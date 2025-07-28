package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.model.AnswerRequest;
import com.genderhealthcare.demo.entity.Answer;
import com.genderhealthcare.demo.service.AnswerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * API Controller xử lý các yêu cầu quản lý câu trả lời
 * Quản lý các câu trả lời từ consultant cho câu hỏi sức khỏe của khách hàng
 * API này chỉ tiếp nhận request từ frontend và gọi đến service layer
 */
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RestController
@RequestMapping("/api/answers")
public class AnswerAPI {
    @Autowired
    private AnswerService answerService;

    /**
     * API lấy tất cả câu trả lời trong hệ thống
     * Trả về danh sách tất cả answer có trong database
     * 
     * @return ResponseEntity chứa danh sách Answer hoặc lỗi
     */
    // @GetMapping
    // public ResponseEntity<List<Answer>> getAll() {
    //     try {
    //         List<Answer> answers = answerService.getAllAnswers();
    //         return ResponseEntity.ok(answers);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(500).body(null);
    //     }
    // }

    /**
     * API lấy câu trả lời theo question ID
     * Tìm kiếm answer dựa trên ID của câu hỏi tương ứng
     * 
     * @param questionId ID của câu hỏi cần tìm answer
     * @return ResponseEntity chứa Answer hoặc thông báo không tìm thấy
     */
    @GetMapping("/{questionId}")
    public ResponseEntity<Object> getByQuestionId(@PathVariable Integer questionId) {
        try {
            Optional<Answer> answer = answerService.getAnswerByQuestionId(questionId);
            return answer.map(value -> ResponseEntity.ok((Object)value))
                    .orElse(ResponseEntity.status(404).body("Không tìm thấy câu trả lời"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    /**
     * API tạo câu trả lời mới
     * Tạo answer entity trực tiếp từ dữ liệu frontend gửi lên
     * 
     * @param answer Đối tượng Answer cần tạo (đã validate)
     * @return ResponseEntity chứa Answer đã tạo hoặc lỗi
     */
    // @PostMapping
    // public ResponseEntity<?> create(@Valid @RequestBody Answer answer) {
    //     try {
    //         Answer savedAnswer = answerService.createAnswer(answer);
    //         return ResponseEntity.ok(savedAnswer);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
    //     }
    // }

    /**
     * API trả lời câu hỏi từ consultant
     * Endpoint chính cho consultant trả lời câu hỏi sức khỏe từ khách hàng
     * Sử dụng AnswerRequest để validate và xử lý dữ liệu đầu vào
     * 
     * @param request AnswerRequest chứa thông tin câu trả lời (questionId, consultantId, content)
     * @return ResponseEntity chứa answer đã tạo và thông báo thành công hoặc lỗi
     */
    @PostMapping("/reply")
    public ResponseEntity<?> replyQuestion(@Valid @RequestBody AnswerRequest request) {
        try {
            Answer savedAnswer = answerService.replyToQuestion(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("answer", savedAnswer);
            response.put("message", "Trả lời câu hỏi thành công");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
}