package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.Booking;
import com.genderhealthcare.demo.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.time.LocalDate;

/**
 * API Controller xử lý các yêu cầu đặt lịch tư vấn sức khỏe
 * Quản lý việc tạo, cập nhật, truy vấn các booking của khách hàng
 * API này chỉ tiếp nhận request từ frontend và gọi đến service layer
 */
@RestController
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RequestMapping("/api/bookings")
@Validated
public class BookingAPI {
    @Autowired
    private BookingService bookingService;

    /**
     * API tạo booking với dịch vụ mặc định
     * Tạo lịch tư vấn với dịch vụ tư vấn sức khỏe phụ nữ cơ bản
     * 
     * @param booking Thông tin booking từ frontend
     * @return ResponseEntity chứa booking đã tạo hoặc lỗi
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody Booking booking) {
        try {
            Booking saved = bookingService.createBookingWithDefaultService(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi tạo booking: " + e.getMessage());
        }
    }

    /**
     * API tạo booking với dịch vụ cụ thể
     * Tạo lịch tư vấn với dịch vụ được chỉ định rõ ràng
     * 
     * @param booking Thông tin booking kèm service ID từ frontend
     * @return ResponseEntity chứa booking đã tạo hoặc lỗi
     */
    @PostMapping("/with-service")
    public ResponseEntity<?> createBookingWithService(@Valid @RequestBody Booking booking) {
        try {
            Booking saved = bookingService.createBookingWithSpecificService(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi tạo booking với service: " + e.getMessage());
        }
    }

    /**
     * API lấy danh sách booking theo consultant ID
     * Lấy tất cả booking được phân công cho một consultant cụ thể
     * 
     * @param consultantId ID của consultant
     * @return ResponseEntity chứa danh sách booking của consultant hoặc lỗi
     */
    @GetMapping("/consultant/{consultantId}")
    public ResponseEntity<?> getBookingsByConsultantId(@PathVariable("consultantId") Integer consultantId) {
        try {
            List<Booking> bookings = bookingService.getBookingsByConsultantId(consultantId);
            bookings.forEach(Booking::updateStatus);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy booking theo consultantId: " + e.getMessage());
        }
    }

    /**
     * API lấy danh sách booking tư vấn theo user ID
     * Chỉ lấy các booking có loại dịch vụ là tư vấn (consultation)
     * 
     * @param userId ID của khách hàng
     * @return ResponseEntity chứa danh sách consultation booking hoặc lỗi
     */
    @GetMapping("/user/{userId}/consultations")
    public ResponseEntity<?> getConsultationBookingsByUserId(@PathVariable("userId") Integer userId) {
        try {
            List<Booking> consultationBookings = bookingService.getConsultationBookingsByUserId(userId);
            consultationBookings.forEach(Booking::updateStatus);
            return ResponseEntity.ok(consultationBookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy consultation bookings: " + e.getMessage());
        }
    }

    /**
     * API cập nhật trạng thái booking
     * Cập nhật trạng thái và thời gian kết thúc (nếu có) cho booking
     * 
     * @param id ID của booking cần cập nhật
     * @param status Trạng thái mới
     * @param endTimeStr Thời gian kết thúc (optional)
     * @return ResponseEntity chứa booking đã cập nhật hoặc lỗi
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable("id") Integer id,
            @RequestParam(value = "status", required = true) String status,
            @RequestParam(value = "endTime", required = false) String endTimeStr) {
        try {
            Booking updated = bookingService.updateBookingStatusWithEndTime(id, status, endTimeStr);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi cập nhật trạng thái booking: " + e.getMessage());
        }
    }

    // /**
    //  * API lấy danh sách booking theo tên dịch vụ
    //  * Tìm kiếm booking dựa trên tên của dịch vụ
    //  * 
    //  * @param serviceName Tên của dịch vụ cần tìm
    //  * @return ResponseEntity chứa danh sách booking hoặc lỗi
    //  */
    // @GetMapping("/by-service-name")
    // public ResponseEntity<?> getBookingsByServiceName(@RequestParam("serviceName") String serviceName) {
    //     try {
    //         List<Booking> bookings = bookingService.getBookingsByServiceName(serviceName);
    //         return ResponseEntity.ok(bookings);
    //     } catch (IllegalArgumentException e) {
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy bookings theo service name: " + e.getMessage());
    //     }
    // }

    // /**
    //  * API lấy danh sách booking theo tên dịch vụ và trạng thái
    //  * Tìm kiếm booking với điều kiện kết hợp tên dịch vụ và trạng thái
    //  * 
    //  * @param serviceName Tên của dịch vụ
    //  * @param status Trạng thái booking
    //  * @return ResponseEntity chứa danh sách booking hoặc lỗi
    //  */
    // @GetMapping("/by-service-name-and-status")
    // public ResponseEntity<?> getBookingsByServiceNameAndStatus(
    //         @RequestParam("serviceName") String serviceName,
    //         @RequestParam("status") String status) {
    //     try {
    //         List<Booking> bookings = bookingService.getBookingsByServiceNameAndStatus(serviceName, status);
    //         return ResponseEntity.ok(bookings);
    //     } catch (IllegalArgumentException e) {
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy bookings theo service name và status: " + e.getMessage());
    //     }
    // }

    /**
     * API lấy khung giờ trống của consultant
     * Trả về danh sách các khung giờ còn trống để đặt lịch tư vấn
     * 
     * @param consultantId ID của consultant
     * @param date Ngày cần kiểm tra (format: yyyy-MM-dd)
     * @return ResponseEntity chứa danh sách khung giờ trống hoặc lỗi
     */
    @GetMapping("/available-times")
    public ResponseEntity<?> getAvailableTimes(@RequestParam("consultantId") Integer consultantId,
                                               @RequestParam("date") String date) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            List<String> availableSlots = bookingService.getAvailableTimeSlots(consultantId, localDate);
            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Lỗi khi lấy khung giờ rảnh: " + e.getMessage());
        }
    }
    
