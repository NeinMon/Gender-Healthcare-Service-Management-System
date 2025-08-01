package com.genderhealthcare.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity để quản lý đơn xin nghỉ của consultant
 */
@Entity
@Table(name = "consultant_leave_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConsultantLeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_request_id")
    private Integer leaveRequestId;

    @NotNull(message = "ID tư vấn viên không được để trống")
    @Column(name = "consultant_id")
    private Integer consultantId;

    @NotNull(message = "Ngày xin nghỉ không được để trống")
    @Column(name = "leave_date")
    private LocalDate leaveDate;

    @NotNull(message = "Ca xin nghỉ không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(name = "shift")
    private WorkShift shift;

    @Column(name = "note", columnDefinition = "NVARCHAR(1000)")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private LeaveRequestStatus status = LeaveRequestStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by")
    private Integer processedBy; // ID của manager xử lý đơn

    /**
     * Enum để định nghĩa ca xin nghỉ
     */
    public enum WorkShift {
        MORNING("Ca sáng", "08:00 - 12:00"),
        AFTERNOON("Ca chiều", "13:30 - 17:30"),
        FULL_DAY("Cả ngày", "08:00 - 17:30");

        private final String description;
        private final String timeRange;

        WorkShift(String description, String timeRange) {
            this.description = description;
            this.timeRange = timeRange;
        }

        public String getDescription() {
            return description;
        }

        public String getTimeRange() {
            return timeRange;
        }
    }

    /**
     * Enum để định nghĩa trạng thái đơn xin nghỉ
     */
    public enum LeaveRequestStatus {
        PENDING("Chờ duyệt"),
        APPROVED("Đã duyệt"),
        REJECTED("Từ chối");

        private final String description;

        LeaveRequestStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * Tự động set thời gian tạo khi tạo mới
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = LeaveRequestStatus.PENDING;
        }
    }

    /**
     * Tự động cập nhật thời gian khi update
     */
    @PreUpdate
    protected void onUpdate() {
        if (this.status == LeaveRequestStatus.APPROVED || this.status == LeaveRequestStatus.REJECTED) {
            this.processedAt = LocalDateTime.now();
        }
    }

    /**
     * Kiểm tra xem đơn có đang chờ duyệt không
     */
    public boolean isPending() {
        return this.status == LeaveRequestStatus.PENDING;
    }

    /**
     * Kiểm tra xem đơn đã được duyệt chưa
     */
    public boolean isApproved() {
        return this.status == LeaveRequestStatus.APPROVED;
    }

    /**
     * Kiểm tra xem đơn có bị từ chối không
     */
    public boolean isRejected() {
        return this.status == LeaveRequestStatus.REJECTED;
    }

    /**
     * Duyệt đơn xin nghỉ
     */
    public void approve(Integer managerId) {
        this.status = LeaveRequestStatus.APPROVED;
        this.processedBy = managerId;
        this.processedAt = LocalDateTime.now();
    }

    /**
     * Từ chối đơn xin nghỉ
     */
    public void reject(Integer managerId) {
        this.status = LeaveRequestStatus.REJECTED;
        this.processedBy = managerId;
        this.processedAt = LocalDateTime.now();
    }

    /**
     * Kiểm tra xem có phải xin nghỉ cả ngày không
     */
    public boolean isFullDayLeave() {
        return this.shift == WorkShift.FULL_DAY;
    }

    /**
     * Kiểm tra xem có phải ngày trong quá khứ không
     */
    public boolean isPastDate() {
        return this.leaveDate.isBefore(LocalDate.now());
    }

    @Override
    public String toString() {
        return "ConsultantLeaveRequest{" +
                "leaveRequestId=" + leaveRequestId +
                ", consultantId=" + consultantId +
                ", leaveDate=" + leaveDate +
                ", shift=" + shift +
                ", note='" + note + '\'' +
                ", status=" + status +
                ", createdAt=" + createdAt +
                '}';
    }
}
