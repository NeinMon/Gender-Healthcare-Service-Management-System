package com.genderhealthcare.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Entity để quản lý lịch làm việc của consultant
 */
@Entity
@Table(name = "consultant_schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConsultantSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scheduleID")
    private Integer scheduleID;

    @NotNull(message = "ID tư vấn viên không được để trống")
    @Column(name = "consultantID")
    private Integer consultantID;

    @NotNull(message = "Ngày làm việc không được để trống")
    @Column(name = "work_date")
    private LocalDate workDate;

    @NotNull(message = "Ca làm việc không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(name = "shift")
    private WorkShift shift;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ScheduleStatus status = ScheduleStatus.NOT_YET;

    @Column(name = "notes", columnDefinition = "NVARCHAR(1000)")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Enum để định nghĩa ca làm việc
     */
    public enum WorkShift {
        MORNING("Ca sáng", LocalTime.of(8, 0), LocalTime.of(12, 0)),
        AFTERNOON("Ca chiều", LocalTime.of(13, 30), LocalTime.of(17, 30));

        private final String description;
        private final LocalTime startTime;
        private final LocalTime endTime;

        WorkShift(String description, LocalTime startTime, LocalTime endTime) {
            this.description = description;
            this.startTime = startTime;
            this.endTime = endTime;
        }

        public String getDescription() {
            return description;
        }

        public LocalTime getStartTime() {
            return startTime;
        }

        public LocalTime getEndTime() {
            return endTime;
        }

        public String getTimeRange() {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
            return startTime.format(formatter) + " - " + endTime.format(formatter);
        }
    }

    /**
     * Enum để định nghĩa trạng thái của lịch làm việc
     */
    public enum ScheduleStatus {
        AVAILABLE("Có đi làm"),
        CANCELLED("Nghỉ"),
        NOT_YET("Chưa tới");

        private final String description;

        ScheduleStatus(String description) {
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
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ScheduleStatus.NOT_YET;
        }
        if (this.shift == null) {
            this.shift = WorkShift.MORNING;
        }
    }

    /**
     * Tự động cập nhật thời gian khi update
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Kiểm tra xem lịch có khả dụng để đặt không
     */
    public boolean isAvailable() {
        return this.status == ScheduleStatus.AVAILABLE;
    }

    /**
     * Hủy lịch làm việc (đánh dấu nghỉ)
     */
    public void cancel() {
        this.status = ScheduleStatus.CANCELLED;
    }

    /**
     * Đặt lại trạng thái về có đi làm
     */
    public void makeAvailable() {
        this.status = ScheduleStatus.AVAILABLE;
    }

    /**
     * Đặt trạng thái chưa tới
     */
    public void setNotYet() {
        this.status = ScheduleStatus.NOT_YET;
    }

    /**
     * Kiểm tra xem ca làm việc có hợp lệ không
     */
    public boolean isValidTimeRange() {
        return shift != null;
    }

    /**
     * Lấy thời gian làm việc dưới dạng string
     */
    public String getWorkTimeRange() {
        if (shift != null) {
            return shift.getTimeRange();
        }
        return "";
    }

    /**
     * Lấy giờ bắt đầu của ca làm việc
     */
    public LocalTime getStartTime() {
        return shift != null ? shift.getStartTime() : null;
    }

    /**
     * Lấy giờ kết thúc của ca làm việc
     */
    public LocalTime getEndTime() {
        return shift != null ? shift.getEndTime() : null;
    }

    /**
     * Kiểm tra xem có trùng ca làm việc với lịch khác không
     */
    public boolean isOverlapping(ConsultantSchedule other) {
        if (other == null || !this.workDate.equals(other.workDate) || 
            !this.consultantID.equals(other.consultantID)) {
            return false;
        }
        
        // Kiểm tra trùng ca làm việc (cùng ngày, cùng consultant, cùng ca)
        return this.shift == other.shift;
    }

    @Override
    public String toString() {
        return "ConsultantSchedule{" +
                "scheduleID=" + scheduleID +
                ", consultantID=" + consultantID +
                ", workDate=" + workDate +
                ", shift=" + shift +
                ", status=" + status +
                ", notes='" + notes + '\'' +
                '}';
    }
}
