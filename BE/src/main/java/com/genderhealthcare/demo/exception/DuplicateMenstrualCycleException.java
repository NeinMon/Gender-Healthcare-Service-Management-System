package com.genderhealthcare.demo.exception;

public class DuplicateMenstrualCycleException extends RuntimeException {
    public DuplicateMenstrualCycleException(String message) {
        super(message);
    }
    
    public DuplicateMenstrualCycleException(Long userId) {
        super("User with ID " + userId + " already has a menstrual cycle record");
    }
}
