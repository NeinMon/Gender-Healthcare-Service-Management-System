package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.TestBookingInfo;
import com.genderhealthcare.demo.entity.Booking;
import com.genderhealthcare.demo.repository.TestBookingInfoRepository;
import com.genderhealthcare.demo.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional  
public class TestBookingInfoService {
    
    @Autowired
    private TestBookingInfoRepository testBookingInfoRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private com.genderhealthcare.demo.repository.UserRepository userRepository;
    
    @Autowired
    private com.genderhealthcare.demo.service.ServiceService serviceService;
    
    // Tạo thông tin đặt lịch xét nghiệm
    public TestBookingInfo createTestBookingInfo(TestBookingInfo testBookingInfo) {
        // Kiểm tra booking tồn tại
        if (testBookingInfo.getBookingId() != null) {
            Optional<Booking> booking = bookingRepository.findById(testBookingInfo.getBookingId());
            if (booking.isEmpty()) {
                throw new IllegalArgumentException("Booking with ID " + testBookingInfo.getBookingId() + " not found");
            }
            
            // Kiểm tra booking info đã tồn tại chưa
            if (testBookingInfoRepository.existsByBookingId(testBookingInfo.getBookingId())) {
                throw new IllegalArgumentException("Test booking info already exists for booking ID " + testBookingInfo.getBookingId());
            }
        }
        
        // Đặt trạng thái mặc định đúng chuẩn FE/BE
        if (testBookingInfo.getTestStatus() == null || testBookingInfo.getTestStatus().isBlank()) {
            testBookingInfo.setTestStatus("Chờ bắt đầu");
        }
        
        return testBookingInfoRepository.save(testBookingInfo);
    }
    
    // Lấy tất cả thông tin đặt lịch
    public List<TestBookingInfo> getAllTestBookingInfos() {
        return testBookingInfoRepository.findAll();
    }
    
    // Lấy theo ID
    public TestBookingInfo getTestBookingInfoById(Integer id) {
        return testBookingInfoRepository.findById(id).orElse(null);
    }
    
    // Lấy theo booking ID
    public TestBookingInfo getTestBookingInfoByBookingId(Integer bookingId) {
        return testBookingInfoRepository.findByBookingId(bookingId).orElse(null);
    }
    
    // Lấy theo user ID
    public List<TestBookingInfo> getTestBookingInfosByUserId(Integer userId) {
        return testBookingInfoRepository.findByUserId(userId);
    }
    
    // Lấy theo trạng thái
    public List<TestBookingInfo> getTestBookingInfosByStatus(String status) {
        return testBookingInfoRepository.findByTestStatus(status);
    }
    
    // Lấy theo staff ID
    public List<TestBookingInfo> getTestBookingInfosByStaffId(Integer staffId) {
        return testBookingInfoRepository.findByStaffId(staffId);
    }
    
    // Cập nhật trạng thái (chỉ cho phép chuyển đổi giữa 3 trạng thái mới)
    public TestBookingInfo updateTestStatus(Integer id, String newStatus) {
        TestBookingInfo testBookingInfo = testBookingInfoRepository.findById(id).orElse(null);
        if (testBookingInfo == null) {
            throw new IllegalArgumentException("Test booking info not found with ID: " + id);
        }
        // Chỉ cho phép chuyển đổi giữa 3 trạng thái hợp lệ
        if (!newStatus.equals("Chờ bắt đầu") && !newStatus.equals("Đã check-in") && !newStatus.equals("Đã check-out")) {
            throw new IllegalArgumentException("Invalid status for test booking");
        }
        testBookingInfo.setTestStatus(newStatus);
        // Nếu check-in thì set thời gian và staff
        if (newStatus.equals("Đã check-in")) {
            testBookingInfo.setCheckinTime(java.time.LocalDateTime.now());
            // StaffId, StaffName nên truyền từ FE hoặc lấy từ context nếu cần
        }
        // Nếu check-out thì set thời gian checkout
        if (newStatus.equals("Đã check-out")) {
            testBookingInfo.setCheckoutTime(java.time.LocalDateTime.now());
        }
        return testBookingInfoRepository.save(testBookingInfo);
    }
    
    // Cập nhật trạng thái (cho phép truyền testResult khi check-out)
    public TestBookingInfo updateTestStatusWithResult(Integer id, String newStatus, String testResult) {
        TestBookingInfo testBookingInfo = testBookingInfoRepository.findById(id).orElse(null);
        if (testBookingInfo == null) {
            throw new IllegalArgumentException("Test booking info not found with ID: " + id);
        }
        if (!newStatus.equals("Đã check-out")) {
            throw new IllegalArgumentException("This method only supports status 'Đã check-out'");
        }
        testBookingInfo.setTestStatus(newStatus);
        testBookingInfo.setCheckoutTime(java.time.LocalDateTime.now());
        testBookingInfo.setTestResults(testResult);
        return testBookingInfoRepository.save(testBookingInfo);
    }
    
