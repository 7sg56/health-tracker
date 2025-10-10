package com.healthtracker.htbackend.service;

import com.healthtracker.htbackend.dto.DailyHealthIndexResponseDto;
import com.healthtracker.htbackend.entity.DailyHealthIndex;
import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.exception.ResourceNotFoundException;
import com.healthtracker.htbackend.repository.DailyHealthIndexRepository;
import com.healthtracker.htbackend.repository.FoodIntakeRepository;
import com.healthtracker.htbackend.repository.UserRepository;
import com.healthtracker.htbackend.repository.WaterIntakeRepository;
import com.healthtracker.htbackend.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Service class for calculating and managing daily health scores.
 * Implements the health score calculation algorithm based on water intake, 
 * calorie consumption, and exercise activity.
 */
@Service
@Transactional
public class HealthScoreService {

    // Health score calculation constants
    // Targets for each metric
    private static final float TARGET_WATER_LITERS = 2.5f;    // Target daily water intake in liters
    private static final int TARGET_CALORIES = 2000;          // Target daily calorie intake
    private static final int TARGET_EXERCISE_MINUTES = 30;    // Target daily exercise in minutes

    private final DailyHealthIndexRepository dailyHealthIndexRepository;
    private final WaterIntakeRepository waterIntakeRepository;
    private final FoodIntakeRepository foodIntakeRepository;
    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;

    @Autowired
    public HealthScoreService(DailyHealthIndexRepository dailyHealthIndexRepository,
                             WaterIntakeRepository waterIntakeRepository,
                             FoodIntakeRepository foodIntakeRepository,
                             WorkoutRepository workoutRepository,
                             UserRepository userRepository) {
        this.dailyHealthIndexRepository = dailyHealthIndexRepository;
        this.waterIntakeRepository = waterIntakeRepository;
        this.foodIntakeRepository = foodIntakeRepository;
        this.workoutRepository = workoutRepository;
        this.userRepository = userRepository;
    }

    /**
     * Symmetric percent-completion around the target.
     * 100 at target; decreases linearly as you deviate; 0 at 0 or 200% of target.
     */
    private float symmetricCompletion(float actual, float target) {
        if (target <= 0) return 0.0f;
        float deviationRatio = Math.abs(actual - target) / target; // 0 at target, 1 at 0% or 200%
        float score = 100.0f - (deviationRatio * 100.0f);
        return Math.max(0.0f, score);
    }

