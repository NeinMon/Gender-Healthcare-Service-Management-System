package com.genderhealthcare.demo.api;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import jakarta.validation.Valid;

import java.util.List;

import com.genderhealthcare.demo.entity.ConsultantLeaveRequest;
import com.genderhealthcare.demo.service.ConsultantLeaveRequestService;

/**
 * API Controller xử lý các yêu cầu quản lý đơn xin nghỉ của consultant
 * Bao gồm: tạo đơn, duyệt/từ chối đơn, xem danh sách đơn, xóa đơn
 */
@RestController
@CrossOrigin("*")
@RequestMapping("/api/leave-requests")
public class ConsultantLeaveRequestAPI {

    @Autowired
    private ConsultantLeaveRequestService leaveRequestService;

    /**
     * API để consultant tạo đơn xin nghỉ mới
     * 
     * @param leaveRequest Đơn xin nghỉ cần tạo
     * @return ResponseEntity chứa đơn xin nghỉ đã tạo hoặc lỗi
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitLeaveRequest(@Valid @RequestBody ConsultantLeaveRequest leaveRequest) {
        try {
            ConsultantLeaveRequest newRequest = leaveRequestService.createLeaveRequest(leaveRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(newRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo đơn xin nghỉ: " + e.getMessage());
        }
    }

    /**
     * API để manager duyệt đơn xin nghỉ
     * 
     * @param requestId ID của đơn xin nghỉ
     * @param managerId ID của manager duyệt đơn
     * @return ResponseEntity chứa đơn đã duyệt hoặc lỗi
     */
    @PutMapping("/{requestId}/approve")
    public ResponseEntity<?> approveLeaveRequest(
            @PathVariable Integer requestId,
            @RequestParam Integer managerId) {
        try {
            ConsultantLeaveRequest approvedRequest = leaveRequestService.approveLeaveRequest(requestId, managerId);
            return ResponseEntity.ok(approvedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi duyệt đơn xin nghỉ: " + e.getMessage());
        }
    }

    /**
     * API để manager từ chối đơn xin nghỉ
     * 
     * @param requestId ID của đơn xin nghỉ
     * @param managerId ID của manager từ chối đơn
     * @return ResponseEntity chứa đơn đã từ chối hoặc lỗi
     */
    @PutMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectLeaveRequest(
            @PathVariable Integer requestId,
            @RequestParam Integer managerId) {
        try {
            ConsultantLeaveRequest rejectedRequest = leaveRequestService.rejectLeaveRequest(requestId, managerId);
            return ResponseEntity.ok(rejectedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi từ chối đơn xin nghỉ: " + e.getMessage());
        }
    }

    /**
     * API để manager lấy tất cả đơn xin nghỉ
     * 
     * @return ResponseEntity chứa danh sách tất cả đơn xin nghỉ
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllLeaveRequests() {
        try {
            List<ConsultantLeaveRequest> requests = leaveRequestService.getAllLeaveRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi lấy danh sách đơn xin nghỉ: " + e.getMessage());
        }
    }

    /**
     * API để lấy đơn xin nghỉ của một consultant cụ thể
     * 
     * @param consultantId ID của consultant
     * @return ResponseEntity chứa danh sách đơn xin nghỉ của consultant
     */
    @GetMapping("/consultant/{consultantId}")
    public ResponseEntity<?> getLeaveRequestsByConsultant(@PathVariable Integer consultantId) {
        try {
            List<ConsultantLeaveRequest> requests = leaveRequestService.getLeaveRequestsByConsultant(consultantId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy đơn xin nghỉ của consultant: " + e.getMessage());
        }
    }

    /**
     * API để xóa đơn xin nghỉ (chỉ có thể xóa đơn chờ duyệt)
     * 
     * @param requestId ID của đơn xin nghỉ cần xóa
     * @return ResponseEntity xác nhận xóa thành công hoặc lỗi
     */
    @DeleteMapping("/{requestId}")
    public ResponseEntity<?> deleteLeaveRequest(@PathVariable Integer requestId) {
        try {
            leaveRequestService.deleteLeaveRequest(requestId);
            return ResponseEntity.ok("Xóa đơn xin nghỉ thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể xóa đơn xin nghỉ: " + e.getMessage());
        }
    }

    /**
     * API để cập nhật đơn xin nghỉ (chỉ có thể cập nhật đơn chờ duyệt)
     * 
     * @param requestId ID của đơn xin nghỉ
     * @param updatedRequest Thông tin đơn xin nghỉ mới
     * @return ResponseEntity chứa đơn đã cập nhật hoặc lỗi
     */
    @PutMapping("/{requestId}")
    public ResponseEntity<?> updateLeaveRequest(
            @PathVariable Integer requestId,
            @Valid @RequestBody ConsultantLeaveRequest updatedRequest) {
        try {
            ConsultantLeaveRequest updated = leaveRequestService.updateLeaveRequest(requestId, updatedRequest);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể cập nhật đơn xin nghỉ: " + e.getMessage());
        }
    }

    /**
     * API để lấy đơn xin nghỉ chờ duyệt (cho manager)
     * 
     * @return ResponseEntity chứa danh sách đơn chờ duyệt
     */
}
