package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findByServiceIdAndStatus(Integer serviceId, String status);


    // Lấy tất cả booking của 1 tư vấn viên trong 1 ngày (để kiểm tra khung giờ rảnh)
    List<Booking> findByConsultantIdAndAppointmentDate(Integer consultantId, LocalDate appointmentDate);

    boolean existsByConsultantIdAndAppointmentDate(Integer consultantId, LocalDate appointmentDate);
}

