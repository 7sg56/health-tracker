package com.healthtracker.htbackend.repository;

import com.healthtracker.htbackend.entity.WaterIntake;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for WaterIntake entity operations.
 * Provides methods for pagination, date filtering, and user-specific queries.
 */
@Repository
public interface WaterIntakeRepository extends JpaRepository<WaterIntake, Long> {
    
    /**
     * Find all water intake entries for a user with pagination, ordered by date descending.
     * @param userId the user ID
     * @param pageable pagination information
     * @return paginated water intake entries
     */
    Page<WaterIntake> findByUserIdOrderByDateDesc(Long userId, Pageable pageable);
    
    /**
     * Find water intake entries for a user within a date range with pagination.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @param pageable pagination information
     * @return paginated water intake entries within date range
     */
    Page<WaterIntake> findByUserIdAndDateBetweenOrderByDateDesc(
            Long userId, 
            LocalDate startDate, 
            LocalDate endDate, 
            Pageable pageable
    );
    
    /**
     * Find all water intake entries for a user on a specific date.
     * @param userId the user ID
     * @param date the specific date
     * @return list of water intake entries for the date
     */
    List<WaterIntake> findByUserIdAndDate(Long userId, LocalDate date);
    
    /**
     * Find water intake entries for a user from a specific date onwards.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param pageable pagination information
     * @return paginated water intake entries from start date
     */
    Page<WaterIntake> findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
            Long userId, 
            LocalDate startDate, 
            Pageable pageable
    );
    
    /**
     * Find water intake entries for a user up to a specific date.
     * @param userId the user ID
     * @param endDate the end date (inclusive)
     * @param pageable pagination information
     * @return paginated water intake entries up to end date
     */
    Page<WaterIntake> findByUserIdAndDateLessThanEqualOrderByDateDesc(
            Long userId, 
            LocalDate endDate, 
            Pageable pageable
    );
    
    /**
     * Calculate total water intake for a user on a specific date.
     * @param userId the user ID
     * @param date the specific date
     * @return total water intake in liters, or 0 if no entries
     */
    @Query("SELECT COALESCE(SUM(w.amountLtr), 0.0) FROM WaterIntake w WHERE w.user.id = :userId AND w.date = :date")
    Float getTotalWaterIntakeByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    /**
     * Count water intake entries for multiple users (for test data management).
     * @param userIds list of user IDs
     * @return count of water intake entries
     */
    long countByUserIdIn(List<Long> userIds);
    
    /**
     * Delete water intake entries for a specific user (for test data cleanup).
     * @param userId the user ID
     * @return number of deleted entries
     */
    long deleteByUserId(Long userId);
    
    /**
     * Delete water intake entries for multiple users (for test data cleanup).
     * @param userIds list of user IDs
     * @return number of deleted entries
     */
    long deleteByUserIdIn(List<Long> userIds);
}