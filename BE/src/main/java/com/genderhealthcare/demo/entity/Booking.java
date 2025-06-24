package com.genderhealthcare.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "booking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bookingId;

    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotNull(message = "Consultant ID is required")
    private Integer consutantId;

    @NotBlank(message = "Content is required")
    @Size(max = 500, message = "Content must be less than 500 characters")
    private String content;

    @NotBlank(message = "Appointment date is required")
    private String appointmentDate; // Date and time of the appointment

    @Pattern(
        regexp = "Chờ xác nhận|Đã xác nhận|Đã xong",
        message = "Status must be one of: Chờ xác nhận, Đã xác nhận, Đã xong"
    )
    private String status; // "Chờ xác nhận", "Đã xác nhận", "Đã xong"

    @NotBlank(message = "Created at is required")
    private String createdAt; // Timestamp of when the booking was created

    // Additional fields can be added as needed
}
