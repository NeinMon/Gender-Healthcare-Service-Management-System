package com.genderhealthcare.demo.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.genderhealthcare.demo.entity.Question;
import com.genderhealthcare.demo.exception.InvalidQuestionTitleException;
import com.genderhealthcare.demo.exception.QuestionNotFoundException;
import com.genderhealthcare.demo.repository.QuestionRepository;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;
      /**
     * Kiểm tra tính hợp lệ của tiêu đề câu hỏi
     * Chấp nhận các tiêu đề thuộc danh mục đã định nghĩa
     */
    private boolean isValidQuestionTitle(String title) {
        try {
            // Check if the title matches any of the standard categories
            List<String> validTitles = Arrays.asList(
                "Sức khỏe sinh sản",
                "Thai sản và phụ khoa",
                "Kế hoạch hóa gia đình",
                "Kinh nguyệt và mãn kinh",
                "Sức khỏe tình dục",
                "Dinh dưỡng và lối sống"
            );
            return validTitles.contains(title);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Tạo câu hỏi mới với validation
     */
    public Question createQuestion(Question question) {
        // Kiểm tra tiêu đề có hợp lệ không
        if (!isValidQuestionTitle(question.getTitle())) {
            throw new InvalidQuestionTitleException("Tiêu đề câu hỏi không hợp lệ");
        }
          // Thiết lập trạng thái mặc định là "pending" nếu chưa được thiết lập
        if (question.getStatus() == null || question.getStatus().isEmpty()) {
            question.setStatus("pending");
        }
        
        // Thiết lập thời gian tạo câu hỏi là thời gian hiện tại
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        question.setCreatedAt(now.format(formatter));
        
        return questionRepository.save(question);
    }
    
    /**
     * Lấy câu hỏi theo ID với xử lý ngoại lệ
     */
    public Question getQuestionById(Integer questionId) {
        Optional<Question> questionOpt = questionRepository.findById(questionId);
        if (questionOpt.isEmpty()) {
            throw new QuestionNotFoundException("Không tìm thấy câu hỏi với ID: " + questionId);
        }
        return questionOpt.get();
    }
    
    /**
     * Cập nhật câu hỏi với validation
     */
    public Question updateQuestion(Integer questionId, Question questionDetails) {
        Question question = getQuestionById(questionId);
        
        // Kiểm tra tiêu đề mới có hợp lệ không nếu được cung cấp
        if (questionDetails.getTitle() != null && !questionDetails.getTitle().isEmpty()) {
            if (!isValidQuestionTitle(questionDetails.getTitle())) {
                throw new InvalidQuestionTitleException("Tiêu đề câu hỏi không hợp lệ");
            }
            question.setTitle(questionDetails.getTitle());
        }
        
        // Cập nhật các trường khác nếu được cung cấp
        if (questionDetails.getContent() != null && !questionDetails.getContent().isEmpty()) {
            question.setContent(questionDetails.getContent());
        }
          if (questionDetails.getStatus() != null && !questionDetails.getStatus().isEmpty()) {
            // Kiểm tra trạng thái hợp lệ
            List<String> validStatuses = Arrays.asList("pending", "resolved");
            if (!validStatuses.contains(questionDetails.getStatus())) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ (pending, resolved)");
            }
            question.setStatus(questionDetails.getStatus());
        }
        
        return questionRepository.save(question);
    }
    
    /**
     * Xóa câu hỏi
     */
    public void deleteQuestion(Integer questionId) {
        Question question = getQuestionById(questionId);
        questionRepository.delete(question);
    }
    
    /**
     * Lấy danh sách tất cả câu hỏi
     */
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }
    
    /**
     * Lấy danh sách câu hỏi theo userID
     */
    public List<Question> getQuestionsByUserId(Integer userId) {
        List<Question> questions = questionRepository.findByUserID(userId);
        if (questions.isEmpty()) {
            throw new QuestionNotFoundException("Không tìm thấy câu hỏi nào của người dùng với ID: " + userId);
        }
        return questions;
    }
}
