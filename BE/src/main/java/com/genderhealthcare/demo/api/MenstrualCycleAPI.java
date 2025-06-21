package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.MenstrualCycle;
import com.genderhealthcare.demo.exception.AccountNotFoundException;
import com.genderhealthcare.demo.exception.DuplicateMenstrualCycleException;
import com.genderhealthcare.demo.exception.InvalidMenstrualCycleDateException;
import com.genderhealthcare.demo.exception.MenstrualCycleNotFoundException;
import com.genderhealthcare.demo.model.MenstrualCycleRequest;
import com.genderhealthcare.demo.service.MenstrualCycleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/menstrual-cycles")
public class MenstrualCycleAPI {

    @Autowired
    private MenstrualCycleService menstrualCycleService;

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testConnection() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Backend connection successful");
        response.put("status", "OK");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<MenstrualCycle>> getAllMenstrualCycles() {
        List<MenstrualCycle> cycles = menstrualCycleService.getAllMenstrualCycles();
        return new ResponseEntity<>(cycles, HttpStatus.OK);
    }    @GetMapping("/user/{userId}")
    public ResponseEntity<MenstrualCycle> getMenstrualCycleByUserId(@PathVariable Long userId) {
        try {
            MenstrualCycle cycle = menstrualCycleService.getMenstrualCycleByUserId(userId);
            return new ResponseEntity<>(cycle, HttpStatus.OK);
        } catch (MenstrualCycleNotFoundException e) {
            // Return 404 status instead of throwing exception
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }    @GetMapping("/{id}")
    public ResponseEntity<MenstrualCycle> getMenstrualCycleById(@PathVariable Long id) {
        try {
            MenstrualCycle cycle = menstrualCycleService.getMenstrualCycleById(id);
            return new ResponseEntity<>(cycle, HttpStatus.OK);
        } catch (MenstrualCycleNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/user/{userId}/exists")
    public ResponseEntity<Map<String, Boolean>> checkUserHasCycle(@PathVariable Long userId) {
        boolean exists = menstrualCycleService.hasUserMenstrualCycle(userId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }@PostMapping
    public ResponseEntity<MenstrualCycle> createMenstrualCycle(@Valid @RequestBody MenstrualCycleRequest request) {
        try {
            MenstrualCycle createdCycle = menstrualCycleService.createMenstrualCycle(request);
            return new ResponseEntity<>(createdCycle, HttpStatus.CREATED);
        } catch (AccountNotFoundException | InvalidMenstrualCycleDateException | DuplicateMenstrualCycleException e) {
            // These exceptions will be handled by ValidationHandler
            throw e;
        }
    }    @PutMapping("/{id}")
    public ResponseEntity<MenstrualCycle> updateMenstrualCycle(
            @PathVariable Long id,
            @Valid @RequestBody MenstrualCycleRequest request) {
        try {
            MenstrualCycle updatedCycle = menstrualCycleService.updateOrCreateMenstrualCycle(id, request);
            return new ResponseEntity<>(updatedCycle, HttpStatus.OK);
        } catch (MenstrualCycleNotFoundException | AccountNotFoundException | 
                 InvalidMenstrualCycleDateException | IllegalArgumentException e) {
            // Let the ValidationHandler handle these exceptions
            throw e;
        }
    }    @PutMapping("/user/{userId}")
    public ResponseEntity<MenstrualCycle> updateMenstrualCycleByUserId(
            @PathVariable Long userId,
            @Valid @RequestBody MenstrualCycleRequest request) {
        try {
            // Use our new service method that handles both update and create cases
            MenstrualCycle cycle = menstrualCycleService.updateOrCreateMenstrualCycleForUser(userId, request);
            
            // Return CREATED status if this was a new cycle, otherwise OK
            HttpStatus status = menstrualCycleService.hasUserMenstrualCycle(userId) ? HttpStatus.OK : HttpStatus.CREATED;
            return new ResponseEntity<>(cycle, status);
        } catch (AccountNotFoundException | InvalidMenstrualCycleDateException | IllegalArgumentException e) {
            // Let the ValidationHandler handle these exceptions
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenstrualCycle(@PathVariable Long id) {
        try {
            menstrualCycleService.deleteMenstrualCycle(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (MenstrualCycleNotFoundException e) {
            // Let the ValidationHandler handle this exception
            throw e;
        }
    }
}
