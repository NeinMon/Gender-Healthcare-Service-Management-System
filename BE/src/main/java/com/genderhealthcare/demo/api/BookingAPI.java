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

@RestController
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RequestMapping("/api/bookings")
@Validated
public class BookingAPI {
    @Autowired
    private BookingService bookingService;

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

    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        try {
            List<Booking> bookings = bookingService.getAllBookings();
            bookings.forEach(Booking::updateStatus);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy danh sách booking: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBookingsByUserId(@PathVariable("userId") Integer userId) {
        try {
            List<Booking> bookings = bookingService.getBookingsByUserId(userId);
            bookings.forEach(Booking::updateStatus);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy booking theo userId: " + e.getMessage());
        }
    }

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

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<?> getBookingsByServiceId(@PathVariable("serviceId") Integer serviceId) {
        try {
            List<Booking> bookings = bookingService.getBookingsByServiceId(serviceId);
            bookings.forEach(Booking::updateStatus);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy booking theo serviceId: " + e.getMessage());
        }
    }

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

    @GetMapping("/user/{userId}/other-services")
    public ResponseEntity<?> getNonConsultationBookingsByUserId(@PathVariable("userId") Integer userId) {
        try {
            List<Booking> otherServiceBookings = bookingService.getNonConsultationBookingsByUserId(userId);
            otherServiceBookings.forEach(Booking::updateStatus);
            return ResponseEntity.ok(otherServiceBookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy other service bookings: " + e.getMessage());
        }
    }

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

    @GetMapping("/by-service-name")
    public ResponseEntity<?> getBookingsByServiceName(@RequestParam("serviceName") String serviceName) {
        try {
            List<Booking> bookings = bookingService.getBookingsByServiceName(serviceName);
            return ResponseEntity.ok(bookings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy bookings theo service name: " + e.getMessage());
        }
    }

    @GetMapping("/by-service-name-and-status")
    public ResponseEntity<?> getBookingsByServiceNameAndStatus(
            @RequestParam("serviceName") String serviceName,
            @RequestParam("status") String status) {
        try {
            List<Booking> bookings = bookingService.getBookingsByServiceNameAndStatus(serviceName, status);
            return ResponseEntity.ok(bookings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy bookings theo service name và status: " + e.getMessage());
        }
    }

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
    
    // === Test Booking Endpoints ===
    
    @GetMapping("/test-bookings")
    public ResponseEntity<?> getAllTestBookings() {
        try {
            List<Booking> testBookings = bookingService.getTestBookings();
            testBookings.forEach(Booking::updateStatus);
            return ResponseEntity.ok(testBookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy danh sách test bookings: " + e.getMessage());
        }
    }
    
    @GetMapping("/test-bookings/status/{status}")
    public ResponseEntity<?> getTestBookingsByStatus(@PathVariable("status") String status) {
        try {
            List<Booking> testBookings = bookingService.getTestBookingsByStatus(status);
            testBookings.forEach(Booking::updateStatus);
            return ResponseEntity.ok(testBookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy test bookings theo status: " + e.getMessage());
        }
    }
    
    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<?> getBookingsByUserIdAndStatus(
            @PathVariable("userId") Integer userId,
            @PathVariable("status") String status) {
        try {
            List<Booking> bookings = bookingService.getBookingsByUserIdAndStatus(userId, status);
            bookings.forEach(Booking::updateStatus);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy bookings theo userId và status: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}/update-status")
    public ResponseEntity<?> updateBookingStatusOnly(@PathVariable("id") Integer id,
                                                     @RequestParam("status") String status) {
        try {
            Booking updated = bookingService.updateBookingStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}/test-bookings")
    public ResponseEntity<?> getTestBookingsByUserId(@PathVariable("userId") Integer userId) {
        try {
            List<Booking> testBookings = bookingService.getTestBookingsByUserId(userId);
            testBookings.forEach(Booking::updateStatus);
            return ResponseEntity.ok(testBookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy test bookings theo userId: " + e.getMessage());
        }
    }

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
