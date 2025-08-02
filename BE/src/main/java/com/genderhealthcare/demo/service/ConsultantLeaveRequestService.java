package com.genderhealthcare.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

import com.genderhealthcare.demo.entity.ConsultantLeaveRequest;
import com.genderhealthcare.demo.repository.ConsultantLeaveRequestRepository;

/**
 * Service xử lý logic nghiệp vụ cho đơn xin nghỉ của consultant
 */
@Service
public class ConsultantLeaveRequestService {

    @Autowired
    private ConsultantLeaveRequestRepository leaveRequestRepository;

    /**
     * Tạo đơn xin nghỉ mới
     * 
     * @param leaveRequest Đơn xin nghỉ cần tạo
     * @return Đơn xin nghỉ đã được tạo
     * @throws RuntimeException nếu có lỗi validation
     */
    public ConsultantLeaveRequest createLeaveRequest(ConsultantLeaveRequest leaveRequest) {
        // Validation cơ bản
        validateLeaveRequest(leaveRequest);
        
        // Kiểm tra trùng lặp đơn xin nghỉ
        List<ConsultantLeaveRequest> existingRequests = leaveRequestRepository
                .findByConsultantIdAndLeaveDateAndShift(
                        leaveRequest.getConsultantId(),
                        leaveRequest.getLeaveDate(),
                        leaveRequest.getShift()
                );
        
        // Kiểm tra xem đã có đơn nào chưa được xử lý (PENDING hoặc APPROVED)
        boolean hasConflict = existingRequests.stream()
                .anyMatch(req -> req.getStatus() == ConsultantLeaveRequest.LeaveRequestStatus.PENDING ||
                               req.getStatus() == ConsultantLeaveRequest.LeaveRequestStatus.APPROVED);
        
        if (hasConflict) {
            throw new RuntimeException("Đã có đơn xin nghỉ cho ca làm việc này trong ngày " + leaveRequest.getLeaveDate());
        }
        
        return leaveRequestRepository.save(leaveRequest);
    }

    /**
     * Duyệt đơn xin nghỉ
     * 
     * @param requestId ID của đơn xin nghỉ
     * @param managerId ID của manager duyệt
     * @return Đơn xin nghỉ đã được duyệt
     */
    public ConsultantLeaveRequest approveLeaveRequest(Integer requestId, Integer managerId) {
        ConsultantLeaveRequest request = getLeaveRequestById(requestId);
        
        if (!request.isPending()) {
            throw new RuntimeException("Chỉ có thể duyệt đơn xin nghỉ đang chờ duyệt");
        }
        
        request.approve(managerId);
        return leaveRequestRepository.save(request);
    }

    /**
     * Từ chối đơn xin nghỉ
     * 
     * @param requestId ID của đơn xin nghỉ
     * @param managerId ID của manager từ chối
     * @return Đơn xin nghỉ đã bị từ chối
     */
    public ConsultantLeaveRequest rejectLeaveRequest(Integer requestId, Integer managerId) {
        ConsultantLeaveRequest request = getLeaveRequestById(requestId);
        
        if (!request.isPending()) {
            throw new RuntimeException("Chỉ có thể từ chối đơn xin nghỉ đang chờ duyệt");
        }
        
        request.reject(managerId);
        return leaveRequestRepository.save(request);
    }

    /**
     * Lấy tất cả đơn xin nghỉ
     * 
     * @return Danh sách tất cả đơn xin nghỉ
     */
    public List<ConsultantLeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Lấy đơn xin nghỉ theo trạng thái
     * 
     * @param status Trạng thái đơn
     * @return Danh sách đơn xin nghỉ theo trạng thái
     */
    public List<ConsultantLeaveRequest> getLeaveRequestsByStatus(String status) {
        try {
            ConsultantLeaveRequest.LeaveRequestStatus requestStatus = 
                ConsultantLeaveRequest.LeaveRequestStatus.valueOf(status.toUpperCase());
            return leaveRequestRepository.findByStatusOrderByCreatedAtDesc(requestStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status);
        }
    }

