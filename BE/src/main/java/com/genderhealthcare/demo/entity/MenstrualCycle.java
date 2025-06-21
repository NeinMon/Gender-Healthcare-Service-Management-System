package com.genderhealthcare.demo.entity;

import com.genderhealthcare.demo.entity.Users;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class MenstrualCycle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menstrual_cycle_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "userid")
    @NotNull(message = "User is required")
    private Users user;

    @Column(name = "start_date")
    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "cycle_length")
    @Min(value = 1, message = "Cycle length must be at least 1 day")
    private int cycleLength;

    @Column(name = "period_length")
    @Min(value = 1, message = "Period length must be at least 1 day")
    private Integer periodLength;


}
