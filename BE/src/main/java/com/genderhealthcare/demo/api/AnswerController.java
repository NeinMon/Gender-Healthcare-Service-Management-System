package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.model.AnswerRequest;
import com.genderhealthcare.demo.entity.Answer;
import com.genderhealthcare.demo.entity.Question;
import com.genderhealthcare.demo.repository.AnswerRepository;
import com.genderhealthcare.demo.repository.QuestionRepository;
import com.genderhealthcare.demo.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API
@RestController
@RequestMapping("/api/answers")
public class AnswerController {
    @Autowired
    private AnswerRepository answerRepository;
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Answer> getAll() {
        return answerRepository.findAll();
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<Object> getByQuestionId(@PathVariable Integer questionId) {
        Optional<Answer> answer = answerRepository.findById(questionId);
        return answer.map(value -> ResponseEntity.ok((Object)value))
                .orElse(ResponseEntity.status(404).body("Không tìm thấy câu trả lời"));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Answer answer) {
        try {
            // Kiểm tra câu hỏi tồn tại
            if (!questionRepository.existsById(answer.getQuestionID())) {
                return ResponseEntity.status(404).body("Không tìm thấy câu hỏi");
            }

            // Kiểm tra đã có câu trả lời chưa
            if (answerRepository.existsById(answer.getQuestionID())) {
                return ResponseEntity.status(400).body("Câu hỏi này đã có câu trả lời");
            }
            // Cập nhật trạng thái câu hỏi thành "đã giải quyết"
            Question question = questionRepository.findById(answer.getQuestionID()).get();
            question.setStatus("resolved");
            questionRepository.save(question);

            return ResponseEntity.ok(answerRepository.save(answer));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/reply")
    public ResponseEntity<?> replyQuestion(@Valid @RequestBody AnswerRequest request) {
        try {
            // Chuyển đổi từ Long sang Integer
            Integer questionId = request.getQuestionId();
            Integer consultantId = request.getConsultantId();

            // Kiểm tra câu hỏi tồn tại
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi"));

            // Kiểm tra tư vấn viên tồn tại
            if (!userRepository.existsById(consultantId)) {
                return ResponseEntity.status(404).body("Không tìm thấy tư vấn viên");
            }

            // Kiểm tra đã có câu trả lời chưa
            if (answerRepository.existsById(questionId)) {
                return ResponseEntity.status(400).body("Câu hỏi này đã có câu trả lời");
            }

            // Tạo câu trả lời
            Answer answer = new Answer();
            answer.setQuestionID(questionId);
            answer.setConsultantID(consultantId);
            answer.setContent(request.getContent());

            // Cập nhật thời gian
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String dateString = formatter.format(new Date());
            answer.setCreatedAt(dateString);            // Cập nhật trạng thái câu hỏi
            question.setStatus("resolved");
            questionRepository.save(question);

            // Lưu câu trả lời
            Answer savedAnswer = answerRepository.save(answer);

            Map<String, Object> response = new HashMap<>();
            response.put("answer", savedAnswer);
            response.put("message", "Trả lời câu hỏi thành công");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
}