    /**
     * Lấy đơn xin nghỉ của một consultant
     * 
     * @param consultantId ID của consultant
     * @return Danh sách đơn xin nghỉ của consultant
     */
    public List<ConsultantLeaveRequest> getLeaveRequestsByConsultant(Integer consultantId) {
        return leaveRequestRepository.findByConsultantIdOrderByCreatedAtDesc(consultantId);
    }

    /**
     * Lấy thông tin chi tiết một đơn xin nghỉ
     * 
     * @param requestId ID của đơn xin nghỉ
     * @return Thông tin đơn xin nghỉ
     */
    public ConsultantLeaveRequest getLeaveRequestById(Integer requestId) {
        return leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn xin nghỉ với ID: " + requestId));
    }

    /**
     * Xóa đơn xin nghỉ
     * 
     * @param requestId ID của đơn xin nghỉ cần xóa
     */
    public void deleteLeaveRequest(Integer requestId) {
        ConsultantLeaveRequest request = getLeaveRequestById(requestId);
        
        // Chỉ cho phép xóa đơn chờ duyệt hoặc đơn bị từ chối
        if (request.isApproved()) {
            throw new RuntimeException("Không thể xóa đơn xin nghỉ đã được duyệt");
        }
        
        leaveRequestRepository.delete(request);
    }

    /**
     * Cập nhật đơn xin nghỉ
     * 
     * @param requestId ID của đơn xin nghỉ
     * @param updatedRequest Thông tin mới
     * @return Đơn xin nghỉ đã cập nhật
     */
    public ConsultantLeaveRequest updateLeaveRequest(Integer requestId, ConsultantLeaveRequest updatedRequest) {
        ConsultantLeaveRequest existingRequest = getLeaveRequestById(requestId);
        
        // Chỉ cho phép cập nhật đơn chờ duyệt
        if (!existingRequest.isPending()) {
            throw new RuntimeException("Chỉ có thể cập nhật đơn xin nghỉ đang chờ duyệt");
        }
        
        // Validate dữ liệu mới
        validateLeaveRequest(updatedRequest);
        
        // Cập nhật thông tin
        existingRequest.setLeaveDate(updatedRequest.getLeaveDate());
        existingRequest.setShift(updatedRequest.getShift());
        existingRequest.setNote(updatedRequest.getNote());
        
        return leaveRequestRepository.save(existingRequest);
    }

    /**
     * Lấy danh sách đơn chờ duyệt
     * 
     * @return Danh sách đơn chờ duyệt
     */
    public List<ConsultantLeaveRequest> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatusOrderByCreatedAtDesc(
                ConsultantLeaveRequest.LeaveRequestStatus.PENDING);
    }

    /**
     * Lấy đơn xin nghỉ của consultant trong ngày cụ thể
     * 
     * @param consultantId ID của consultant
     * @param date Ngày cần kiểm tra
     * @return Danh sách đơn xin nghỉ trong ngày đó
     */
    public List<ConsultantLeaveRequest> getLeaveRequestsByConsultantAndDate(Integer consultantId, LocalDate date) {
        return leaveRequestRepository.findByConsultantIdAndLeaveDateOrderByCreatedAtDesc(consultantId, date);
    }

    /**
     * Validate dữ liệu đơn xin nghỉ
     * 
     * @param leaveRequest Đơn xin nghỉ cần validate
     */
    private void validateLeaveRequest(ConsultantLeaveRequest leaveRequest) {
        if (leaveRequest.getConsultantId() == null) {
            throw new RuntimeException("ID tư vấn viên không được để trống");
        }
        
        if (leaveRequest.getLeaveDate() == null) {
            throw new RuntimeException("Ngày xin nghỉ không được để trống");
        }
        
        if (leaveRequest.getShift() == null) {
            throw new RuntimeException("Ca xin nghỉ không được để trống");
        }
        
        // Không cho phép xin nghỉ trong quá khứ (trừ ngày hôm nay)
        if (leaveRequest.getLeaveDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Không thể xin nghỉ trong quá khứ");
        }
    }
}
