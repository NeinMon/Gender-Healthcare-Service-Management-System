package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.ServiceTestParameter;
import com.genderhealthcare.demo.repository.ServiceTestParameterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service xử lý logic nghiệp vụ cho quản lý thông số xét nghiệm
 * Đặc biệt hỗ trợ các xét nghiệm liên quan đến theo dõi chu kỳ kinh nguyệt
 */
@Service
@Transactional
public class ServiceTestParameterService {
    
    @Autowired
    private ServiceTestParameterRepository parameterRepository;
    
    /**
     * Tạo thông số xét nghiệm mới
     */
    public ServiceTestParameter createParameter(ServiceTestParameter parameter) {
        return parameterRepository.save(parameter);
    }
    
    /**
     * Lấy tất cả thông số xét nghiệm của một dịch vụ
     */
    public List<ServiceTestParameter> getParametersByServiceId(Integer serviceId) {
        return parameterRepository.findByServiceIdOrderByDisplayOrder(serviceId);
    }
    
    /**
     * Lấy thông số xét nghiệm theo loại
     */
    public List<ServiceTestParameter> getParametersByServiceIdAndType(Integer serviceId, String parameterType) {
        return parameterRepository.findByServiceIdAndParameterTypeOrderByDisplayOrder(serviceId, parameterType);
    }
    
    /**
     * Lấy thông số xét nghiệm theo ID
     */
    public ServiceTestParameter getParameterById(Integer parameterId) {
        return parameterRepository.findById(parameterId).orElse(null);
    }
    
    /**
     * Cập nhật thông số xét nghiệm
     */
    public ServiceTestParameter updateParameter(Integer parameterId, ServiceTestParameter updatedParameter) {
        ServiceTestParameter existingParameter = parameterRepository.findById(parameterId).orElse(null);
        if (existingParameter != null) {
            existingParameter.setParameterName(updatedParameter.getParameterName());
            existingParameter.setUnit(updatedParameter.getUnit());
            existingParameter.setReferenceRange(updatedParameter.getReferenceRange());
            existingParameter.setDescription(updatedParameter.getDescription());
            existingParameter.setIsRequired(updatedParameter.getIsRequired());
            existingParameter.setDisplayOrder(updatedParameter.getDisplayOrder());
            existingParameter.setParameterType(updatedParameter.getParameterType());
            return parameterRepository.save(existingParameter);
        }
        return null;
    }
    
    /**
     * Xóa thông số xét nghiệm
     */
    public boolean deleteParameter(Integer parameterId) {
        if (parameterRepository.existsById(parameterId)) {
            parameterRepository.deleteById(parameterId);
            return true;
        }
        return false;
    }
    
    /**
     * Tạo template thông số cho xét nghiệm nội tiết tố (từ PeriodTracking)
     */
    public void createHormoneTestParameters(Integer serviceId) {
        // FSH
        createHormoneParameter(serviceId, "FSH", "mIU/mL", "3.5-12.5", 
            "Hormone kích thích nang trứng - đánh giá chức năng buồng trứng", 1);
        
        // LH
        createHormoneParameter(serviceId, "LH", "mIU/mL", "2.4-12.6", 
            "Hormone luteinizing - đánh giá rụng trứng và chu kỳ", 2);
        
        // Estradiol
        createHormoneParameter(serviceId, "Estradiol (E2)", "pg/mL", "30-400", 
            "Hormone estrogen chính - đánh giá chức năng buồng trứng", 3);
        
        // Progesterone
        createHormoneParameter(serviceId, "Progesterone", "ng/mL", "0.1-25", 
            "Hormone duy trì thai kỳ - đánh giá pha hoàng thể", 4);
        
        // Prolactin
        createHormoneParameter(serviceId, "Prolactin", "ng/mL", "4.8-23.3", 
            "Hormone prolactin - có thể ảnh hưởng đến chu kỳ kinh nguyệt", 5);
        
        // TSH
        createHormoneParameter(serviceId, "TSH", "mIU/L", "0.27-4.2", 
            "Hormone kích thích tuyến giáp - ảnh hưởng đến chu kỳ", 6);
        
        // AMH
        createHormoneParameter(serviceId, "AMH", "ng/mL", "1.0-4.0", 
            "Hormone kháng mullerian - đánh giá dự trữ buồng trứng", 7);
    }
    
