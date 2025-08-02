package com.genderhealthcare.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity lưu trữ các thông số xét nghiệm cho từng dịch vụ
 * Định nghĩa các chỉ số cần đo, đơn vị, giá trị tham chiếu cho từng loại xét nghiệm
 * Đặc biệt cho các xét nghiệm liên quan đến theo dõi chu kỳ kinh nguyệt
 */
@Entity
@Table(name = "service_test_parameter")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTestParameter {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "parameter_id")
    private Integer parameterId;
    
    @NotNull(message = "Service ID is required")
    @Column(name = "service_id")
    private Integer serviceId; // Foreign key to Service
    
    @NotBlank(message = "Parameter name is required")
    @Size(max = 255, message = "Parameter name must be less than 255 characters")
    @Column(name = "parameter_name", columnDefinition = "NVARCHAR(255)")
    private String parameterName; // Tên thông số (VD: "FSH", "Hemoglobin", "Siêu âm tử cung")
    
    @Size(max = 50, message = "Unit must be less than 50 characters")
    @Column(name = "unit", columnDefinition = "NVARCHAR(50)")
    private String unit; // Đơn vị (VD: "mIU/mL", "g/dL", "mm")
    
    @Size(max = 500, message = "Reference range must be less than 500 characters")
    @Column(name = "reference_range", columnDefinition = "NVARCHAR(500)")
    private String referenceRange; // Giá trị tham chiếu (VD: "3.5-12.5", "12.0-15.5", "Bình thường")
    
    @Size(max = 1000, message = "Description must be less than 1000 characters")
    @Column(name = "description", columnDefinition = "NVARCHAR(1000)")
    private String description; // Mô tả chi tiết về thông số
    
    @Column(name = "is_required")
    private Boolean isRequired = true; // Thông số bắt buộc phải có kết quả hay không
    
    @Column(name = "display_order")
    private Integer displayOrder = 0; // Thứ tự hiển thị trong báo cáo
    
    @Size(max = 50, message = "Parameter type must be less than 50 characters")
    @Column(name = "parameter_type", columnDefinition = "NVARCHAR(50)")
    private String parameterType; // Loại thông số: "HORMONE", "BLOOD", "ULTRASOUND", "OTHER"
    
    // // Relationship với Service entity
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "service_id", insertable = false, updatable = false)
    // private Service service;
}
