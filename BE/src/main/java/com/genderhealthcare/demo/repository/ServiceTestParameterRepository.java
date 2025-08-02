package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.ServiceTestParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceTestParameterRepository extends JpaRepository<ServiceTestParameter, Integer> {
    
    /**
     * Lấy tất cả thông số xét nghiệm của một dịch vụ theo thứ tự hiển thị
     */
    List<ServiceTestParameter> findByServiceIdOrderByDisplayOrder(Integer serviceId);
    
    /**
     * Lấy thông số xét nghiệm theo tên và serviceId
     */
    ServiceTestParameter findByServiceIdAndParameterName(Integer serviceId, String parameterName);
    
    /**
     * Lấy các thông số bắt buộc của một dịch vụ
     */
    List<ServiceTestParameter> findByServiceIdAndIsRequiredTrue(Integer serviceId);
    
    /**
     * Lấy thông số theo loại (HORMONE, BLOOD, ULTRASOUND)
     */
    List<ServiceTestParameter> findByServiceIdAndParameterTypeOrderByDisplayOrder(Integer serviceId, String parameterType);
    
    /**
     * Kiểm tra dịch vụ có thông số xét nghiệm nào không
     */
    boolean existsByServiceId(Integer serviceId);
    
    /**
     * Đếm số lượng thông số của một dịch vụ
     */
    @Query("SELECT COUNT(p) FROM ServiceTestParameter p WHERE p.serviceId = :serviceId")
    long countParametersByServiceId(@Param("serviceId") Integer serviceId);
    
    /**
     * Lấy thông số theo tên service (join với bảng service)
     */
//    List<ServiceTestParameter> findByServiceNameContaining(String serviceName);
}
