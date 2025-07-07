package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.Booking;
import com.genderhealthcare.demo.entity.TestBookingInfo;
import com.genderhealthcare.demo.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TestBookingInfoService testBookingInfoService;

    @Transactional
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
        Booking saved = bookingRepository.save(booking);

        // Tự động tạo TestBookingInfo nếu là booking xét nghiệm (serviceId != 1)
        if (saved.getServiceId() != null && !saved.getServiceId().equals(1)) {
            // Kiểm tra đã có TestBookingInfo chưa (tránh tạo trùng)
            if (testBookingInfoService.getTestBookingInfoByBookingId(saved.getBookingId()) == null) {
                TestBookingInfo testBookingInfo = new TestBookingInfo();
                testBookingInfo.setBookingId(saved.getBookingId());
                testBookingInfo.setUserId(saved.getUserId());
                testBookingInfo.setTestStatus("Chờ bắt đầu");
                testBookingInfoService.createTestBookingInfo(testBookingInfo);
            }
        }
        return saved;
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

    // Kiểm tra trùng lịch tư vấn viên theo khung giờ chính xác
    public boolean hasConflictingBooking(Integer consultantId, LocalDate appointmentDate, LocalTime startTime, LocalTime endTime) {
        if (consultantId == null || appointmentDate == null || startTime == null || endTime == null) {
            return false;
        }
        // Lấy tất cả booking của consultant trong ngày
        List<Booking> bookingsInDay = bookingRepository.findByConsultantIdAndAppointmentDate(consultantId, appointmentDate);
        for (Booking booking : bookingsInDay) {
            // Kiểm tra booking có paymentStatus là PAID hoặc PROCESSING
            String status = booking.getPaymentStatus();
            if ("PAID".equalsIgnoreCase(status) || "PROCESSING".equalsIgnoreCase(status)) {
                LocalTime bookingStart = booking.getStartTime();
                LocalTime bookingEnd = booking.getEndTime();
                if (bookingEnd == null) {
                    bookingEnd = bookingStart.plusHours(1);
                }
                // Kiểm tra overlap: hai khoảng thời gian có giao nhau không
                if (startTime.isBefore(bookingEnd) && endTime.isAfter(bookingStart)) {
                    return true; // Có trùng lịch đã PAID hoặc PROCESSING
                }
            }
        }
        return false; // Không có trùng lịch đã PAID hoặc PROCESSING
    }

    // Kiểm tra trùng lịch tư vấn viên theo khung giờ
    @Deprecated
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
    
    // === Methods for Test Bookings ===
    
    public List<Booking> getTestBookings() {
        return bookingRepository.findTestBookings();
    }
    
    public List<Booking> getTestBookingsByStatus(String status) {
        return bookingRepository.findTestBookingsByStatus(status);
    }
    
    public List<Booking> getBookingsByUserIdAndStatus(Integer userId, String status) {
        return bookingRepository.findByUserIdAndStatus(userId, status);
    }
    
    // Cập nhật status cho booking xét nghiệm
    public Booking updateBookingStatus(Integer bookingId, String newStatus) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            throw new IllegalArgumentException("Booking not found with ID: " + bookingId);
        }
        
        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }

    public List<Booking> getTestBookingsByUserId(Integer userId) {
        if (userId == null) return List.of();
        return bookingRepository.findAll().stream()
                .filter(b -> userId.equals(b.getUserId()) && b.getServiceId() != null && b.getServiceId() != 1)
                .toList();
    }

    @Transactional
    public Booking updateBookingPaymentStatus(Integer bookingId, String newPaymentStatus) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            throw new IllegalArgumentException("Booking not found with ID: " + bookingId);
        }
        booking.setPaymentStatus(newPaymentStatus);
        return bookingRepository.save(booking);
    }

    public Booking getBookingByOrderCode(Long orderCode) {
        return bookingRepository.findByOrderCode(orderCode);
    }
}
