package com.genderhealthcare.demo.service;

import com.genderhealthcare.demo.entity.MenstrualCycle;
import com.genderhealthcare.demo.entity.Users;
import com.genderhealthcare.demo.exception.AccountNotFoundException;
import com.genderhealthcare.demo.exception.DuplicateMenstrualCycleException;
import com.genderhealthcare.demo.exception.InvalidMenstrualCycleDateException;
import com.genderhealthcare.demo.exception.MenstrualCycleNotFoundException;
import com.genderhealthcare.demo.model.MenstrualCycleRequest;
import com.genderhealthcare.demo.repository.MenstrualCycleRepository;
import com.genderhealthcare.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service xử lý logic nghiệp vụ cho theo dõi chu kỳ kinh nguyệt
 * Quản lý thông tin chu kỳ kinh nguyệt của phụ nữ, tính toán dự đoán
 * Validate dữ liệu chu kỳ và hỗ trợ tư vấn sức khỏe sinh sản
 * Đảm bảo tính nhất quán dữ liệu qua @Transactional
 */
@Service
public class MenstrualCycleService {

    @Autowired
    private MenstrualCycleRepository menstrualCycleRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MenstrualCycle> getAllMenstrualCycles() {
        return menstrualCycleRepository.findAll();
    }    @Transactional(readOnly = true)
    public MenstrualCycle getMenstrualCycleByUserId(Long userId) {
        return menstrualCycleRepository.findFirstByUser_UserID(userId)
                .orElseThrow(() -> new MenstrualCycleNotFoundException("No menstrual cycle found for user with ID: " + userId));
    }
    
    @Transactional(readOnly = true)
    public boolean hasUserMenstrualCycle(Long userId) {
        return menstrualCycleRepository.existsByUser_UserID(userId);
    }

    @Transactional(readOnly = true)
    public MenstrualCycle getMenstrualCycleById(Long id) {
        return menstrualCycleRepository.findById(id)
                .orElseThrow(() -> new MenstrualCycleNotFoundException(id));
    }    @Transactional
    public MenstrualCycle createMenstrualCycle(MenstrualCycleRequest request) {
        Users user = userRepository.findById(request.getUserId().intValue())
                .orElseThrow(() -> new AccountNotFoundException("User not found with ID: " + request.getUserId()));
        
        // Check if user already has a menstrual cycle
        if (menstrualCycleRepository.existsByUser_UserID(request.getUserId())) {
            throw new DuplicateMenstrualCycleException(request.getUserId());
        }
        
        // Validate dates
        validateDates(request.getStartDate(), request.getEndDate());

        // Debug logging
        System.out.println("Creating menstrual cycle with data:");
        System.out.println("UserId: " + request.getUserId());
        System.out.println("StartDate: " + request.getStartDate());
        System.out.println("EndDate: " + request.getEndDate());
        System.out.println("CycleLength: " + request.getCycleLength());
        System.out.println("PeriodLength: " + request.getPeriodLength());
        System.out.println("FlowLevel: " + request.getFlowLevel());

        MenstrualCycle menstrualCycle = new MenstrualCycle();
        menstrualCycle.setUser(user);
        menstrualCycle.setStartDate(request.getStartDate());
        menstrualCycle.setEndDate(request.getEndDate());
        menstrualCycle.setCycleLength(request.getCycleLength());
        menstrualCycle.setPeriodLength(request.getPeriodLength());
        menstrualCycle.setFlowLevel(request.getFlowLevel());

        return menstrualCycleRepository.save(menstrualCycle);
    }
    
    private void validateDates(LocalDate startDate, LocalDate endDate) {
        // Start date cannot be null
        if (startDate == null) {
            throw new InvalidMenstrualCycleDateException("Start date cannot be null");
        }
        
        // Start date cannot be in the future
        if (startDate.isAfter(LocalDate.now())) {
            throw new InvalidMenstrualCycleDateException("Start date cannot be in the future");
        }
        
        // If end date is provided, it must be after start date
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new InvalidMenstrualCycleDateException("End date must be after start date");
        }
        
