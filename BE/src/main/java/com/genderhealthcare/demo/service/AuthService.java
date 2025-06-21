package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.Role;
import com.genderhealthcare.demo.entity.Users;
import com.genderhealthcare.demo.exception.AccountNotFoundException;
import com.genderhealthcare.demo.model.AuthResponse;
import com.genderhealthcare.demo.model.LoginRequest;
import com.genderhealthcare.demo.model.RegisterRequest;
import com.genderhealthcare.demo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class AuthService {    @Autowired
    private UserRepository userRepository;

    /**
     * Đăng ký người dùng mới
     * 
     * @param request Dữ liệu đăng ký
     * @return Thông tin phản hồi đăng ký
     */
    public ResponseEntity<?> register(RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(AuthResponse.builder()
                            .message("Email đã được sử dụng")
                            .build());
        }

        // Chuyển đổi từ RegisterRequest sang Users entity
        Users user = new Users();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // Trong thực tế cần mã hóa mật khẩu
        user.setGender(request.getGender());
        user.setDob(request.getDob());        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(Role.CUSTOMER); // Mặc định vai trò là người dùng thông thường (customer)

        // Lưu vào cơ sở dữ liệu
        Users savedUser = userRepository.save(user);
        
        // Tạo và trả về response
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AuthResponse.from(savedUser, "Đăng ký thành công", savedUser.getRole()));
    }

    /**
     * Đăng nhập người dùng
     * 
     * @param request Dữ liệu đăng nhập
     * @return Thông tin phản hồi đăng nhập
     */    public ResponseEntity<?> login(LoginRequest request) {
        // Tìm người dùng theo email
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AccountNotFoundException("Email hoặc mật khẩu không hợp lệ"));

        // Kiểm tra mật khẩu
        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponse.builder()
                            .message("Email hoặc mật khẩu không hợp lệ")
                            .build());
        }        // Tạo và trả về response với thông tin role
        return ResponseEntity.ok(AuthResponse.from(user, "Đăng nhập thành công", user.getRole()));
    }
}
