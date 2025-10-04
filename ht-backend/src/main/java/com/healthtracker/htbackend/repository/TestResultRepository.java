package com.healthtracker.htbackend.repository;

import com.healthtracker.htbackend.dto.PaginatedResponse;
import com.healthtracker.testing.reporting.TestReport;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TestResultRepository {
    
    void save(TestReport report);
    
    Optional<TestReport> findById(String testId);
    
    PaginatedResponse<TestReport> findWithFilters(
            String testType, 
            String status, 
            LocalDateTime startDate, 
            LocalDateTime endDate, 
            Pageable pageable
    );
    
    int deleteOldResults(LocalDateTime cutoffDate, String testType);
}