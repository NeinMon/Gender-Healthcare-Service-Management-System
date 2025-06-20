package com.example.demo.repository;

import com.example.demo.entity.MenstrualCycle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenstrualCycleRepository extends JpaRepository<MenstrualCycle, Long> {
    List<MenstrualCycle> findTop1ByEmailOrderByStartDateDesc(String email);
}