    /**
     * Tạo template thông số cho xét nghiệm máu (từ PeriodTracking)
     */
    public void createBloodTestParameters(Integer serviceId) {
        // Hồng cầu
        createBloodParameter(serviceId, "Red Blood Cell (RBC)", "million cells/μL", "4.2-5.4", 
            "Số lượng hồng cầu - đánh giá thiếu máu", 1);
        
        // Hemoglobin
        createBloodParameter(serviceId, "Hemoglobin (Hb)", "g/dL", "12.0-15.5", 
            "Lượng hemoglobin - chỉ số quan trọng về thiếu máu", 2);
        
        // Hematocrit
        createBloodParameter(serviceId, "Hematocrit (Hct)", "%", "36-46", 
            "Tỷ lệ thể tích hồng cầu trong máu", 3);
        
        // Bạch cầu
        createBloodParameter(serviceId, "White Blood Cell (WBC)", "cells/μL", "4500-11000", 
            "Số lượng bạch cầu - đánh giá tình trạng nhiễm trùng", 4);
        
        // Tiểu cầu
        createBloodParameter(serviceId, "Platelet Count", "cells/μL", "150000-450000", 
            "Số lượng tiểu cầu - đánh giá khả năng đông máu", 5);
    }
    
    /**
     * Tạo template thông số cho siêu âm tử cung và buồng trứng
     */
    public void createUltrasoundParameters(Integer serviceId) {
        // Cấu trúc tử cung
        createUltrasoundParameter(serviceId, "Cấu trúc tử cung", "", "Bình thường", 
            "Đánh giá hình thái, kích thước và cấu trúc tử cung", 1);
        
        // Nội mạc tử cung
        createUltrasoundParameter(serviceId, "Độ dày nội mạc tử cung", "mm", "5-15", 
            "Đánh giá độ dày nội mạc tử cung theo chu kỳ", 2);
        
        // Buồng trứng phải
        createUltrasoundParameter(serviceId, "Buồng trứng phải", "cm", "2-5", 
            "Đánh giá kích thước và cấu trúc buồng trứng phải", 3);
        
        // Buồng trứng trái
        createUltrasoundParameter(serviceId, "Buồng trứng trái", "cm", "2-5", 
            "Đánh giá kích thước và cấu trúc buồng trứng trái", 4);
        
        // Phát hiện u xơ
        createUltrasoundParameter(serviceId, "U xơ tử cung", "", "Không phát hiện", 
            "Tìm kiếm các khối u xơ trong tử cung", 5);
        
        // Phát hiện polyp
        createUltrasoundParameter(serviceId, "Polyp nội mạc tử cung", "", "Không phát hiện", 
            "Tìm kiếm các polyp trong lòng tử cung", 6);
        
        // Phát hiện nang buồng trứng
        createUltrasoundParameter(serviceId, "Nang buồng trứng", "", "Không phát hiện", 
            "Tìm kiếm các nang trong buồng trứng", 7);
        
        // Dị dạng
        createUltrasoundParameter(serviceId, "Dị dạng cấu trúc", "", "Không phát hiện", 
            "Tìm kiếm các dị dạng bẩm sinh hoặc mắc phải", 8);
    }
    
    // Helper methods để tạo thông số
    private void createHormoneParameter(Integer serviceId, String name, String unit, String range, String desc, int order) {
        ServiceTestParameter param = new ServiceTestParameter();
        param.setServiceId(serviceId);
        param.setParameterName(name);
        param.setUnit(unit);
        param.setReferenceRange(range);
        param.setDescription(desc);
        param.setParameterType("HORMONE");
        param.setIsRequired(true);
        param.setDisplayOrder(order);
        parameterRepository.save(param);
    }
    
    private void createBloodParameter(Integer serviceId, String name, String unit, String range, String desc, int order) {
        ServiceTestParameter param = new ServiceTestParameter();
        param.setServiceId(serviceId);
        param.setParameterName(name);
        param.setUnit(unit);
        param.setReferenceRange(range);
        param.setDescription(desc);
        param.setParameterType("BLOOD");
        param.setIsRequired(true);
        param.setDisplayOrder(order);
        parameterRepository.save(param);
    }
    
    private void createUltrasoundParameter(Integer serviceId, String name, String unit, String range, String desc, int order) {
        ServiceTestParameter param = new ServiceTestParameter();
        param.setServiceId(serviceId);
        param.setParameterName(name);
        param.setUnit(unit);
        param.setReferenceRange(range);
        param.setDescription(desc);
        param.setParameterType("ULTRASOUND");
        param.setIsRequired(true);
        param.setDisplayOrder(order);
        parameterRepository.save(param);
    }
    
    /**
     * Tạo thông số mẫu dựa trên loại dịch vụ
     */
    public void createParametersForCycleFertilityService(Integer serviceId, String serviceType) {
        switch (serviceType.toLowerCase()) {
            case "hormone":
            case "nội tiết tố":
                createHormoneTestParameters(serviceId);
                break;
            case "blood":
            case "máu":
            case "công thức máu":
                createBloodTestParameters(serviceId);
                break;
            case "ultrasound":
            case "siêu âm":
                createUltrasoundParameters(serviceId);
                break;
            default:
                // Tạo một số thông số cơ bản
                break;
        }
    }
}
