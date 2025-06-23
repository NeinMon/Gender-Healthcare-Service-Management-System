package com.genderhealthcare.demo.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AnswerRequest {
    @NotNull(message = "ID câu hỏi không được để trống")
    private Integer questionId;

    @NotNull(message = "ID tư vấn viên không được để trống")
    private Integer consultantId;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(min = 10, max = 5000, message = "Nội dung phải từ 10-5000 ký tự")
    private String content;

    // Getters và Setters
    public Integer getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Integer questionId) {
        this.questionId = questionId;
    }

    public Integer getConsultantId() {
        return consultantId;
    }

    public void setConsultantId(Integer consultantId) {
        this.consultantId = consultantId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}