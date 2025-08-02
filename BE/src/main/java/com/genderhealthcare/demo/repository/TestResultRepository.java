package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Integer> {
    
    /**
     * Lấy tất cả kết quả xét nghiệm của một test booking
     */
    List<TestResult> findByTestBookingInfoId(Integer testBookingInfoId);
    
    /**
     * Lấy kết quả xét nghiệm theo test booking và parameter
     */
    TestResult findByTestBookingInfoIdAndParameterId(Integer testBookingInfoId, Integer parameterId);
    
    /**
     * Lấy các kết quả bất thường (High, Low, Critical, Abnormal)
     */
    List<TestResult> findByTestBookingInfoIdAndStatusIn(Integer testBookingInfoId, List<String> statuses);
    
    /**
     * Đếm số lượng kết quả bất thường
     */
    @Query("SELECT COUNT(tr) FROM TestResult tr WHERE tr.testBookingInfoId = :testBookingInfoId AND tr.status IN ('High', 'Low', 'Critical', 'Abnormal')")
    long countAbnormalResults(@Param("testBookingInfoId") Integer testBookingInfoId);
    
    /**
     * Kiểm tra test booking đã có đầy đủ kết quả chưa
     */
    @Query("SELECT COUNT(tr) FROM TestResult tr WHERE tr.testBookingInfoId = :testBookingInfoId AND (tr.resultValue IS NOT NULL AND tr.resultValue != '')")
    long countCompletedResults(@Param("testBookingInfoId") Integer testBookingInfoId);
    
    /**
     * Lấy kết quả theo loại thông số (HORMONE, BLOOD, ULTRASOUND)
     */
    @Query("SELECT tr FROM TestResult tr JOIN ServiceTestParameter p ON tr.parameterId = p.parameterId WHERE tr.testBookingInfoId = :testBookingInfoId AND p.parameterType = :parameterType ORDER BY p.displayOrder")
    List<TestResult> findByTestBookingInfoIdAndParameterType(@Param("testBookingInfoId") Integer testBookingInfoId, @Param("parameterType") String parameterType);
    
    /**
     * Xóa tất cả kết quả của một test booking
     */
    void deleteByTestBookingInfoId(Integer testBookingInfoId);
    
    /**
     * Lấy kết quả hormone cho phân tích chu kỳ kinh nguyệt
     */
    @Query("SELECT tr FROM TestResult tr JOIN ServiceTestParameter p ON tr.parameterId = p.parameterId WHERE tr.testBookingInfoId = :testBookingInfoId AND p.parameterType = 'HORMONE' AND p.parameterName IN ('FSH', 'LH', 'Estradiol', 'Progesterone') ORDER BY p.displayOrder")
    List<TestResult> findHormoneResultsForCycleAnalysis(@Param("testBookingInfoId") Integer testBookingInfoId);
}
