package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.TestResult;
import com.genderhealthcare.demo.model.TestResultWithSummaryRequest;
import com.genderhealthcare.demo.service.TestResultService;
import com.genderhealthcare.demo.service.TestResultSummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API Controller cho quản lý kết quả xét nghiệm chi tiết
 * Đặc biệt hỗ trợ các xét nghiệm liên quan đến chu kỳ kinh nguyệt
 */
@RestController
@RequestMapping("/api/test-results")
@CrossOrigin(origins = "*")
public class TestResultAPI {
    
    @Autowired
    private TestResultService testResultService;
    
    @Autowired
    private TestResultSummaryService testResultSummaryService;
    
    /**
     * Test endpoint để kiểm tra API hoạt động
     */
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("TestResult API is working!");
    }
    
    /**
     * Lấy tất cả kết quả xét nghiệm của một test booking
     */
    @GetMapping("/test-booking/{testBookingInfoId}")
    public ResponseEntity<List<TestResult>> getResultsByTestBookingInfoId(@PathVariable Integer testBookingInfoId) {
        try {
            System.out.println("API: Getting test results for testBookingInfoId: " + testBookingInfoId);
            List<TestResult> results = testResultService.getResultsByTestBookingInfoId(testBookingInfoId);
            System.out.println("API: Found " + results.size() + " test results");
            
            // Log chi tiết từng result để debug
            for (TestResult result : results) {
                System.out.println("Result - ID: " + result.getResultId() + 
                                 ", TestBookingInfoId: " + result.getTestBookingInfoId() +
                                 ", ParameterId: " + result.getParameterId() + 
                                 ", Value: " + result.getResultValue() + 
                                 ", Status: " + result.getStatus());
            }
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("API: Error getting test results for testBookingInfoId " + testBookingInfoId);
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            e.printStackTrace();
            
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Lấy kết quả theo loại thông số (HORMONE, BLOOD, ULTRASOUND)
     */
    @GetMapping("/test-booking/{testBookingInfoId}/type/{parameterType}")
    public ResponseEntity<List<TestResult>> getResultsByType(
            @PathVariable Integer testBookingInfoId, 
            @PathVariable String parameterType) {
        try {
            List<TestResult> results = testResultService.getResultsByTypeAndTestBooking(testBookingInfoId, parameterType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Lấy kết quả hormone cho phân tích chu kỳ
     */
    @GetMapping("/test-booking/{testBookingInfoId}/hormone-analysis")
    public ResponseEntity<List<TestResult>> getHormoneResultsForCycleAnalysis(@PathVariable Integer testBookingInfoId) {
        try {
            List<TestResult> results = testResultService.getHormoneResultsForCycleAnalysis(testBookingInfoId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Tạo kết quả xét nghiệm mới
     */
    @PostMapping
    public ResponseEntity<TestResult> createTestResult(@RequestBody TestResult testResult) {
        try {
            TestResult created = testResultService.createTestResult(testResult);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Tạo kết quả xét nghiệm kèm summary (cho frontend staff interface)
     */
    @PostMapping("/with-summary")
    public ResponseEntity<String> createTestResultWithSummary(@RequestBody TestResultWithSummaryRequest request) {
        try {
            System.out.println("API: Creating test result with summary for testBookingInfoId: " + request.getTestBookingInfoId());
            
            // Tạo test result chi tiết
            TestResult testResult = new TestResult();
            testResult.setTestBookingInfoId(request.getTestBookingInfoId());
            
            // Xử lý parameterId (có thể là Integer hoặc String)
            Integer parameterId = null;
            if (request.getParameterId() instanceof Integer) {
                parameterId = (Integer) request.getParameterId();
            } else if (request.getParameterId() instanceof String) {
                try {
                    parameterId = Integer.parseInt((String) request.getParameterId());
                } catch (NumberFormatException e) {
                    // Nếu không parse được thành Integer, có thể để null hoặc xử lý khác
                    System.out.println("API: Cannot parse parameterId as Integer: " + request.getParameterId());
                    parameterId = 0; // Hoặc giá trị mặc định
                }
            }
            testResult.setParameterId(parameterId);
            
            testResult.setResultValue(request.getResultValue());
            testResult.setNote(request.getNote());
            testResult.setStatus(request.getStatus());
            
            TestResult created = testResultService.createTestResult(testResult);
            System.out.println("API: Created test result with ID: " + created.getResultId());
            
            // Tạo hoặc cập nhật summary nếu có thông tin summary
            if (request.getOverallResult() != null || request.getOverallStatus() != null) {
                try {
                    testResultSummaryService.createOrUpdateSummary(
                        request.getTestBookingInfoId(),
                        request.getOverallResult(),
                        request.getOverallStatus(),
                        request.getOverallNote()
                    );
                    System.out.println("API: Created/updated summary for testBookingInfoId: " + request.getTestBookingInfoId());
                } catch (Exception summaryError) {
                    System.err.println("API: Error creating summary: " + summaryError.getMessage());
                    // Không fail toàn bộ request nếu summary lỗi
                }
            }
            
            return ResponseEntity.ok("Test result with summary created successfully");
        } catch (Exception e) {
            System.err.println("API: Error creating test result with summary: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating test result: " + e.getMessage());
        }
    }
    
    /**
     * Cập nhật kết quả xét nghiệm
     */
    @PutMapping("/{resultId}")
    public ResponseEntity<TestResult> updateTestResult(
            @PathVariable Integer resultId, 
            @RequestBody TestResult testResult) {
        try {
            TestResult updated = testResultService.updateTestResult(resultId, testResult);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Xóa kết quả xét nghiệm
     */
    @DeleteMapping("/{resultId}")
    public ResponseEntity<String> deleteTestResult(@PathVariable Integer resultId) {
        try {
            boolean deleted = testResultService.deleteTestResult(resultId);
            if (deleted) {
                return ResponseEntity.ok("Test result deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting test result: " + e.getMessage());
        }
    }
    
    /**
     * Tạo template kết quả từ thông số dịch vụ
     */
    @PostMapping("/test-booking/{testBookingInfoId}/create-template")
    public ResponseEntity<String> createResultsTemplate(
            @PathVariable Integer testBookingInfoId,
            @RequestParam Integer serviceId) {
        try {
            testResultService.createResultsFromServiceTemplate(testBookingInfoId, serviceId);
            return ResponseEntity.ok("Results template created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating results template: " + e.getMessage());
        }
    }
    
    /**
     * Cập nhật nhiều kết quả cùng lúc
     */
    @PutMapping("/batch-update")
    public ResponseEntity<String> updateMultipleResults(@RequestBody List<TestResult> testResults) {
        try {
            testResultService.updateMultipleResults(testResults);
            return ResponseEntity.ok("Test results updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating test results: " + e.getMessage());
        }
    }
    
    /**
     * Lấy các kết quả bất thường
     */
    @GetMapping("/test-booking/{testBookingInfoId}/abnormal")
    public ResponseEntity<List<TestResult>> getAbnormalResults(@PathVariable Integer testBookingInfoId) {
        try {
            List<TestResult> abnormalResults = testResultService.getAbnormalResults(testBookingInfoId);
            return ResponseEntity.ok(abnormalResults);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Phân tích kết quả hormone cho chu kỳ kinh nguyệt
     */
    @GetMapping("/test-booking/{testBookingInfoId}/hormone-cycle-analysis")
    public ResponseEntity<String> analyzeHormoneResultsForCycle(@PathVariable Integer testBookingInfoId) {
        try {
            String analysis = testResultService.analyzeHormoneResultsForCycle(testBookingInfoId);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Tạo báo cáo tổng hợp cho xét nghiệm liên quan chu kỳ
     */
    @GetMapping("/test-booking/{testBookingInfoId}/cycle-fertility-report")
    public ResponseEntity<String> generateCycleFertilityReport(@PathVariable Integer testBookingInfoId) {
        try {
            String report = testResultService.generateCycleFertilityReport(testBookingInfoId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
