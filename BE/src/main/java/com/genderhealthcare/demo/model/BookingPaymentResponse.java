package com.genderhealthcare.demo.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingPaymentResponse {
    private Integer bookingId;
    private Double amount;
    private String message;
}
