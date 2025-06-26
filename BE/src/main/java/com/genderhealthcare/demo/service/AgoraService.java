package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.agora.RtcTokenBuilder2;import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AgoraService {
    @Value("${agora.app.id}")
    private String appId;

    @Value("${agora.app.certificate}")
    private String appCertificate;

    public String generateToken(String channelName, String uid, int expireSeconds, String roleStr) {
        RtcTokenBuilder2 tokenBuilder = new RtcTokenBuilder2();
        int userId = Integer.parseInt(uid);
        RtcTokenBuilder2.Role role = RtcTokenBuilder2.Role.ROLE_PUBLISHER;
        if ("CUSTOMER".equalsIgnoreCase(roleStr)) {
            role = RtcTokenBuilder2.Role.ROLE_SUBSCRIBER;
        }
        return tokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, userId, role, expireSeconds, expireSeconds);
    }
}
