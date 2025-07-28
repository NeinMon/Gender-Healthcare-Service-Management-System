package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.model.LoginRequest;
import com.genderhealthcare.demo.model.RegisterRequest;
import com.genderhealthcare.demo.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * API Controller xử lý các yêu cầu xác thực và phân quyền người dùng
 * Quản lý đăng ký, đăng nhập cho customer, consultant và staff
 * API này chỉ tiếp nhận request từ frontend và gọi đến service layer
 */
/**
 * Controller xử lý các yêu cầu xác thực người dùng
 */
@RestController
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RequestMapping("/api/auth")
public class AuthAPI {
    
    @Autowired
    private AuthService authService;
    
    /**
     * API đăng ký tài khoản mới
     * Tạo tài khoản cho customer, consultant hoặc staff
     * Validate thông tin và kiểm tra trùng lặp email/username
     * 
     * @param registerRequest Thông tin đăng ký (email, password, fullName, role, ...)
     * @return ResponseEntity chứa thông tin user đã tạo hoặc lỗi
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return authService.register(registerRequest);
    }
    
    /**
     * API đăng nhập vào hệ thống
     * Xác thực thông tin đăng nhập và trả về thông tin user
     * Hỗ trợ đăng nhập cho tất cả loại user (customer, consultant, staff)
     * 
     * @param loginRequest Thông tin đăng nhập (email/username và password)
     * @return ResponseEntity chứa thông tin user và role hoặc lỗi
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }
}
