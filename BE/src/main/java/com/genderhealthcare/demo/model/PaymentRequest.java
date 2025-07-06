package com.genderhealthcare.demo.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private Integer bookingId;
    private Double amount;
    private String description;
    private String returnUrl;
    private String cancelUrl;
}
