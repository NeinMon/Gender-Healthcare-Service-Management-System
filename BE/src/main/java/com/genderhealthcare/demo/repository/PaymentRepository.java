package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Payment findByOrderCode(Long orderCode);
    Payment findByPaymentLinkId(String paymentLinkId);
    Payment findByBooking_BookingId(Integer bookingId);
}
