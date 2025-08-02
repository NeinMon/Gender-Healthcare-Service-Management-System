package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.ServiceTestParameter;
import com.genderhealthcare.demo.service.ServiceTestParameterService;
import com.genderhealthcare.demo.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API Controller cho quản lý thông số xét nghiệm của dịch vụ
 * Đặc biệt hỗ trợ các xét nghiệm liên quan đến chu kỳ kinh nguyệt
 */
@RestController
@RequestMapping("/api/service-test-parameters")
@CrossOrigin(origins = "*")
public class ServiceTestParameterAPI {
    
    @Autowired
    private ServiceTestParameterService parameterService;
    
    @Autowired
    private ServiceService serviceService;
    
    /**
     * Lấy tất cả thông số xét nghiệm của một dịch vụ
     */
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<ServiceTestParameter>> getParametersByServiceId(@PathVariable Integer serviceId) {
        try {
            List<ServiceTestParameter> parameters = parameterService.getParametersByServiceId(serviceId);
            return ResponseEntity.ok(parameters);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Lấy thông số theo loại (HORMONE, BLOOD, ULTRASOUND)
     */
    @GetMapping("/service/{serviceId}/type/{parameterType}")
    public ResponseEntity<List<ServiceTestParameter>> getParametersByServiceIdAndType(
            @PathVariable Integer serviceId, 
            @PathVariable String parameterType) {
        try {
            List<ServiceTestParameter> parameters = parameterService.getParametersByServiceIdAndType(serviceId, parameterType);
            return ResponseEntity.ok(parameters);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Tạo thông số xét nghiệm mới
     */
    @PostMapping
    public ResponseEntity<ServiceTestParameter> createParameter(@RequestBody ServiceTestParameter parameter) {
        try {
            ServiceTestParameter created = parameterService.createParameter(parameter);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Cập nhật thông số xét nghiệm
     */
    @PutMapping("/{parameterId}")
    public ResponseEntity<ServiceTestParameter> updateParameter(
            @PathVariable Integer parameterId, 
            @RequestBody ServiceTestParameter parameter) {
        try {
            ServiceTestParameter updated = parameterService.updateParameter(parameterId, parameter);
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
     * Xóa thông số xét nghiệm
     */
    @DeleteMapping("/{parameterId}")
    public ResponseEntity<String> deleteParameter(@PathVariable Integer parameterId) {
        try {
            boolean deleted = parameterService.deleteParameter(parameterId);
            if (deleted) {
                return ResponseEntity.ok("Parameter deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting parameter: " + e.getMessage());
        }
    }
    
    /**
     * Tạo template thông số cho xét nghiệm nội tiết tố
     */
    @PostMapping("/service/{serviceId}/hormone-template")
    public ResponseEntity<String> createHormoneTemplate(@PathVariable Integer serviceId) {
        try {
            parameterService.createHormoneTestParameters(serviceId);
            return ResponseEntity.ok("Hormone test parameters created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating hormone parameters: " + e.getMessage());
        }
    }
    
    /**
     * Tạo template thông số cho xét nghiệm máu
     */
    @PostMapping("/service/{serviceId}/blood-template")
    public ResponseEntity<String> createBloodTemplate(@PathVariable Integer serviceId) {
        try {
            parameterService.createBloodTestParameters(serviceId);
            return ResponseEntity.ok("Blood test parameters created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating blood parameters: " + e.getMessage());
        }
    }
    
    /**
     * Tạo template thông số cho siêu âm
     */
    @PostMapping("/service/{serviceId}/ultrasound-template")
    public ResponseEntity<String> createUltrasoundTemplate(@PathVariable Integer serviceId) {
        try {
            parameterService.createUltrasoundParameters(serviceId);
            return ResponseEntity.ok("Ultrasound parameters created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating ultrasound parameters: " + e.getMessage());
        }
    }
    
    /**
     * Tạo template dựa trên loại dịch vụ từ PeriodTracking
     */
    @PostMapping("/service/{serviceId}/cycle-fertility-template")
    public ResponseEntity<String> createCycleFertilityTemplate(
            @PathVariable Integer serviceId,
            @RequestParam String serviceType) {
        try {
            parameterService.createParametersForCycleFertilityService(serviceId, serviceType);
            return ResponseEntity.ok("Cycle fertility parameters created successfully for service type: " + serviceType);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating parameters: " + e.getMessage());
        }
    }
    
    /**
     * Lấy thông số xét nghiệm theo ID
     */
    @GetMapping("/{parameterId}")
    public ResponseEntity<ServiceTestParameter> getParameterById(@PathVariable Integer parameterId) {
        try {
            ServiceTestParameter parameter = parameterService.getParameterById(parameterId);
            if (parameter != null) {
                return ResponseEntity.ok(parameter);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
