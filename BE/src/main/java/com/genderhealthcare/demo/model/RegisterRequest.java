package com.genderhealthcare.demo.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "Name must not be blank")
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
}
