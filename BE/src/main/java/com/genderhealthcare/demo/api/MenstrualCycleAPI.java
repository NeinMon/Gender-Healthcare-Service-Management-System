package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.MenstrualCycle;
import com.genderhealthcare.demo.exception.AccountNotFoundException;
import com.genderhealthcare.demo.exception.DuplicateMenstrualCycleException;
import com.genderhealthcare.demo.exception.InvalidMenstrualCycleDateException;
import com.genderhealthcare.demo.exception.MenstrualCycleNotFoundException;
import com.genderhealthcare.demo.model.MenstrualCycleRequest;
import com.genderhealthcare.demo.service.MenstrualCycleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import java.util.List;

/**
 * API Controller xử lý các yêu cầu theo dõi chu kỳ kinh nguyệt
 * Quản lý thông tin chu kỳ kinh nguyệt của phụ nữ để hỗ trợ tư vấn sức khỏe
 * API này chỉ tiếp nhận request từ frontend và gọi đến service layer
 */
@RestController
@CrossOrigin("*")
@RequestMapping("/api/menstrual-cycles")
public class MenstrualCycleAPI {

    @Autowired
    private MenstrualCycleService menstrualCycleService;

    /**
     * API test kết nối backend
     * Endpoint đơn giản để kiểm tra kết nối từ frontend đến backend
     * 
     * @return ResponseEntity chứa thông báo kết nối thành công
     */
    // @GetMapping("/test")
    // public ResponseEntity<Map<String, String>> testConnection() {
    //     Map<String, String> response = new HashMap<>();
    //     response.put("message", "Backend connection successful");
    //     response.put("status", "OK");
    //     return new ResponseEntity<>(response, HttpStatus.OK);
    // }

    /**
     * API lấy tất cả chu kỳ kinh nguyệt trong hệ thống
     * Trả về danh sách tất cả menstrual cycle data cho admin/staff
     * 
     * @return ResponseEntity chứa danh sách MenstrualCycle hoặc lỗi
     */
    // @GetMapping
    // public ResponseEntity<?> getAllMenstrualCycles() {
    //     try {
    //         List<MenstrualCycle> cycles = menstrualCycleService.getAllMenstrualCycles();
    //         return ResponseEntity.ok(cycles);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi lấy danh sách chu kỳ kinh nguyệt: " + e.getMessage());
    //     }
    // }

