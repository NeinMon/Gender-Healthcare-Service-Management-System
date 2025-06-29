package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.Booking;
import com.genderhealthcare.demo.repository.BookingRepository;
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

    @Autowired
    private com.genderhealthcare.demo.service.ServiceService serviceService;

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody Booking booking) {
        try {
            // API mặc định: tự động set serviceId = 1 nếu chưa có
            if (booking.getServiceId() == null) {
                booking.setServiceId(1);
            }
            // Kiểm tra trùng lịch tư vấn viên
            if (booking.getConsultantId() != null && booking.getAppointmentDate() != null) {
                boolean exists = bookingService.existsByConsultantIdAndAppointmentDate(
                    booking.getConsultantId(),
                    booking.getAppointmentDate()
                );
                if (exists) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Tư vấn viên đã có lịch trong khung giờ này!");
                }
            }
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

    @GetMapping("/service/{serviceId}")
    public List<Booking> getBookingsByServiceId(@PathVariable("serviceId") Integer serviceId) {
        return bookingService.getBookingsByServiceId(serviceId);
    }

    @GetMapping("/user/{userId}/consultations")
    public ResponseEntity<List<Booking>> getConsultationBookingsByUserId(@PathVariable("userId") Integer userId) {
        List<Booking> consultationBookings = bookingService.getConsultationBookingsByUserId(userId);
        return ResponseEntity.ok(consultationBookings);
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

    @GetMapping("/by-service-name")
    public ResponseEntity<?> getBookingsByServiceName(@RequestParam("serviceName") String serviceName) {
        com.genderhealthcare.demo.entity.Service service = serviceService.getServiceByName(serviceName);
        if (service == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Service not found");
        }
        List<Booking> bookings = bookingService.getBookingsByServiceId(service.getServiceId());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/by-service-name-and-status")
    public ResponseEntity<?> getBookingsByServiceNameAndStatus(
            @RequestParam("serviceName") String serviceName,
            @RequestParam("status") String status) {
        com.genderhealthcare.demo.entity.Service service = serviceService.getServiceByName(serviceName);
        if (service == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Service not found");
        }
        List<Booking> bookings = bookingService.getBookingsByServiceIdAndStatus(service.getServiceId(), status);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{id}/test-results")
    public ResponseEntity<?> updateTestResults(
            @PathVariable("id") Integer id,
            @RequestBody String testResults) {
        Booking booking = bookingService.getBookingById(id);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found");
        }
        booking.setTestResults(testResults);
        Booking updated = bookingService.createBooking(booking);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/available-times")
    public ResponseEntity<?> getAvailableTimes(@RequestParam("consultantId") Integer consultantId,
                                               @RequestParam("date") String date) {
        // Danh sách khung giờ chuẩn (cố định)
        String[] allSlots = {
            "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
            "13:30 - 14:30", "14:30 - 15:30", "15:30 - 16:30", "16:30 - 17:30"
        };
        // Lấy tất cả booking của consultant trong ngày
        List<Booking> bookings = bookingService.getBookingsByConsultantIdAndDate(consultantId, date);
        java.util.Set<String> bookedSlots = new java.util.HashSet<>();
        for (Booking b : bookings) {
            // Giả sử appointmentDate lưu dạng "yyyy-MM-dd HH:mm:ss" hoặc tương tự
            String time = b.getAppointmentDate().substring(11, 16); // lấy HH:mm
            for (String slot : allSlots) {
                if (slot.startsWith(time)) {
                    bookedSlots.add(slot);
                }
            }
        }
        java.util.List<String> available = new java.util.ArrayList<>();
        for (String slot : allSlots) {
            if (!bookedSlots.contains(slot)) {
                available.add(slot);
            }
        }
        return ResponseEntity.ok(available);
    }
}
