package com.genderhealthcare.demo.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DTO kết hợp thông tin từ TestBookingInfo và Users
 * Để trả về đầy đủ thông tin cho frontend
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestBookingDetailDTO {
    
    // Thông tin từ TestBookingInfo
    private Integer id;
    private Integer bookingId;
    private Integer userId;
    private String notes;
    private String testStatus;
    private LocalDateTime checkinTime;
    private LocalDateTime checkoutTime;
    private Integer staffId;
    private String staffName;
    private String createdAt;
    private String updatedAt;
    // Object Payment trả về cho FE
    private com.genderhealthcare.demo.entity.Payment payment;
    
    // Ghi chú: testResults và resultNote hiện được quản lý trong bảng test_result riêng
    
    // Thông tin từ Users
    private String fullName;
    private String email;
    private String gender;
    private LocalDateTime dob;
    private String phone;
    private String address;
    
    // Thông tin từ Booking
    private Integer serviceId; 
    private String serviceName;
    private LocalDateTime appointmentDate;
    private String appointmentTime;
    private String bookingContent;
    
    // Helper method để tính tuổi từ date of birth
    public Integer getAge() {
        if (dob == null) return null;
        
        LocalDateTime now = LocalDateTime.now();
        int age = now.getYear() - dob.getYear();
        
        // Kiểm tra xem đã qua sinh nhật chưa
        if (now.getMonthValue() < dob.getMonthValue() || 
            (now.getMonthValue() == dob.getMonthValue() && now.getDayOfMonth() < dob.getDayOfMonth())) {
            age--;
        }
        
        return age;
    }
}
