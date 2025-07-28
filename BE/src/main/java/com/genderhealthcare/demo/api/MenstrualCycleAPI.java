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

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testConnection() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Backend connection successful");
        response.put("status", "OK");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<?> getAllMenstrualCycles() {
        try {
            List<MenstrualCycle> cycles = menstrualCycleService.getAllMenstrualCycles();
            return ResponseEntity.ok(cycles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi lấy danh sách chu kỳ kinh nguyệt: " + e.getMessage());
        }
    }

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
    }    @GetMapping("/{id}")
    public ResponseEntity<?> getMenstrualCycleById(@PathVariable Long id) {
        try {
            MenstrualCycle cycle = menstrualCycleService.getMenstrualCycleById(id);
            return ResponseEntity.ok(cycle);
        } catch (MenstrualCycleNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy chu kỳ kinh nguyệt với ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi lấy chu kỳ kinh nguyệt: " + e.getMessage());
        }
    }

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
    }@PostMapping
    public ResponseEntity<MenstrualCycle> createMenstrualCycle(@Valid @RequestBody MenstrualCycleRequest request) {
        try {
            MenstrualCycle createdCycle = menstrualCycleService.createMenstrualCycle(request);
            return new ResponseEntity<>(createdCycle, HttpStatus.CREATED);
        } catch (AccountNotFoundException | InvalidMenstrualCycleDateException | DuplicateMenstrualCycleException e) {
            // These exceptions will be handled by ValidationHandler
            throw e;
        }
    }    @PutMapping("/{id}")
    public ResponseEntity<MenstrualCycle> updateMenstrualCycle(
            @PathVariable Long id,
            @Valid @RequestBody MenstrualCycleRequest request) {
        try {
            MenstrualCycle updatedCycle = menstrualCycleService.updateOrCreateMenstrualCycle(id, request);
            return new ResponseEntity<>(updatedCycle, HttpStatus.OK);
        } catch (MenstrualCycleNotFoundException | AccountNotFoundException | 
                 InvalidMenstrualCycleDateException | IllegalArgumentException e) {
            // Let the ValidationHandler handle these exceptions
            throw e;
        }
    }    @PutMapping("/user/{userId}")
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenstrualCycle(@PathVariable Long id) {
        try {
            menstrualCycleService.deleteMenstrualCycle(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (MenstrualCycleNotFoundException e) {
            // Let the ValidationHandler handle this exception
            throw e;
        }
    }
}
