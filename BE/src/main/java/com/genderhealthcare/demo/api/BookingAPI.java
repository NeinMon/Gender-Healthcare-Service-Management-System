package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.Booking;
import com.genderhealthcare.demo.model.BookingPaymentResponse;
import com.genderhealthcare.demo.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.time.LocalTime;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

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
            
            // Kiểm tra trùng lịch tư vấn viên theo khung giờ chính xác
            if (booking.getConsultantId() != null && booking.getAppointmentDate() != null && booking.getStartTime() != null) {
                // Tự động tính endTime nếu chưa có (mặc định 1 giờ)
                LocalTime endTime = booking.getEndTime();
                if (endTime == null) {
                    endTime = booking.getStartTime().plusHours(1);
                }
                
                boolean hasConflict = bookingService.hasConflictingBooking(
                    booking.getConsultantId(),
                    booking.getAppointmentDate(),
                    booking.getStartTime(),
                    endTime
                );
                
                if (hasConflict) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Tư vấn viên đã có lịch trùng trong khung giờ này! Vui lòng chọn giờ khác.");
                }
            }
            
            // Set default values
            booking.setEndTime(null);
            booking.setPaymentStatus("PENDING");

            // If amount is not set, set a default amount (can be calculated based on service)
            if (booking.getAmount() == null) {
                booking.setAmount(100000.0); // Default amount, in practice should be based on the service
            }

            // Status sẽ tự động là "Chờ bắt đầu" hoặc "Đang diễn ra" dựa vào startTime
            Booking saved = bookingService.createBooking(booking);

            // Return payment-related information for frontend
            Map<String, Object> response = new HashMap<>();
            response.put("bookingId", saved.getBookingId());
            response.put("amount", saved.getAmount());
            response.put("message", "Booking created successfully. Proceed to payment.");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    @GetMapping("/available-times")
    public ResponseEntity<?> getAvailableTimes(@RequestParam("consultantId") Integer consultantId,
                                               @RequestParam("date") String date) {
        try {
            // Danh sách khung giờ chuẩn (cố định)
            String[] allSlots = {
                "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
                "13:30 - 14:30", "14:30 - 15:30", "15:30 - 16:30", "16:30 - 17:30"
            };
            // Lấy tất cả booking của consultant trong ngày
            LocalDate localDate = LocalDate.parse(date); // Chuyển String sang LocalDate
            List<Booking> bookings = bookingService.getBookingsByConsultantIdAndDate(consultantId, localDate);
            // Tạo set các slot đã được đặt (chỉ tính booking chưa kết thúc)
            java.util.Set<String> bookedSlots = new java.util.HashSet<>();
            for (Booking b : bookings) {
                // Chỉ tính các booking chưa kết thúc VÀ đã thanh toán thành công (PAID) HOẶC PROCESSING
                if (!"Đã kết thúc".equals(b.getStatus()) && ("PAID".equals(b.getPaymentStatus()) || "PROCESSING".equals(b.getPaymentStatus()))) {
                    LocalTime startTime = b.getStartTime();
                    LocalTime endTime = b.getEndTime() != null ? b.getEndTime() : startTime.plusHours(1);
                    // Kiểm tra slot nào bị trùng với booking này
                    for (String slot : allSlots) {
                        String[] timeParts = slot.split(" - ");
                        LocalTime slotStart = LocalTime.parse(timeParts[0]);
                        LocalTime slotEnd = LocalTime.parse(timeParts[1]);
                        // Kiểm tra overlap: booking và slot có giao nhau không
                        if (startTime.isBefore(slotEnd) && endTime.isAfter(slotStart)) {
                            bookedSlots.add(slot);
                        }
                    }
                }
            }
            // Lọc ra các slot còn trống
            java.util.List<String> available = new java.util.ArrayList<>();
            for (String slot : allSlots) {
                if (!bookedSlots.contains(slot)) {
                    available.add(slot);
                }
            }
            return ResponseEntity.ok(available);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Lỗi khi lấy khung giờ rảnh: " + e.getMessage());
        }
    }
    
    // === Test Booking Endpoints ===
    
    @GetMapping("/test-bookings")
    public ResponseEntity<List<Booking>> getAllTestBookings() {
        List<Booking> testBookings = bookingService.getTestBookings();
        testBookings.forEach(Booking::updateStatus);
        return ResponseEntity.ok(testBookings);
    }
    
    @GetMapping("/test-bookings/status/{status}")
    public ResponseEntity<List<Booking>> getTestBookingsByStatus(@PathVariable("status") String status) {
        List<Booking> testBookings = bookingService.getTestBookingsByStatus(status);
        testBookings.forEach(Booking::updateStatus);
        return ResponseEntity.ok(testBookings);
    }
    
    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByUserIdAndStatus(
            @PathVariable("userId") Integer userId,
            @PathVariable("status") String status) {
        List<Booking> bookings = bookingService.getBookingsByUserIdAndStatus(userId, status);
        bookings.forEach(Booking::updateStatus);
        return ResponseEntity.ok(bookings);
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
    public ResponseEntity<List<Booking>> getTestBookingsByUserId(@PathVariable("userId") Integer userId) {
        List<Booking> testBookings = bookingService.getTestBookingsByUserId(userId);
        testBookings.forEach(Booking::updateStatus);
        return ResponseEntity.ok(testBookings);
    }

    // === API cập nhật trạng thái paymentStatus cho booking (PAID/CANCELLED) ===
    @PutMapping("/{id}/update-payment-status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable("id") Integer id,
                                                 @RequestParam("status") String status) {
        Booking booking = bookingService.getBookingById(id);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found");
        }
        // Chỉ cho phép cập nhật sang PAID hoặc CANCELLED từ PROCESSING
        if (!"PROCESSING".equals(booking.getPaymentStatus())) {
            return ResponseEntity.badRequest().body("Chỉ cập nhật trạng thái khi booking đang PROCESSING");
        }
        if (!"PAID".equals(status) && !"CANCELLED".equals(status)) {
            return ResponseEntity.badRequest().body("Trạng thái hợp lệ: PAID hoặc CANCELLED");
        }
        booking.setPaymentStatus(status);
        bookingService.createBooking(booking);
        return ResponseEntity.ok("Đã cập nhật trạng thái thanh toán cho booking.");
    }
}
