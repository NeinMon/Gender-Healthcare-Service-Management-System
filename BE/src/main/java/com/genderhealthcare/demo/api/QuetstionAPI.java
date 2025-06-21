package com.genderhealthcare.demo.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.genderhealthcare.demo.entity.Question;
import com.genderhealthcare.demo.model.QuestionRequest;
import com.genderhealthcare.demo.service.QuestionService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RequestMapping("/api/questions")
public class QuetstionAPI {
    
    @Autowired
    private QuestionService questionService;
    
    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        List<Question> questions = questionService.getAllQuestions();
        return new ResponseEntity<>(questions, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Integer id) {
        Question question = questionService.getQuestionById(id);
        return new ResponseEntity<>(question, HttpStatus.OK);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Question>> getQuestionsByUserId(@PathVariable Integer userId) {
        List<Question> questions = questionService.getQuestionsByUserId(userId);
        return new ResponseEntity<>(questions, HttpStatus.OK);
    }
      @PostMapping
    public ResponseEntity<Question> createQuestion(@Valid @RequestBody QuestionRequest questionRequest) {
        // Convert request to entity
        Question question = new Question();
        question.setUserID(questionRequest.getUserID());
        question.setTitle(questionRequest.getTitle());
        question.setContent(questionRequest.getContent());
        
        Question createdQuestion = questionService.createQuestion(question);
        return new ResponseEntity<>(createdQuestion, HttpStatus.CREATED);
    }
      @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(
            @PathVariable Integer id, 
            @Valid @RequestBody QuestionRequest questionRequest) {
        // Convert request to entity
        Question questionDetails = new Question();
        questionDetails.setUserID(questionRequest.getUserID());
        questionDetails.setTitle(questionRequest.getTitle());
        questionDetails.setContent(questionRequest.getContent());
        
        Question updatedQuestion = questionService.updateQuestion(id, questionDetails);
        return new ResponseEntity<>(updatedQuestion, HttpStatus.OK);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteQuestion(@PathVariable Integer id) {
        questionService.deleteQuestion(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Câu hỏi đã được xóa thành công");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
