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

@RestController
@RequestMapping("/api/payment")
@CrossOrigin("*")
public class PaymentAPI {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingService bookingService;

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
            if ("PAID".equals(booking.getPaymentStatus())) {
                return ResponseEntity.badRequest().body("This booking is already paid");
            }

            // If amount is not provided in request, use the amount from booking
            if (paymentRequest.getAmount() == null) {
                paymentRequest.setAmount(booking.getAmount());
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

    @GetMapping("/status/{bookingId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Integer bookingId) {
        try {
            Booking booking = bookingService.getBookingById(bookingId);
            if (booking == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Booking not found with ID: " + bookingId);
            }

            // Luôn kiểm tra trạng thái link PayOS bằng bookingId (orderCode)
            paymentService.syncBookingStatusWithPayOS(booking);
            // Lấy lại trạng thái booking mới nhất từ DB
            booking = bookingService.getBookingById(bookingId);

            Map<String, Object> response = new HashMap<>();
            response.put("bookingId", booking.getBookingId());
            response.put("paymentStatus", booking.getPaymentStatus());
            response.put("amount", booking.getAmount());
            response.put("paymentId", booking.getPaymentId());
            // Add additional information for better UX
            String statusMessage;
            switch (booking.getPaymentStatus()) {
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
                    statusMessage = "Trạng thái thanh toán: " + booking.getPaymentStatus();
            }
            response.put("statusMessage", statusMessage);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving payment status: " + e.getMessage());
        }
    }

    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelPayment(@PathVariable Integer bookingId, @RequestBody(required = false) Map<String, Object> body) {
        try {
            String reason = body != null && body.get("cancellationReason") != null ? body.get("cancellationReason").toString() : "Khách hàng hủy thanh toán";
            boolean result = paymentService.cancelPaymentRequest(bookingId, reason);
            if (result) {
                return ResponseEntity.ok("Đã hủy liên kết thanh toán và cập nhật trạng thái booking.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không thể hủy thanh toán hoặc booking đã ở trạng thái cuối.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi khi hủy thanh toán: " + e.getMessage());
        }
    }

    // Đã loại bỏ API xác nhận thanh toán thủ công (processing) vì đã tự động đồng bộ trạng thái.
}
