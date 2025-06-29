package com.genderhealthcare.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.genderhealthcare.demo.validation.ValidBooking;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "booking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ValidBooking
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bookingId;

    @NotNull(message = "User ID is required")
    private Integer userId;

    private Integer consultantId; // Required only when serviceId = 1

    private Integer serviceId; // Service ID - có thể được set tự động hoặc từ frontend

    @NotBlank(message = "Content is required")
    @Size(max = 500, message = "Content must be less than 500 characters")
    @Column(name = "content", columnDefinition = "NVARCHAR(500)")
    private String content;

    @NotBlank(message = "Appointment date is required")
    private String appointmentDate; // Date and time of the appointment

    @Pattern(
        regexp = "Đang chờ duyệt|Đã duyệt|Đã kết thúc|Không được duyệt",
        message = "Status must be one of: Đang chờ duyệt, Đã duyệt, Đã kết thúc, Không được duyệt"
    )
    @Column(name = "status", columnDefinition = "NVARCHAR(50)")
    private String status; // "Chờ xác nhận", "Đã xác nhận", "Đã xong"

    private String createdAt; // Timestamp of when the booking was created

    @Column(name = "testresults", columnDefinition = "NVARCHAR(1000)")
    private String testResults; // Kết quả xét nghiệm (nếu là lịch xét nghiệm)

    // Tự động thiết lập thời gian tạo trước khi lưu vào database
    @PrePersist
    protected void onCreate() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        this.createdAt = LocalDateTime.now().format(formatter);
    }
    
    // Additional fields can be added as needed
}
