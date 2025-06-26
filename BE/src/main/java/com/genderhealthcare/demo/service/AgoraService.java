package com.genderhealthcare.demo.service;
import io.agora.media.RtcTokenBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AgoraService {
    @Value("${agora.app.id}")
    private String appId;

    @Value("${agora.app.certificate}")
    private String appCertificate;

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
