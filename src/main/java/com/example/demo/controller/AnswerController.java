package com.example.demo.controller;

import com.example.demo.entity.Answer;
import com.example.demo.repository.AnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
public class AnswerController {
    @Autowired
    private AnswerRepository answerRepository;

    @GetMapping
    public List<Answer> getAll() {
        return answerRepository.findAll();
    }

    @PostMapping
    public Answer create(@RequestBody Answer answer) {
        return answerRepository.save(answer);
    }
}
