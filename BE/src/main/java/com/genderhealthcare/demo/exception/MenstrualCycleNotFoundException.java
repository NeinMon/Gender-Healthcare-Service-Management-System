package com.genderhealthcare.demo.exception;

public class MenstrualCycleNotFoundException extends RuntimeException {
    public MenstrualCycleNotFoundException(String message) {
        super(message);
    }

    public MenstrualCycleNotFoundException(Long id) {
        super("Could not find menstrual cycle with id: " + id);
    }
}
