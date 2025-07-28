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

/**
 * API Controller xử lý các yêu cầu quản lý dịch vụ tư vấn
 * Quản lý các loại dịch vụ tư vấn sức khỏe phụ nữ (tư vấn cơ bản, chuyên sâu, ...)
 * API này chỉ tiếp nhận request từ frontend và gọi đến service layer
 */
@RestController
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RequestMapping("/api/services")
@Validated
public class ServiceAPI {
    
    @Autowired
    private ServiceService serviceService;
    
    /**
     * API tạo dịch vụ mới
     * Thêm dịch vụ tư vấn sức khỏe mới vào hệ thống
     * 
     * @param service Đối tượng Service cần tạo (đã validate)
     * @return ResponseEntity chứa Service đã tạo hoặc lỗi
     */
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
    
    /**
     * API lấy tất cả dịch vụ trong hệ thống
     * Trả về danh sách tất cả dịch vụ tư vấn sức khỏe
     * 
     * @return ResponseEntity chứa danh sách Service hoặc lỗi
     */
    // READ - Lấy tất cả services
    @GetMapping
    public ResponseEntity<?> getAllServices() {
        try {
            List<Service> services = serviceService.getAllServices();
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy danh sách services: " + e.getMessage());
        }
    }
    
    /**
     * API lấy dịch vụ theo ID
     * Tìm kiếm và trả về thông tin chi tiết của một dịch vụ cụ thể
     * 
     * @param serviceId ID của dịch vụ cần tìm
     * @return ResponseEntity chứa Service hoặc thông báo không tìm thấy
     */
    // READ - Lấy service theo ID
    @GetMapping("/{serviceId}")
    public ResponseEntity<?> getServiceById(@PathVariable("serviceId") Integer serviceId) {
        try {
            Service service = serviceService.getServiceById(serviceId);
            if (service != null) {
                return ResponseEntity.ok(service);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Service not found with ID: " + serviceId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy service: " + e.getMessage());
        }
    }
    
    /**
     * API lấy dịch vụ theo manager ID
     * Lấy danh sách các dịch vụ được quản lý bởi một manager cụ thể
     * 
     * @param managerId ID của manager quản lý dịch vụ
     * @return ResponseEntity chứa danh sách Service hoặc lỗi
     */
    // READ - Lấy services theo manager ID
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<?> getServicesByManagerId(@PathVariable("managerId") Integer managerId) {
        try {
            List<Service> services = serviceService.getServicesByManagerId(managerId);
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi lấy services theo managerId: " + e.getMessage());
        }
    }
    
    /**
     * API tìm kiếm dịch vụ theo tên
     * Search dịch vụ dựa trên tên dịch vụ (có thể partial match)
     * 
     * @param serviceName Tên dịch vụ cần tìm kiếm
     * @return ResponseEntity chứa danh sách Service khớp với tên hoặc lỗi
     */
    // READ - Tìm kiếm services theo tên
    @GetMapping("/search")
    public ResponseEntity<?> searchServicesByName(@RequestParam("name") String serviceName) {
        try {
            List<Service> services = serviceService.searchServicesByName(serviceName);
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi tìm kiếm services: " + e.getMessage());
        }
    }
    
    /**
     * API cập nhật thông tin dịch vụ
     * Cập nhật thông tin dịch vụ tư vấn đã tồn tại (tên, mô tả, giá, ...)
     * 
     * @param serviceId ID của dịch vụ cần cập nhật
     * @param serviceDetails Đối tượng Service chứa thông tin mới (đã validate)
     * @return ResponseEntity chứa Service đã cập nhật hoặc lỗi
     */
    // UPDATE - Cập nhật service
    @PutMapping("/{serviceId}")
    public ResponseEntity<?> updateService(
            @PathVariable("serviceId") Integer serviceId,
            @Valid @RequestBody Service serviceDetails) {
        try {
            Service updatedService = serviceService.updateService(serviceId, serviceDetails);
            if (updatedService != null) {
                return ResponseEntity.ok(updatedService);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Service not found with ID: " + serviceId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Lỗi cập nhật service: " + e.getMessage());
        }
    }
    
    /**
     * API xóa dịch vụ
     * Xóa dịch vụ tư vấn khỏi hệ thống (chỉ khi không có booking liên quan)
     * 
     * @param serviceId ID của dịch vụ cần xóa
     * @return ResponseEntity chứa thông báo thành công hoặc lỗi
     */
    // DELETE - Xóa service
    @DeleteMapping("/{serviceId}")
    public ResponseEntity<?> deleteService(@PathVariable("serviceId") Integer serviceId) {
        try {
            boolean isDeleted = serviceService.deleteService(serviceId);
            if (isDeleted) {
                return ResponseEntity.ok("Service deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Service not found with ID: " + serviceId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Lỗi xóa service: " + e.getMessage());
        }
    }
}
