package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.Users;
import com.genderhealthcare.demo.entity.Role;
import com.genderhealthcare.demo.exception.AccountNotFoundException;
import com.genderhealthcare.demo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

/**
 * Service xử lý logic nghiệp vụ cho quản lý người dùng
 * Quản lý thông tin user (customer, consultant, staff) trong hệ thống
 * Xử lý CRUD operations và các nghiệp vụ liên quan đến user
 * Đảm bảo tính nhất quán dữ liệu qua @Transactional
 */
@Service // Đánh dấu đây là một service trong Spring Boot
public class UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    private ConsultantScheduleService consultantScheduleService;

    @Transactional(readOnly = true)
    public List<Users> getAllUser(){
        return userRepository.findAll();
    }

    @Transactional
    public Users createnewUsers(Users users){
        // Ensure the ID is null for new entities to prevent conflicts
        users.setUserID(null);
        return userRepository.save(users);
    }
    
    @Transactional(readOnly = true)
    public Users getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccountNotFoundException("Không tìm thấy người dùng với email: " + email));
    }
    
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
      @Transactional(readOnly = true)
    public Optional<Users> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
      @Transactional(readOnly = true)
    public Users getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Không tìm thấy người dùng với ID: " + id));
    }
    
    @Transactional
    public Users updateUser(Integer userId, Users updatedUser) {
        System.out.println("UserService.updateUser called with userId: " + userId);
        
        Users existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new AccountNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        System.out.println("Found existing user: " + existingUser.getFullName());
        System.out.println("Existing user email: " + existingUser.getEmail());

        // Check email uniqueness only if email is being changed
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().equals(existingUser.getEmail())) {
            System.out.println("Email is being changed from " + existingUser.getEmail() + " to " + updatedUser.getEmail());
            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new IllegalArgumentException("Email đã tồn tại trong hệ thống");
            }
            existingUser.setEmail(updatedUser.getEmail());
        }

        // Update fields that can be changed by the user
        if (updatedUser.getFullName() != null) {
            System.out.println("Updating fullName to: " + updatedUser.getFullName());
            existingUser.setFullName(updatedUser.getFullName());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
            System.out.println("Updating password");
            existingUser.setPassword(updatedUser.getPassword());
        }
        if (updatedUser.getPhone() != null) {
            System.out.println("Updating phone to: " + updatedUser.getPhone());
            existingUser.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getAddress() != null) {
            System.out.println("Updating address to: " + updatedUser.getAddress());
            existingUser.setAddress(updatedUser.getAddress());
        }
        if (updatedUser.getGender() != null) {
            System.out.println("Updating gender to: " + updatedUser.getGender());
            existingUser.setGender(updatedUser.getGender());
        }
        if (updatedUser.getDob() != null) {
            System.out.println("Updating dob to: " + updatedUser.getDob());
            existingUser.setDob(updatedUser.getDob());
        }
        if (updatedUser.getRole() != null) {
            System.out.println("Updating role to: " + updatedUser.getRole());
            existingUser.setRole(updatedUser.getRole());
        }
        
        // Cập nhật trường specification nếu người dùng là CONSULTANT
        if (updatedUser.getRole() != null && updatedUser.getRole() == Role.CONSULTANT && updatedUser.getSpecification() != null) {
            System.out.println("Updating specification to: " + updatedUser.getSpecification());
            existingUser.setSpecification(updatedUser.getSpecification());
        } else if (existingUser.getRole() == Role.CONSULTANT && updatedUser.getSpecification() != null) {
            System.out.println("Updating specification (existing consultant) to: " + updatedUser.getSpecification());
            existingUser.setSpecification(updatedUser.getSpecification());
        }
        
        System.out.println("Saving updated user...");
        Users savedUser = userRepository.save(existingUser);
        System.out.println("User saved successfully with ID: " + savedUser.getUserID());
        
        return savedUser;
    }

    @Transactional(readOnly = true)
    public List<Users> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    @Transactional
    public void deleteUser(Integer userId) {
        Users existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new AccountNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        userRepository.delete(existingUser);
    }

    /**
     * Lấy danh sách consultant có lịch làm việc trong ngày cụ thể
     * Chỉ trả về những consultant có status AVAILABLE trong ngày đó
     * 
     * @param date Ngày cần kiểm tra
     * @return List<Users> danh sách consultant có lịch làm việc
     */
    @Transactional(readOnly = true)
    public List<Users> getAvailableConsultantsByDate(LocalDate date) {
        // Lấy tất cả consultant
        List<Users> allConsultants = getUsersByRole(Role.CONSULTANT);
        
        // Lọc những consultant có lịch làm việc và available trong ngày
        return allConsultants.stream()
                .filter(consultant -> {
                    try {
                        // Kiểm tra có lịch làm việc trong ngày này không (cả 2 ca)
                        List<com.genderhealthcare.demo.entity.ConsultantSchedule> schedules = 
                            consultantScheduleService.getSchedulesByDate(date);
                        
                        return schedules.stream()
                                .anyMatch(schedule -> 
                                    schedule.getConsultantID().equals(consultant.getUserID()) &&
                                    schedule.getStatus() == com.genderhealthcare.demo.entity.ConsultantSchedule.ScheduleStatus.AVAILABLE
                                );
                    } catch (Exception e) {
                        return false; // Nếu có lỗi, loại bỏ consultant này
                    }
                })
                .toList();
    }

}
