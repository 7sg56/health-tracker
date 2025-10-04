package com.healthtracker.htbackend.repository;

import com.healthtracker.htbackend.entity.Workout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Workout entity operations.
 * Provides methods for pagination, date range filtering, sorting, and user-specific queries.
 */
@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    
    /**
     * Find all workout entries for a user with pagination, ordered by date descending.
     * @param userId the user ID
     * @param pageable pagination information
     * @return paginated workout entries
     */
    Page<Workout> findByUserIdOrderByDateDesc(Long userId, Pageable pageable);
    
    /**
     * Find workout entries for a user within a date range with pagination.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @param pageable pagination information
     * @return paginated workout entries within date range
     */
    Page<Workout> findByUserIdAndDateBetweenOrderByDateDesc(
            Long userId, 
            LocalDate startDate, 
            LocalDate endDate, 
            Pageable pageable
    );
    
    /**
     * Find all workout entries for a user on a specific date.
     * @param userId the user ID
     * @param date the specific date
     * @return list of workout entries for the date
     */
    List<Workout> findByUserIdAndDate(Long userId, LocalDate date);
    
    /**
     * Find workout entries for a user from a specific date onwards.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param pageable pagination information
     * @return paginated workout entries from start date
     */
    Page<Workout> findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
            Long userId, 
            LocalDate startDate, 
            Pageable pageable
    );
    
    /**
     * Find workout entries for a user up to a specific date.
     * @param userId the user ID
     * @param endDate the end date (inclusive)
     * @param pageable pagination information
     * @return paginated workout entries up to end date
     */
    Page<Workout> findByUserIdAndDateLessThanEqualOrderByDateDesc(
            Long userId, 
            LocalDate endDate, 
            Pageable pageable
    );
    
    /**
     * Find workout entries ordered by duration descending.
     * @param userId the user ID
     * @param pageable pagination information
     * @return paginated workout entries ordered by duration
     */
    Page<Workout> findByUserIdOrderByDurationMinDesc(Long userId, Pageable pageable);
    
    /**
     * Find workout entries ordered by duration ascending.
     * @param userId the user ID
     * @param pageable pagination information
     * @return paginated workout entries ordered by duration
     */
    Page<Workout> findByUserIdOrderByDurationMinAsc(Long userId, Pageable pageable);
    
    /**
     * Find workout entries ordered by calories burned descending.
     * @param userId the user ID
     * @param pageable pagination information
     * @return paginated workout entries ordered by calories burned
     */
    Page<Workout> findByUserIdOrderByCaloriesBurnedDesc(Long userId, Pageable pageable);
    
    /**
     * Calculate total workout duration for a user on a specific date.
     * @param userId the user ID
     * @param date the specific date
     * @return total duration in minutes, or 0 if no entries
     */
    @Query("SELECT COALESCE(SUM(w.durationMin), 0) FROM Workout w WHERE w.user.id = :userId AND w.date = :date")
    Integer getTotalDurationByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    /**
     * Calculate total calories burned for a user on a specific date.
     * @param userId the user ID
     * @param date the specific date
     * @return total calories burned, or 0 if no entries or null values
     */
    @Query("SELECT COALESCE(SUM(w.caloriesBurned), 0) FROM Workout w WHERE w.user.id = :userId AND w.date = :date AND w.caloriesBurned IS NOT NULL")
    Integer getTotalCaloriesBurnedByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    /**
     * Find workout entries by activity name (case-insensitive partial match).
     * @param userId the user ID
     * @param activity the activity name to search for
     * @param pageable pagination information
     * @return paginated workout entries matching the activity
     */
    Page<Workout> findByUserIdAndActivityContainingIgnoreCaseOrderByDateDesc(
            Long userId, 
            String activity, 
            Pageable pageable
    );
    
    /**
     * Find workout entries within a duration range.
     * @param userId the user ID
     * @param minDuration minimum duration in minutes (inclusive)
     * @param maxDuration maximum duration in minutes (inclusive)
     * @param pageable pagination information
     * @return paginated workout entries within duration range
     */
    Page<Workout> findByUserIdAndDurationMinBetweenOrderByDateDesc(
            Long userId, 
            Integer minDuration, 
            Integer maxDuration, 
            Pageable pageable
    );
    
    /**
     * Find workout entries within a calories burned range.
     * @param userId the user ID
     * @param minCalories minimum calories burned (inclusive)
     * @param maxCalories maximum calories burned (inclusive)
     * @param pageable pagination information
     * @return paginated workout entries within calories range
     */
    Page<Workout> findByUserIdAndCaloriesBurnedBetweenOrderByDateDesc(
            Long userId, 
            Integer minCalories, 
            Integer maxCalories, 
            Pageable pageable
    );
    
    /**
     * Find workouts with calories burned data only.
     * @param userId the user ID
     * @param pageable pagination information
     * @return paginated workout entries that have calories burned data
     */
    Page<Workout> findByUserIdAndCaloriesBurnedIsNotNullOrderByDateDesc(Long userId, Pageable pageable);
    
    /**
     * Count workout entries for multiple users (for test data management).
     * @param userIds list of user IDs
     * @return count of workout entries
     */
    long countByUserIdIn(List<Long> userIds);
    
    /**
     * Delete workout entries for a specific user (for test data cleanup).
     * @param userId the user ID
     * @return number of deleted entries
     */
    long deleteByUserId(Long userId);
    
    /**
     * Delete workout entries for multiple users (for test data cleanup).
     * @param userIds list of user IDs
     * @return number of deleted entries
     */
    long deleteByUserIdIn(List<Long> userIds);
}