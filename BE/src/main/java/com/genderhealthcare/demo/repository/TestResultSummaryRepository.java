package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.TestResultSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TestResultSummaryRepository extends JpaRepository<TestResultSummary, Integer> {
    Optional<TestResultSummary> findByTestBookingInfoId(Integer testBookingInfoId);
}
