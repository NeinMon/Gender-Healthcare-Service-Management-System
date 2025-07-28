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

/**
 * API Controller xử lý các yêu cầu quản lý câu hỏi
 * Quản lý hệ thống hỏi đáp sức khỏe phụ nữ trong ứng dụng
 * API này chỉ tiếp nhận request từ frontend và gọi đến service layer
 */
@RestController
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RequestMapping("/api/questions")
public class QuestionAPI {

    @Autowired
    private QuestionService questionService;

    /**
     * API lấy tất cả câu hỏi trong hệ thống
     * Trả về danh sách tất cả question có trong database
     * 
     * @return ResponseEntity chứa danh sách Question hoặc lỗi
     */
    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        try {
            List<Question> questions = questionService.getAllQuestions();
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * API lấy câu hỏi theo ID
     * Tìm kiếm và trả về thông tin chi tiết của một question cụ thể
     * 
     * @param id ID của câu hỏi cần tìm
     * @return ResponseEntity chứa Question hoặc thông báo không tìm thấy
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@PathVariable Integer id) {
        try {
            Question question = questionService.getQuestionById(id);
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy câu hỏi với ID: " + id);
        }
    }

    /**
     * API lấy danh sách câu hỏi theo user ID
     * Lấy tất cả câu hỏi do một khách hàng cụ thể đặt ra
     * 
     * @param userId ID của khách hàng
     * @return ResponseEntity chứa danh sách Question của user hoặc lỗi
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getQuestionsByUserId(@PathVariable Integer userId) {
        try {
            List<Question> questions = questionService.getQuestionsByUserId(userId);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy câu hỏi nào của người dùng với ID: " + userId);
        }
    }
    
    /**
     * API tạo câu hỏi mới
     * Khách hàng tạo câu hỏi sức khỏe để được consultant tư vấn
     * Convert QuestionRequest thành Question entity trước khi lưu
     * 
     * @param questionRequest QuestionRequest chứa thông tin câu hỏi (userID, title, content)
     * @return ResponseEntity chứa Question đã tạo hoặc lỗi
     */
    @PostMapping
    public ResponseEntity<?> createQuestion(@Valid @RequestBody QuestionRequest questionRequest) {
        try {
            // Convert request to entity
            Question question = new Question();
            question.setUserID(questionRequest.getUserID());
            question.setTitle(questionRequest.getTitle());
            question.setContent(questionRequest.getContent());

            Question createdQuestion = questionService.createQuestion(question);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdQuestion);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi tạo câu hỏi: " + e.getMessage());
        }
    }

    /**
     * API cập nhật câu hỏi
     * Cập nhật thông tin câu hỏi đã tồn tại (title, content)
     * Chỉ cho phép chủ sở hữu câu hỏi cập nhật
     * 
     * @param id ID của câu hỏi cần cập nhật
     * @param questionRequest QuestionRequest chứa thông tin cập nhật
     * @return ResponseEntity chứa Question đã cập nhật hoặc lỗi
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable Integer id,
            @Valid @RequestBody QuestionRequest questionRequest) {
        try {
            // Convert request to entity
            Question questionDetails = new Question();
            questionDetails.setUserID(questionRequest.getUserID());
            questionDetails.setTitle(questionRequest.getTitle());
            questionDetails.setContent(questionRequest.getContent());

            Question updatedQuestion = questionService.updateQuestion(id, questionDetails);
            return ResponseEntity.ok(updatedQuestion);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi cập nhật câu hỏi: " + e.getMessage());
        }
    }

    /**
     * API xóa câu hỏi
     * Xóa câu hỏi khỏi hệ thống (cùng với các answer liên quan)
     * Chỉ cho phép chủ sở hữu hoặc admin xóa câu hỏi
     * 
     * @param id ID của câu hỏi cần xóa
     * @return ResponseEntity chứa thông báo thành công hoặc lỗi
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Integer id) {
        try {
            questionService.deleteQuestion(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Câu hỏi đã được xóa thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi xóa câu hỏi: " + e.getMessage());
        }
    }
}