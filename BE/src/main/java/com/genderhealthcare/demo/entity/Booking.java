package com.genderhealthcare.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.genderhealthcare.demo.validation.ValidBooking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    @NotNull(message = "Appointment date is required")
    @Column(name = "appointment_date")
    private LocalDate appointmentDate; // Date of the appointment (chỉ ngày)

    @NotNull(message = "Start time is required")
    @Column(name = "start_time")
    private LocalTime startTime; // Time when appointment starts

    @Column(name = "end_time")
    private LocalTime endTime; // Time when appointment ends

    @Pattern(
        regexp = "Chờ bắt đầu|Đang diễn ra|Đã kết thúc",
        message = "Status must be one of: Chờ bắt đầu, Đang diễn ra, Đã kết thúc"
    )
    @Column(name = "status", columnDefinition = "NVARCHAR(50)")
    private String status;

    @Pattern(
        regexp = "PENDING|PROCESSING|PAID|FAILED|CANCELLED|EXPIRED",
        message = "Payment status must be one of: PENDING, PROCESSING, PAID, FAILED, CANCELLED, EXPIRED"
    )
    @Column(name = "payment_status", columnDefinition = "VARCHAR(20)") // Removed DEFAULT 'PENDING'
    private String paymentStatus = "PENDING";

    @Column(name = "amount")
    private Double amount;

    @Column(name = "payment_id")
    private String paymentId;

    private String createdAt; // Timestamp of when the booking was created

    @Column(name = "testresults", columnDefinition = "NVARCHAR(1000)")
    private String testResults; // Kết quả xét nghiệm (nếu là lịch xét nghiệm)9908fb

    // Tự động thiết lập thời gian tạo trước khi lưu vào database
    @PrePersist
    protected void onCreate() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        this.createdAt = LocalDateTime.now().format(formatter);
        // Không tự động set endTime khi tạo mới, chỉ set khi kết thúc thủ công
        // Cập nhật status ban đầu
        updateStatus();
        // Set payment status to PENDING if not set
        if (this.paymentStatus == null) {
            this.paymentStatus = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        // Cập nhật status mỗi khi entity được update
        updateStatus();
    }

    /**
     * Tự động cập nhật status dựa trên thời gian hiện tại so với appointmentDate và startTime/endTime
     * Chỉ tự động chuyển giữa 'Chờ bắt đầu' và 'Đang diễn ra'.
     * 'Đã kết thúc' chỉ được set thủ công khi endTime được cập nhật qua API.
     */
    public void updateStatus() {
        // Nếu status đã là 'Đã kết thúc' thì giữ nguyên, không tự động chuyển lại
        if ("Đã kết thúc".equals(this.status)) {
            return;
        }
        if (appointmentDate != null && startTime != null) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime appointmentStart = LocalDateTime.of(appointmentDate, startTime);
            // Nếu endTime đã được set (tức là đã kết thúc thủ công), status sẽ là 'Đã kết thúc' và không vào đây
            if (now.isBefore(appointmentStart)) {
                this.status = "Chờ bắt đầu";
            } else {
                this.status = "Đang diễn ra";
            }
        }
    }

    /**
     * Thiết lập appointmentDate và startTime, tự động tính endTime (mặc định 1 giờ)
     */
    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
        updateStatus();
    }

    /**
     * Thiết lập startTime và tự động tính endTime (mặc định 1 giờ)
     */
    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        if (this.endTime == null && startTime != null) {
            this.endTime = startTime.plusHours(1);
        }
        updateStatus();
    }

    /**
     * Thiết lập appointmentDate và startTime với duration tùy chỉnh (tính bằng giờ)
     */
    public void setAppointmentDateTime(LocalDate appointmentDate, LocalTime startTime, int durationHours) {
        this.appointmentDate = appointmentDate;
        this.startTime = startTime;
        if (startTime != null) {
            this.endTime = startTime.plusHours(durationHours);
        }
        updateStatus();
    }

    /**
     * Thiết lập endTime và cập nhật status
     */
    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        updateStatus();
    }

    /**
     * Get current status dựa trên thời gian thực
     */
    public String getCurrentStatus() {
        updateStatus();
        return this.status;
    }
    
    // Additional fields can be added as needed
}
