package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.TestResultSummary;
import com.genderhealthcare.demo.service.TestResultSummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/test-result-summary")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TestResultSummaryAPI {
    @Autowired
    private TestResultSummaryService summaryService;

    /**
     * Lưu hoặc cập nhật kết quả tổng quát
     */
    @PostMapping
    public ResponseEntity<TestResultSummary> saveOrUpdate(@RequestBody TestResultSummary summary) {
        try {
            TestResultSummary saved = summaryService.saveOrUpdate(summary);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy kết quả tổng quát theo testBookingInfoId
     */
    @GetMapping("/test-booking/{testBookingInfoId}")
    public ResponseEntity<TestResultSummary> getByTestBookingInfoId(@PathVariable Integer testBookingInfoId) {
        Optional<TestResultSummary> summary = summaryService.getByTestBookingInfoId(testBookingInfoId);
        return summary.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // /**
    //  * Lấy kết quả tổng quát theo ID
    //  */
    // @GetMapping("/{id}")
    // public ResponseEntity<TestResultSummary> getById(@PathVariable Integer id) {
    //     Optional<TestResultSummary> summary = summaryService.getById(id);
    //     return summary.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    // }

    // /**
    //  * Lấy tất cả kết quả tổng quát
    //  */
    // @GetMapping
    // public ResponseEntity<List<TestResultSummary>> getAllSummaries() {
    //     List<TestResultSummary> summaries = summaryService.getAllSummaries();
    //     return ResponseEntity.ok(summaries);
    // }

    /**
     * Cập nhật kết quả tổng quát theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<TestResultSummary> updateById(@PathVariable Integer id, @RequestBody TestResultSummary summary) {
        Optional<TestResultSummary> existing = summaryService.getById(id);
        if (existing.isPresent()) {
            summary.setId(id);
            TestResultSummary updated = summaryService.saveOrUpdate(summary);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // /**
    //  * Xóa kết quả tổng quát theo ID
    //  */
    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
    //     try {
    //         summaryService.deleteById(id);
    //         return ResponseEntity.ok().build();
    //     } catch (Exception e) {
    //         return ResponseEntity.notFound().build();
    //     }
    // }
}
