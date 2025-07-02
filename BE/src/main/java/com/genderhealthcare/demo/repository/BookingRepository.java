package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findByServiceIdAndStatus(Integer serviceId, String status);
    
    // Tìm booking theo userId và status
    List<Booking> findByUserIdAndStatus(Integer userId, String status);
    
    // Tìm booking xét nghiệm (serviceId != 1)
    @Query("SELECT b FROM Booking b WHERE b.serviceId != 1")
    List<Booking> findTestBookings();
    
    // Tìm booking xét nghiệm theo trạng thái
    @Query("SELECT b FROM Booking b WHERE b.serviceId != 1 AND b.status = :status")
    List<Booking> findTestBookingsByStatus(@Param("status") String status);

    // Lấy tất cả booking của 1 tư vấn viên trong 1 ngày (để kiểm tra khung giờ rảnh)
    List<Booking> findByConsultantIdAndAppointmentDate(Integer consultantId, LocalDate appointmentDate);

    // Kiểm tra trùng lịch dựa trên consultant, ngày và khung giờ cụ thể
    @Query("SELECT b FROM Booking b " +
           "WHERE b.consultantId = :consultantId AND b.appointmentDate = :appointmentDate " +
           "AND b.status IN ('Chờ bắt đầu', 'Đang diễn ra') " +
           "AND b.startTime >= :startTime AND b.startTime < :endTime")
    List<Booking> findConflictingBookingsByTimeRange(@Param("consultantId") Integer consultantId,
                                                     @Param("appointmentDate") LocalDate appointmentDate,
                                                     @Param("startTime") LocalTime startTime,
                                                     @Param("endTime") LocalTime endTime);

    // Deprecated - chỉ kiểm tra theo ngày (không chính xác)
    @Deprecated
    boolean existsByConsultantIdAndAppointmentDate(Integer consultantId, LocalDate appointmentDate);
}

