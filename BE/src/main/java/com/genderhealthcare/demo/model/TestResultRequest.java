package com.genderhealthcare.demo.model;

/**
 * Request model để cập nhật TestResult
 */
public class TestResultRequest {
    private String resultValue;
    private String note;

    // Default constructor
    public TestResultRequest() {}

    // Constructor with basic fields
    public TestResultRequest(String resultValue, String note) {
        this.resultValue = resultValue;
        this.note = note;
    }

    // Getters and Setters
    public String getResultValue() {
        return resultValue;
    }

    public void setResultValue(String resultValue) {
        this.resultValue = resultValue;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    @Override
    public String toString() {
        return "TestResultRequest{" +
                "resultValue='" + resultValue + '\'' +
                ", note='" + note + '\'' +
                '}';
    }
}
