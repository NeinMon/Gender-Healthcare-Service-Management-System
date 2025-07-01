package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.TestBookingInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TestBookingInfoRepository extends JpaRepository<TestBookingInfo, Integer> {
    
    // Tìm theo booking ID
    Optional<TestBookingInfo> findByBookingId(Integer bookingId);
    
    // Tìm theo user ID
    List<TestBookingInfo> findByUserId(Integer userId);
    
    // Tìm theo trạng thái
    List<TestBookingInfo> findByTestStatus(String testStatus);
    
    // Tìm theo số điện thoại (không cần nữa vì đã có userId)
    // List<TestBookingInfo> findByPhone(String phone);
    
    // Tìm theo staff ID
    List<TestBookingInfo> findByStaffId(Integer staffId);
    
    // Tìm theo trạng thái và staff ID
    List<TestBookingInfo> findByTestStatusAndStaffId(String testStatus, Integer staffId);
    
    // Tìm tất cả booking đã checkin trong khoảng thời gian
    @Query("SELECT tbi FROM TestBookingInfo tbi WHERE tbi.checkinTime BETWEEN :startTime AND :endTime")
    List<TestBookingInfo> findByCheckinTimeBetween(@Param("startTime") LocalDateTime startTime, 
                                                   @Param("endTime") LocalDateTime endTime);
    
    // Tìm tất cả booking đã checkout trong khoảng thời gian
    @Query("SELECT tbi FROM TestBookingInfo tbi WHERE tbi.checkoutTime BETWEEN :startTime AND :endTime")
    List<TestBookingInfo> findByCheckoutTimeBetween(@Param("startTime") LocalDateTime startTime, 
                                                    @Param("endTime") LocalDateTime endTime);
    
    // Kiểm tra tồn tại booking info theo booking ID
    boolean existsByBookingId(Integer bookingId);
    
    // Tìm booking chưa checkout (đã checkin nhưng chưa checkout)
    @Query("SELECT tbi FROM TestBookingInfo tbi WHERE tbi.testStatus = 'Đã check-in' OR tbi.testStatus = 'Đang thực hiện'")
    List<TestBookingInfo> findPendingCheckout();
    
    // Thống kê theo trạng thái
    @Query("SELECT tbi.testStatus, COUNT(tbi) FROM TestBookingInfo tbi GROUP BY tbi.testStatus")
    List<Object[]> countByTestStatus();
}
