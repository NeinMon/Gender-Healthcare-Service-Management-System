package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.ConsultantSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface cho ConsultantSchedule entity
 */
@Repository
public interface ConsultantScheduleRepository extends JpaRepository<ConsultantSchedule, Integer> {
    
    // Tìm lịch làm việc theo consultantID
    List<ConsultantSchedule> findByConsultantID(Integer consultantID);
    
    // Tìm lịch làm việc theo ngày
    List<ConsultantSchedule> findByWorkDate(LocalDate workDate);
    
    // Tìm lịch làm việc theo consultantID và ngày
    List<ConsultantSchedule> findByConsultantIDAndWorkDate(Integer consultantID, LocalDate workDate);
    
    // Tìm lịch làm việc theo consultantID, ngày và ca
    List<ConsultantSchedule> findByConsultantIDAndWorkDateAndShift(
            Integer consultantID, LocalDate workDate, ConsultantSchedule.WorkShift shift);
    
    // Tìm lịch làm việc theo trạng thái
    List<ConsultantSchedule> findByStatus(ConsultantSchedule.ScheduleStatus status);
    
    // Tìm lịch làm việc theo consultantID và trạng thái
    List<ConsultantSchedule> findByConsultantIDAndStatus(Integer consultantID, ConsultantSchedule.ScheduleStatus status);
    
    // Tìm lịch làm việc theo consultantID, ngày, ca và trạng thái
    List<ConsultantSchedule> findByConsultantIDAndWorkDateAndShiftAndStatus(
            Integer consultantID, LocalDate workDate, 
            ConsultantSchedule.WorkShift shift, ConsultantSchedule.ScheduleStatus status);
    
    // Tìm lịch có sẵn của consultant trong ngày cụ thể
    @Query("SELECT cs FROM ConsultantSchedule cs WHERE cs.consultantID = :consultantID " +
           "AND cs.workDate = :workDate AND cs.status = 'AVAILABLE' ORDER BY cs.shift")
    List<ConsultantSchedule> findAvailableSchedulesByConsultantAndDate(
            @Param("consultantID") Integer consultantID, 
            @Param("workDate") LocalDate workDate);
    
    // Tìm lịch trùng lặp để kiểm tra xung đột
    @Query("SELECT cs FROM ConsultantSchedule cs WHERE cs.consultantID = :consultantID " +
           "AND cs.workDate = :workDate AND cs.shift = :shift AND cs.scheduleID != :excludeScheduleID")
    List<ConsultantSchedule> findOverlappingSchedules(
            @Param("consultantID") Integer consultantID,
            @Param("workDate") LocalDate workDate,
            @Param("shift") ConsultantSchedule.WorkShift shift,
            @Param("excludeScheduleID") Integer excludeScheduleID);
    
    // Đếm số lượng lịch làm việc của consultant
    @Query("SELECT COUNT(cs) FROM ConsultantSchedule cs WHERE cs.consultantID = :consultantID")
    Long countByConsultantID(@Param("consultantID") Integer consultantID);
    
    // Tìm lịch làm việc trong khoảng thời gian
    @Query("SELECT cs FROM ConsultantSchedule cs WHERE cs.workDate >= :startDate AND cs.workDate <= :endDate ORDER BY cs.workDate, cs.shift")
    List<ConsultantSchedule> findSchedulesInDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
    
    // Tìm lịch làm việc của consultant trong khoảng thời gian
    @Query("SELECT cs FROM ConsultantSchedule cs WHERE cs.consultantID = :consultantID " +
           "AND cs.workDate >= :startDate AND cs.workDate <= :endDate ORDER BY cs.workDate, cs.shift")
    List<ConsultantSchedule> findConsultantSchedulesInDateRange(
            @Param("consultantID") Integer consultantID,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
