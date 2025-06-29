package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.Booking;
import com.genderhealthcare.demo.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    public Booking createBooking(Booking booking) {
        // Đặt trạng thái mặc định nếu chưa có
        if (booking.getStatus() == null || booking.getStatus().isBlank()) {
            booking.setStatus("Đang chờ duyệt");
        }
        
        // Đảm bảo serviceId luôn có giá trị (validation business logic)
        if (booking.getServiceId() == null) {
            throw new IllegalArgumentException("Service ID cannot be null");
        }
        
        // Validation bổ sung: Nếu serviceId = 1 thì consultantId phải có
        if (booking.getServiceId().equals(1) && booking.getConsultantId() == null) {
            throw new IllegalArgumentException("Consultant ID is required when Service ID is 1");
        }
        
        // CreatedAt sẽ được tự động thiết lập bởi @PrePersist
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Integer id) {
        return bookingRepository.findById(id).orElse(null);
    }    public List<Booking> getBookingsByUserId(Integer userId) {
        if (userId == null) {
            return List.of();
        }
        return bookingRepository.findAll().stream()
                .filter(b -> userId.equals(b.getUserId()))
                .toList();
    }

    public List<Booking> getBookingsByConsultantId(Integer consultantId) {
        if (consultantId == null) {
            return List.of();
        }
        return bookingRepository.findAll().stream()
                .filter(b -> consultantId.equals(b.getConsultantId()))
                .toList();
    }

    public List<Booking> getBookingsByServiceId(Integer serviceId) {
        if (serviceId == null) {
            return List.of();
        }
        return bookingRepository.findAll().stream()
                .filter(b -> serviceId.equals(b.getServiceId()))
                .toList();
    }

    public List<Booking> getConsultationBookingsByUserId(Integer userId) {
        if (userId == null) {
            return List.of();
        }
        return bookingRepository.findAll().stream()
                .filter(b -> userId.equals(b.getUserId()) && 
                           b.getServiceId() != null && 
                           b.getServiceId().equals(1))
                .toList();
    }
    public List<Booking> getBookingsByServiceIdAndStatus(Integer serviceId, String status) {
        return bookingRepository.findByServiceIdAndStatus(serviceId, status);
    }

    // Kiểm tra trùng lịch tư vấn viên theo khung giờ
    public boolean existsByConsultantIdAndAppointmentDate(Integer consultantId, LocalDate appointmentDate) {
        return bookingRepository.existsByConsultantIdAndAppointmentDate(consultantId, appointmentDate);
    }

    // Lấy tất cả booking của 1 tư vấn viên trong 1 ngày (để kiểm tra khung giờ rảnh)
    public List<Booking> getBookingsByConsultantIdAndDate(Integer consultantId, LocalDate appointmentDate) {
        return bookingRepository.findByConsultantIdAndAppointmentDate(consultantId, appointmentDate);
    }

    public List<Booking> getNonConsultationBookingsByUserId(Integer userId) {
        if (userId == null) {
            return List.of();
        }
        return bookingRepository.findAll().stream()
                .filter(b -> userId.equals(b.getUserId()) &&
                        b.getServiceId() != null &&
                        !b.getServiceId().equals(1))
                .toList();
    }
}
