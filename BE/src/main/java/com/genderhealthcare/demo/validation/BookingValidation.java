package com.genderhealthcare.demo.validation;

import com.genderhealthcare.demo.entity.Booking;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class BookingValidation implements ConstraintValidator<ValidBooking, Booking> {

    @Override
    public void initialize(ValidBooking constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(Booking booking, ConstraintValidatorContext context) {
        if (booking == null) {
            return true; // Let other validators handle null values
        }

        // Nếu serviceId = 1, thì consultantId phải có giá trị
        if (booking.getServiceId() != null && booking.getServiceId().equals(1)) {
            if (booking.getConsultantId() == null) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    "Consultant ID is required when Service ID is 1")
                    .addPropertyNode("consultantId")
                    .addConstraintViolation();
                return false;
            }
        }

        // Nếu serviceId khác 1, consultantId có thể null hoặc có giá trị đều được
        // Các trường hợp khác đều hợp lệ
        return true;
    }
}
