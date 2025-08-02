package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.TestResultSummary;
import com.genderhealthcare.demo.repository.TestResultSummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TestResultSummaryService {
    @Autowired
    private TestResultSummaryRepository summaryRepository;

    /**
     * Lưu hoặc cập nhật kết quả tổng quát
     */
    public TestResultSummary saveOrUpdate(TestResultSummary summary) {
        Optional<TestResultSummary> existing = summaryRepository.findByTestBookingInfoId(summary.getTestBookingInfoId());
        if (existing.isPresent()) {
            TestResultSummary old = existing.get();
            old.setOverallResult(summary.getOverallResult());
            old.setOverallStatus(summary.getOverallStatus());
            old.setNote(summary.getNote());
            return summaryRepository.save(old);
        }
        return summaryRepository.save(summary);
    }

    /**
     * Lấy kết quả tổng quát theo testBookingInfoId
     */
    public Optional<TestResultSummary> getByTestBookingInfoId(Integer testBookingInfoId) {
        return summaryRepository.findByTestBookingInfoId(testBookingInfoId);
    }

    /**
     * Lấy kết quả tổng quát theo ID
     */
    public Optional<TestResultSummary> getById(Integer id) {
        return summaryRepository.findById(id);
    }

    /**
     * Lấy tất cả kết quả tổng quát
     */
    public List<TestResultSummary> getAllSummaries() {
        return summaryRepository.findAll();
    }

    /**
     * Xóa kết quả tổng quát theo ID
     */
    public void deleteById(Integer id) {
        summaryRepository.deleteById(id);
    }

    /**
     * Tạo hoặc cập nhật kết quả tổng quát với các tham số riêng lẻ
     */
    public TestResultSummary createOrUpdateSummary(Integer testBookingInfoId, String overallResult, 
                                                   String overallStatus, String note) {
        TestResultSummary summary = new TestResultSummary();
        summary.setTestBookingInfoId(testBookingInfoId);
        summary.setOverallResult(overallResult);
        summary.setOverallStatus(overallStatus);
        summary.setNote(note);
        
        return saveOrUpdate(summary);
    }
}
