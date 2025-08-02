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

/**
 * Service xử lý logic nghiệp vụ cho các thao tác booking (đặt lịch tư vấn)
 * Quản lý toàn bộ quy trình đặt lịch từ tạo booking, cập nhật trạng thái,
 * đến quản lý thanh toán và tích hợp với dịch vụ tư vấn
 * Đảm bảo tính nhất quán dữ liệu qua @Transactional
 */
@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TestBookingInfoService testBookingInfoService;

    @Autowired
    private com.genderhealthcare.demo.service.ServiceService serviceService;

    @Autowired
    private ConsultantScheduleService consultantScheduleService;

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
        
        // Kiểm tra lịch làm việc của consultant trước khi tạo booking
        if (booking.getServiceId().equals(1) && booking.getConsultantId() != null && booking.getAppointmentDate() != null) {
            if (!isConsultantAvailableForBooking(booking.getConsultantId(), booking.getAppointmentDate(), booking.getStartTime())) {
                throw new IllegalArgumentException("Tư vấn viên không có lịch làm việc trong ngày này hoặc chưa có mặt. Vui lòng chọn ngày khác.");
            }
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
            // Kiểm tra booking có paymentStatus là PAID hoặc PROCESSING từ Payment entity
            if (booking.getPayment() != null) {
                String status = booking.getPayment().getStatus();
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
        if (booking.getPayment() == null) {
            throw new IllegalArgumentException("No payment record found for this booking");
        }
        booking.getPayment().setStatus(newPaymentStatus);
        return bookingRepository.save(booking);
    }

    public Booking getBookingByOrderCode(Long orderCode) {
        // Now handled via Payment entity
        return bookingRepository.findAll().stream()
                .filter(b -> b.getPayment() != null && orderCode.equals(b.getPayment().getOrderCode()))
                .findFirst().orElse(null);
    }

    /**
     * Lấy danh sách khung giờ trống của tư vấn viên trong ngày
     */
    public List<String> getAvailableTimeSlots(Integer consultantId, LocalDate date) {
        // Danh sách khung giờ chuẩn (cố định)
        String[] allSlots = {
            "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
            "13:30 - 14:30", "14:30 - 15:30", "15:30 - 16:30", "16:30 - 17:30"
        };
        
        // Lấy tất cả booking của consultant trong ngày
        List<Booking> bookings = getBookingsByConsultantIdAndDate(consultantId, date);
        
        // Tạo set các slot đã được đặt (chỉ tính booking chưa kết thúc)
        java.util.Set<String> bookedSlots = new java.util.HashSet<>();
        for (Booking b : bookings) {
            // Chỉ tính các booking chưa kết thúc VÀ đã thanh toán thành công (PAID) HOẶC PROCESSING
            if (!"Đã kết thúc".equals(b.getStatus()) && b.getPayment() != null && 
                ("PAID".equals(b.getPayment().getStatus()) || "PROCESSING".equals(b.getPayment().getStatus()))) {
                
                LocalTime startTime = b.getStartTime();
                LocalTime endTime = b.getEndTime() != null ? b.getEndTime() : startTime.plusHours(1);
                
                // Kiểm tra slot nào bị trùng với booking này
                for (String slot : allSlots) {
                    String[] timeParts = slot.split(" - ");
                    LocalTime slotStart = LocalTime.parse(timeParts[0]);
                    LocalTime slotEnd = LocalTime.parse(timeParts[1]);
                    
                    // Kiểm tra overlap: booking và slot có giao nhau không
                    if (startTime.isBefore(slotEnd) && endTime.isAfter(slotStart)) {
                        bookedSlots.add(slot);
                    }
                }
            }
        }
        
        // Lọc ra các slot còn trống
        java.util.List<String> available = new java.util.ArrayList<>();
        for (String slot : allSlots) {
            if (!bookedSlots.contains(slot)) {
                available.add(slot);
            }
        }
        return available;
    }

    /**
     * Tạo booking với validation và logic đầy đủ (cho API mặc định)
     */
    public Booking createBookingWithDefaultService(Booking booking) {
        // API mặc định: tự động set serviceId = 1 nếu chưa có
        if (booking.getServiceId() == null) {
            booking.setServiceId(1);
        }
        
        // Kiểm tra trùng lịch tư vấn viên theo khung giờ chính xác
        if (booking.getConsultantId() != null && booking.getAppointmentDate() != null && booking.getStartTime() != null) {
            // Tự động tính endTime nếu chưa có (mặc định 1 giờ)
            LocalTime endTime = booking.getEndTime();
            if (endTime == null) {
                endTime = booking.getStartTime().plusHours(1);
            }
            boolean hasConflict = hasConflictingBooking(
                booking.getConsultantId(),
                booking.getAppointmentDate(),
                booking.getStartTime(),
                endTime
            );
            if (hasConflict) {
                throw new IllegalArgumentException("Tư vấn viên đã có lịch trùng trong khung giờ này! Vui lòng chọn giờ khác.");
            }
        }
        
        // Set default values
        booking.setEndTime(null);
        
        return createBooking(booking);
    }

    /**
     * Tạo booking với service cụ thể (yêu cầu serviceId)
     */
    public Booking createBookingWithSpecificService(Booking booking) {
        if (booking.getServiceId() == null) {
            throw new IllegalArgumentException("Service ID is required for this operation");
        }
        return createBooking(booking);
    }

    /**
     * Cập nhật trạng thái booking với endTime
     */
    public Booking updateBookingStatusWithEndTime(Integer bookingId, String status, String endTimeStr) {
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            throw new IllegalArgumentException("Booking not found");
        }

        // Validate status value
        if (!"Đã kết thúc".equals(status)) {
            throw new IllegalArgumentException("Invalid status. Only 'Đã kết thúc' is allowed for this action");
        }

        // Parse endTime nếu có
        if (endTimeStr != null) {
            try {
                LocalTime endTime = LocalTime.parse(endTimeStr);
                booking.setEndTime(endTime);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid endTime format. Use HH:mm");
            }
        } else {
            // Nếu không truyền endTime thì lấy thời điểm hiện tại
            booking.setEndTime(LocalTime.now());
        }
        
        booking.setStatus("Đã kết thúc");
        return createBooking(booking);
    }

    /**
     * Cập nhật trạng thái payment
     */
    public Booking updatePaymentStatus(Integer bookingId, String status) {
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            throw new IllegalArgumentException("Booking not found");
        }
        if (booking.getPayment() == null) {
            throw new IllegalArgumentException("No payment record found for this booking");
        }
        // Chỉ cho phép cập nhật sang PAID hoặc CANCELLED từ PROCESSING
        if (!"PROCESSING".equals(booking.getPayment().getStatus())) {
            throw new IllegalArgumentException("Chỉ cập nhật trạng thái khi booking đang PROCESSING");
        }
        if (!"PAID".equals(status) && !"CANCELLED".equals(status)) {
            throw new IllegalArgumentException("Trạng thái hợp lệ: PAID hoặc CANCELLED");
        }
        booking.getPayment().setStatus(status);
        return createBooking(booking);
    }

    /**
     * Lấy bookings theo tên service
     */
    public List<Booking> getBookingsByServiceName(String serviceName) {
        com.genderhealthcare.demo.entity.Service service = serviceService.getServiceByName(serviceName);
        if (service == null) {
            throw new IllegalArgumentException("Service not found");
        }
        return getBookingsByServiceId(service.getServiceId());
    }

    /**
     * Lấy bookings theo tên service và trạng thái
     */
    public List<Booking> getBookingsByServiceNameAndStatus(String serviceName, String status) {
        com.genderhealthcare.demo.entity.Service service = serviceService.getServiceByName(serviceName);
        if (service == null) {
            throw new IllegalArgumentException("Service not found");
        }
        return getBookingsByServiceIdAndStatus(service.getServiceId(), status);
    }

    /**
     * Kiểm tra tư vấn viên có thể nhận booking trong ngày cụ thể hay không
     * Kiểm tra xem consultant có lịch làm việc và đang có mặt (status = AVAILABLE)
     * 
     * @param consultantId ID của tư vấn viên
     * @param appointmentDate Ngày đặt lịch
     * @param startTime Giờ bắt đầu booking (để xác định ca làm việc)
     * @return true nếu consultant có thể nhận booking, false nếu không
     */
    private boolean isConsultantAvailableForBooking(Integer consultantId, LocalDate appointmentDate, LocalTime startTime) {
        try {
            // Xác định ca làm việc dựa trên giờ booking
            com.genderhealthcare.demo.entity.ConsultantSchedule.WorkShift shift = determineWorkShift(startTime);
            
            // Kiểm tra consultant có lịch làm việc trong ca này không và có status AVAILABLE
            boolean isAvailable = consultantScheduleService.isConsultantAvailable(consultantId, appointmentDate, shift);
            
            return isAvailable;
        } catch (Exception e) {
            // Nếu có lỗi, mặc định là không available để đảm bảo an toàn
            System.err.println("Error checking consultant availability: " + e.getMessage());
            return false;
        }
    }

    /**
     * Xác định ca làm việc dựa trên giờ bắt đầu booking
     * 
     * @param startTime Giờ bắt đầu booking
     * @return WorkShift tương ứng
     */
    private com.genderhealthcare.demo.entity.ConsultantSchedule.WorkShift determineWorkShift(LocalTime startTime) {
        if (startTime == null) {
            return com.genderhealthcare.demo.entity.ConsultantSchedule.WorkShift.MORNING; // Default
        }
        
        // Ca sáng: 8:00-12:00
        // Ca chiều: 13:30-17:30
        if (startTime.isBefore(LocalTime.of(13, 0))) {
            return com.genderhealthcare.demo.entity.ConsultantSchedule.WorkShift.MORNING;
        } else {
            return com.genderhealthcare.demo.entity.ConsultantSchedule.WorkShift.AFTERNOON;
        }
    }
}
