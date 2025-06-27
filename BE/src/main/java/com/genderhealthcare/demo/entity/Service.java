package com.genderhealthcare.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "serviceid")
    private int serviceId;

    @NotBlank(message = "Service name is required")
    @Size(max = 255, message = "Service name must be less than 255 characters")
    @Column(name = "servicename", columnDefinition = "NVARCHAR(255)")
    private String serviceName;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    @Column(name = "description", columnDefinition = "NVARCHAR(1000)")
    private String description;

    @NotNull(message = "Manager ID is required")
    @Column(name = "managerid")
    private Integer managerId;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "1000.0", inclusive = true, message = "Price must be at least 1,000 VND")
    @Digits(integer = 12, fraction = 0, message = "Price must be a whole number (VND does not use decimal places)")
    @Column(name = "price", precision = 12, scale = 0)
    private BigDecimal price; // Giá tính bằng VND (Việt Nam đồng)
}
