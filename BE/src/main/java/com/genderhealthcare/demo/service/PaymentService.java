package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.Booking;
import com.genderhealthcare.demo.entity.Payment;
import com.genderhealthcare.demo.repository.PaymentRepository;
import com.genderhealthcare.demo.model.PaymentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private final RestTemplate restTemplate;
    private final BookingService bookingService;
    private final PaymentRepository paymentRepository;

    @Value("${payos.client-id}")
    private String payosClientId;

    @Value("${payos.api-key}")
    private String payosApiKey;

    @Value("${payos.checksum-key}")
    private String payosChecksumKey;

    @Value("${payos.api-url}")
    private String payosApiUrl;

    @Autowired
    public PaymentService(BookingService bookingService, PaymentRepository paymentRepository) {
        this.restTemplate = new RestTemplate();
        this.bookingService = bookingService;
        this.paymentRepository = paymentRepository;
    }

    // Hàm tạo HMAC_SHA256 cho signature
    public String hmacSHA256(String data, String key) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC_SHA256 signature: " + e.getMessage(), e);
        }
    }

    // Helper method to encode URI component similar to JavaScript's encodeURIComponent
    private String encodeURIComponent(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8.toString())
                    .replace("+", "%20")
                    .replace("%21", "!")
                    .replace("%27", "'")
                    .replace("%28", "(")
                    .replace("%29", ")")
                    .replace("%7E", "~");
        } catch (Exception e) {
            return value; // Return unencoded value in case of error
        }
    }

    /**
     * Create a payment URL for PayOS
     */
    public String createPaymentUrl(PaymentRequest paymentRequest) {
        try {
            Booking booking = bookingService.getBookingById(paymentRequest.getBookingId());
            if (booking == null) throw new RuntimeException("Booking not found");
            Payment payment = booking.getPayment();
            if (payment == null) {
                payment = new Payment();
                payment.setBooking(booking);
                payment.setAmount(paymentRequest.getAmount());
                payment.setOrderCode(System.currentTimeMillis());
                payment.setStatus("PENDING");
                paymentRepository.save(payment);
                booking.setPayment(payment);
                bookingService.createBooking(booking);
            }
            // Nếu đã có payment và trạng thái là PENDING, trả về link cũ nếu có
            if ("PENDING".equals(payment.getStatus()) && payment.getPaymentLinkId() != null) {
                // Lấy lại link thanh toán từ PayOS nếu paymentLinkId còn hiệu lực
                try {
                    String url = payosApiUrl + "/v2/payment-requests/" + payment.getPaymentLinkId();
                    HttpHeaders headers = new HttpHeaders();
                    headers.set("x-client-id", payosClientId);
                    headers.set("x-api-key", payosApiKey);
                    HttpEntity<Void> entity = new HttpEntity<>(headers);
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map<String, Object> body = response.getBody();
                    if (body.containsKey("code") && "00".equals(body.get("code").toString()) && body.containsKey("data")) {
                        Object dataObj = body.get("data");
                        if (dataObj instanceof Map) {
                            Map<String, Object> data = (Map<String, Object>) dataObj;
                            if (data.containsKey("checkoutUrl")) {
                                return data.get("checkoutUrl").toString();
                            }
                        }
                    }
                }
                } catch (Exception e) {
                    // Nếu lỗi, tiếp tục tạo mới
                }
            }
            // Nếu đã thanh toán, không cho tạo lại link
            if ("PAID".equals(payment.getStatus())) {
                throw new RuntimeException("Booking đã được thanh toán");
            }
            Long orderCode = payment.getOrderCode();
            int amount = payment.getAmount().intValue();
            String serviceName = "DichVu";
            try {
                if (booking.getServiceId() != null) {
                    serviceName = booking.getServiceId() == 1 ? "Tuvan" : "DichVu" + booking.getServiceId();
                }
            } catch (Exception e) {}
            String description = serviceName + "#" + paymentRequest.getBookingId();
            String returnUrl = paymentRequest.getReturnUrl() != null ? paymentRequest.getReturnUrl() : "http://localhost:5173/consultation-booking?status=success&bookingId=" + paymentRequest.getBookingId();
            String cancelUrl = paymentRequest.getCancelUrl() != null ? paymentRequest.getCancelUrl() : "http://localhost:5173/consultation-booking?status=cancel&bookingId=" + paymentRequest.getBookingId();
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("orderCode", orderCode);
            requestBody.put("amount", amount);
            requestBody.put("description", encodeURIComponent(description));
            requestBody.put("returnUrl", encodeURIComponent(returnUrl));
            requestBody.put("cancelUrl", encodeURIComponent(cancelUrl));

            // Optional buyer info
            try {
                ResponseEntity<Object> userResponse = restTemplate.getForEntity(
                    "http://localhost:8080/api/users/" + booking.getUserId(),
                    Object.class
                );
                if (userResponse != null && userResponse.getBody() != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> userData = (Map<String, Object>) userResponse.getBody();
                    if (userData.get("fullName") != null) requestBody.put("buyerName", userData.get("fullName").toString());
                    if (userData.get("email") != null) requestBody.put("buyerEmail", userData.get("email").toString());
                    if (userData.get("phone") != null) requestBody.put("buyerPhone", userData.get("phone").toString());
                    if (userData.get("address") != null) requestBody.put("buyerAddress", userData.get("address").toString());
                }
            } catch (Exception e) {
                System.out.println("Failed to get user info: " + e.getMessage());
                // Bỏ qua buyer info nếu lỗi
            }

            // Tạo signature
            String data = String.format("amount=%d&cancelUrl=%s&description=%s&orderCode=%s&returnUrl=%s",
                    amount, 
                    encodeURIComponent(cancelUrl), 
                    encodeURIComponent(description), 
                    orderCode, 
                    encodeURIComponent(returnUrl));
            String signature = hmacSHA256(data, payosChecksumKey);
            requestBody.put("signature", signature);

            // Create HTTP entity with headers and body
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", payosClientId);
            headers.set("x-api-key", payosApiKey);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Log request for debugging
            System.out.println("PayOS API Request: " + requestBody);
            
            try {
                // Make API call to PayOS v2 API
                ResponseEntity<Object> response = restTemplate.postForEntity(
                    "https://api-merchant.payos.vn/v2/payment-requests",
                    entity,
                    Object.class
                );
                // Log response status and body
                System.out.println("PayOS API Response Status: " + response.getStatusCode());
                System.out.println("PayOS API Response Body: " + response.getBody());

                // Get payment URL from response
                if (response.getBody() != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
                    
                    // Check for error code first
                    if (responseBody.containsKey("code")) {
                        String codeStr = responseBody.get("code").toString();
                        // Code "00" means success in PayOS API
                        if ("00".equals(codeStr) && responseBody.containsKey("data")) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> dataMap = (Map<String, Object>) responseBody.get("data");
                            if (dataMap != null && dataMap.containsKey("checkoutUrl")) {
                                // Store paymentLinkId in payment
                                if (dataMap.containsKey("paymentLinkId")) {
                                    payment.setPaymentLinkId(dataMap.get("paymentLinkId").toString());
                                    paymentRepository.save(payment);
                                }
                                return dataMap.get("checkoutUrl").toString();
                            } else {
                                System.out.println("Error: Missing checkoutUrl in data: " + dataMap);
                                throw new RuntimeException("PayOS không trả về URL thanh toán");
                            }
                        } else {
                            // Handle error code from PayOS
                            String desc = responseBody.containsKey("desc") ? 
                                responseBody.get("desc").toString() : "Unknown error";
                            System.out.println("PayOS Error: Code " + codeStr + " - " + desc);
                            throw new RuntimeException("PayOS Error: " + desc);
                        }
                    } else {
                        System.out.println("Error: Unexpected response format: " + responseBody);
                        // Check for error message in the response
                        if (responseBody.containsKey("error") || responseBody.containsKey("message")) {
                            String errorMsg = responseBody.containsKey("error") ? 
                                responseBody.get("error").toString() : responseBody.get("message").toString();
                            throw new RuntimeException("PayOS API error: " + errorMsg);
                        }
                    }
                } else {
                    System.out.println("Error: Response body is null");
                }
            } catch (Exception e) {
                System.out.println("Exception during PayOS API call: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }

            throw new RuntimeException("Could not retrieve payment URL from PayOS");
        } catch (Exception e) {
            throw new RuntimeException("Failed to create payment link: " + e.getMessage(), e);
        }
    }

    /**
     * Verify PayOS webhook signature
     * Implementation based on PayOS v2 documentation
     */
    public boolean verifyPaymentWebhook(String signature, String payload) {
        try {
            // Log webhook data for debugging
            System.out.println("Received webhook with signature: " + signature);
            System.out.println("Webhook payload: " + payload);
            
            // Calculate HMAC SHA256 signature of the payload with the checksum key
            String computed = hmacSHA256(payload, payosChecksumKey);
            
            // Compare the calculated signature with the provided one
            boolean isValid = signature != null && computed != null && signature.equals(computed);
            
            System.out.println("Webhook signature verification: " + (isValid ? "VALID" : "INVALID"));
            System.out.println("  Expected: " + signature);
            System.out.println("  Computed: " + computed);
            
            return isValid;
        } catch (Exception e) {
            System.out.println("Error verifying webhook: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Update booking status after successful payment
     */
    public void processSuccessfulPayment(Integer bookingId, String paymentId) {
        Booking booking = bookingService.getBookingById(bookingId);
        if (booking != null) {
            Payment payment = booking.getPayment();
            if (payment != null) {
                payment.setStatus("PAID");
                payment.setPaymentLinkId(paymentId);
                paymentRepository.save(payment);
            }
            bookingService.createBooking(booking);
        }
    }

    /**
     * Update booking status after cancelled/expired payment
     */
    public void processCancelledPayment(Integer bookingId, String paymentId) {
        Booking booking = bookingService.getBookingById(bookingId);
        if (booking != null) {
            Payment payment = booking.getPayment();
            if (payment != null) {
                payment.setStatus("CANCELLED");
                payment.setPaymentLinkId(paymentId);
                paymentRepository.save(payment);
            }
            bookingService.createBooking(booking);
        }
    }

    /**
     * Hủy link thanh toán PayOS và cập nhật trạng thái booking về CANCELLED
     */
    public boolean cancelPaymentRequest(Integer bookingId, String reason) {
        try {
            Booking booking = bookingService.getBookingById(bookingId);
            if (booking == null) return false;
            // Cho phép hủy nếu trạng thái là PENDING, EXPIRED, hoặc CANCELLED (idempotent)
            Payment payment = booking.getPayment();
            if (payment != null) {
                if ("PAID".equalsIgnoreCase(payment.getStatus())) {
                    return false; // Không hủy nếu đã thanh toán thành công
                }
                // Gọi API PayOS để hủy link thanh toán (nếu có paymentLinkId)
                if (payment.getPaymentLinkId() != null && !payment.getPaymentLinkId().isEmpty()) {
                    String url = "https://api-merchant.payos.vn/v2/payment-requests/" + payment.getPaymentLinkId() + "/cancel";
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    headers.set("x-client-id", payosClientId);
                    headers.set("x-api-key", payosApiKey);
                    Map<String, Object> body = new HashMap<>();
                    body.put("reason", reason != null ? reason : "Khách hàng hủy thanh toán");
                    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                    try {
                        ResponseEntity<Object> response = restTemplate.postForEntity(url, entity, Object.class);
                        System.out.println("PayOS cancel response: " + response.getBody());
                    } catch (Exception e) {
                        System.out.println("Lỗi khi gọi PayOS cancel: " + e.getMessage());
                    }
                }
                // Luôn cập nhật trạng thái payment về CANCELLED nếu chưa phải PAID
                payment.setStatus("CANCELLED");
                paymentRepository.save(payment);
            }
            bookingService.createBooking(booking);
            return true;
        } catch (Exception e) {
            System.out.println("Lỗi khi hủy thanh toán: " + e.getMessage());
            return false;
        }
    }

    /**
     * Trả về checksum key PayOS (lấy từ application.properties)
     */
    public String getPayOSChecksumKey() {
        return payosChecksumKey;
    }

    /**
     * Đồng bộ trạng thái booking với trạng thái link PayOS (ưu tiên kiểm tra bằng bookingId/orderCode)
     */
    public void syncBookingStatusWithPayOS(Booking booking) {
        if (booking == null) return;
        Payment payment = booking.getPayment();
        String paymentId = payment != null ? payment.getPaymentLinkId() : null;
        if (paymentId != null && !paymentId.isEmpty()) {
            try {
                String url = payosApiUrl + "/v2/payment-requests/" + paymentId;
                HttpHeaders headers = new HttpHeaders();
                headers.set("x-client-id", payosClientId);
                headers.set("x-api-key", payosApiKey);
                HttpEntity<Void> entity = new HttpEntity<>(headers);
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map<String, Object> body = response.getBody();
                    if (body.containsKey("code") && "00".equals(body.get("code").toString()) && body.containsKey("data")) {
                        Object dataObj = body.get("data");
                        if (dataObj instanceof Map) {
                            Map<String, Object> data = (Map<String, Object>) dataObj;
                            String payosStatus = data.get("status") != null ? data.get("status").toString() : null;
                            if (payosStatus != null) {
                                String newStatus = payosStatus.toUpperCase();
                                if (payment != null) {
                                    payment.setStatus(newStatus);
                                    paymentRepository.save(payment);
                                }
                                System.out.println("[PayOS Sync] Updated booking to status: " + newStatus);
                            }
                        }
                    }
                }
            } catch (Exception ex) {
                System.out.println("[PayOS Sync] Error by paymentId: " + ex.getMessage());
            }
        } else {
            System.out.println("[PayOS Sync] No paymentLinkId found for booking, cannot sync status with PayOS.");
        }
    }
}
