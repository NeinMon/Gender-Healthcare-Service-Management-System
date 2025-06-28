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
import java.time.LocalTime;

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
            // API mặc định: tự động set serviceId = 1 nếu chưa có
            if (booking.getServiceId() == null) {
                booking.setServiceId(1);
            }
            // Luôn chỉ nhận startTime, endTime để null khi tạo mới
            booking.setEndTime(null);
            // Status sẽ tự động là "Chờ bắt đầu" hoặc "Đang diễn ra" dựa vào startTime
            Booking saved = bookingService.createBooking(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/with-service")
    public ResponseEntity<?> createBookingWithService(@Valid @RequestBody Booking booking) {
        try {
            // API yêu cầu serviceId từ frontend - serviceId phải được gửi trong request body
            if (booking.getServiceId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Service ID is required for this endpoint");
            }
            Booking saved = bookingService.createBooking(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        bookings.forEach(Booking::updateStatus);
        return bookings;
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getBookingsByUserId(@PathVariable("userId") Integer userId) {
        List<Booking> bookings = bookingService.getBookingsByUserId(userId);
        bookings.forEach(Booking::updateStatus);
        return bookings;
    }

    @GetMapping("/consultant/{consultantId}")
    public List<Booking> getBookingsByConsultantId(@PathVariable("consultantId") Integer consultantId) {
        List<Booking> bookings = bookingService.getBookingsByConsultantId(consultantId);
        bookings.forEach(Booking::updateStatus);
        return bookings;
    }

    @GetMapping("/service/{serviceId}")
    public List<Booking> getBookingsByServiceId(@PathVariable("serviceId") Integer serviceId) {
        List<Booking> bookings = bookingService.getBookingsByServiceId(serviceId);
        bookings.forEach(Booking::updateStatus);
        return bookings;
    }

    @GetMapping("/user/{userId}/consultations")
    public ResponseEntity<List<Booking>> getConsultationBookingsByUserId(@PathVariable("userId") Integer userId) {
        List<Booking> consultationBookings = bookingService.getConsultationBookingsByUserId(userId);
        consultationBookings.forEach(Booking::updateStatus);
        return ResponseEntity.ok(consultationBookings);
    }

    @GetMapping("/user/{userId}/other-services")
    public ResponseEntity<List<Booking>> getNonConsultationBookingsByUserId(@PathVariable("userId") Integer userId) {
        List<Booking> otherServiceBookings = bookingService.getNonConsultationBookingsByUserId(userId);
        otherServiceBookings.forEach(Booking::updateStatus);
        return ResponseEntity.ok(otherServiceBookings);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable("id") Integer id,
            @RequestParam(value = "status", required = true) String status,
            @RequestParam(value = "endTime", required = false) String endTimeStr) {

        Booking booking = bookingService.getBookingById(id);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found");
        }

        // Validate status value
        if (!status.equals("Đã kết thúc")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Invalid status. Only 'Đã kết thúc' is allowed for this action");
        }

        // Parse endTime nếu có
        if (endTimeStr != null) {
            try {
                LocalTime endTime = LocalTime.parse(endTimeStr);
                booking.setEndTime(endTime);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid endTime format. Use HH:mm");
            }
        } else {
            // Nếu không truyền endTime thì lấy thời điểm hiện tại
            booking.setEndTime(LocalTime.now());
        }
        booking.setStatus("Đã kết thúc");
        Booking updated = bookingService.createBooking(booking);
        return ResponseEntity.ok(updated);
    }
}
