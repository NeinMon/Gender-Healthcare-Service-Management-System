package com.genderhealthcare.demo.api;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;

import java.util.List;

import com.genderhealthcare.demo.entity.Users;
import com.genderhealthcare.demo.service.UserService;

/**
 * API Controller xử lý các yêu cầu quản lý người dùng
 * Quản lý thông tin user, consultant, staff trong hệ thống
 * API này chỉ tiếp nhận request từ frontend và gọi đến service layer
 */
@RestController
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RequestMapping("/api/users")
public class    UserAPI {

    @Autowired
    UserService userService;
    
    /**
     * API tạo người dùng mới
     * Tạo user account trong hệ thống với đầy đủ thông tin
     * 
     * @param user Đối tượng Users cần tạo (đã validate)
     * @return ResponseEntity chứa user đã tạo hoặc lỗi
     */
    @PostMapping
    public ResponseEntity<?> createNewUser(@Valid @RequestBody Users user) {
        try {
            Users newUsers = userService.createnewUsers(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUsers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi tạo người dùng: " + e.getMessage());
        }
    }
    
    /**
     * API lấy danh sách tất cả người dùng
     * Trả về danh sách tất cả user trong hệ thống
     * 
     * @return ResponseEntity chứa danh sách Users hoặc lỗi
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<Users> users = userService.getAllUser();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi lấy danh sách người dùng: " + e.getMessage());
        }
    }
    
    /**
     * API lấy thông tin người dùng theo ID
     * Tìm kiếm và trả về thông tin chi tiết của một user cụ thể
     * 
     * @param userId ID của người dùng cần tìm
     * @return ResponseEntity chứa thông tin Users hoặc lỗi
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@org.springframework.web.bind.annotation.PathVariable Integer userId) {
        try {
            Users user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không tìm thấy người dùng với ID: " + userId);
        }
    }    
    
    /**
     * API cập nhật thông tin người dùng
     * Cập nhật thông tin profile của user đã tồn tại
     * 
     * @param userId ID của người dùng cần cập nhật
     * @param updatedUser Đối tượng Users chứa thông tin mới
     * @return ResponseEntity chứa user đã cập nhật hoặc lỗi
     */
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@org.springframework.web.bind.annotation.PathVariable Integer userId, 
                                       @RequestBody Users updatedUser) {
        try {
            System.out.println("Updating user ID: " + userId);
            System.out.println("Updated user data: " + updatedUser);
            System.out.println("User fullName: " + updatedUser.getFullName());
            System.out.println("User email: " + updatedUser.getEmail());
            System.out.println("User role: " + updatedUser.getRole());
            System.out.println("User dob: " + updatedUser.getDob());
            
            Users user = userService.updateUser(userId, updatedUser);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("Error updating user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Không thể cập nhật thông tin người dùng: " + e.getMessage());
        }
    }

    /**
     * API lấy danh sách tất cả consultant
     * Trả về danh sách user có role là CONSULTANT
     * 
     * @return ResponseEntity chứa danh sách consultant
     */
    @GetMapping("/consultants")
    public ResponseEntity<List<Users>> getAllConsultants() {
        List<Users> consultants = userService.getUsersByRole(com.genderhealthcare.demo.entity.Role.CONSULTANT);
        return ResponseEntity.ok(consultants);
    }

    /**
     * API cập nhật chuyên môn cho consultant
     * Cập nhật thông tin specification (chuyên môn) cho user có role CONSULTANT
     * 
     * @param consultantId ID của consultant cần cập nhật
     * @param specification Thông tin chuyên môn mới
     * @return ResponseEntity chứa consultant đã cập nhật hoặc lỗi
     */
    // @PutMapping("/consultant/{consultantId}/specification")
    // public ResponseEntity<?> updateConsultantSpecification(
    //         @org.springframework.web.bind.annotation.PathVariable Integer consultantId,
    //         @RequestBody String specification) {
    //     try {
    //         Users consultant = userService.getUserById(consultantId);
            
    //         if (consultant.getRole() != com.genderhealthcare.demo.entity.Role.CONSULTANT) {
    //             return ResponseEntity.badRequest().body("Người dùng này không phải là consultant");
    //         }
            
    //         Users updatedConsultant = new Users();
    //         updatedConsultant.setSpecification(specification);
            
    //         Users result = userService.updateUser(consultantId, updatedConsultant);
    //         return ResponseEntity.ok(result);
    //     } catch (Exception e) {
    //         return ResponseEntity.badRequest().body("Không thể cập nhật chuyên môn: " + e.getMessage());
    //     }
    // }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@org.springframework.web.bind.annotation.PathVariable Integer userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok("Xóa người dùng thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể xóa người dùng: " + e.getMessage());
        }
    }

}
