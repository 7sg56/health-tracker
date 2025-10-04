package com.healthtracker.htbackend.repository;

import com.healthtracker.htbackend.entity.DailyHealthIndex;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for DailyHealthIndex entity operations.
 * Provides methods for finding health index by user and date with unique constraint handling.
 */
@Repository
public interface DailyHealthIndexRepository extends JpaRepository<DailyHealthIndex, Long> {
    
    /**
     * Find health index by user ID and specific date.
     * This method respects the unique constraint on (user_id, date).
     * @param userId the user ID
     * @param date the specific date
     * @return Optional containing the health index if found
     */
    Optional<DailyHealthIndex> findByUserIdAndDate(Long userId, LocalDate date);
    
    /**
     * Find all health indices for a user with pagination, ordered by date descending.
     * @param userId the user ID
     * @param pageable pagination information
     * @return paginated health index entries
     */
    Page<DailyHealthIndex> findByUserIdOrderByDateDesc(Long userId, Pageable pageable);
    
    /**
     * Find health indices for a user within a date range with pagination.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @param pageable pagination information
     * @return paginated health index entries within date range
     */
    Page<DailyHealthIndex> findByUserIdAndDateBetweenOrderByDateDesc(
            Long userId, 
            LocalDate startDate, 
            LocalDate endDate, 
            Pageable pageable
    );
    
    /**
     * Find health indices for a user from a specific date onwards.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param pageable pagination information
     * @return paginated health index entries from start date
     */
    Page<DailyHealthIndex> findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
            Long userId, 
            LocalDate startDate, 
            Pageable pageable
    );
    
    /**
     * Find health indices for a user up to a specific date.
     * @param userId the user ID
     * @param endDate the end date (inclusive)
     * @param pageable pagination information
     * @return paginated health index entries up to end date
     */
    Page<DailyHealthIndex> findByUserIdAndDateLessThanEqualOrderByDateDesc(
            Long userId, 
            LocalDate endDate, 
            Pageable pageable
    );
    
    /**
     * Find health indices within a score range for a user.
     * @param userId the user ID
     * @param minScore minimum health score (inclusive)
     * @param maxScore maximum health score (inclusive)
     * @param pageable pagination information
     * @return paginated health index entries within score range
     */
    Page<DailyHealthIndex> findByUserIdAndHealthScoreBetweenOrderByDateDesc(
            Long userId, 
            Float minScore, 
            Float maxScore, 
            Pageable pageable
    );
    
    /**
     * Find the latest health index entry for a user.
     * @param userId the user ID
     * @return Optional containing the most recent health index entry
     */
    Optional<DailyHealthIndex> findFirstByUserIdOrderByDateDesc(Long userId);
    
    /**
     * Calculate average health score for a user within a date range.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return average health score, or null if no entries
     */
    @Query("SELECT AVG(d.healthScore) FROM DailyHealthIndex d WHERE d.user.id = :userId AND d.date BETWEEN :startDate AND :endDate")
    Float getAverageHealthScoreByUserAndDateRange(
            @Param("userId") Long userId, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate
    );
    
    /**
     * Find the highest health score for a user within a date range.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return maximum health score, or null if no entries
     */
    @Query("SELECT MAX(d.healthScore) FROM DailyHealthIndex d WHERE d.user.id = :userId AND d.date BETWEEN :startDate AND :endDate")
    Float getMaxHealthScoreByUserAndDateRange(
            @Param("userId") Long userId, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate
    );
    
    /**
     * Find the lowest health score for a user within a date range.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return minimum health score, or null if no entries
     */
    @Query("SELECT MIN(d.healthScore) FROM DailyHealthIndex d WHERE d.user.id = :userId AND d.date BETWEEN :startDate AND :endDate")
    Float getMinHealthScoreByUserAndDateRange(
            @Param("userId") Long userId, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate
    );
    
    /**
     * Count the number of days with health scores above a threshold for a user.
     * @param userId the user ID
     * @param threshold the health score threshold
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return count of days with scores above threshold
     */
    @Query("SELECT COUNT(d) FROM DailyHealthIndex d WHERE d.user.id = :userId AND d.healthScore > :threshold AND d.date BETWEEN :startDate AND :endDate")
    Long countDaysAboveThreshold(
            @Param("userId") Long userId, 
            @Param("threshold") Float threshold,
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate
    );
    
    /**
     * Check if a health index entry exists for a user on a specific date.
     * This is useful for handling the unique constraint.
     * @param userId the user ID
     * @param date the specific date
     * @return true if an entry exists, false otherwise
     */
    boolean existsByUserIdAndDate(Long userId, LocalDate date);
    
    /**
     * Find all health indices for a user on specific dates.
     * @param userId the user ID
     * @param dates list of dates to search for
     * @return list of health index entries for the specified dates
     */
    List<DailyHealthIndex> findByUserIdAndDateIn(Long userId, List<LocalDate> dates);
}