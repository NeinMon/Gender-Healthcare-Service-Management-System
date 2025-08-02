package com.genderhealthcare.demo.entity;

import jakarta.persistence.*;


import java.time.LocalDateTime;

@Entity
@Table(name = "test_result_summary")
public class TestResultSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer testBookingInfoId;

    @Column(length = 1000)
    private String overallResult;

    @Column(nullable = false)
    private String overallStatus; // NORMAL, ABNORMAL

    @Column(length = 1000)
    private String note;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getTestBookingInfoId() { return testBookingInfoId; }
    public void setTestBookingInfoId(Integer testBookingInfoId) { this.testBookingInfoId = testBookingInfoId; }
    public String getOverallResult() { return overallResult; }
    public void setOverallResult(String overallResult) { this.overallResult = overallResult; }
    public String getOverallStatus() { return overallStatus; }
    public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
