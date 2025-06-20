package com.example.demo.controller;

import com.example.demo.entity.TestingResult;
import com.example.demo.repository.TestingResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/testingresults")
public class TestingResultController {
    @Autowired
    private TestingResultRepository testingResultRepository;

    @GetMapping
    public List<TestingResult> getAll() {
        return testingResultRepository.findAll();
    }

    @PostMapping
    public TestingResult create(@RequestBody TestingResult testingResult) {
        return testingResultRepository.save(testingResult);
    }
}
