package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.ConsultantSchedule;
import com.genderhealthcare.demo.entity.ConsultantSchedule.WorkShift;
import com.genderhealthcare.demo.entity.ConsultantSchedule.ScheduleStatus;
import com.genderhealthcare.demo.repository.ConsultantScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

/**
 * Service class xử lý logic nghiệp vụ cho ConsultantSchedule
 */
@Service
@Transactional
public class ConsultantScheduleService {

    @Autowired
    private ConsultantScheduleRepository scheduleRepository;

    /**
     * Lấy tất cả lịch làm việc
     */
    public List<ConsultantSchedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    /**
     * Lấy lịch làm việc theo ID
     */
    public Optional<ConsultantSchedule> getScheduleById(Integer scheduleID) {
        return scheduleRepository.findById(scheduleID);
    }

    /**
     * Tạo lịch làm việc mới
     */
    public ConsultantSchedule createSchedule(ConsultantSchedule schedule) {
        // Validate dữ liệu
        validateSchedule(schedule);
        
        // Set trạng thái mặc định là NOT_YET nếu chưa được set
        if (schedule.getStatus() == null) {
            schedule.setStatus(ScheduleStatus.NOT_YET);
        }
        
        // Kiểm tra trùng lặp
        List<ConsultantSchedule> overlapping = scheduleRepository.findOverlappingSchedules(
                schedule.getConsultantID(),
                schedule.getWorkDate(),
                schedule.getShift(),
                -1 // Không loại trừ ID nào
        );
        
        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Consultant đã có lịch làm việc trong ca này");
        }
        
