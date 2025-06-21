package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.MenstrualCycle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenstrualCycleRepository extends JpaRepository<MenstrualCycle, Long> {
    List<MenstrualCycle> findByUser_UserID(Long userId);
    
    // Add method to find a single menstrual cycle by user ID
    Optional<MenstrualCycle> findFirstByUser_UserID(Long userId);
    
    // Check if a user has a menstrual cycle
    boolean existsByUser_UserID(Long userId);
}
