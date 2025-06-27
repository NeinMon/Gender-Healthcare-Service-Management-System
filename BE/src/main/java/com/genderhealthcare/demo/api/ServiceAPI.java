package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.Service;
import com.genderhealthcare.demo.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RequestMapping("/api/services")
@Validated
public class ServiceAPI {
    
    @Autowired
    private ServiceService serviceService;
    
    // CREATE - Tạo service mới
    @PostMapping
    public ResponseEntity<?> createService(@Valid @RequestBody Service service) {
        try {
            Service createdService = serviceService.createService(service);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdService);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error creating service: " + e.getMessage());
        }
    }
    
    // READ - Lấy tất cả services
    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        List<Service> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }
    
    // READ - Lấy service theo ID
    @GetMapping("/{serviceId}")
    public ResponseEntity<?> getServiceById(@PathVariable("serviceId") Integer serviceId) {
        Service service = serviceService.getServiceById(serviceId);
        if (service != null) {
            return ResponseEntity.ok(service);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Service not found with ID: " + serviceId);
        }
    }
    
    // READ - Lấy services theo manager ID
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<Service>> getServicesByManagerId(@PathVariable("managerId") Integer managerId) {
        List<Service> services = serviceService.getServicesByManagerId(managerId);
        return ResponseEntity.ok(services);
    }
    
    // READ - Tìm kiếm services theo tên
    @GetMapping("/search")
    public ResponseEntity<List<Service>> searchServicesByName(@RequestParam("name") String serviceName) {
        List<Service> services = serviceService.searchServicesByName(serviceName);
        return ResponseEntity.ok(services);
    }
    
    // UPDATE - Cập nhật service
    @PutMapping("/{serviceId}")
    public ResponseEntity<?> updateService(
            @PathVariable("serviceId") Integer serviceId,
            @Valid @RequestBody Service serviceDetails) {
        
        Service updatedService = serviceService.updateService(serviceId, serviceDetails);
        if (updatedService != null) {
            return ResponseEntity.ok(updatedService);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Service not found with ID: " + serviceId);
        }
    }
    
    // DELETE - Xóa service
    @DeleteMapping("/{serviceId}")
    public ResponseEntity<?> deleteService(@PathVariable("serviceId") Integer serviceId) {
        boolean isDeleted = serviceService.deleteService(serviceId);
        if (isDeleted) {
            return ResponseEntity.ok("Service deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Service not found with ID: " + serviceId);
        }
    }
}
