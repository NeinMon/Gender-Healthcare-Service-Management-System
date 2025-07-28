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
     * Đăng ký tài khoản mới
     * 
     * @param registerRequest Dữ liệu đăng ký
     * @return Thông tin đăng ký thành công
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return authService.register(registerRequest);
    }
    
    /**
     * Đăng nhập vào hệ thống
     * 
     * @param loginRequest Dữ liệu đăng nhập
     * @return Thông tin đăng nhập thành công
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }
}
