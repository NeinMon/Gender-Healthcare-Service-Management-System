package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findByServiceIdAndStatus(Integer serviceId, String status);


    // Đảm bảo có interface này
    boolean existsByConsultantIdAndAppointmentDate(Integer consultantId, String appointmentDate);

    // Lấy tất cả booking của 1 tư vấn viên trong 1 ngày (để kiểm tra khung giờ rảnh)
    @Query("SELECT b FROM Booking b WHERE b.consultantId = :consultantId AND b.appointmentDate LIKE CONCAT(:date, '%')")
    List<Booking> findByConsultantIdAndDate(Integer consultantId, String date);
}

