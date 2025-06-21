package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Integer> {
    // Tìm người dùng theo email
    Optional<Users> findByEmail(String email);
    
    // Kiểm tra email đã tồn tại hay chưa
    boolean existsByEmail(String email);
}
