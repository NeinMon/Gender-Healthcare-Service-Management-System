package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.Booking;
import com.genderhealthcare.demo.model.PaymentRequest;
import com.genderhealthcare.demo.service.BookingService;
import com.genderhealthcare.demo.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * API Controller xử lý các yêu cầu thanh toán
 * Tích hợp với cổng thanh toán PayOS để xử lý thanh toán online
 * API này chỉ tiếp nhận request từ frontend và gọi đến service layer
 */
@RestController
@RequestMapping("/api/payment")
@CrossOrigin("*")
public class PaymentAPI {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingService bookingService;

    /**
     * API tạo liên kết thanh toán PayOS
     * Tạo URL thanh toán để chuyển hướng user đến cổng thanh toán
     * 
     * @param paymentRequest Thông tin yêu cầu thanh toán (bookingId, amount, description)
     * @return ResponseEntity chứa URL thanh toán hoặc lỗi
     */
    @PostMapping("/payos")
    public ResponseEntity<?> createPayOSPayment(@RequestBody PaymentRequest paymentRequest) {
        try {
            // Check if booking exists
            Booking booking = bookingService.getBookingById(paymentRequest.getBookingId());
            if (booking == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Booking not found with ID: " + paymentRequest.getBookingId());
            }

            // Check if booking is already paid
            if (booking.getPayment() != null && "PAID".equals(booking.getPayment().getStatus())) {
                return ResponseEntity.badRequest().body("This booking is already paid");
            }

            // If amount is not provided in request, use the amount from Payment entity
            if (paymentRequest.getAmount() == null && booking.getPayment() != null) {
                paymentRequest.setAmount(booking.getPayment().getAmount());
            }

            // Generate default description if not provided
            if (paymentRequest.getDescription() == null || paymentRequest.getDescription().isEmpty()) {
                paymentRequest.setDescription("Payment for booking #" + booking.getBookingId());
            }

            // Create payment URL through PaymentService
            String paymentUrl = paymentService.createPaymentUrl(paymentRequest);

            // Return response with payment URL
            Map<String, Object> response = new HashMap<>();
            response.put("payUrl", paymentUrl);
            response.put("bookingId", booking.getBookingId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to create payment: " + e.getMessage());
        }
    }

    /**
     * API lấy trạng thái thanh toán theo booking ID
     * Đồng bộ trạng thái từ PayOS và trả về thông tin booking kèm payment
     * 
     * @param bookingId ID của booking cần kiểm tra trạng thái thanh toán
     * @return ResponseEntity chứa thông tin booking và payment hoặc lỗi
     */
    @GetMapping("/status/{bookingId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Integer bookingId) {
        try {
            Booking booking = bookingService.getBookingById(bookingId);
            if (booking == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Booking not found with ID: " + bookingId);
            }

            paymentService.syncBookingStatusWithPayOS(booking);
            booking = bookingService.getBookingById(bookingId);

            // Đảm bảo payment có statusMessage phù hợp
            if (booking.getPayment() != null) {
                String statusMessage;
                switch (booking.getPayment().getStatus()) {
                    case "PAID":
                        statusMessage = "Thanh toán thành công! Lịch tư vấn của bạn đã được xác nhận.";
                        break;
                    case "PENDING":
                        statusMessage = "Chưa thanh toán. Vui lòng hoàn thành thanh toán để xác nhận lịch tư vấn.";
                        break;
                    case "CANCELLED":
                        statusMessage = "Thanh toán đã bị hủy. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần thiết.";
                        break;
                    case "EXPIRED":
                        statusMessage = "Thanh toán đã hết hạn. Vui lòng tạo lịch tư vấn mới.";
                        break;
                    default:
                        statusMessage = "Trạng thái thanh toán: " + booking.getPayment().getStatus();
                }
                booking.getPayment().setStatusMessage(statusMessage);
            }

            // Trả về object booking (bao gồm payment)
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving payment status: " + e.getMessage());
        }
    }

    /**
     * API lấy trạng thái thanh toán theo order code từ PayOS
     * Sử dụng để theo dõi giao dịch thông qua mã đơn hàng PayOS
     * 
     * @param orderCode Mã đơn hàng từ PayOS
     * @return ResponseEntity chứa thông tin thanh toán hoặc lỗi
     */
    // API lấy trạng thái/thanh toán qua orderCode (PayOS)
    @GetMapping("/status/order/{orderCode}")
    public ResponseEntity<?> getPaymentStatusByOrderCode(@PathVariable Long orderCode) {
        try {
            Booking booking = bookingService.getBookingByOrderCode(orderCode);
            if (booking == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Booking not found with orderCode: " + orderCode);
            }
            // Không gọi PayOS nữa, chỉ trả về thông tin payment nội bộ
            Map<String, Object> response = new HashMap<>();
            response.put("bookingId", booking.getBookingId());
            if (booking.getPayment() != null) {
                response.put("orderCode", booking.getPayment().getOrderCode());
                response.put("paymentStatus", booking.getPayment().getStatus());
                response.put("amount", booking.getPayment().getAmount());
                response.put("paymentId", booking.getPayment().getPaymentId());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving payment status: " + e.getMessage());
        }
    }

    /**
     * API hủy thanh toán
     * Hủy liên kết thanh toán và cập nhật trạng thái booking/payment
     * 
     * @param bookingId ID của booking cần hủy thanh toán
     * @param body Thông tin bổ sung (lý do hủy)
     * @return ResponseEntity chứa kết quả hủy thanh toán
     */
    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelPayment(@PathVariable Integer bookingId, @RequestBody(required = false) Map<String, Object> body) {
        try {
            String reason = body != null && body.get("cancellationReason") != null ? body.get("cancellationReason").toString() : "Khách hàng hủy thanh toán";
            boolean result = paymentService.cancelPaymentRequest(bookingId, reason);
            if (result) {
                return ResponseEntity.ok("Đã hủy liên kết thanh toán và cập nhật trạng thái booking/payment.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không thể hủy thanh toán hoặc booking/payment đã ở trạng thái cuối.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi khi hủy thanh toán: " + e.getMessage());
        }
    }

    // Đã loại bỏ API xác nhận thanh toán thủ công (processing) vì đã tự động đồng bộ trạng thái.
}
