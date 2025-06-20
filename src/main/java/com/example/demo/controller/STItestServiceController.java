package com.example.demo.controller;

import com.example.demo.entity.STItestService;
import com.example.demo.repository.STItestServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stitestservices")
public class STItestServiceController {
    @Autowired
    private STItestServiceRepository stiTestServiceRepository;

    @GetMapping
    public List<STItestService> getAll() {
        return stiTestServiceRepository.findAll();
    }

    @PostMapping
    public STItestService create(@RequestBody STItestService stiTestService) {
        return stiTestServiceRepository.save(stiTestService);
    }
}