        // End date cannot be in the future
        if (endDate != null && endDate.isAfter(LocalDate.now())) {
            throw new InvalidMenstrualCycleDateException("End date cannot be in the future");
        }
    }    @Transactional
    public MenstrualCycle updateMenstrualCycle(Long id, MenstrualCycleRequest request) {
        MenstrualCycle existingCycle = menstrualCycleRepository.findById(id)
                .orElseThrow(() -> new MenstrualCycleNotFoundException(id));        // If userId is changing, verify the new user exists and doesn't already have a menstrual cycle
        if (request.getUserId() != null && !request.getUserId().equals(existingCycle.getUser().getUserID())) {
            Users newUser = userRepository.findById(request.getUserId().intValue())
                    .orElseThrow(() -> new AccountNotFoundException("User not found with ID: " + request.getUserId()));
            
            // Check if the new user already has a menstrual cycle
            if (menstrualCycleRepository.existsByUser_UserID(request.getUserId())) {
                throw new DuplicateMenstrualCycleException(request.getUserId());
            }
            
            existingCycle.setUser(newUser);
        }
        
        // Determine the start and end dates for validation
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : existingCycle.getStartDate();
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : existingCycle.getEndDate();
        
        // Validate dates
        validateDates(startDate, endDate);

        if (request.getStartDate() != null) {
            existingCycle.setStartDate(request.getStartDate());
        }
        
        if (request.getEndDate() != null) {
            existingCycle.setEndDate(request.getEndDate());
        }
        
        if (request.getCycleLength() != null) {
            if (request.getCycleLength() < 1) {
                throw new IllegalArgumentException("Cycle length must be at least 1 day");
            }
            existingCycle.setCycleLength(request.getCycleLength());
        }
        
        if (request.getPeriodLength() != null) {
            if (request.getPeriodLength() < 1) {
                throw new IllegalArgumentException("Period length must be at least 1 day");
            }
            existingCycle.setPeriodLength(request.getPeriodLength());
        }
        
        // Debug logging for update
        System.out.println("Updating menstrual cycle with data:");
        System.out.println("FlowLevel: " + request.getFlowLevel());
        
        // Cập nhật thông tin mới (có thể null)
        existingCycle.setFlowLevel(request.getFlowLevel());

        return menstrualCycleRepository.save(existingCycle);
    }

    @Transactional
    public void deleteMenstrualCycle(Long id) {
        if (!menstrualCycleRepository.existsById(id)) {
            throw new MenstrualCycleNotFoundException(id);
        }
        menstrualCycleRepository.deleteById(id);
    }    @Transactional
    public MenstrualCycle updateOrCreateMenstrualCycle(Long id, MenstrualCycleRequest request) {
        MenstrualCycle existingCycle = menstrualCycleRepository.findById(id)
                .orElseThrow(() -> new MenstrualCycleNotFoundException(id));
                
        // If userId is changing, verify the new user exists
        if (request.getUserId() != null && !request.getUserId().equals(existingCycle.getUser().getUserID())) {
            Users newUser = userRepository.findById(request.getUserId().intValue())
                    .orElseThrow(() -> new AccountNotFoundException("User not found with ID: " + request.getUserId()));
            
            // If the new user already has a menstrual cycle, get it and update it instead
            // First fetch the existing cycle for the target user
            if (menstrualCycleRepository.existsByUser_UserID(request.getUserId())) {
                // Delete the current cycle being updated as we'll use the target user's cycle instead
                menstrualCycleRepository.deleteById(existingCycle.getId());
                
                // Get the target user's cycle
                MenstrualCycle targetUserCycle = menstrualCycleRepository.findFirstByUser_UserID(request.getUserId())
                        .orElseThrow(() -> new MenstrualCycleNotFoundException("No menstrual cycle found for user with ID: " + request.getUserId()));
                
                // Update the target user's cycle with new values
                if (request.getStartDate() != null) {
                    targetUserCycle.setStartDate(request.getStartDate());
                }
                
                if (request.getEndDate() != null) {
                    targetUserCycle.setEndDate(request.getEndDate());
                }
                
                if (request.getCycleLength() != null) {
                    if (request.getCycleLength() < 1) {
                        throw new IllegalArgumentException("Cycle length must be at least 1 day");
                    }
                    targetUserCycle.setCycleLength(request.getCycleLength());
                }
                
                if (request.getPeriodLength() != null) {
                    if (request.getPeriodLength() < 1) {
                        throw new IllegalArgumentException("Period length must be at least 1 day");
                    }
                    targetUserCycle.setPeriodLength(request.getPeriodLength());
                }
                
                // Validate dates
                validateDates(targetUserCycle.getStartDate(), targetUserCycle.getEndDate());
                
                return menstrualCycleRepository.save(targetUserCycle);
            }
            
            // If user doesn't have a cycle yet, continue with updating the current cycle
            existingCycle.setUser(newUser);
        }
        
        // Determine the start and end dates for validation
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : existingCycle.getStartDate();
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : existingCycle.getEndDate();
        
        // Validate dates
        validateDates(startDate, endDate);

        if (request.getStartDate() != null) {
            existingCycle.setStartDate(request.getStartDate());
        }
        
        if (request.getEndDate() != null) {
            existingCycle.setEndDate(request.getEndDate());
        }
        
        if (request.getCycleLength() != null) {
            if (request.getCycleLength() < 1) {
                throw new IllegalArgumentException("Cycle length must be at least 1 day");
            }
            existingCycle.setCycleLength(request.getCycleLength());
        }
        
        if (request.getPeriodLength() != null) {
            if (request.getPeriodLength() < 1) {
                throw new IllegalArgumentException("Period length must be at least 1 day");
            }
            existingCycle.setPeriodLength(request.getPeriodLength());
        }

        return menstrualCycleRepository.save(existingCycle);
    }
    
    @Transactional
    public MenstrualCycle updateOrCreateMenstrualCycleForUser(Long userId, MenstrualCycleRequest request) {
        // Make sure the userId in the request matches the parameter
        if (request.getUserId() == null || !request.getUserId().equals(userId)) {
            request.setUserId(userId);
        }
        
        try {
            // Check if the user exists
            Users user = userRepository.findById(userId.intValue())
                    .orElseThrow(() -> new AccountNotFoundException("User not found with ID: " + userId));
            
            // Check if the user already has a menstrual cycle
            if (menstrualCycleRepository.existsByUser_UserID(userId)) {
                // If yes, update it
                MenstrualCycle existingCycle = menstrualCycleRepository.findFirstByUser_UserID(userId)
                        .orElseThrow(() -> new MenstrualCycleNotFoundException("No menstrual cycle found for user with ID: " + userId));
                
                // Validate dates
                LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : existingCycle.getStartDate();
                LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : existingCycle.getEndDate();
                validateDates(startDate, endDate);
                
                // Update fields
                if (request.getStartDate() != null) {
                    existingCycle.setStartDate(request.getStartDate());
                }
                
                if (request.getEndDate() != null) {
                    existingCycle.setEndDate(request.getEndDate());
                }
                
                if (request.getCycleLength() != null) {
                    if (request.getCycleLength() < 1) {
                        throw new IllegalArgumentException("Cycle length must be at least 1 day");
                    }
                    existingCycle.setCycleLength(request.getCycleLength());
                }
                
                if (request.getPeriodLength() != null) {
                    if (request.getPeriodLength() < 1) {
                        throw new IllegalArgumentException("Period length must be at least 1 day");
                    }
                    existingCycle.setPeriodLength(request.getPeriodLength());
                }
                
                // Add flowLevel update
                if (request.getFlowLevel() != null) {
                    existingCycle.setFlowLevel(request.getFlowLevel());
                }
                
                return menstrualCycleRepository.save(existingCycle);
            } else {
                // If no, create a new one
                validateDates(request.getStartDate(), request.getEndDate());
                
                MenstrualCycle menstrualCycle = new MenstrualCycle();
                menstrualCycle.setUser(user);
                menstrualCycle.setStartDate(request.getStartDate());
                menstrualCycle.setEndDate(request.getEndDate());
                menstrualCycle.setCycleLength(request.getCycleLength());
                menstrualCycle.setPeriodLength(request.getPeriodLength());
                
                // Add flowLevel for new records
                if (request.getFlowLevel() != null) {
                    menstrualCycle.setFlowLevel(request.getFlowLevel());
                }
                
                return menstrualCycleRepository.save(menstrualCycle);
            }
        } catch (AccountNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error updating or creating menstrual cycle: " + e.getMessage(), e);
        }
    }
}
