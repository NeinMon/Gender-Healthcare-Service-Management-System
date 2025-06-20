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
    public MenstrualCycle createOrUpdate(@RequestBody MenstrualCycle menstrualCycle) {
        // Tính endDate từ startDate và cycleLength
        if (menstrualCycle.getStartDate() != null && menstrualCycle.getCycleLength() > 0) {
            menstrualCycle.setEndDate(menstrualCycle.getStartDate().plusDays(menstrualCycle.getCycleLength() - 1));
        }
        List<MenstrualCycle> cycles = menstrualCycleRepository.findTop1ByEmailOrderByStartDateDesc(menstrualCycle.getEmail());
        if (!cycles.isEmpty()) {
            MenstrualCycle existing = cycles.get(0);
            existing.setStartDate(menstrualCycle.getStartDate());
            existing.setEndDate(menstrualCycle.getEndDate());
            existing.setCycleLength(menstrualCycle.getCycleLength());
            return menstrualCycleRepository.save(existing);
        } else {
            return menstrualCycleRepository.save(menstrualCycle);
        }
    }

    @GetMapping(params = "email")
    public MenstrualCycle getLatestByEmail(@RequestParam String email) {
        List<MenstrualCycle> cycles = menstrualCycleRepository.findTop1ByEmailOrderByStartDateDesc(email);
        return cycles.isEmpty() ? null : cycles.get(0);
    }
}
