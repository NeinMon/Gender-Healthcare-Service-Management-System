package com.genderhealthcare.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer questionID;
    
    @NotNull(message = "Người dùng không được để trống")
    private Integer userID;
    
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(min = 5, max = 200, message = "Tiêu đề phải từ 5-200 ký tự")
    private String title;
    
    @NotBlank(message = "Nội dung không được để trống")
    @Size(min = 10, max = 5000, message = "Nội dung phải từ 10-5000 ký tự")
    private String content;
    
    @Pattern(regexp = "^(mới|đang xử lý|đã giải quyết|đã đóng)$", message = "Trạng thái không hợp lệ (mới, đang xử lý, đã giải quyết, đã đóng)")
    private String status; // Trạng thái câu hỏi (mới, đang xử lý, đã giải quyết, đã đóng)
    
    private String createdAt; // Ngày tạo câu hỏi
}
