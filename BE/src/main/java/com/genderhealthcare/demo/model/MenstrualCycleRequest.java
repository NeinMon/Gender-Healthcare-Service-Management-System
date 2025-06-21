package com.genderhealthcare.demo.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MenstrualCycleRequest {
    @NotNull(message = "User ID cannot be null")
    private Long userId;
    
    @NotNull(message = "Start date cannot be null")
    @PastOrPresent(message = "Start date cannot be in the future")
    private LocalDate startDate;
    
    @PastOrPresent(message = "End date cannot be in the future")
    private LocalDate endDate;
    
    @NotNull(message = "Cycle length cannot be null")
    @Min(value = 1, message = "Cycle length must be at least 1 day")
    private Integer cycleLength;
    
    @NotNull(message = "Period length cannot be null")
    @Min(value = 1, message = "Period length must be at least 1 day")
    private Integer periodLength;
}