    /**
     * Calculate water intake score based on daily consumption.
     * Formula: min(100, (actual_liters / 2.5) * 100)
     * 
     * @param userId the user ID
     * @param date the date to calculate for
     * @return water score (0-100)
     */
    public float calculateWaterScore(Long userId, LocalDate date) {
        Float totalWaterIntake = waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, date);
        if (totalWaterIntake == null || totalWaterIntake <= 0) {
            return 0.0f;
        }
        // Symmetric completion: 100 at target liters, decreases beyond target and when under
        return symmetricCompletion(totalWaterIntake, TARGET_WATER_LITERS);
    }

    /**
     * Calculate calorie balance score based on daily consumption.
     * Formula: max(0, 100 - abs(actual_calories - 2000) / 20)
     * 
     * @param userId the user ID
     * @param date the date to calculate for
     * @return calorie score (0-100)
     */
    public float calculateCalorieScore(Long userId, LocalDate date) {
        Integer totalCalories = foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, date);
        if (totalCalories == null || totalCalories <= 0) {
            return 0.0f;
        }
        // Symmetric completion around target calories: 100 at target, reduced if under or over
        return symmetricCompletion(totalCalories.floatValue(), TARGET_CALORIES);
    }

    /**
     * Calculate exercise score based on daily workout duration.
     * Formula: min(100, (actual_minutes / 30) * 100)
     * 
     * @param userId the user ID
     * @param date the date to calculate for
     * @return exercise score (0-100)
     */
    public float calculateExerciseScore(Long userId, LocalDate date) {
        Integer totalDuration = workoutRepository.getTotalDurationByUserAndDate(userId, date);
        if (totalDuration == null || totalDuration <= 0) {
            return 0.0f;
        }
        // Symmetric completion: 100 at target minutes, decreases if under or beyond
        return symmetricCompletion(totalDuration.floatValue(), TARGET_EXERCISE_MINUTES);
    }

    /**
     * Calculate the overall daily health score using weighted components.
     * 
     * @param userId the user ID
     * @param date the date to calculate for
     * @return overall health score (0-100)
     */
    public float calculateOverallHealthScore(Long userId, LocalDate date) {
        float waterScore = calculateWaterScore(userId, date);
        float calorieScore = calculateCalorieScore(userId, date);
        float exerciseScore = calculateExerciseScore(userId, date);
        
        // Simple average of the three component scores
        return (waterScore + calorieScore + exerciseScore) / 3.0f;
    }

    /**
     * Get or calculate health score for a specific date.
     * If the score doesn't exist, it will be calculated and stored.
     * 
     * @param userId the user ID
     * @param date the date to get/calculate score for
     * @return DailyHealthIndexResponseDto containing the health score
     * @throws ResourceNotFoundException if user is not found
     */
    public DailyHealthIndexResponseDto getHealthScore(Long userId, LocalDate date) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Always compute the latest score to avoid stale cached values
        float overallScore = calculateOverallHealthScore(userId, date);

        // Upsert: update existing or create new record for the date
        DailyHealthIndex healthIndex = dailyHealthIndexRepository
                .findByUserIdAndDate(userId, date)
                .orElse(new DailyHealthIndex());

        healthIndex.setUser(user);
        healthIndex.setDate(date);
        healthIndex.setHealthScore(overallScore);
        if (healthIndex.getId() == null) {
            healthIndex.setCreatedAt(java.time.LocalDateTime.now());
        }

        DailyHealthIndex saved = dailyHealthIndexRepository.save(healthIndex);
        return mapToDailyHealthIndexResponseDto(saved);
    }

    /**
     * Calculate health score for a specific date and store it in the database.
     * This method will update existing entries or create new ones.
     * 
     * @param userId the user ID
     * @param date the date to calculate score for
     * @return DailyHealthIndexResponseDto containing the calculated health score
     * @throws ResourceNotFoundException if user is not found
     */
    public DailyHealthIndexResponseDto calculateHealthScore(Long userId, LocalDate date) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        float overallScore = calculateOverallHealthScore(userId, date);
        
        // Check if entry already exists (handle unique constraint)
        DailyHealthIndex healthIndex = dailyHealthIndexRepository
                .findByUserIdAndDate(userId, date)
                .orElse(new DailyHealthIndex());
        
        // Set or update the health index data
        healthIndex.setUser(user);
        healthIndex.setDate(date);
        healthIndex.setHealthScore(overallScore);
        
        // Set created timestamp only for new entries
        if (healthIndex.getId() == null) {
            healthIndex.setCreatedAt(LocalDateTime.now());
        }
        
        // Save to database
        DailyHealthIndex savedHealthIndex = dailyHealthIndexRepository.save(healthIndex);
        
        return mapToDailyHealthIndexResponseDto(savedHealthIndex);
    }

    /**
     * Private helper method to calculate and store health score.
     * 
     * @param user the User entity
     * @param date the date to calculate for
     * @return DailyHealthIndexResponseDto containing the health score
     */
    private DailyHealthIndexResponseDto calculateAndStoreHealthScore(User user, LocalDate date) {
        float overallScore = calculateOverallHealthScore(user.getId(), date);
        
        // Create new health index entry
        DailyHealthIndex healthIndex = new DailyHealthIndex();
        healthIndex.setUser(user);
        healthIndex.setDate(date);
        healthIndex.setHealthScore(overallScore);
        healthIndex.setCreatedAt(LocalDateTime.now());
        
        // Save to database
        DailyHealthIndex savedHealthIndex = dailyHealthIndexRepository.save(healthIndex);
        
        return mapToDailyHealthIndexResponseDto(savedHealthIndex);
    }

    /**
     * Helper method to map DailyHealthIndex entity to DailyHealthIndexResponseDto.
     * 
     * @param healthIndex the DailyHealthIndex entity
     * @return DailyHealthIndexResponseDto
     */
    private DailyHealthIndexResponseDto mapToDailyHealthIndexResponseDto(DailyHealthIndex healthIndex) {
        return new DailyHealthIndexResponseDto(
                healthIndex.getId(),
                healthIndex.getDate(),
                healthIndex.getHealthScore(),
                healthIndex.getCreatedAt()
        );
    }
}