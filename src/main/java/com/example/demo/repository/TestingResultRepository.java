package com.example.demo.repository;

import com.example.demo.entity.TestingResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestingResultRepository extends JpaRepository<TestingResult, Long> {
}