    /**
     * === ENDPOINTS CHO TEST BOOKING (XÉT NGHIỆM) ===
     * Các API dành riêng cho quản lý booking xét nghiệm
     */
    
    /**
     * API lấy tất cả test booking trong hệ thống
     * Chỉ lấy các booking có loại dịch vụ là xét nghiệm
     * 
     * @return ResponseEntity chứa danh sách test booking hoặc lỗi
     */
    // @GetMapping("/test-bookings")
    // public ResponseEntity<?> getAllTestBookings() {
    //     try {
    //         List<Booking> testBookings = bookingService.getTestBookings();
    //         testBookings.forEach(Booking::updateStatus);
    //         return ResponseEntity.ok(testBookings);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy danh sách test bookings: " + e.getMessage());
    //     }
    // }
    
    /**
     * API lấy test booking theo trạng thái
     * Lọc các booking xét nghiệm theo trạng thái cụ thể
     * 
     * @param status Trạng thái cần lọc (Đang chờ duyệt, Đã xác nhận, Hoàn thành, ...)
     * @return ResponseEntity chứa danh sách test booking theo trạng thái hoặc lỗi
     */
    // @GetMapping("/test-bookings/status/{status}")
    // public ResponseEntity<?> getTestBookingsByStatus(@PathVariable("status") String status) {
    //     try {
    //         List<Booking> testBookings = bookingService.getTestBookingsByStatus(status);
    //         testBookings.forEach(Booking::updateStatus);
    //         return ResponseEntity.ok(testBookings);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy test bookings theo status: " + e.getMessage());
    //     }
    // }
    
    /**
     * API lấy booking theo user ID và trạng thái
     * Lọc booking của một khách hàng cụ thể theo trạng thái
     * 
     * @param userId ID của khách hàng
     * @param status Trạng thái booking cần lọc
     * @return ResponseEntity chứa danh sách booking hoặc lỗi
     */
    // @GetMapping("/user/{userId}/status/{status}")
    // public ResponseEntity<?> getBookingsByUserIdAndStatus(
    //         @PathVariable("userId") Integer userId,
    //         @PathVariable("status") String status) {
    //     try {
    //         List<Booking> bookings = bookingService.getBookingsByUserIdAndStatus(userId, status);
    //         bookings.forEach(Booking::updateStatus);
    //         return ResponseEntity.ok(bookings);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy bookings theo userId và status: " + e.getMessage());
    //     }
    // }
    
    /**
     * API cập nhật chỉ trạng thái booking (không cập nhật endTime)
     * Cập nhật trạng thái đơn giản cho booking
     * 
     * @param id ID của booking cần cập nhật
     * @param status Trạng thái mới
     * @return ResponseEntity chứa booking đã cập nhật hoặc lỗi
     */
    // @PutMapping("/{id}/update-status")
    // public ResponseEntity<?> updateBookingStatusOnly(@PathVariable("id") Integer id,
    //                                                  @RequestParam("status") String status) {
    //     try {
    //         Booking updated = bookingService.updateBookingStatus(id, status);
    //         return ResponseEntity.ok(updated);
    //     } catch (IllegalArgumentException e) {
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    //     }
    // }

    /**
     * API lấy test booking theo user ID
     * Lấy tất cả booking xét nghiệm của một khách hàng cụ thể
     * 
     * @param userId ID của khách hàng
     * @return ResponseEntity chứa danh sách test booking của user hoặc lỗi
     */
    // @GetMapping("/user/{userId}/test-bookings")
    // public ResponseEntity<?> getTestBookingsByUserId(@PathVariable("userId") Integer userId) {
    //     try {
    //         List<Booking> testBookings = bookingService.getTestBookingsByUserId(userId);
    //         testBookings.forEach(Booking::updateStatus);
    //         return ResponseEntity.ok(testBookings);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy test bookings theo userId: " + e.getMessage());
    //     }
    // }

    /**
     * API cập nhật trạng thái thanh toán cho booking
     * Cập nhật payment status (PAID/CANCELLED) cho booking cụ thể
     * 
     * @param id ID của booking cần cập nhật
     * @param status Trạng thái thanh toán (PAID, CANCELLED, PENDING)
     * @return ResponseEntity chứa thông báo kết quả hoặc lỗi
     */
    // === API cập nhật trạng thái paymentStatus cho booking (PAID/CANCELLED) ===
    @PutMapping("/{id}/update-payment-status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable("id") Integer id,
                                                 @RequestParam("status") String status) {
        try {
            bookingService.updatePaymentStatus(id, status);
            return ResponseEntity.ok("Đã cập nhật trạng thái thanh toán cho booking.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi cập nhật trạng thái payment: " + e.getMessage());
        }
    }
}
