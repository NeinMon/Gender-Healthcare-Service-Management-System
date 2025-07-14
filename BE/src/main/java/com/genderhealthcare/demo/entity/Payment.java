package com.genderhealthcare.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @jakarta.persistence.Transient
    private String statusMessage;

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer paymentId;

    @Column(name = "order_code", unique = true)
    private Long orderCode;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "status", columnDefinition = "VARCHAR(20)")
    private String status; // PENDING, PROCESSING, PAID, FAILED, CANCELLED, EXPIRED

    @Column(name = "payment_link_id")
    private String paymentLinkId;

    @OneToOne
    @JoinColumn(name = "booking_id", referencedColumnName = "bookingId")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Booking booking;

    // Thêm các trường khác nếu cần
}
