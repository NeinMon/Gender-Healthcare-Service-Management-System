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

@RestController
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RequestMapping("/api/bookings")
@Validated
public class BookingAPI {
    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody Booking booking) {
        Booking saved = bookingService.createBooking(booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getBookingsByUserId(@PathVariable("userId") Integer userId) {
        return bookingService.getBookingsByUserId(userId);
    }

    @GetMapping("/consultant/{consultantId}")
    public List<Booking> getBookingsByConsultantId(@PathVariable("consultantId") Integer consultantId) {
        return bookingService.getBookingsByConsultantId(consultantId);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable("id") Integer id,
            @RequestParam(value = "status", required = true) String status) {

        Booking booking = bookingService.getBookingById(id);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found");
        }

        // Validate status value
        if (!status.equals("Đã duyệt") &&
            !status.equals("Đã kết thúc") &&
            !status.equals("Không được duyệt")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Invalid status. Valid values: 'Đã duyệt', 'Đã kết thúc', 'Không được duyệt'");
        }

        booking.setStatus(status);
        Booking updated = bookingService.createBooking(booking);
        return ResponseEntity.ok(updated);
    }
}
