package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class MenstrualCycle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private int cycleLength;
    private Integer periodLength;
    private String email;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public int getCycleLength() { return cycleLength; }
    public void setCycleLength(int cycleLength) { this.cycleLength = cycleLength; }
    public Integer getPeriodLength() { return periodLength; }
    public void setPeriodLength(Integer periodLength) { this.periodLength = periodLength; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
