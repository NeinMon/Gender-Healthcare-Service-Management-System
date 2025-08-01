package com.genderhealthcare.demo.api;

import com.genderhealthcare.demo.entity.ConsultantSchedule;
import com.genderhealthcare.demo.service.ConsultantScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

/**
 * API Controller xử lý các yêu cầu quản lý lịch làm việc của consultant
 */
@RestController
@RequestMapping("/api/consultant-schedules")
@Validated
@CrossOrigin("*") // Cho phép tất cả các nguồn truy cập vào API

public class ConsultantScheduleAPI {

    @Autowired
    private ConsultantScheduleService scheduleService;

    /**
     * Lấy tất cả lịch làm việc
     */
    @GetMapping("/all")
    public ResponseEntity<List<ConsultantSchedule>> getAllSchedules() {
        try {
            List<ConsultantSchedule> schedules = scheduleService.getAllSchedules();
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Thêm lịch làm việc mới
     */
    @PostMapping("/add")
    public ResponseEntity<?> addSchedule(@Valid @RequestBody ConsultantSchedule schedule) {
        try {
            ConsultantSchedule savedSchedule = scheduleService.createSchedule(schedule);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Thêm lịch làm việc thành công");
            response.put("schedule", savedSchedule);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Có lỗi xảy ra khi thêm lịch: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Xóa lịch làm việc theo ID
     */
    @DeleteMapping("/delete/{scheduleID}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Integer scheduleID) {
        try {
            boolean deleted = scheduleService.deleteSchedule(scheduleID);
            
            Map<String, Object> response = new HashMap<>();
            if (deleted) {
                response.put("message", "Xóa lịch làm việc thành công");
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Không tìm thấy lịch làm việc với ID: " + scheduleID);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Có lỗi xảy ra khi xóa lịch: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy lịch làm việc theo ID
     */
    @GetMapping("/{scheduleID}")
    public ResponseEntity<?> getScheduleById(@PathVariable Integer scheduleID) {
        try {
            Optional<ConsultantSchedule> schedule = scheduleService.getScheduleById(scheduleID);
            
            if (schedule.isPresent()) {
                return ResponseEntity.ok(schedule.get());
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Không tìm thấy lịch làm việc với ID: " + scheduleID);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Có lỗi xảy ra khi lấy thông tin lịch: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy lịch làm việc theo consultant ID
     */
    @GetMapping("/consultant/{consultantID}")
    public ResponseEntity<?> getSchedulesByConsultant(@PathVariable Integer consultantID) {
        try {
            List<ConsultantSchedule> schedules = scheduleService.getSchedulesByConsultant(consultantID);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Có lỗi xảy ra khi lấy lịch làm việc: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy lịch làm việc theo ngày
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<?> getSchedulesByDate(@PathVariable String date) {
        try {
            LocalDate workDate = LocalDate.parse(date);
            List<ConsultantSchedule> schedules = scheduleService.getSchedulesByDate(workDate);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Có lỗi xảy ra khi lấy lịch làm việc theo ngày: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Cập nhật lịch làm việc
     */
    @PutMapping("/update/{scheduleID}")
    public ResponseEntity<?> updateSchedule(
            @PathVariable Integer scheduleID,
            @Valid @RequestBody ConsultantSchedule updatedSchedule) {
        try {
            ConsultantSchedule schedule = scheduleService.updateSchedule(scheduleID, updatedSchedule);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật lịch làm việc thành công");
            response.put("schedule", schedule);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Có lỗi xảy ra khi cập nhật lịch: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

  

    
}
