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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for HealthScoreService.
 * Tests all calculation methods and health score operations.
 */
@ExtendWith(MockitoExtension.class)
class HealthScoreServiceTest {

    @Mock
    private DailyHealthIndexRepository dailyHealthIndexRepository;
    
    @Mock
    private WaterIntakeRepository waterIntakeRepository;
    
    @Mock
    private FoodIntakeRepository foodIntakeRepository;
    
    @Mock
    private WorkoutRepository workoutRepository;
    
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private HealthScoreService healthScoreService;

    private User testUser;
    private LocalDate testDate;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setCreatedAt(LocalDateTime.now());
        
        testDate = LocalDate.of(2024, 1, 15);
    }

    // Water Score Calculation Tests

    @Test
    void calculateWaterScore_WithTargetIntake_ShouldReturn100() {
        // Arrange
        Long userId = 1L;
        when(waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, testDate))
                .thenReturn(2.5f);

        // Act
        float score = healthScoreService.calculateWaterScore(userId, testDate);

        // Assert
        assertEquals(100.0f, score, 0.01f);
        verify(waterIntakeRepository).getTotalWaterIntakeByUserAndDate(userId, testDate);
    }

    @Test
    void calculateWaterScore_WithHalfTargetIntake_ShouldReturn50() {
        // Arrange
        Long userId = 1L;
        when(waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, testDate))
                .thenReturn(1.25f);

        // Act
        float score = healthScoreService.calculateWaterScore(userId, testDate);

        // Assert
        assertEquals(50.0f, score, 0.01f);
    }

    @Test
    void calculateWaterScore_WithExcessiveIntake_ShouldCapAt100() {
        // Arrange
        Long userId = 1L;
        when(waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, testDate))
                .thenReturn(5.0f); // Double the target

        // Act
        float score = healthScoreService.calculateWaterScore(userId, testDate);

        // Assert
        assertEquals(100.0f, score, 0.01f);
    }

    @Test
    void calculateWaterScore_WithNoIntake_ShouldReturn0() {
        // Arrange
        Long userId = 1L;
        when(waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, testDate))
                .thenReturn(0.0f);

        // Act
        float score = healthScoreService.calculateWaterScore(userId, testDate);

        // Assert
        assertEquals(0.0f, score, 0.01f);
    }

    @Test
    void calculateWaterScore_WithNullIntake_ShouldReturn0() {
        // Arrange
        Long userId = 1L;
        when(waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, testDate))
                .thenReturn(null);

        // Act
        float score = healthScoreService.calculateWaterScore(userId, testDate);

        // Assert
        assertEquals(0.0f, score, 0.01f);
    }

    // Calorie Score Calculation Tests

    @Test
    void calculateCalorieScore_WithTargetCalories_ShouldReturn100() {
        // Arrange
        Long userId = 1L;
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(2000);

        // Act
        float score = healthScoreService.calculateCalorieScore(userId, testDate);

        // Assert
        assertEquals(100.0f, score, 0.01f);
        verify(foodIntakeRepository).getTotalCaloriesByUserAndDate(userId, testDate);
    }

    @Test
    void calculateCalorieScore_With100CaloriesOver_ShouldReturn95() {
        // Arrange
        Long userId = 1L;
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(2100); // 100 calories over target

        // Act
        float score = healthScoreService.calculateCalorieScore(userId, testDate);

        // Assert
        // Score = 100 - (100 / 20) = 100 - 5 = 95
        assertEquals(95.0f, score, 0.01f);
    }

    @Test
    void calculateCalorieScore_With100CaloriesUnder_ShouldReturn95() {
        // Arrange
        Long userId = 1L;
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(1900); // 100 calories under target

        // Act
        float score = healthScoreService.calculateCalorieScore(userId, testDate);

        // Assert
        // Score = 100 - (100 / 20) = 100 - 5 = 95
        assertEquals(95.0f, score, 0.01f);
    }

    @Test
    void calculateCalorieScore_WithExtremeDeviation_ShouldReturn0() {
        // Arrange
        Long userId = 1L;
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(4000); // 2000 calories over target

        // Act
        float score = healthScoreService.calculateCalorieScore(userId, testDate);

        // Assert
        // Score = 100 - (2000 / 20) = 100 - 100 = 0, but max(0, result)
        assertEquals(0.0f, score, 0.01f);
    }

    @Test
    void calculateCalorieScore_WithNoCalories_ShouldReturn0() {
        // Arrange
        Long userId = 1L;
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(0);

        // Act
        float score = healthScoreService.calculateCalorieScore(userId, testDate);

        // Assert
        assertEquals(0.0f, score, 0.01f);
    }

    @Test
    void calculateCalorieScore_WithNullCalories_ShouldReturn0() {
        // Arrange
        Long userId = 1L;
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(null);

        // Act
        float score = healthScoreService.calculateCalorieScore(userId, testDate);

        // Assert
        assertEquals(0.0f, score, 0.01f);
    }

    // Exercise Score Calculation Tests

    @Test
    void calculateExerciseScore_WithTargetDuration_ShouldReturn100() {
        // Arrange
        Long userId = 1L;
        when(workoutRepository.getTotalDurationByUserAndDate(userId, testDate))
                .thenReturn(30);

        // Act
        float score = healthScoreService.calculateExerciseScore(userId, testDate);

        // Assert
        assertEquals(100.0f, score, 0.01f);
        verify(workoutRepository).getTotalDurationByUserAndDate(userId, testDate);
    }

    @Test
    void calculateExerciseScore_WithHalfTargetDuration_ShouldReturn50() {
        // Arrange
        Long userId = 1L;
        when(workoutRepository.getTotalDurationByUserAndDate(userId, testDate))
                .thenReturn(15);

        // Act
        float score = healthScoreService.calculateExerciseScore(userId, testDate);

        // Assert
        assertEquals(50.0f, score, 0.01f);
    }

    @Test
    void calculateExerciseScore_WithExcessiveDuration_ShouldCapAt100() {
        // Arrange
        Long userId = 1L;
        when(workoutRepository.getTotalDurationByUserAndDate(userId, testDate))
                .thenReturn(60); // Double the target

        // Act
        float score = healthScoreService.calculateExerciseScore(userId, testDate);

        // Assert
        assertEquals(100.0f, score, 0.01f);
    }

    @Test
    void calculateExerciseScore_WithNoDuration_ShouldReturn0() {
        // Arrange
        Long userId = 1L;
        when(workoutRepository.getTotalDurationByUserAndDate(userId, testDate))
                .thenReturn(0);

        // Act
        float score = healthScoreService.calculateExerciseScore(userId, testDate);

        // Assert
        assertEquals(0.0f, score, 0.01f);
    }

    @Test
    void calculateExerciseScore_WithNullDuration_ShouldReturn0() {
        // Arrange
        Long userId = 1L;
        when(workoutRepository.getTotalDurationByUserAndDate(userId, testDate))
                .thenReturn(null);

        // Act
        float score = healthScoreService.calculateExerciseScore(userId, testDate);

        // Assert
        assertEquals(0.0f, score, 0.01f);
    }

    // Overall Health Score Calculation Tests

    @Test
    void calculateOverallHealthScore_WithPerfectScores_ShouldReturn100() {
        // Arrange
        Long userId = 1L;
        when(waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, testDate))
                .thenReturn(2.5f);
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(2000);
        when(workoutRepository.getTotalDurationByUserAndDate(userId, testDate))
                .thenReturn(30);

        // Act
        float score = healthScoreService.calculateOverallHealthScore(userId, testDate);

        // Assert
        // Expected: (100 * 0.30) + (100 * 0.40) + (100 * 0.30) = 30 + 40 + 30 = 100
        assertEquals(100.0f, score, 0.01f);
    }

    @Test
    void calculateOverallHealthScore_WithMixedScores_ShouldReturnWeightedAverage() {
        // Arrange
        Long userId = 1L;
        when(waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, testDate))
                .thenReturn(1.25f); // 50% score
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(1900); // 95% score (100 calories under)
        when(workoutRepository.getTotalDurationByUserAndDate(userId, testDate))
                .thenReturn(15); // 50% score

        // Act
        float score = healthScoreService.calculateOverallHealthScore(userId, testDate);

        // Assert
        // Expected: (50 * 0.30) + (95 * 0.40) + (50 * 0.30) = 15 + 38 + 15 = 68
        assertEquals(68.0f, score, 0.01f);
    }

    @Test
    void calculateOverallHealthScore_WithZeroScores_ShouldReturn0() {
        // Arrange
        Long userId = 1L;
        when(waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, testDate))
                .thenReturn(0.0f);
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(0);
        when(workoutRepository.getTotalDurationByUserAndDate(userId, testDate))
                .thenReturn(0);

        // Act
        float score = healthScoreService.calculateOverallHealthScore(userId, testDate);

        // Assert
        assertEquals(0.0f, score, 0.01f);
    }

    // Health Score Retrieval and Storage Tests

    @Test
    void getHealthScore_WithExistingEntry_ShouldReturnStoredScore() {
        // Arrange
        Long userId = 1L;
        DailyHealthIndex existingIndex = new DailyHealthIndex();
        existingIndex.setId(1L);
        existingIndex.setUser(testUser);
        existingIndex.setDate(testDate);
        existingIndex.setHealthScore(85.5f);
        existingIndex.setCreatedAt(LocalDateTime.now());

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(dailyHealthIndexRepository.findByUserIdAndDate(userId, testDate))
                .thenReturn(Optional.of(existingIndex));

        // Act
        DailyHealthIndexResponseDto result = healthScoreService.getHealthScore(userId, testDate);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(testDate, result.getDate());
        assertEquals(85.5f, result.getHealthScore(), 0.01f);
        
        verify(userRepository).findById(userId);
        verify(dailyHealthIndexRepository).findByUserIdAndDate(userId, testDate);
        // Should not calculate new score since existing entry was found
        verify(waterIntakeRepository, never()).getTotalWaterIntakeByUserAndDate(any(), any());
    }

    @Test
    void getHealthScore_WithoutExistingEntry_ShouldCalculateAndStore() {
        // Arrange
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(dailyHealthIndexRepository.findByUserIdAndDate(userId, testDate))
                .thenReturn(Optional.empty());
        
        // Mock calculation data
        when(waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, testDate))
                .thenReturn(2.0f);
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(1800);
        when(workoutRepository.getTotalDurationByUserAndDate(userId, testDate))
                .thenReturn(25);

        DailyHealthIndex savedIndex = new DailyHealthIndex();
        savedIndex.setId(2L);
        savedIndex.setUser(testUser);
        savedIndex.setDate(testDate);
        savedIndex.setHealthScore(75.0f);
        savedIndex.setCreatedAt(LocalDateTime.now());

        when(dailyHealthIndexRepository.save(any(DailyHealthIndex.class)))
                .thenReturn(savedIndex);

        // Act
        DailyHealthIndexResponseDto result = healthScoreService.getHealthScore(userId, testDate);

        // Assert
        assertNotNull(result);
        assertEquals(2L, result.getId());
        assertEquals(testDate, result.getDate());
        assertEquals(75.0f, result.getHealthScore(), 0.01f);
        
        verify(userRepository).findById(userId);
        verify(dailyHealthIndexRepository).findByUserIdAndDate(userId, testDate);
        verify(dailyHealthIndexRepository).save(any(DailyHealthIndex.class));
    }

    @Test
    void getHealthScore_WithNonExistentUser_ShouldThrowException() {
        // Arrange
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> healthScoreService.getHealthScore(userId, testDate)
        );
        
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(userId);
        verify(dailyHealthIndexRepository, never()).findByUserIdAndDate(any(), any());
    }

    @Test
    void calculateHealthScore_ShouldAlwaysRecalculateAndStore() {
        // Arrange
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        
        // Mock calculation data for perfect scores
        when(waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, testDate))
                .thenReturn(2.5f);
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(2000);
        when(workoutRepository.getTotalDurationByUserAndDate(userId, testDate))
                .thenReturn(30);

        DailyHealthIndex savedIndex = new DailyHealthIndex();
        savedIndex.setId(3L);
        savedIndex.setUser(testUser);
        savedIndex.setDate(testDate);
        savedIndex.setHealthScore(100.0f);
        savedIndex.setCreatedAt(LocalDateTime.now());

        when(dailyHealthIndexRepository.findByUserIdAndDate(userId, testDate))
                .thenReturn(Optional.empty());
        when(dailyHealthIndexRepository.save(any(DailyHealthIndex.class)))
                .thenReturn(savedIndex);

        // Act
        DailyHealthIndexResponseDto result = healthScoreService.calculateHealthScore(userId, testDate);

        // Assert
        assertNotNull(result);
        assertEquals(3L, result.getId());
        assertEquals(testDate, result.getDate());
        assertEquals(100.0f, result.getHealthScore(), 0.01f);
        
        verify(userRepository).findById(userId);
        verify(waterIntakeRepository).getTotalWaterIntakeByUserAndDate(userId, testDate);
        verify(foodIntakeRepository).getTotalCaloriesByUserAndDate(userId, testDate);
        verify(workoutRepository).getTotalDurationByUserAndDate(userId, testDate);
        verify(dailyHealthIndexRepository).save(any(DailyHealthIndex.class));
    }

    @Test
    void calculateHealthScore_WithExistingEntry_ShouldUpdateExistingRecord() {
        // Arrange
        Long userId = 1L;
        DailyHealthIndex existingIndex = new DailyHealthIndex();
        existingIndex.setId(1L);
        existingIndex.setUser(testUser);
        existingIndex.setDate(testDate);
        existingIndex.setHealthScore(50.0f); // Old score
        existingIndex.setCreatedAt(LocalDateTime.now().minusHours(1));

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(dailyHealthIndexRepository.findByUserIdAndDate(userId, testDate))
                .thenReturn(Optional.of(existingIndex));
        
        // Mock calculation data for better scores
        when(waterIntakeRepository.getTotalWaterIntakeByUserAndDate(userId, testDate))
                .thenReturn(2.5f);
        when(foodIntakeRepository.getTotalCaloriesByUserAndDate(userId, testDate))
                .thenReturn(2000);
        when(workoutRepository.getTotalDurationByUserAndDate(userId, testDate))
                .thenReturn(30);

        // Update the existing index with new score
        existingIndex.setHealthScore(100.0f);
        when(dailyHealthIndexRepository.save(existingIndex))
                .thenReturn(existingIndex);

        // Act
        DailyHealthIndexResponseDto result = healthScoreService.calculateHealthScore(userId, testDate);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId()); // Same ID as existing entry
        assertEquals(testDate, result.getDate());
        assertEquals(100.0f, result.getHealthScore(), 0.01f);
        
        verify(userRepository).findById(userId);
        verify(dailyHealthIndexRepository).findByUserIdAndDate(userId, testDate);
        verify(dailyHealthIndexRepository).save(existingIndex);
    }
}