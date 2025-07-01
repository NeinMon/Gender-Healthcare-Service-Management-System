package com.genderhealthcare.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Entity lưu thông tin chi tiết của khách hàng đặt lịch xét nghiệm
 * Bổ sung cho entity Booking để lưu thêm thông tin cá nhân
 */
@Entity
@Table(name = "test_booking_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestBookingInfo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @NotNull(message = "Booking ID is required")
    @Column(name = "booking_id", unique = true)
    private Integer bookingId; // Foreign key to Booking
    
    @NotNull(message = "User ID is required")
    @Column(name = "user_id")
    private Integer userId; // Foreign key to Users - lấy thông tin cá nhân từ bảng users
    
    @Column(name = "notes", columnDefinition = "NVARCHAR(500)")
    private String notes;
    
    // Trạng thái checkin/checkout
    @Pattern(
        regexp = "Chờ bắt đầu|Đã check-in|Đã check-out",
        message = "Status must be valid test booking status"
    )
    @Column(name = "test_status", columnDefinition = "NVARCHAR(50)")
    private String testStatus = "Chờ bắt đầu";
    
    // Thời gian checkin/checkout
    @Column(name = "checkin_time")
    private LocalDateTime checkinTime;
    
    @Column(name = "checkout_time")
    private LocalDateTime checkoutTime;
    
    // Nhân viên thực hiện checkin/checkout
    @Column(name = "staff_id")
    private Integer staffId;
    
    @Column(name = "staff_name", columnDefinition = "NVARCHAR(100)")
    private String staffName;
    
    // Kết quả xét nghiệm
    @Column(name = "test_results", columnDefinition = "NTEXT")
    private String testResults;
    
    // Thời gian tạo và cập nhật
    @Column(name = "created_at")
    private String createdAt;
    
    @Column(name = "updated_at")
    private String updatedAt;
    
    @PrePersist
    protected void onCreate() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        this.createdAt = LocalDateTime.now().format(formatter);
        this.updatedAt = this.createdAt;
    }
    
    @PreUpdate
    protected void onUpdate() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        this.updatedAt = LocalDateTime.now().format(formatter);
    }
    
    // Helper methods
    public void performCheckin(Integer staffId, String staffName) {
        this.testStatus = "Đã check-in";
        this.checkinTime = LocalDateTime.now();
        this.staffId = staffId;
        this.staffName = staffName;
    }

    public void performCheckout(String testResults) {
        this.testStatus = "Đã check-out";
        this.checkoutTime = LocalDateTime.now();
        this.testResults = testResults;
    }
}
