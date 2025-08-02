package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.TestBookingInfo;
import com.genderhealthcare.demo.service.TestBookingInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    
    /**
     * === CÁC API CRUD VÀ QUẢN LÝ TRẠNG THÁI ===
     * Nhóm API cơ bản cho test booking operations
     */
    // === CRUD & Status Operations ===

    /**
     * API tạo test booking mới
     * Tạo lịch hẹn xét nghiệm offline cho khách hàng
     * 
     * @param testBookingInfo Thông tin test booking cần tạo (đã validate)
     * @return ResponseEntity chứa TestBookingInfo đã tạo hoặc lỗi
     */
    // @PostMapping
    // public ResponseEntity<?> createTestBooking(@Valid @RequestBody TestBookingInfo testBookingInfo) {
    //     try {
    //         TestBookingInfo created = testBookingInfoService.createTestBookingInfo(testBookingInfo);
    //         return ResponseEntity.status(HttpStatus.CREATED).body(created);
    //     } catch (IllegalArgumentException e) {
    //         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    //     }
    // }

    /**
     * API lấy tất cả test booking trong hệ thống
     * Trả về danh sách tất cả lịch hẹn xét nghiệm cho staff quản lý
     * 
     * @return ResponseEntity chứa danh sách TestBookingInfo hoặc lỗi
     */
    // @GetMapping
    // public ResponseEntity<?> getAllTestBookings() {
    //     try {
    //         List<TestBookingInfo> testBookings = testBookingInfoService.getAllTestBookingInfos();
    //         return ResponseEntity.ok(testBookings);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy danh sách test bookings: " + e.getMessage());
    //     }
    // }

    /**
     * API lấy test booking theo ID
     * Tìm kiếm và trả về thông tin chi tiết của một test booking cụ thể
     * 
     * @param id ID của test booking cần tìm
     * @return ResponseEntity chứa TestBookingInfo hoặc thông báo không tìm thấy
     */
    // @GetMapping("/{id}")
    // public ResponseEntity<?> getTestBookingById(@PathVariable("id") Integer id) {
    //     try {
    //         TestBookingInfo testBookingInfo = testBookingInfoService.getTestBookingInfoById(id);
    //         if (testBookingInfo == null) {
    //             return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Test booking not found");
    //         }
    //         return ResponseEntity.ok(testBookingInfo);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy test booking: " + e.getMessage());
    //     }
    // }

    /**
     * API lấy test booking theo booking ID
     * Tìm kiếm test booking thông qua ID của booking chính
     * 
     * @param bookingId ID của booking chính liên kết với test booking
     * @return ResponseEntity chứa TestBookingInfo hoặc thông báo không tìm thấy
     */
    // @GetMapping("/booking/{bookingId}")
    // public ResponseEntity<?> getTestBookingByBookingId(@PathVariable("bookingId") Integer bookingId) {
    //     try {
    //         TestBookingInfo testBookingInfo = testBookingInfoService.getTestBookingInfoByBookingId(bookingId);
    //         if (testBookingInfo == null) {
    //             return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Test booking not found for booking ID: " + bookingId);
    //         }
    //         return ResponseEntity.ok(testBookingInfo);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy test booking theo bookingId: " + e.getMessage());
    //     }
    // }

    /**
     * API lấy test booking theo trạng thái
     * Lọc danh sách test booking theo trạng thái cụ thể
     * 
     * @param status Trạng thái cần lọc (Pending, Confirmed, Completed, Cancelled)
     * @return ResponseEntity chứa danh sách TestBookingInfo theo trạng thái hoặc lỗi
     */
    // @GetMapping("/status/{status}")
    // public ResponseEntity<?> getTestBookingsByStatus(@PathVariable("status") String status) {
    //     try {
    //         List<TestBookingInfo> testBookings = testBookingInfoService.getTestBookingInfosByStatus(status);
    //         return ResponseEntity.ok(testBookings);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy test bookings theo status: " + e.getMessage());
    //     }
    // }

    /**
     * API lấy test booking theo user ID
     * Lấy danh sách tất cả test booking của một khách hàng cụ thể
     * 
     * @param userId ID của khách hàng
     * @return ResponseEntity chứa danh sách TestBookingInfo của user hoặc lỗi
     */
    // @GetMapping("/user/{userId}")
    // public ResponseEntity<?> getTestBookingsByUserId(@PathVariable("userId") Integer userId) {
    //     try {
    //         List<TestBookingInfo> testBookings = testBookingInfoService.getTestBookingInfosByUserId(userId);
    //         return ResponseEntity.ok(testBookings);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy test bookings theo userId: " + e.getMessage());
    //     }
    // }

    /**
     * API lấy test booking theo staff ID
     * Lấy danh sách tất cả test booking được quản lý bởi nhân viên cụ thể
     * 
     * @param staffId ID của nhân viên xét nghiệm
     * @return ResponseEntity chứa danh sách TestBookingInfo được quản lý bởi staff hoặc lỗi
     */
    // @GetMapping("/staff/{staffId}")
    // public ResponseEntity<?> getTestBookingsByStaffId(@PathVariable("staffId") Integer staffId) {
    //     try {
    //         List<TestBookingInfo> testBookings = testBookingInfoService.getTestBookingInfosByStaffId(staffId);
    //         return ResponseEntity.ok(testBookings);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .body("Lỗi lấy test bookings theo staffId: " + e.getMessage());
    //     }
    // }

    /**
     * API cập nhật thông tin test booking
     * Cập nhật toàn bộ thông tin của một test booking cụ thể
     * 
     * @param id ID của test booking cần cập nhật
     * @param testBookingInfo Thông tin mới của test booking (đã validate)
     * @return ResponseEntity chứa TestBookingInfo đã được cập nhật hoặc lỗi
     * @throws IllegalArgumentException nếu ID không tồn tại
     */
    // @PutMapping("/{id}")
    // public ResponseEntity<?> updateTestBooking(@PathVariable("id") Integer id, 
    //                                            @Valid @RequestBody TestBookingInfo testBookingInfo) {
    //     try {
    //         TestBookingInfo updated = testBookingInfoService.updateTestBookingInfo(id, testBookingInfo);
    //         return ResponseEntity.ok(updated);
    //     } catch (IllegalArgumentException e) {
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    //     }
    // }

    /**
     * API cập nhật trạng thái test booking
     * Cập nhật trạng thái của test booking cho quy trình check-in/check-out
     * Hỗ trợ 4 trạng thái: Chờ bắt đầu, Đã check-in, Đã check-out, Đã kết thúc
     * 
     * @param id ID của test booking cần cập nhật trạng thái
     * @param status Trạng thái mới (Chờ bắt đầu/Đã check-in/Đã check-out/Đã kết thúc)
     * @param testResult Kết quả xét nghiệm (bắt buộc khi status = "Đã check-out")
     * @param resultNote Ghi chú kết quả (tùy chọn)
     * @param staffName Tên nhân viên (tùy chọn)
     * @return ResponseEntity chứa TestBookingInfo đã cập nhật trạng thái hoặc lỗi
     * @throws IllegalArgumentException nếu ID không tồn tại hoặc trạng thái không hợp lệ
     */
    // Chỉ còn 1 endpoint cập nhật trạng thái (4 trạng thái hợp lệ)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable("id") Integer id,
                                          @RequestParam("status") String status,
                                          @RequestParam(value = "staffName", required = false) String staffName) {
        try {
            TestBookingInfo updated;
            
            if ("Đã check-out".equals(status)) {
                // Cập nhật thành check-out
                updated = testBookingInfoService.updateTestStatusToCheckout(id);
            } else if ("Đã kết thúc".equals(status)) {
                // Hoàn thành test booking - chuyển từ check-out sang kết thúc
                updated = testBookingInfoService.completeTestBooking(id);
            } else {
                // Cập nhật trạng thái thông thường (check-in, etc.)
                updated = testBookingInfoService.updateTestStatus(id, status);
            }
            
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * API tạo test booking kèm booking gốc
     * Tạo đồng thời booking chính và test booking info trong một transaction
     * Đây là endpoint tích hợp để đảm bảo tính nhất quán dữ liệu
     * 
     * @param request Map chứa userId, serviceId, content cho việc tạo booking
     * @return ResponseEntity chứa thông tin booking và test booking đã tạo hoặc lỗi
     * @throws Exception nếu có lỗi trong quá trình tạo booking hoặc test booking
     */
    // === Tạo test booking kèm booking gốc ===
    // @PostMapping("/create-with-booking")
    // public ResponseEntity<?> createTestBookingWithBooking(@Valid @RequestBody Map<String, Object> request) {
    //     try {
    //         Integer userId = (Integer) request.get("userId");
    //         Integer serviceId = (Integer) request.get("serviceId");
    //         String content = (String) request.get("content");
            
    //         Map<String, Object> result = testBookingInfoService.createBookingWithTestBooking(userId, serviceId, content);
    //         return ResponseEntity.status(HttpStatus.CREATED).body(result);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi tạo booking với test booking: " + e.getMessage());
    //     }
    // }

    /**
     * API cập nhật kết quả xét nghiệm
     * Cập nhật kết quả xét nghiệm khi nhân viên hoàn thành kiểm tra
     * Chỉ cho phép cập nhật khi trạng thái là "Đã check-out"
     * 
     * @param id ID của test booking cần cập nhật kết quả
     * @param testStatus Trạng thái test (phải là "Đã check-out")
     * @param testResult Kết quả xét nghiệm chi tiết
     * @param resultNote Ghi chú thêm về kết quả (tùy chọn)
     * @param staffName Tên nhân viên thực hiện xét nghiệm (tùy chọn)
     * @return ResponseEntity chứa TestBookingInfo đã cập nhật kết quả hoặc lỗi
     * @throws Exception nếu có lỗi trong quá trình cập nhật
     */
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
            
            // Cập nhật trạng thái thành check-out (không cần kết quả ở đây)
            // Kết quả xét nghiệm được quản lý trong hệ thống TestResult riêng
            TestBookingInfo updated = testBookingInfoService.updateTestStatusToCheckout(id);
            
            return ResponseEntity.ok(updated);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật kết quả xét nghiệm: " + e.getMessage());
        }
    }

    /**
     * API cập nhật kết quả và ghi chú cho test booking đã hoàn thành
     * Chỉ cho phép cập nhật test booking có trạng thái "Đã kết thúc"
     * 
     * @param id ID của test booking cần cập nhật
     * @param testResult Kết quả xét nghiệm mới
     * @param resultNote Ghi chú kết quả mới (tùy chọn)
     * @return ResponseEntity chứa TestBookingInfo đã cập nhật hoặc lỗi
     */
    @PutMapping("/{id}/update-result")
    public ResponseEntity<?> updateCompletedResult(
            @PathVariable("id") Integer id,
            @RequestParam("testResult") String testResult,
            @RequestParam(value = "resultNote", required = false) String resultNote) {
        try {
            // Kiểm tra xem test booking có tồn tại không
            TestBookingInfo existing = testBookingInfoService.getTestBookingInfoById(id);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Không tìm thấy thông tin đặt xét nghiệm với ID: " + id);
            }
            
            // Chỉ cho phép cập nhật nếu trạng thái là "Đã kết thúc"
            if (!"Đã kết thúc".equals(existing.getTestStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Chỉ có thể cập nhật kết quả cho xét nghiệm đã hoàn thành");
            }
            
            // Ghi chú: Với hệ thống mới, kết quả xét nghiệm được quản lý trong bảng test_result riêng
            // API này không còn cần thiết và sẽ trả về thông báo hướng dẫn
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("API này đã được thay thế. Vui lòng sử dụng hệ thống TestResult API để quản lý kết quả xét nghiệm.");
            
            // Không cần cập nhật kết quả ở đây nữa
            // TestBookingInfo updated = testBookingInfoService.updateTestBookingInfo(id, existing);
            
            // return ResponseEntity.ok(updated);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật kết quả xét nghiệm: " + e.getMessage());
        }
    }

    /**
     * API lấy thông tin chi tiết test booking theo ID
     * Trả về thông tin chi tiết đầy đủ của test booking bao gồm cả thông tin liên quan
     * 
     * @param id ID của test booking cần lấy thông tin chi tiết
     * @return ResponseEntity chứa TestBookingDetailDTO hoặc thông báo không tìm thấy
     */
    // === Detailed Information Endpoints ===
    @GetMapping("/{id}/detail")
    public ResponseEntity<?> getTestBookingDetailById(@PathVariable("id") Integer id) {
        com.genderhealthcare.demo.model.TestBookingDetailDTO detail = testBookingInfoService.getTestBookingDetailById(id);
        if (detail == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Test booking not found");
        }
        return ResponseEntity.ok(detail);
    }

    /**
     * API lấy thông tin chi tiết test booking theo trạng thái
     * Trả về danh sách thông tin chi tiết của tất cả test booking có trạng thái cụ thể
     * 
     * @param status Trạng thái cần lọc (Pending, Đã check-in, Đã check-out)
     * @return ResponseEntity chứa danh sách TestBookingDetailDTO theo trạng thái hoặc lỗi
     */
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

    /**
     * API lấy thông tin chi tiết test booking theo user ID
     * Trả về danh sách thông tin chi tiết của tất cả test booking của một khách hàng
     * 
     * @param userId ID của khách hàng
     * @return ResponseEntity chứa danh sách TestBookingDetailDTO của user hoặc lỗi
     */
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
    
    /**
     * API lấy tất cả thông tin chi tiết test booking
     * Trả về danh sách thông tin chi tiết đầy đủ của tất cả test booking trong hệ thống
     * Dành cho staff quản lý xem tổng quan toàn bộ
     * 
     * @return ResponseEntity chứa danh sách tất cả TestBookingDetailDTO hoặc lỗi
     */
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