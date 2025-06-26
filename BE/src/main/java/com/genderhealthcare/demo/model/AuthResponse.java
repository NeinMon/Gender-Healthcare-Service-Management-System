package com.genderhealthcare.demo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.genderhealthcare.demo.entity.Users;
import com.genderhealthcare.demo.entity.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String message;
    private Integer userId;
    private String email;
    private String fullName;
    private int roleId;
    private String roleName;
    private String redirectUrl;      public static AuthResponse from(Users user, String message, Role role) {
        // Xác định URL chuyển hướng dựa trên role
        String redirectUrl;
        if (role == Role.CUSTOMER) {
            redirectUrl = "/";  // URL cho customer
        } else if (role == Role.CONSULTANT) {
            redirectUrl = "/consultant-interface"; // URL cho consultant
        } else if (role == Role.MANAGER) {
            redirectUrl = "/manager"; // URL cho manager
        } else if (role == Role.ADMIN) {
            redirectUrl = "/admin"; // URL cho admin
        } else {
            redirectUrl = "/"; // URL mặc định - trang chủ
        }
        
        return AuthResponse.builder()
                .message(message)
                .userId(user.getUserID())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roleId(role.ordinal())
                .roleName(role.name())
                .redirectUrl(redirectUrl)
                .build();
    }
}
