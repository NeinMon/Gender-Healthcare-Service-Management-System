package com.genderhealthcare.demo.repository;

import com.genderhealthcare.demo.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Integer> {
    
    // Find services by manager ID
    List<Service> findByManagerId(Integer managerId);
    
    // Find services by service name (case-insensitive)
    List<Service> findByServiceNameContainingIgnoreCase(String serviceName);

    // Find service by exact service name
    Service findByServiceName(String serviceName);


//    boolean existsByConsultantIdAndAppointmentDate(Integer consultantId, String appointmentDate);
}
