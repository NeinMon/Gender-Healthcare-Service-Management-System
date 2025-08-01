package com.genderhealthcare.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

import com.genderhealthcare.demo.entity.ConsultantLeaveRequest;

/**
 * Repository interface để quản lý đơn xin nghỉ của consultant
 * Kế thừa JpaRepository để có các phương thức CRUD cơ bản
 */
@Repository
public interface ConsultantLeaveRequestRepository extends JpaRepository<ConsultantLeaveRequest, Integer> {

    /**
     * Tìm tất cả đơn xin nghỉ sắp xếp theo thời gian tạo giảm dần
     * 
     * @return Danh sách đơn xin nghỉ
     */
    List<ConsultantLeaveRequest> findAllByOrderByCreatedAtDesc();

    /**
     * Tìm đơn xin nghỉ theo trạng thái
     * 
     * @param status Trạng thái đơn
     * @return Danh sách đơn xin nghỉ theo trạng thái
     */
    List<ConsultantLeaveRequest> findByStatusOrderByCreatedAtDesc(ConsultantLeaveRequest.LeaveRequestStatus status);

    /**
     * Tìm đơn xin nghỉ theo consultant ID
     * 
     * @param consultantId ID của consultant
     * @return Danh sách đơn xin nghỉ của consultant
     */
    List<ConsultantLeaveRequest> findByConsultantIdOrderByCreatedAtDesc(Integer consultantId);

    /**
     * Tìm đơn xin nghỉ theo consultant ID và ngày nghỉ
     * 
     * @param consultantId ID của consultant
     * @param leaveDate Ngày nghỉ
     * @return Danh sách đơn xin nghỉ trong ngày đó
     */
    List<ConsultantLeaveRequest> findByConsultantIdAndLeaveDateOrderByCreatedAtDesc(Integer consultantId, LocalDate leaveDate);

    /**
     * Tìm đơn xin nghỉ theo consultant ID, ngày nghỉ và ca nghỉ
     * Dùng để kiểm tra trùng lặp khi tạo đơn mới
     * 
     * @param consultantId ID của consultant
     * @param leaveDate Ngày nghỉ
     * @param shift Ca nghỉ
     * @return Danh sách đơn xin nghỉ trùng lặp
     */
    List<ConsultantLeaveRequest> findByConsultantIdAndLeaveDateAndShift(
            Integer consultantId, 
            LocalDate leaveDate, 
            ConsultantLeaveRequest.WorkShift shift);

    /**
     * Tìm đơn xin nghỉ đã được duyệt trong khoảng thời gian
     * 
     * @param consultantId ID của consultant
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     * @return Danh sách đơn xin nghỉ đã duyệt
     */
    @Query("SELECT lr FROM ConsultantLeaveRequest lr WHERE lr.consultantId = :consultantId " +
           "AND lr.leaveDate BETWEEN :startDate AND :endDate " +
           "AND lr.status = :status " +
           "ORDER BY lr.leaveDate ASC, lr.shift ASC")
    List<ConsultantLeaveRequest> findApprovedLeaveRequestsInDateRange(
            @Param("consultantId") Integer consultantId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") ConsultantLeaveRequest.LeaveRequestStatus status);

    /**
     * Đếm số đơn xin nghỉ chờ duyệt của một consultant
     * 
     * @param consultantId ID của consultant
     * @return Số lượng đơn chờ duyệt
     */
    @Query("SELECT COUNT(lr) FROM ConsultantLeaveRequest lr WHERE lr.consultantId = :consultantId " +
           "AND lr.status = :status")
    Long countPendingRequestsByConsultant(
            @Param("consultantId") Integer consultantId,
            @Param("status") ConsultantLeaveRequest.LeaveRequestStatus status);

    /**
     * Tìm đơn xin nghỉ theo khoảng thời gian tạo
     * 
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     * @return Danh sách đơn xin nghỉ trong khoảng thời gian
     */
    @Query("SELECT lr FROM ConsultantLeaveRequest lr WHERE lr.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY lr.createdAt DESC")
    List<ConsultantLeaveRequest> findByCreatedAtBetweenOrderByCreatedAtDesc(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);

    /**
     * Tìm đơn xin nghỉ của tất cả consultant trong ngày cụ thể
     * 
     * @param leaveDate Ngày nghỉ
     * @return Danh sách đơn xin nghỉ trong ngày
     */
    List<ConsultantLeaveRequest> findByLeaveDateOrderByConsultantIdAscShiftAsc(LocalDate leaveDate);

    /**
     * Tìm đơn xin nghỉ đã được duyệt của consultant trong ngày cụ thể
     * Dùng để kiểm tra xem consultant có nghỉ trong ngày đó không
     * 
     * @param consultantId ID của consultant
     * @param leaveDate Ngày cần kiểm tra
     * @return Danh sách đơn nghỉ đã duyệt
     */
    @Query("SELECT lr FROM ConsultantLeaveRequest lr WHERE lr.consultantId = :consultantId " +
           "AND lr.leaveDate = :leaveDate " +
           "AND lr.status = 'APPROVED'")
    List<ConsultantLeaveRequest> findApprovedLeaveRequestsByConsultantAndDate(
            @Param("consultantId") Integer consultantId,
            @Param("leaveDate") LocalDate leaveDate);
}
