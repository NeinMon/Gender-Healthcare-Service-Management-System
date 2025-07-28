package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.service.AgoraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RestController
@RequestMapping("/api/agora")
public class AgoraAPI {
    @Autowired
    private AgoraService agoraService;

    @GetMapping("/token")
    public ResponseEntity<?> getToken(
            @RequestParam String channelName, 
            @RequestParam String uid, 
            @RequestParam(defaultValue = "3600") int expireSeconds, 
            @RequestParam(defaultValue = "PUBLISHER") String role) {
        try {
            String token = agoraService.generateToken(channelName, uid, expireSeconds, role);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi tạo token Agora: " + e.getMessage());
        }
    }
}
