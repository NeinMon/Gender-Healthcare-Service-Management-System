package com.example.demo.controller;

import com.example.demo.entity.MenstrualCycle;
import com.example.demo.repository.MenstrualCycleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menstrualcycles")
public class MenstrualCycleController {
    @Autowired
    private MenstrualCycleRepository menstrualCycleRepository;

    @GetMapping
    public List<MenstrualCycle> getAll() {
        return menstrualCycleRepository.findAll();
    }

    @PostMapping
    public MenstrualCycle create(@RequestBody MenstrualCycle menstrualCycle) {
        return menstrualCycleRepository.save(menstrualCycle);
    }
}
