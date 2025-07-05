package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.TestBookingInfo;
import com.genderhealthcare.demo.entity.Booking;
import com.genderhealthcare.demo.service.TestBookingInfoService;
import com.genderhealthcare.demo.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * API Controller cho quản lý đặt lịch xét nghiệm với checkin/checkout offline
 */
@RestController
@CrossOrigin("*")
@RequestMapping("/api/test-bookings")
@Validated
public class TestBookingAPI {
    
    @Autowired
    private TestBookingInfoService testBookingInfoService;
    
    @Autowired
    private BookingService bookingService;
    
    // === CRUD & Status Operations ===

    @PostMapping
    public ResponseEntity<?> createTestBooking(@Valid @RequestBody TestBookingInfo testBookingInfo) {
        try {
            TestBookingInfo created = testBookingInfoService.createTestBookingInfo(testBookingInfo);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<TestBookingInfo>> getAllTestBookings() {
        List<TestBookingInfo> testBookings = testBookingInfoService.getAllTestBookingInfos();
        return ResponseEntity.ok(testBookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTestBookingById(@PathVariable("id") Integer id) {
        TestBookingInfo testBookingInfo = testBookingInfoService.getTestBookingInfoById(id);
        if (testBookingInfo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Test booking not found");
        }
        return ResponseEntity.ok(testBookingInfo);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getTestBookingByBookingId(@PathVariable("bookingId") Integer bookingId) {
        TestBookingInfo testBookingInfo = testBookingInfoService.getTestBookingInfoByBookingId(bookingId);
        if (testBookingInfo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Test booking not found for booking ID: " + bookingId);
        }
        return ResponseEntity.ok(testBookingInfo);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TestBookingInfo>> getTestBookingsByStatus(@PathVariable("status") String status) {
        List<TestBookingInfo> testBookings = testBookingInfoService.getTestBookingInfosByStatus(status);
        return ResponseEntity.ok(testBookings);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TestBookingInfo>> getTestBookingsByUserId(@PathVariable("userId") Integer userId) {
        List<TestBookingInfo> testBookings = testBookingInfoService.getTestBookingInfosByUserId(userId);
        return ResponseEntity.ok(testBookings);
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<TestBookingInfo>> getTestBookingsByStaffId(@PathVariable("staffId") Integer staffId) {
        List<TestBookingInfo> testBookings = testBookingInfoService.getTestBookingInfosByStaffId(staffId);
        return ResponseEntity.ok(testBookings);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTestBooking(@PathVariable("id") Integer id, 
                                               @Valid @RequestBody TestBookingInfo testBookingInfo) {
        try {
            TestBookingInfo updated = testBookingInfoService.updateTestBookingInfo(id, testBookingInfo);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Chỉ còn 1 endpoint cập nhật trạng thái (3 trạng thái hợp lệ)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable("id") Integer id,
                                          @RequestParam("status") String status,
                                          @RequestParam(value = "testResult", required = false) String testResult) {
        try {
            TestBookingInfo updated;
            if ("Đã check-out".equals(status) && testResult != null) {
                updated = testBookingInfoService.updateTestStatusWithResult(id, status, testResult);
            } else {
                updated = testBookingInfoService.updateTestStatus(id, status);
            }
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // === Tạo test booking kèm booking gốc ===
    @PostMapping("/create-with-booking")
    public ResponseEntity<?> createTestBookingWithBooking(@Valid @RequestBody Map<String, Object> request) {
        try {
            Booking booking = new Booking();
            booking.setUserId((Integer) request.get("userId"));
            booking.setServiceId((Integer) request.get("serviceId"));
            booking.setContent((String) request.get("content"));
            Booking createdBooking = bookingService.createBooking(booking);
            TestBookingInfo testBookingInfo = new TestBookingInfo();
            testBookingInfo.setBookingId(createdBooking.getBookingId());
            testBookingInfo.setUserId(createdBooking.getUserId());
            TestBookingInfo createdTestBooking = testBookingInfoService.createTestBookingInfo(testBookingInfo);
            Map<String, Object> response = new HashMap<>();
            response.put("booking", createdBooking);
            response.put("testBookingInfo", createdTestBooking);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // === Test Result Endpoint ===
    @PutMapping("/{id}/result")
    public ResponseEntity<?> updateTestResult(
            @PathVariable("id") Integer id,
            @RequestParam("testStatus") String testStatus,
            @RequestParam("testResult") String testResult,
            @RequestParam(value = "resultNote", required = false) String resultNote,
            @RequestParam(value = "staffName", required = false) String staffName) {
        try {
            if (!"Đã check-out".equals(testStatus)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Trạng thái phải là 'Đã check-out' để cập nhật kết quả");
            }
            
            // Kiểm tra xem đối tượng có tồn tại không
            TestBookingInfo existing = testBookingInfoService.getTestBookingInfoById(id);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Không tìm thấy thông tin đặt xét nghiệm với ID: " + id);
            }
            
            // Sử dụng phương thức hiện có để cập nhật trạng thái và kết quả
            TestBookingInfo updated = testBookingInfoService.updateTestStatusWithResult(id, testStatus, testResult);
            
            // Cập nhật các thông tin bổ sung nếu cần
            if (resultNote != null && !resultNote.trim().isEmpty() || staffName != null && !staffName.trim().isEmpty()) {
                TestBookingInfo additionalInfo = testBookingInfoService.getTestBookingInfoById(id);
                updated = testBookingInfoService.updateTestBookingInfo(id, additionalInfo);
            }
            
            return ResponseEntity.ok(updated);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật kết quả xét nghiệm: " + e.getMessage());
        }
    }

    // === Detailed Information Endpoints ===
    @GetMapping("/{id}/detail")
    public ResponseEntity<?> getTestBookingDetailById(@PathVariable("id") Integer id) {
        com.genderhealthcare.demo.model.TestBookingDetailDTO detail = testBookingInfoService.getTestBookingDetailById(id);
        if (detail == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Test booking not found");
        }
        return ResponseEntity.ok(detail);
    }

    @GetMapping("/status/{status}/detail")
    public ResponseEntity<List<com.genderhealthcare.demo.model.TestBookingDetailDTO>> getTestBookingDetailsByStatus(@PathVariable("status") String status) {
        List<com.genderhealthcare.demo.model.TestBookingDetailDTO> details = testBookingInfoService.getTestBookingDetailsByStatus(status);
        return ResponseEntity.ok(details);
    }

    @GetMapping("/user/{userId}/detail")
    public ResponseEntity<List<com.genderhealthcare.demo.model.TestBookingDetailDTO>> getTestBookingDetailsByUserId(@PathVariable("userId") Integer userId) {
        List<com.genderhealthcare.demo.model.TestBookingDetailDTO> details = testBookingInfoService.getTestBookingDetailsByUserId(userId);
        return ResponseEntity.ok(details);
    }
    
    @GetMapping("/all/detail")
    public ResponseEntity<List<com.genderhealthcare.demo.model.TestBookingDetailDTO>> getAllTestBookingDetails() {
        // Get all test bookings first
        List<TestBookingInfo> allBookings = testBookingInfoService.getAllTestBookingInfos();
        
        // Then manually convert each one to detail DTO
        List<com.genderhealthcare.demo.model.TestBookingDetailDTO> details = new java.util.ArrayList<>();
        for (TestBookingInfo booking : allBookings) {
            com.genderhealthcare.demo.model.TestBookingDetailDTO detail = testBookingInfoService.getTestBookingDetailById(booking.getId());
            if (detail != null) {
                details.add(detail);
            }
        }
        
        return ResponseEntity.ok(details);
    }
}
