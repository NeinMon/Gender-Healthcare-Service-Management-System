package com.genderhealthcare.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Entity lưu trữ kết quả xét nghiệm chi tiết cho từng thông số
 * Kết nối với TestBookingInfo và ServiceTestParameter
 * Đặc biệt hỗ trợ kết quả xét nghiệm liên quan đến chu kỳ kinh nguyệt
 */
@Entity
@Table(name = "test_result")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TestResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Integer resultId;
    
    @NotNull(message = "Test booking info ID is required")
    @Column(name = "test_booking_info_id")
    private Integer testBookingInfoId; // Foreign key to TestBookingInfo
    
    @NotNull(message = "Parameter ID is required")
    @Column(name = "parameter_id")
    private Integer parameterId; // Foreign key to ServiceTestParameter
    
    @Size(max = 1000, message = "Result value must be less than 1000 characters")
    @Column(name = "result_value", columnDefinition = "NVARCHAR(1000)")
    private String resultValue; // Giá trị kết quả (có thể là số hoặc mô tả cho siêu âm)
    
    @Size(max = 20, message = "Status must be less than 20 characters")
    @Column(name = "status", columnDefinition = "NVARCHAR(20)")
    private String status = "Normal"; // Normal, High, Low, Critical, Abnormal
    
    @Size(max = 2000, message = "Note must be less than 2000 characters")
    @Column(name = "note", columnDefinition = "NVARCHAR(2000)")
    private String note; // Ghi chú thêm từ nhân viên, đặc biệt quan trọng cho siêu âm
    
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
    
    /**
     * Tự động tính toán status dựa trên reference range và parameter type
     */
    public void calculateStatus(String referenceRange, String parameterType) {
        if (resultValue == null || resultValue.trim().isEmpty()) {
            this.status = "Pending";
            return;
        }
        
        // Xử lý đặc biệt cho siêu âm
        if ("ULTRASOUND".equals(parameterType)) {
            // Siêu âm thường có kết quả mô tả, không có số liệu cụ thể
            if (resultValue.toLowerCase().contains("bình thường") || 
                resultValue.toLowerCase().contains("normal")) {
                this.status = "Normal";
            } else if (resultValue.toLowerCase().contains("bất thường") ||
                      resultValue.toLowerCase().contains("u xơ") ||
                      resultValue.toLowerCase().contains("polyp") ||
                      resultValue.toLowerCase().contains("nang")) {
                this.status = "Abnormal";
            } else {
                this.status = "Unknown";
            }
            return;
        }
        
        // Xử lý cho các xét nghiệm có số liệu (HORMONE, BLOOD)
        if (referenceRange == null || referenceRange.trim().isEmpty()) {
            this.status = "Unknown";
            return;
        }
        
        try {
            // Parsing logic for different reference range formats
            if (referenceRange.contains("-")) {
                // Range format: "12.0-15.5"
                String[] parts = referenceRange.split("-");
                double minValue = Double.parseDouble(parts[0].trim());
                double maxValue = Double.parseDouble(parts[1].trim());
                double value = Double.parseDouble(resultValue.trim());
                
                if (value < minValue) {
                    this.status = "Low";
                } else if (value > maxValue) {
                    this.status = "High";
                } else {
                    this.status = "Normal";
                }
            } else if (referenceRange.startsWith("<")) {
                // Less than format: "<100"
                double maxValue = Double.parseDouble(referenceRange.substring(1).trim());
                double value = Double.parseDouble(resultValue.trim());
                
                if (value >= maxValue) {
                    this.status = "High";
                } else {
                    this.status = "Normal";
                }
            } else if (referenceRange.startsWith(">")) {
                // Greater than format: ">50"
                double minValue = Double.parseDouble(referenceRange.substring(1).trim());
                double value = Double.parseDouble(resultValue.trim());
                
                if (value <= minValue) {
                    this.status = "Low";
                } else {
                    this.status = "Normal";
                }
            } else {
                // Đối với các giá trị text (như "Bình thường")
                if (resultValue.toLowerCase().contains("bình thường") || 
                    resultValue.toLowerCase().contains("normal")) {
                    this.status = "Normal";
                } else {
                    this.status = "Unknown";
                }
            }
        } catch (NumberFormatException e) {
            // Nếu không parse được số, coi như Unknown
            this.status = "Unknown";
        }
    }
}
