package com.genderhealthcare.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import lombok.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import java.time.LocalDateTime;
import java.util.Date;
import jakarta.persistence.PrePersist;

import com.genderhealthcare.demo.entity.Role;

/**
 * Data Transfer Object cho User.
 * Sử dụng để chuyển dữ liệu giữa các layer của ứng dụng và API.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userID")
    private Integer userID;

    @NotBlank(message = "Name must not be blank")
    @Column(name = "full_name", columnDefinition = "NVARCHAR(255)")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            message = "Email phải đúng định dạng (ví dụ: example@email.com)")
    private String email;

    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, message = "Password phải có ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "Gender không được để trống")
    private String gender;

    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDateTime dob;

    @NotBlank(message = "Phone không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc +84, và có 10 số)")
    private String phone;    
    private String address;
    private Date createdAt;

    @NotNull(message = "Role không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }
}