    /**
     * API lấy chu kỳ kinh nguyệt theo user ID
     * Lấy thông tin chu kỳ kinh nguyệt của một phụ nữ cụ thể
     * 
     * @param userId ID của người dùng (phụ nữ)
     * @return ResponseEntity chứa MenstrualCycle hoặc thông báo không tìm thấy
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getMenstrualCycleByUserId(@PathVariable Long userId) {
        try {
            MenstrualCycle cycle = menstrualCycleService.getMenstrualCycleByUserId(userId);
            return ResponseEntity.ok(cycle);
        } catch (MenstrualCycleNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy chu kỳ kinh nguyệt cho người dùng ID: " + userId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi lấy chu kỳ kinh nguyệt: " + e.getMessage());
        }
    }    
    
    /**
     * API lấy chu kỳ kinh nguyệt theo ID
     * Tìm kiếm menstrual cycle bằng primary key ID
     * 
     * @param id ID của chu kỳ kinh nguyệt cần tìm
     * @return ResponseEntity chứa MenstrualCycle hoặc thông báo không tìm thấy
     */
    // @GetMapping("/{id}")
    // public ResponseEntity<?> getMenstrualCycleById(@PathVariable Long id) {
    //     try {
    //         MenstrualCycle cycle = menstrualCycleService.getMenstrualCycleById(id);
    //         return ResponseEntity.ok(cycle);
    //     } catch (MenstrualCycleNotFoundException e) {
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy chu kỳ kinh nguyệt với ID: " + id);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi lấy chu kỳ kinh nguyệt: " + e.getMessage());
    //     }
    // }

    /**
     * API kiểm tra user có chu kỳ kinh nguyệt không
     * Kiểm tra xem một phụ nữ đã có thông tin chu kỳ trong hệ thống chưa
     * 
     * @param userId ID của người dùng cần kiểm tra
     * @return ResponseEntity chứa boolean exists hoặc lỗi
     */
    @GetMapping("/user/{userId}/exists")
    public ResponseEntity<?> checkUserHasCycle(@PathVariable Long userId) {
        try {
            boolean exists = menstrualCycleService.hasUserMenstrualCycle(userId);
            Map<String, Boolean> response = new HashMap<>();
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi kiểm tra chu kỳ kinh nguyệt: " + e.getMessage());
        }
    }
    
    /**
     * API tạo chu kỳ kinh nguyệt mới
     * Tạo thông tin chu kỳ kinh nguyệt cho phụ nữ lần đầu sử dụng
     * Validate dữ liệu và kiểm tra không trùng lặp
     * 
     * @param request MenstrualCycleRequest chứa thông tin chu kỳ (userId, lastPeriodDate, cycleLength, ...)
     * @return ResponseEntity chứa MenstrualCycle đã tạo hoặc exception
     * @throws AccountNotFoundException nếu không tìm thấy user
     * @throws InvalidMenstrualCycleDateException nếu ngày không hợp lệ
     * @throws DuplicateMenstrualCycleException nếu user đã có chu kỳ
     */
    @PostMapping
    public ResponseEntity<MenstrualCycle> createMenstrualCycle(@Valid @RequestBody MenstrualCycleRequest request) {
        try {
            MenstrualCycle createdCycle = menstrualCycleService.createMenstrualCycle(request);
            return new ResponseEntity<>(createdCycle, HttpStatus.CREATED);
        } catch (AccountNotFoundException | InvalidMenstrualCycleDateException | DuplicateMenstrualCycleException e) {
            // These exceptions will be handled by ValidationHandler
            throw e;
        }
    }    
    
    /**
     * API cập nhật chu kỳ kinh nguyệt theo ID
     * Cập nhật thông tin chu kỳ kinh nguyệt đã tồn tại hoặc tạo mới nếu không có
     * 
     * @param id ID của chu kỳ kinh nguyệt cần cập nhật
     * @param request MenstrualCycleRequest chứa thông tin cập nhật
     * @return ResponseEntity chứa MenstrualCycle đã cập nhật hoặc exception
     * @throws MenstrualCycleNotFoundException nếu không tìm thấy chu kỳ
     * @throws AccountNotFoundException nếu không tìm thấy user
     * @throws InvalidMenstrualCycleDateException nếu ngày không hợp lệ
     */
    // @PutMapping("/{id}")
    // public ResponseEntity<MenstrualCycle> updateMenstrualCycle(
    //         @PathVariable Long id,
    //         @Valid @RequestBody MenstrualCycleRequest request) {
    //     try {
    //         MenstrualCycle updatedCycle = menstrualCycleService.updateOrCreateMenstrualCycle(id, request);
    //         return new ResponseEntity<>(updatedCycle, HttpStatus.OK);
    //     } catch (MenstrualCycleNotFoundException | AccountNotFoundException | 
    //              InvalidMenstrualCycleDateException | IllegalArgumentException e) {
    //         // Let the ValidationHandler handle these exceptions
    //         throw e;
    //     }
    // }    
    
    /**
     * API cập nhật chu kỳ kinh nguyệt theo user ID
     * Cập nhật hoặc tạo mới chu kỳ kinh nguyệt cho một user cụ thể
     * Tự động xác định trả về status CREATED hoặc OK tùy theo trường hợp
     * 
     * @param userId ID của người dùng
     * @param request MenstrualCycleRequest chứa thông tin chu kỳ
     * @return ResponseEntity chứa MenstrualCycle với status tương ứng hoặc exception
     * @throws AccountNotFoundException nếu không tìm thấy user
     * @throws InvalidMenstrualCycleDateException nếu ngày không hợp lệ
     */
    @PutMapping("/user/{userId}")
    public ResponseEntity<MenstrualCycle> updateMenstrualCycleByUserId(
            @PathVariable Long userId,
            @Valid @RequestBody MenstrualCycleRequest request) {
        try {
            // Use our new service method that handles both update and create cases
            MenstrualCycle cycle = menstrualCycleService.updateOrCreateMenstrualCycleForUser(userId, request);
            
            // Return CREATED status if this was a new cycle, otherwise OK
            HttpStatus status = menstrualCycleService.hasUserMenstrualCycle(userId) ? HttpStatus.OK : HttpStatus.CREATED;
            return new ResponseEntity<>(cycle, status);
        } catch (AccountNotFoundException | InvalidMenstrualCycleDateException | IllegalArgumentException e) {
            // Let the ValidationHandler handle these exceptions
            throw e;
        }
    }

    /**
     * API xóa chu kỳ kinh nguyệt
     * Xóa hoàn toàn thông tin chu kỳ kinh nguyệt khỏi hệ thống
     * 
     * @param id ID của chu kỳ kinh nguyệt cần xóa
     * @return ResponseEntity với status NO_CONTENT hoặc exception
     * @throws MenstrualCycleNotFoundException nếu không tìm thấy chu kỳ để xóa
     */
    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deleteMenstrualCycle(@PathVariable Long id) {
    //     try {
    //         menstrualCycleService.deleteMenstrualCycle(id);
    //         return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    //     } catch (MenstrualCycleNotFoundException e) {
    //         // Let the ValidationHandler handle this exception
    //         throw e;
    //     }
    // }
}
