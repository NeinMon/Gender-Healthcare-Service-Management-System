package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.service.AgoraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * API Controller xử lý các yêu cầu liên quan đến Agora Video Call
 * Agora là dịch vụ tích hợp video call, voice call cho ứng dụng tư vấn sức khỏe
 * API này chỉ tiếp nhận request từ frontend và gọi đến service layer
 */
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RestController
@RequestMapping("/api/agora")
public class AgoraAPI {
    @Autowired
    private AgoraService agoraService;

    /**
     * API tạo token cho phiên video call Agora
     * Token này được sử dụng để authenticate user trong cuộc gọi video
     * 
     * @param channelName Tên kênh (phòng) video call
     * @param uid User ID của người tham gia
     * @param expireSeconds Thời gian hết hạn token (mặc định 3600s = 1h)
     * @param role Vai trò trong cuộc gọi (PUBLISHER/SUBSCRIBER, mặc định PUBLISHER)
     * @return ResponseEntity chứa token hoặc lỗi
     */
    @GetMapping("/token")
    public ResponseEntity<?> getToken(
            @RequestParam String channelName, 
            @RequestParam String uid, 
            @RequestParam(defaultValue = "3600") int expireSeconds, 
            @RequestParam(defaultValue = "PUBLISHER") String role) {
        try {
            // Gọi service để tạo token Agora
            String token = agoraService.generateToken(channelName, uid, expireSeconds, role);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi tạo token Agora: " + e.getMessage());
        }
    }
}
