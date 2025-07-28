package com.genderhealthcare.demo.service;
import io.agora.media.RtcTokenBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Service xử lý logic nghiệp vụ cho Agora Video Call
 * Tích hợp với Agora SDK để tạo token authentication
 * cho phiên video call giữa khách hàng và consultant
 * Token được tạo dựa trên App ID và Certificate từ Agora Console
 */
@Service
public class AgoraService {
    @Value("${agora.app.id}")
    private String appId;

    @Value("${agora.app.certificate}")
    private String appCertificate;

    /**
     * Tạo token Agora cho phiên video call
     * Token dùng để authenticate user khi join vào channel
     * 
     * @param channelName Tên kênh (phòng) video call
     * @param uid User ID (string format)
     * @param expireSeconds Thời gian hết hạn token (tối thiểu 1 giờ)
     * @param roleStr Vai trò ("CUSTOMER" = subscriber, khác = publisher)
     * @return Token string để client sử dụng
     */
    public String generateToken(String channelName, String uid, int expireSeconds, String roleStr) {
        RtcTokenBuilder tokenBuilder = new RtcTokenBuilder();
        int userId = Integer.parseInt(uid);
        RtcTokenBuilder.Role role = RtcTokenBuilder.Role.Role_Publisher;
        if ("CUSTOMER".equalsIgnoreCase(roleStr)) {
            role = RtcTokenBuilder.Role.Role_Subscriber;
        }

        // Increase default expiration time if it's too low
        if (expireSeconds < 3600) {
            expireSeconds = 3600; // Minimum 1 hour
        }

        // Calculate the actual expiration timestamp by adding expireSeconds to current time
        int privilegeExpiredTs = (int)(System.currentTimeMillis() / 1000 + expireSeconds);

        // Generate token with proper expiration timestamp
        return tokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, userId, role, privilegeExpiredTs);
    }
}
