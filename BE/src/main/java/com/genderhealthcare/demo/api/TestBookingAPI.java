package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.TestBookingInfo;
import com.genderhealthcare.demo.service.TestBookingInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * API Controller xử lý các yêu cầu đặt lịch xét nghiệm
 * Quản lý việc đặt lịch xét nghiệm offline với quy trình check-in/check-out
 * API này chỉ tiếp nhận request từ frontend và gọi đến service layer
 */
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
    public ResponseEntity<?> getAllTestBookings() {
        try {
            List<TestBookingInfo> testBookings = testBookingInfoService.getAllTestBookingInfos();
            return ResponseEntity.ok(testBookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy danh sách test bookings: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTestBookingById(@PathVariable("id") Integer id) {
        try {
            TestBookingInfo testBookingInfo = testBookingInfoService.getTestBookingInfoById(id);
            if (testBookingInfo == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Test booking not found");
            }
            return ResponseEntity.ok(testBookingInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy test booking: " + e.getMessage());
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getTestBookingByBookingId(@PathVariable("bookingId") Integer bookingId) {
        try {
            TestBookingInfo testBookingInfo = testBookingInfoService.getTestBookingInfoByBookingId(bookingId);
            if (testBookingInfo == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Test booking not found for booking ID: " + bookingId);
            }
            return ResponseEntity.ok(testBookingInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy test booking theo bookingId: " + e.getMessage());
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getTestBookingsByStatus(@PathVariable("status") String status) {
        try {
            List<TestBookingInfo> testBookings = testBookingInfoService.getTestBookingInfosByStatus(status);
            return ResponseEntity.ok(testBookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy test bookings theo status: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getTestBookingsByUserId(@PathVariable("userId") Integer userId) {
        try {
            List<TestBookingInfo> testBookings = testBookingInfoService.getTestBookingInfosByUserId(userId);
            return ResponseEntity.ok(testBookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy test bookings theo userId: " + e.getMessage());
        }
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<?> getTestBookingsByStaffId(@PathVariable("staffId") Integer staffId) {
        try {
            List<TestBookingInfo> testBookings = testBookingInfoService.getTestBookingInfosByStaffId(staffId);
            return ResponseEntity.ok(testBookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy test bookings theo staffId: " + e.getMessage());
        }
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
            Integer userId = (Integer) request.get("userId");
            Integer serviceId = (Integer) request.get("serviceId");
            String content = (String) request.get("content");
            
            Map<String, Object> result = testBookingInfoService.createBookingWithTestBooking(userId, serviceId, content);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi tạo booking với test booking: " + e.getMessage());
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
    public ResponseEntity<?> getTestBookingDetailsByStatus(@PathVariable("status") String status) {
        try {
            List<com.genderhealthcare.demo.model.TestBookingDetailDTO> details = testBookingInfoService.getTestBookingDetailsByStatus(status);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy chi tiết test bookings theo status: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}/detail")
    public ResponseEntity<?> getTestBookingDetailsByUserId(@PathVariable("userId") Integer userId) {
        try {
            List<com.genderhealthcare.demo.model.TestBookingDetailDTO> details = testBookingInfoService.getTestBookingDetailsByUserId(userId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy chi tiết test bookings theo userId: " + e.getMessage());
        }
    }
    
    @GetMapping("/all/detail")
    public ResponseEntity<?> getAllTestBookingDetails() {
        try {
            List<com.genderhealthcare.demo.model.TestBookingDetailDTO> details = testBookingInfoService.getAllTestBookingDetails();
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy tất cả chi tiết test bookings: " + e.getMessage());
        }
    }
}
