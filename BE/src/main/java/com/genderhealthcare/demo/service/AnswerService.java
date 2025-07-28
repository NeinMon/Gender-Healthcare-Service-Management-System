package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.Answer;
import com.genderhealthcare.demo.entity.Question;
import com.genderhealthcare.demo.model.AnswerRequest;
import com.genderhealthcare.demo.repository.AnswerRepository;
import com.genderhealthcare.demo.repository.QuestionRepository;
import com.genderhealthcare.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * Service xử lý logic nghiệp vụ cho hệ thống trả lời câu hỏi
 * Quản lý câu trả lời từ consultant cho các câu hỏi sức khỏe
 * Đảm bảo liên kết đúng giữa question, answer và consultant
 */
@Service
public class AnswerService {

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy danh sách tất cả câu trả lời
     */
    public List<Answer> getAllAnswers() {
        return answerRepository.findAll();
    }

    /**
     * Lấy câu trả lời theo questionId
     */
    public Optional<Answer> getAnswerByQuestionId(Integer questionId) {
        return answerRepository.findById(questionId);
    }

    /**
     * Tạo câu trả lời mới
     */
    public Answer createAnswer(Answer answer) {
        // Kiểm tra câu hỏi tồn tại
        if (!questionRepository.existsById(answer.getQuestionID())) {
            throw new RuntimeException("Không tìm thấy câu hỏi");
        }

        // Kiểm tra đã có câu trả lời chưa
        if (answerRepository.existsById(answer.getQuestionID())) {
            throw new RuntimeException("Câu hỏi này đã có câu trả lời");
        }

        // Cập nhật trạng thái câu hỏi thành "đã giải quyết"
        Question question = questionRepository.findById(answer.getQuestionID()).get();
        question.setStatus("resolved");
        questionRepository.save(question);

        return answerRepository.save(answer);
    }

    /**
     * Trả lời câu hỏi từ tư vấn viên
     */
    public Answer replyToQuestion(AnswerRequest request) {
        // Chuyển đổi từ Long sang Integer
        Integer questionId = request.getQuestionId();
        Integer consultantId = request.getConsultantId();

        // Kiểm tra câu hỏi tồn tại
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi"));

        // Kiểm tra tư vấn viên tồn tại
        if (!userRepository.existsById(consultantId)) {
            throw new RuntimeException("Không tìm thấy tư vấn viên");
        }

        // Kiểm tra đã có câu trả lời chưa
        if (answerRepository.existsById(questionId)) {
            throw new RuntimeException("Câu hỏi này đã có câu trả lời");
        }

        // Tạo câu trả lời
        Answer answer = new Answer();
        answer.setQuestionID(questionId);
        answer.setConsultantID(consultantId);
        answer.setContent(request.getContent());

        // Cập nhật thời gian
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String dateString = formatter.format(new Date());
        answer.setCreatedAt(dateString);

        // Cập nhật trạng thái câu hỏi
        question.setStatus("resolved");
        questionRepository.save(question);

        // Lưu câu trả lời
        return answerRepository.save(answer);
    }
}
