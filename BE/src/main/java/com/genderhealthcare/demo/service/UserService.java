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

@Service // Đánh dấu đây là một service trong Spring Boot
public class UserService {

    @Autowired
    UserRepository userRepository;

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
        Users existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new AccountNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        // Update fields that can be changed by the user
        if (updatedUser.getFullName() != null) {
            existingUser.setFullName(updatedUser.getFullName());
        }
        if (updatedUser.getPhone() != null) {
            existingUser.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getAddress() != null) {
            existingUser.setAddress(updatedUser.getAddress());
        }
        if (updatedUser.getGender() != null) {
            existingUser.setGender(updatedUser.getGender());
        }
        if (updatedUser.getDob() != null) {
            existingUser.setDob(updatedUser.getDob());
        }
        
        // Don't allow changing email or role through this method
        
        return userRepository.save(existingUser);
    }

    @Transactional(readOnly = true)
    public List<Users> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

}
