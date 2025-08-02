package com.genderhealthcare.demo.model;

/**
 * Request model để tạo test result kèm summary
 * Được sử dụng bởi endpoint /api/test-results/with-summary
 */
public class TestResultWithSummaryRequest {
    private Integer testBookingInfoId;
    private Object parameterId; // Có thể là Integer hoặc String
    private String resultValue;
    private String note;
    private String status;
    
    // Thông tin summary (optional)
    private String overallResult;
    private String overallStatus;
    private String overallNote;
    
    // Constructors
    public TestResultWithSummaryRequest() {}
    
    public TestResultWithSummaryRequest(Integer testBookingInfoId, Object parameterId, String resultValue, 
                                      String note, String status) {
        this.testBookingInfoId = testBookingInfoId;
        this.parameterId = parameterId;
        this.resultValue = resultValue;
        this.note = note;
        this.status = status;
    }
    
    // Getters và Setters
    public Integer getTestBookingInfoId() {
        return testBookingInfoId;
    }
    
    public void setTestBookingInfoId(Integer testBookingInfoId) {
        this.testBookingInfoId = testBookingInfoId;
    }
    
    public Object getParameterId() {
        return parameterId;
    }
    
    public void setParameterId(Object parameterId) {
        this.parameterId = parameterId;
    }
    
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getOverallResult() {
        return overallResult;
    }
    
    public void setOverallResult(String overallResult) {
        this.overallResult = overallResult;
    }
    
    public String getOverallStatus() {
        return overallStatus;
    }
    
    public void setOverallStatus(String overallStatus) {
        this.overallStatus = overallStatus;
    }
    
    public String getOverallNote() {
        return overallNote;
    }
    
    public void setOverallNote(String overallNote) {
        this.overallNote = overallNote;
    }
    
    @Override
    public String toString() {
        return "TestResultWithSummaryRequest{" +
                "testBookingInfoId=" + testBookingInfoId +
                ", parameterId=" + parameterId +
                ", resultValue='" + resultValue + '\'' +
                ", note='" + note + '\'' +
                ", status='" + status + '\'' +
                ", overallResult='" + overallResult + '\'' +
                ", overallStatus='" + overallStatus + '\'' +
                ", overallNote='" + overallNote + '\'' +
                '}';
    }
}
