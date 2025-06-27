package com.genderhealthcare.demo.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = BookingValidation.class)
public @interface ValidBooking {
    String message() default "Consultant ID is required when Service ID is 1";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
