package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.service.AgoraService;
import org.springframework.beans.factory.annotation.Autowired;
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
    public Map<String, String> getToken(@RequestParam String channelName, @RequestParam String uid, @RequestParam(defaultValue = "3600") int expireSeconds, @RequestParam(defaultValue = "PUBLISHER") String role) {
        String token = agoraService.generateToken(channelName, uid, expireSeconds, role);
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return response;
    }
}
