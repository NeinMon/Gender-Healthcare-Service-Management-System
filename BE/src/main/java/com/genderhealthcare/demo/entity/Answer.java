package com.genderhealthcare.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "answer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Answer {
    @Id
    private Integer questionID;  // Primary key cũng là foreign key

    @OneToOne
    @MapsId  // Sử dụng questionID làm cả primary key và foreign key
    @JoinColumn(name = "questionID")
    private Question question;

    @NotNull(message = "ID tư vấn viên không được để trống")
    private Integer consultantID;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(min = 10, max = 5000, message = "Nội dung phải từ 10-5000 ký tự")
    @Column(name = "content", columnDefinition = "NVARCHAR(4000)")
    private String content;

    private String createdAt;
}