    // Lấy thông tin chi tiết kết hợp từ TestBookingInfo, Users và Booking
    public com.genderhealthcare.demo.model.TestBookingDetailDTO getTestBookingDetailById(Integer id) {
        TestBookingInfo testBookingInfo = testBookingInfoRepository.findById(id).orElse(null);
        if (testBookingInfo == null) {
            return null;
        }
        
        // Lấy thông tin user
        com.genderhealthcare.demo.entity.Users user = userRepository.findById(testBookingInfo.getUserId()).orElse(null);
        
        // Lấy thông tin booking
        Booking booking = bookingRepository.findById(testBookingInfo.getBookingId()).orElse(null);
        
        // Tạo DTO
        com.genderhealthcare.demo.model.TestBookingDetailDTO dto = new com.genderhealthcare.demo.model.TestBookingDetailDTO();
        
        // Set thông tin từ TestBookingInfo
        dto.setId(testBookingInfo.getId());
        dto.setBookingId(testBookingInfo.getBookingId());
        dto.setUserId(testBookingInfo.getUserId());
        dto.setTestStatus(testBookingInfo.getTestStatus());
        dto.setCheckinTime(testBookingInfo.getCheckinTime());
        dto.setCheckoutTime(testBookingInfo.getCheckoutTime());
        dto.setStaffId(testBookingInfo.getStaffId());
        dto.setTestResults(testBookingInfo.getTestResults());
        dto.setCreatedAt(testBookingInfo.getCreatedAt());

        // Set thông tin từ Users
        if (user != null) {
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setGender(user.getGender());
            dto.setDob(user.getDob());
            dto.setPhone(user.getPhone());
            dto.setAddress(user.getAddress());
        }
        
        // Set thông tin từ Booking
        if (booking != null) {
            dto.setBookingContent(booking.getContent());
            dto.setAppointmentDate(booking.getAppointmentDate().atStartOfDay());
            if (booking.getStartTime() != null) {
                dto.setAppointmentTime(booking.getStartTime().toString());
            }
            // Set serviceId from Booking entity
            dto.setServiceId(booking.getServiceId());
            // Lấy serviceName từ serviceId
            String serviceName = null;
            if (booking.getServiceId() != null) {
                com.genderhealthcare.demo.entity.Service service = serviceService.getServiceById(booking.getServiceId());
                if (service != null) {
                    serviceName = service.getServiceName();
                }
            }
            dto.setServiceName(serviceName);
            // Set paymentStatus cho FE filter
            dto.setPaymentStatus(booking.getPaymentStatus());
        }
        
        return dto;
    }
    
    // Lấy danh sách thông tin chi tiết theo trạng thái
    public List<com.genderhealthcare.demo.model.TestBookingDetailDTO> getTestBookingDetailsByStatus(String status) {
        List<TestBookingInfo> testBookingInfos = testBookingInfoRepository.findByTestStatus(status);
        return testBookingInfos.stream()
                .map(info -> getTestBookingDetailById(info.getId()))
                .filter(dto -> dto != null)
                .toList();
    }
    
    // Lấy danh sách thông tin chi tiết theo userId
    public List<com.genderhealthcare.demo.model.TestBookingDetailDTO> getTestBookingDetailsByUserId(Integer userId) {
        List<TestBookingInfo> testBookingInfos = testBookingInfoRepository.findByUserId(userId);
        return testBookingInfos.stream()
                .map(info -> getTestBookingDetailById(info.getId()))
                .filter(dto -> dto != null)
                .toList();
    }
    
    // Cập nhật thông tin TestBookingInfo (chỉ cho phép cập nhật notes, staffId, staffName, testResults)
    public TestBookingInfo updateTestBookingInfo(Integer id, TestBookingInfo updatedInfo) {
        TestBookingInfo existingInfo = testBookingInfoRepository.findById(id).orElse(null);
        if (existingInfo == null) {
            throw new IllegalArgumentException("Test booking info not found with ID: " + id);
        }
        // Cập nhật các field được phép thay đổi
        if (updatedInfo.getStaffId() != null) {
            existingInfo.setStaffId(updatedInfo.getStaffId());
        }
        if (updatedInfo.getTestResults() != null) {
            existingInfo.setTestResults(updatedInfo.getTestResults());
        }
        return testBookingInfoRepository.save(existingInfo);
    }
}
