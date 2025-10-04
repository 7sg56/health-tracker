package com.healthtracker.htbackend.repository;

import com.healthtracker.htbackend.entity.FoodIntake;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for FoodIntake entity operations.
 * Provides methods for pagination, date filtering, sorting, and user-specific queries.
 */
@Repository
public interface FoodIntakeRepository extends JpaRepository<FoodIntake, Long> {
    
    /**
     * Find all food intake entries for a user with pagination, ordered by date descending.
     * @param userId the user ID
     * @param pageable pagination information
     * @return paginated food intake entries
     */
    Page<FoodIntake> findByUserIdOrderByDateDesc(Long userId, Pageable pageable);
    
    /**
     * Find food intake entries for a user within a date range with pagination.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @param pageable pagination information
     * @return paginated food intake entries within date range
     */
    Page<FoodIntake> findByUserIdAndDateBetweenOrderByDateDesc(
            Long userId, 
            LocalDate startDate, 
            LocalDate endDate, 
            Pageable pageable
    );
    
    /**
     * Find all food intake entries for a user on a specific date.
     * @param userId the user ID
     * @param date the specific date
     * @return list of food intake entries for the date
     */
    List<FoodIntake> findByUserIdAndDate(Long userId, LocalDate date);
    
    /**
     * Find food intake entries for a user from a specific date onwards.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param pageable pagination information
     * @return paginated food intake entries from start date
     */
    Page<FoodIntake> findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
            Long userId, 
            LocalDate startDate, 
            Pageable pageable
    );
    
    /**
     * Find food intake entries for a user up to a specific date.
     * @param userId the user ID
     * @param endDate the end date (inclusive)
     * @param pageable pagination information
     * @return paginated food intake entries up to end date
     */
    Page<FoodIntake> findByUserIdAndDateLessThanEqualOrderByDateDesc(
            Long userId, 
            LocalDate endDate, 
            Pageable pageable
    );
    
    /**
     * Find food intake entries ordered by calories descending.
     * @param userId the user ID
     * @param pageable pagination information
     * @return paginated food intake entries ordered by calories
     */
    Page<FoodIntake> findByUserIdOrderByCaloriesDesc(Long userId, Pageable pageable);
    
    /**
     * Find food intake entries ordered by calories ascending.
     * @param userId the user ID
     * @param pageable pagination information
     * @return paginated food intake entries ordered by calories
     */
    Page<FoodIntake> findByUserIdOrderByCaloriesAsc(Long userId, Pageable pageable);
    
    /**
     * Calculate total calories for a user on a specific date.
     * @param userId the user ID
     * @param date the specific date
     * @return total calories, or 0 if no entries
     */
    @Query("SELECT COALESCE(SUM(f.calories), 0) FROM FoodIntake f WHERE f.user.id = :userId AND f.date = :date")
    Integer getTotalCaloriesByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    /**
     * Find food intake entries by food item name (case-insensitive partial match).
     * @param userId the user ID
     * @param foodItem the food item name to search for
     * @param pageable pagination information
     * @return paginated food intake entries matching the food item
     */
    Page<FoodIntake> findByUserIdAndFoodItemContainingIgnoreCaseOrderByDateDesc(
            Long userId, 
            String foodItem, 
            Pageable pageable
    );
    
    /**
     * Find food intake entries within a calorie range.
     * @param userId the user ID
     * @param minCalories minimum calories (inclusive)
     * @param maxCalories maximum calories (inclusive)
     * @param pageable pagination information
     * @return paginated food intake entries within calorie range
     */
    Page<FoodIntake> findByUserIdAndCaloriesBetweenOrderByDateDesc(
            Long userId, 
            Integer minCalories, 
            Integer maxCalories, 
            Pageable pageable
    );
    
    /**
     * Count food intake entries for multiple users (for test data management).
     * @param userIds list of user IDs
     * @return count of food intake entries
     */
    long countByUserIdIn(List<Long> userIds);
    
    /**
     * Delete food intake entries for a specific user (for test data cleanup).
     * @param userId the user ID
     * @return number of deleted entries
     */
    long deleteByUserId(Long userId);
    
    /**
     * Delete food intake entries for multiple users (for test data cleanup).
     * @param userIds list of user IDs
     * @return number of deleted entries
     */
    long deleteByUserIdIn(List<Long> userIds);
}