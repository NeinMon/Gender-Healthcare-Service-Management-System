package com.genderhealthcare.demo.model;

/**
 * Request model để tạo hoặc cập nhật ServiceTestParameter
 */
public class ServiceTestParameterRequest {
    private Integer serviceId;  // Changed from Long to Integer to match entity
    private String parameterName;
    private String unit;
    private String referenceRange;
    private String description;
    private String parameterType; // HORMONE, BLOOD, ULTRASOUND
    private boolean isRequired;
    private int displayOrder;

    // Default constructor
    public ServiceTestParameterRequest() {}

    // Constructor with basic fields
    public ServiceTestParameterRequest(Integer serviceId, String parameterName, String unit, 
                                     String referenceRange, String parameterType) {
        this.serviceId = serviceId;
        this.parameterName = parameterName;
        this.unit = unit;
        this.referenceRange = referenceRange;
        this.parameterType = parameterType;
        this.isRequired = true;
        this.displayOrder = 0;
    }

    // Getters and Setters
    public Integer getServiceId() {
        return serviceId;
    }

    public void setServiceId(Integer serviceId) {
        this.serviceId = serviceId;
    }

    public String getParameterName() {
        return parameterName;
    }

    public void setParameterName(String parameterName) {
        this.parameterName = parameterName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getReferenceRange() {
        return referenceRange;
    }

    public void setReferenceRange(String referenceRange) {
        this.referenceRange = referenceRange;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getParameterType() {
        return parameterType;
    }

    public void setParameterType(String parameterType) {
        this.parameterType = parameterType;
    }

    public boolean isRequired() {
        return isRequired;
    }

    public void setRequired(boolean required) {
        isRequired = required;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    @Override
    public String toString() {
        return "ServiceTestParameterRequest{" +
                "serviceId=" + serviceId +
                ", parameterName='" + parameterName + '\'' +
                ", unit='" + unit + '\'' +
                ", referenceRange='" + referenceRange + '\'' +
                ", description='" + description + '\'' +
                ", parameterType='" + parameterType + '\'' +
                ", isRequired=" + isRequired +
                ", displayOrder=" + displayOrder +
                '}';
    }
}
