package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.TestResult;
import com.genderhealthcare.demo.entity.ServiceTestParameter;
import com.genderhealthcare.demo.repository.TestResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Arrays;

/**
 * Service xử lý logic nghiệp vụ cho kết quả xét nghiệm
 * Đặc biệt hỗ trợ phân tích kết quả liên quan đến chu kỳ kinh nguyệt
 */
@Service
@Transactional
public class TestResultService {
    
    @Autowired
    private TestResultRepository testResultRepository;
    
    @Autowired
    private ServiceTestParameterService parameterService;
    
    /**
     * Tạo kết quả xét nghiệm mới với tự động tính toán status
     */
    public TestResult createTestResult(TestResult testResult) {
        // Lấy thông tin parameter để tự động tính toán status
        ServiceTestParameter parameter = parameterService.getParameterById(testResult.getParameterId());
        if (parameter != null) {
            testResult.calculateStatus(parameter.getReferenceRange(), parameter.getParameterType());
        }
        return testResultRepository.save(testResult);
    }
    
    /**
     * Lấy tất cả kết quả xét nghiệm của một test booking
     */
    public List<TestResult> getResultsByTestBookingInfoId(Integer testBookingInfoId) {
        try {
            System.out.println("TestResultService: Searching for results with testBookingInfoId: " + testBookingInfoId);
            List<TestResult> results = testResultRepository.findByTestBookingInfoId(testBookingInfoId);
            System.out.println("TestResultService: Repository returned " + results.size() + " results");
            
            // Log chi tiết để debug
            for (TestResult result : results) {
                System.out.println("Service - Result ID: " + result.getResultId() + 
                                 ", TestBookingInfoId: " + result.getTestBookingInfoId() + 
                                 ", ParameterId: " + result.getParameterId());
            }
            
            return results;
        } catch (Exception e) {
            System.err.println("TestResultService: Error getting results for testBookingInfoId " + testBookingInfoId);
            System.err.println("Service error message: " + e.getMessage());
            System.err.println("Service error class: " + e.getClass().getName());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Lấy kết quả theo loại thông số (HORMONE, BLOOD, ULTRASOUND)
     */
    public List<TestResult> getResultsByTypeAndTestBooking(Integer testBookingInfoId, String parameterType) {
        return testResultRepository.findByTestBookingInfoIdAndParameterType(testBookingInfoId, parameterType);
    }
    
    /**
     * Lấy kết quả hormone cho phân tích chu kỳ
     */
    public List<TestResult> getHormoneResultsForCycleAnalysis(Integer testBookingInfoId) {
        return testResultRepository.findHormoneResultsForCycleAnalysis(testBookingInfoId);
    }
    
    /**
     * Cập nhật kết quả xét nghiệm
     */
    public TestResult updateTestResult(Integer resultId, TestResult updatedResult) {
        TestResult existingResult = testResultRepository.findById(resultId).orElse(null);
        if (existingResult != null) {
            existingResult.setResultValue(updatedResult.getResultValue());
            existingResult.setNote(updatedResult.getNote());
            
            // Tự động tính toán status
            ServiceTestParameter parameter = parameterService.getParameterById(existingResult.getParameterId());
            if (parameter != null) {
                existingResult.calculateStatus(parameter.getReferenceRange(), parameter.getParameterType());
            }
            
            return testResultRepository.save(existingResult);
        }
        return null;
    }
    
    /**
     * Lấy các kết quả bất thường
     */
    public List<TestResult> getAbnormalResults(Integer testBookingInfoId) {
        List<String> abnormalStatuses = Arrays.asList("High", "Low", "Critical", "Abnormal");
        return testResultRepository.findByTestBookingInfoIdAndStatusIn(testBookingInfoId, abnormalStatuses);
    }
    
    /**
     * Tạo template kết quả từ thông số dịch vụ
     */
    public void createResultsFromServiceTemplate(Integer testBookingInfoId, Integer serviceId) {
        List<ServiceTestParameter> parameters = parameterService.getParametersByServiceId(serviceId);
        
        for (ServiceTestParameter parameter : parameters) {
            // Kiểm tra xem đã có kết quả cho parameter này chưa
            TestResult existingResult = testResultRepository.findByTestBookingInfoIdAndParameterId(
                testBookingInfoId, parameter.getParameterId());
            
            if (existingResult == null) {
                TestResult testResult = new TestResult();
                testResult.setTestBookingInfoId(testBookingInfoId);
                testResult.setParameterId(parameter.getParameterId());
                testResult.setResultValue(""); // Để trống cho staff nhập
                testResult.setStatus("Pending");
                testResult.setNote("");
                
                testResultRepository.save(testResult);
            }
        }
    }
    
    /**
     * Phân tích kết quả hormone để đưa ra khuyến nghị về chu kỳ
     */
    public String analyzeHormoneResultsForCycle(Integer testBookingInfoId) {
        List<TestResult> hormoneResults = getHormoneResultsForCycleAnalysis(testBookingInfoId);
        
        if (hormoneResults.isEmpty()) {
            return "Chưa có kết quả hormone để phân tích.";
        }
        
        StringBuilder analysis = new StringBuilder();
        analysis.append("Phân tích kết quả hormone liên quan đến chu kỳ kinh nguyệt:\n\n");
        
        for (TestResult result : hormoneResults) {
            ServiceTestParameter parameter = parameterService.getParameterById(result.getParameterId());
            if (parameter != null) {
                analysis.append(String.format("- %s: %s %s (%s)\n", 
                    parameter.getParameterName(), 
                    result.getResultValue(), 
                    parameter.getUnit() != null ? parameter.getUnit() : "",
                    result.getStatus()));
                
                // Thêm khuyến nghị dựa trên kết quả
                if ("High".equals(result.getStatus()) && parameter.getParameterName().contains("FSH")) {
                    analysis.append("  → FSH cao có thể chỉ ra suy giảm chức năng buồng trứng\n");
                } else if ("Low".equals(result.getStatus()) && parameter.getParameterName().contains("Estradiol")) {
                    analysis.append("  → Estradiol thấp có thể ảnh hưởng đến chu kỳ kinh nguyệt\n");
                } else if ("High".equals(result.getStatus()) && parameter.getParameterName().contains("Prolactin")) {
                    analysis.append("  → Prolactin cao có thể gây rối loạn chu kỳ kinh nguyệt\n");
                }
            }
        }
        
        return analysis.toString();
    }
    
    /**
     * Tạo báo cáo tổng hợp cho staff
     */
    public String generateCycleFertilityReport(Integer testBookingInfoId) {
        StringBuilder report = new StringBuilder();
        
        // Phân tích hormone
        List<TestResult> hormoneResults = getResultsByTypeAndTestBooking(testBookingInfoId, "HORMONE");
        if (!hormoneResults.isEmpty()) {
            report.append("=== KẾT QUẢ XÉT NGHIỆM NỘI TIẾT TỐ ===\n");
            for (TestResult result : hormoneResults) {
                ServiceTestParameter param = parameterService.getParameterById(result.getParameterId());
                if (param != null) {
                    report.append(String.format("%s: %s %s [%s] - %s\n",
                        param.getParameterName(),
                        result.getResultValue(),
                        param.getUnit() != null ? param.getUnit() : "",
                        param.getReferenceRange(),
                        result.getStatus()));
                }
            }
            report.append("\n");
        }
        
        // Phân tích máu
        List<TestResult> bloodResults = getResultsByTypeAndTestBooking(testBookingInfoId, "BLOOD");
        if (!bloodResults.isEmpty()) {
            report.append("=== KẾT QUẢ XÉT NGHIỆM MÁU ===\n");
            for (TestResult result : bloodResults) {
                ServiceTestParameter param = parameterService.getParameterById(result.getParameterId());
                if (param != null) {
                    report.append(String.format("%s: %s %s [%s] - %s\n",
                        param.getParameterName(),
                        result.getResultValue(),
                        param.getUnit() != null ? param.getUnit() : "",
                        param.getReferenceRange(),
                        result.getStatus()));
                }
            }
            report.append("\n");
        }
        
        // Phân tích siêu âm
        List<TestResult> ultrasoundResults = getResultsByTypeAndTestBooking(testBookingInfoId, "ULTRASOUND");
        if (!ultrasoundResults.isEmpty()) {
            report.append("=== KẾT QUẢ SIÊU ÂM TỬ CUNG VÀ BUỒNG TRỨNG ===\n");
            for (TestResult result : ultrasoundResults) {
                ServiceTestParameter param = parameterService.getParameterById(result.getParameterId());
                if (param != null) {
                    report.append(String.format("%s: %s - %s\n",
                        param.getParameterName(),
                        result.getResultValue(),
                        result.getStatus()));
                    if (result.getNote() != null && !result.getNote().trim().isEmpty()) {
                        report.append(String.format("  Ghi chú: %s\n", result.getNote()));
                    }
                }
            }
            report.append("\n");
        }
        
        // Tổng kết
        long abnormalCount = testResultRepository.countAbnormalResults(testBookingInfoId);
        if (abnormalCount > 0) {
            report.append("=== TỔNG KẾT ===\n");
            report.append(String.format("Phát hiện %d chỉ số bất thường cần theo dõi.\n", abnormalCount));
            report.append("Khuyến nghị tham khảo ý kiến bác sĩ chuyên khoa để được tư vấn chi tiết.\n");
        } else {
            report.append("=== TỔNG KẾT ===\n");
            report.append("Tất cả các chỉ số đều trong giới hạn bình thường.\n");
        }
        
        return report.toString();
    }
    
    /**
     * Xóa kết quả xét nghiệm
     */
    public boolean deleteTestResult(Integer resultId) {
        if (testResultRepository.existsById(resultId)) {
            testResultRepository.deleteById(resultId);
            return true;
        }
        return false;
    }
    
    /**
     * Cập nhật nhiều kết quả cùng lúc
     */
    public void updateMultipleResults(List<TestResult> testResults) {
        for (TestResult result : testResults) {
            if (result.getResultId() != null) {
                updateTestResult(result.getResultId(), result);
            } else {
                createTestResult(result);
            }
        }
    }
}
