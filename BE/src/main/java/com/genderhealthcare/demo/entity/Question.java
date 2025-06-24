package com.genderhealthcare.demo.entity;

import jakarta.persistence.Column;
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
    @Column(name = "title", columnDefinition = "NVARCHAR(200)")
    private String title;
    
    @NotBlank(message = "Nội dung không được để trống")
    @Size(min = 10, max = 5000, message = "Nội dung phải từ 10-5000 ký tự")
    @Column(name = "content", columnDefinition = "NVARCHAR(4000)")
    private String content;    @Pattern(regexp = "^(pending|resolved)$", message = "Trạng thái không hợp lệ (pending, resolved)")
    @Column(name = "status", columnDefinition = "NVARCHAR(50)")
    private String status; // Trạng thái câu hỏi (pending = chưa giải quyết, resolved = đã giải quyết)
    
    private String createdAt; // Ngày tạo câu hỏi
}
