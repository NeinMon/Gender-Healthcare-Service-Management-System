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
             // Kiểm tra xem đầu vào có phải là số không (có thể là kết quả đo lường)
        if (resultValue.trim().matches("\\d+(\\.\\d+)?")) {
            try {
                double value = Double.parseDouble(resultValue.trim());
                
                // Nếu có reference range, sử dụng nó để đánh giá
                if (referenceRange != null && !referenceRange.trim().isEmpty()) {
                    // Áp dụng logic xử lý reference range tương tự như hormone và blood
                    if (referenceRange.contains("-")) {
                        String[] parts = referenceRange.split("-");
                        double minValue = Double.parseDouble(parts[0].trim());
                        double maxValue = Double.parseDouble(parts[1].trim());
                        
                        if (value < minValue) {
                            this.status = "Low";
                        } else if (value > maxValue) {
                            this.status = "High";
                        } else {
                            this.status = "Normal";
                        }
                    } else {
                        // Xử lý các format khác nếu có
                        this.status = "Unknown";
                    }
                } else {
                    // Nếu không có reference range, dùng logic mặc định cho từng loại đo lường
                    // Dựa vào giá trị và đơn vị
                    
                    // Nếu giá trị là mm (có thể là độ dày nội mạc)
                    if (value > 15) { // Độ dày nội mạc > 15mm thường là bất thường
                        this.status = "High";
                    } else if (value >= 5 && value <= 15) { // 5-15mm thường là bình thường
                        this.status = "Normal";
                    } else {
                        this.status = "Low";
                    }
                }
                return;
            } catch (NumberFormatException e) {
                // Nếu parse số thất bại, tiếp tục xử lý như mô tả
            }
        }
        
        // Xử lý mô tả (text) cho siêu âm
        if (resultValue.toLowerCase().contains("bình thường") || 
            resultValue.toLowerCase().contains("normal") ||
            resultValue.toLowerCase().contains("không có bất thường")) {
            this.status = "Normal";
        } else if (resultValue.toLowerCase().contains("bất thường") ||
                  resultValue.toLowerCase().contains("u xơ") ||
                  resultValue.toLowerCase().contains("polyp") ||
                  resultValue.toLowerCase().contains("nang") ||
                  resultValue.toLowerCase().contains("dày") ||
                  resultValue.toLowerCase().contains("tăng kích thước") ||
                  resultValue.toLowerCase().contains("dịch douglas")) {
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
