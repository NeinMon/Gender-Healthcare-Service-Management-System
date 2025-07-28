package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service xử lý logic nghiệp vụ cho quản lý dịch vụ tư vấn
 * Quản lý các loại dịch vụ tư vấn sức khỏe phụ nữ trong hệ thống
 * Xử lý CRUD operations cho service catalog
 */
@Service
public class ServiceService {
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    // Create a new service
    public com.genderhealthcare.demo.entity.Service createService(com.genderhealthcare.demo.entity.Service service) {
        return serviceRepository.save(service);
    }
    
    // Get all services
    public List<com.genderhealthcare.demo.entity.Service> getAllServices() {
        return serviceRepository.findAll();
    }
    
    // Get service by ID
    public com.genderhealthcare.demo.entity.Service getServiceById(Integer serviceId) {
        Optional<com.genderhealthcare.demo.entity.Service> service = serviceRepository.findById(serviceId);
        return service.orElse(null);
    }
    
    // Update service
    public com.genderhealthcare.demo.entity.Service updateService(Integer serviceId, com.genderhealthcare.demo.entity.Service serviceDetails) {
        Optional<com.genderhealthcare.demo.entity.Service> existingServiceOpt = serviceRepository.findById(serviceId);
        
        if (existingServiceOpt.isPresent()) {
            com.genderhealthcare.demo.entity.Service existingService = existingServiceOpt.get();
            
            // Update fields
            if (serviceDetails.getServiceName() != null) {
                existingService.setServiceName(serviceDetails.getServiceName());
            }
            if (serviceDetails.getDescription() != null) {
                existingService.setDescription(serviceDetails.getDescription());
            }
            if (serviceDetails.getManagerId() != null && serviceDetails.getManagerId() != 0) {
                existingService.setManagerId(serviceDetails.getManagerId());
            }
            if (serviceDetails.getPrice() != null) {
                existingService.setPrice(serviceDetails.getPrice());
            }
            
            return serviceRepository.save(existingService);
        }
        
        return null;
    }
    
    // Delete service
    public boolean deleteService(Integer serviceId) {
        if (serviceRepository.existsById(serviceId)) {
            serviceRepository.deleteById(serviceId);
            return true;
        }
        return false;
    }
    
    // Get services by manager ID
    public List<com.genderhealthcare.demo.entity.Service> getServicesByManagerId(Integer managerId) {
        return serviceRepository.findByManagerId(managerId);
    }
    
    // Search services by name
    public List<com.genderhealthcare.demo.entity.Service> searchServicesByName(String serviceName) {
        return serviceRepository.findByServiceNameContainingIgnoreCase(serviceName);
    }

    // Lấy service theo tên (chính xác)
    public com.genderhealthcare.demo.entity.Service getServiceByName(String serviceName) {
        return serviceRepository.findByServiceName(serviceName);
    }
}