        return scheduleRepository.save(schedule);
    }

    /**
     * Cập nhật lịch làm việc
     */
    public ConsultantSchedule updateSchedule(Integer scheduleID, ConsultantSchedule updatedSchedule) {
        Optional<ConsultantSchedule> existingSchedule = scheduleRepository.findById(scheduleID);
        
        if (!existingSchedule.isPresent()) {
            throw new RuntimeException("Không tìm thấy lịch làm việc với ID: " + scheduleID);
        }
        
        // Validate dữ liệu
        validateSchedule(updatedSchedule);
        
        // Kiểm tra trùng lặp với các lịch khác (trừ chính nó)
        List<ConsultantSchedule> overlapping = scheduleRepository.findOverlappingSchedules(
                updatedSchedule.getConsultantID(),
                updatedSchedule.getWorkDate(),
                updatedSchedule.getShift(),
                scheduleID
        );
        
        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Consultant đã có lịch làm việc trong ca này");
        }
        
        // Cập nhật thông tin
        ConsultantSchedule schedule = existingSchedule.get();
        schedule.setConsultantID(updatedSchedule.getConsultantID());
        schedule.setWorkDate(updatedSchedule.getWorkDate());
        schedule.setShift(updatedSchedule.getShift());
        schedule.setStatus(updatedSchedule.getStatus());
        schedule.setNotes(updatedSchedule.getNotes());
        
        return scheduleRepository.save(schedule);
    }

    /**
     * Xóa lịch làm việc
     */
    public boolean deleteSchedule(Integer scheduleID) {
        if (scheduleRepository.existsById(scheduleID)) {
            scheduleRepository.deleteById(scheduleID);
            return true;
        }
        return false;
    }

    /**
     * Lấy lịch làm việc theo consultant ID
     */
    public List<ConsultantSchedule> getSchedulesByConsultant(Integer consultantID) {
        return scheduleRepository.findByConsultantID(consultantID);
    }

    /**
     * Lấy lịch làm việc theo ngày
     */
    public List<ConsultantSchedule> getSchedulesByDate(LocalDate date) {
        return scheduleRepository.findByWorkDate(date);
    }

    /**
     * Lấy lịch có sẵn của consultant trong ngày cụ thể
     */
    public List<ConsultantSchedule> getAvailableSchedulesByConsultantAndDate(Integer consultantID, LocalDate date) {
        return scheduleRepository.findAvailableSchedulesByConsultantAndDate(consultantID, date);
    }

    /**
     * Kiểm tra consultant có lịch trống trong ca làm việc cụ thể không
     */
    public boolean isConsultantAvailable(Integer consultantID, LocalDate date, WorkShift shift) {
        List<ConsultantSchedule> availableSchedules = scheduleRepository.findByConsultantIDAndWorkDateAndShiftAndStatus(
                consultantID, date, shift, ScheduleStatus.AVAILABLE);
        return !availableSchedules.isEmpty();
    }

    /**
     * Lấy số lượng lịch làm việc của consultant
     */
    public Long getScheduleCountByConsultant(Integer consultantID) {
        return scheduleRepository.countByConsultantID(consultantID);
    }

    /**
     * Tạo lịch làm việc cho nhiều ngày
     */
    public List<ConsultantSchedule> createMultipleDaySchedule(
            Integer consultantID, LocalDate startDate, LocalDate endDate, 
            WorkShift shift, ScheduleStatus status, String notes) {
        
        List<ConsultantSchedule> schedules = new java.util.ArrayList<>();
        LocalDate currentDate = startDate;
        
        // Sử dụng NOT_YET làm trạng thái mặc định nếu status là null
        ScheduleStatus defaultStatus = (status != null) ? status : ScheduleStatus.NOT_YET;
        
        while (!currentDate.isAfter(endDate)) {
            // Bỏ qua chủ nhật
            if (currentDate.getDayOfWeek() != DayOfWeek.SUNDAY) {
                ConsultantSchedule schedule = new ConsultantSchedule();
                schedule.setConsultantID(consultantID);
                schedule.setWorkDate(currentDate);
                schedule.setShift(shift);
                schedule.setStatus(defaultStatus);
                schedule.setNotes(notes);
                
                try {
                    ConsultantSchedule savedSchedule = createSchedule(schedule);
                    schedules.add(savedSchedule);
                } catch (RuntimeException e) {
                    // Bỏ qua nếu đã có lịch trong ca này
                    System.out.println("Bỏ qua ngày " + currentDate + ": " + e.getMessage());
                }
            }
            currentDate = currentDate.plusDays(1);
        }
        
        return schedules;
    }

    /**
     * Lấy lịch làm việc trong khoảng thời gian
     */
    public List<ConsultantSchedule> getSchedulesInDateRange(LocalDate startDate, LocalDate endDate) {
        return scheduleRepository.findSchedulesInDateRange(startDate, endDate);
    }

    /**
     * Lấy lịch làm việc của consultant trong khoảng thời gian
     */
    public List<ConsultantSchedule> getConsultantSchedulesInDateRange(
            Integer consultantID, LocalDate startDate, LocalDate endDate) {
        return scheduleRepository.findConsultantSchedulesInDateRange(consultantID, startDate, endDate);
    }

    /**
     * Validate dữ liệu lịch làm việc
     */
    private void validateSchedule(ConsultantSchedule schedule) {
        if (schedule.getConsultantID() == null) {
            throw new RuntimeException("Consultant ID không được để trống");
        }
        
        if (schedule.getWorkDate() == null) {
            throw new RuntimeException("Ngày làm việc không được để trống");
        }
        
        if (schedule.getShift() == null) {
            throw new RuntimeException("Ca làm việc không được để trống");
        }
        
        // Status sẽ được set mặc định là NOT_YET nếu null, không cần validate
        
        // Không cho phép tạo lịch trong quá khứ
        if (schedule.getWorkDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Không thể tạo lịch làm việc trong quá khứ");
        }
        
        // Không cho phép làm việc vào Chủ nhật
        if (schedule.getWorkDate().getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new RuntimeException("Không thể tạo lịch làm việc vào Chủ nhật");
        }
    }
}
