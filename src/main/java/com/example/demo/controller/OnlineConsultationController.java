package com.example.demo.controller;

import com.example.demo.entity.OnlineConsultation;
import com.example.demo.repository.OnlineConsultationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/onlineconsultations")
public class OnlineConsultationController {
    @Autowired
    private OnlineConsultationRepository onlineConsultationRepository;

    @GetMapping
    public List<OnlineConsultation> getAll() {
        return onlineConsultationRepository.findAll();
    }

    @PostMapping
    public OnlineConsultation create(@RequestBody OnlineConsultation onlineConsultation) {
        return onlineConsultationRepository.save(onlineConsultation);
    }
}
