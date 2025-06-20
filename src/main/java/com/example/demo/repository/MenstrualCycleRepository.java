package com.example.demo.repository;

import com.example.demo.entity.MenstrualCycle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenstrualCycleRepository extends JpaRepository<MenstrualCycle, Long> {
}
