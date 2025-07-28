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

@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RestController
@RequestMapping("/api/answers")
public class AnswerAPI {
    @Autowired
    private AnswerService answerService;

    @GetMapping
    public ResponseEntity<List<Answer>> getAll() {
        try {
            List<Answer> answers = answerService.getAllAnswers();
            return ResponseEntity.ok(answers);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

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

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Answer answer) {
        try {
            Answer savedAnswer = answerService.createAnswer(answer);
            return ResponseEntity.ok(savedAnswer);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

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