package com.healthtracker.htbackend.service;

import com.healthtracker.htbackend.dto.WorkoutRequestDto;
import com.healthtracker.htbackend.dto.WorkoutResponseDto;
import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.entity.Workout;
import com.healthtracker.htbackend.exception.ResourceNotFoundException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.repository.UserRepository;
import com.healthtracker.htbackend.repository.WorkoutRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutServiceTest {

    @Mock
    private WorkoutRepository workoutRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WorkoutService workoutService;

    private User testUser;
    private User otherUser;
    private Workout testWorkout;
    private WorkoutRequestDto testRequestDto;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("otheruser");
        otherUser.setEmail("other@example.com");

        testWorkout = new Workout();
        testWorkout.setId(1L);
        testWorkout.setUser(testUser);
        testWorkout.setActivity("Running");
        testWorkout.setDurationMin(30);
        testWorkout.setCaloriesBurned(300);
        testWorkout.setDate(LocalDate.now());
        testWorkout.setCreatedAt(LocalDateTime.now());

        testRequestDto = new WorkoutRequestDto();
        testRequestDto.setActivity("Running");
        testRequestDto.setDurationMin(30);
        testRequestDto.setCaloriesBurned(300);
    }

    @Test
    void createWorkout_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(workoutRepository.save(any(Workout.class))).thenReturn(testWorkout);

        // Act
        WorkoutResponseDto result = workoutService.createWorkout(testRequestDto, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Running", result.getActivity());
        assertEquals(30, result.getDurationMin());
        assertEquals(300, result.getCaloriesBurned());
        assertEquals(LocalDate.now(), result.getDate());
        
        verify(userRepository).findById(1L);
        verify(workoutRepository).save(any(Workout.class));
    }

    @Test
    void createWorkout_WithoutCaloriesBurned_Success() {
        // Arrange
        WorkoutRequestDto requestWithoutCalories = new WorkoutRequestDto();
        requestWithoutCalories.setActivity("Yoga");
        requestWithoutCalories.setDurationMin(45);
        // caloriesBurned is null
        
        Workout workoutWithoutCalories = new Workout();
        workoutWithoutCalories.setId(2L);
        workoutWithoutCalories.setUser(testUser);
        workoutWithoutCalories.setActivity("Yoga");
        workoutWithoutCalories.setDurationMin(45);
        workoutWithoutCalories.setCaloriesBurned(null);
        workoutWithoutCalories.setDate(LocalDate.now());
        workoutWithoutCalories.setCreatedAt(LocalDateTime.now());
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(workoutRepository.save(any(Workout.class))).thenReturn(workoutWithoutCalories);

        // Act
        WorkoutResponseDto result = workoutService.createWorkout(requestWithoutCalories, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(2L, result.getId());
        assertEquals("Yoga", result.getActivity());
        assertEquals(45, result.getDurationMin());
        assertNull(result.getCaloriesBurned());
        
        verify(userRepository).findById(1L);
        verify(workoutRepository).save(any(Workout.class));
    }

    @Test
    void createWorkout_UserNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> workoutService.createWorkout(testRequestDto, 1L)
        );
        
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(workoutRepository, never()).save(any());
    }

    @Test
    void getWorkouts_WithoutDateFilter_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Workout> workoutPage = new PageImpl<>(Arrays.asList(testWorkout));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(workoutRepository.findByUserIdOrderByDateDesc(1L, pageable))
                .thenReturn(workoutPage);

        // Act
        Page<WorkoutResponseDto> result = workoutService.getWorkouts(1L, pageable, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1L, result.getContent().get(0).getId());
        assertEquals("Running", result.getContent().get(0).getActivity());
        assertEquals(30, result.getContent().get(0).getDurationMin());
        assertEquals(300, result.getContent().get(0).getCaloriesBurned());
        
        verify(userRepository).existsById(1L);
        verify(workoutRepository).findByUserIdOrderByDateDesc(1L, pageable);
    }

    @Test
    void getWorkouts_WithDateRange_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        Page<Workout> workoutPage = new PageImpl<>(Arrays.asList(testWorkout));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(workoutRepository.findByUserIdAndDateBetweenOrderByDateDesc(1L, startDate, endDate, pageable))
                .thenReturn(workoutPage);

        // Act
        Page<WorkoutResponseDto> result = workoutService.getWorkouts(1L, pageable, startDate, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        
        verify(userRepository).existsById(1L);
        verify(workoutRepository).findByUserIdAndDateBetweenOrderByDateDesc(1L, startDate, endDate, pageable);
    }

    @Test
    void getWorkouts_WithStartDateOnly_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate startDate = LocalDate.now().minusDays(7);
        Page<Workout> workoutPage = new PageImpl<>(Arrays.asList(testWorkout));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(workoutRepository.findByUserIdAndDateGreaterThanEqualOrderByDateDesc(1L, startDate, pageable))
                .thenReturn(workoutPage);

        // Act
        Page<WorkoutResponseDto> result = workoutService.getWorkouts(1L, pageable, startDate, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        
        verify(userRepository).existsById(1L);
        verify(workoutRepository).findByUserIdAndDateGreaterThanEqualOrderByDateDesc(1L, startDate, pageable);
    }

    @Test
    void getWorkouts_WithEndDateOnly_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate endDate = LocalDate.now();
        Page<Workout> workoutPage = new PageImpl<>(Arrays.asList(testWorkout));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(workoutRepository.findByUserIdAndDateLessThanEqualOrderByDateDesc(1L, endDate, pageable))
                .thenReturn(workoutPage);

        // Act
        Page<WorkoutResponseDto> result = workoutService.getWorkouts(1L, pageable, null, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        
        verify(userRepository).existsById(1L);
        verify(workoutRepository).findByUserIdAndDateLessThanEqualOrderByDateDesc(1L, endDate, pageable);
    }

    @Test
    void getWorkouts_UserNotFound() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.existsById(1L)).thenReturn(false);

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> workoutService.getWorkouts(1L, pageable, null, null)
        );
        
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).existsById(1L);
        verify(workoutRepository, never()).findByUserIdOrderByDateDesc(any(), any());
    }

    @Test
    void updateWorkout_Success() {
        // Arrange
        WorkoutRequestDto updateDto = new WorkoutRequestDto("Swimming", 60, 400);
        Workout updatedWorkout = new Workout();
        updatedWorkout.setId(1L);
        updatedWorkout.setUser(testUser);
        updatedWorkout.setActivity("Swimming");
        updatedWorkout.setDurationMin(60);
        updatedWorkout.setCaloriesBurned(400);
        updatedWorkout.setDate(LocalDate.now());
        updatedWorkout.setCreatedAt(LocalDateTime.now());
        
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(testWorkout));
        when(workoutRepository.save(any(Workout.class))).thenReturn(updatedWorkout);

        // Act
        WorkoutResponseDto result = workoutService.updateWorkout(1L, updateDto, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Swimming", result.getActivity());
        assertEquals(60, result.getDurationMin());
        assertEquals(400, result.getCaloriesBurned());
        
        verify(workoutRepository).findById(1L);
        verify(workoutRepository).save(any(Workout.class));
    }

    @Test
    void updateWorkout_EntryNotFound() {
        // Arrange
        WorkoutRequestDto updateDto = new WorkoutRequestDto("Swimming", 60, 400);
        when(workoutRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> workoutService.updateWorkout(1L, updateDto, 1L)
        );
        
        assertEquals("Workout entry not found", exception.getMessage());
        verify(workoutRepository).findById(1L);
        verify(workoutRepository, never()).save(any());
    }

    @Test
    void updateWorkout_UnauthorizedUser() {
        // Arrange
        testWorkout.setUser(otherUser);
        WorkoutRequestDto updateDto = new WorkoutRequestDto("Swimming", 60, 400);
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(testWorkout));

        // Act & Assert
        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> workoutService.updateWorkout(1L, updateDto, 1L)
        );
        
        assertEquals("You can only update your own workout entries", exception.getMessage());
        verify(workoutRepository).findById(1L);
        verify(workoutRepository, never()).save(any());
    }

    @Test
    void deleteWorkout_Success() {
        // Arrange
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(testWorkout));

        // Act
        workoutService.deleteWorkout(1L, 1L);

        // Assert
        verify(workoutRepository).findById(1L);
        verify(workoutRepository).delete(testWorkout);
    }

    @Test
    void deleteWorkout_EntryNotFound() {
        // Arrange
        when(workoutRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> workoutService.deleteWorkout(1L, 1L)
        );
        
        assertEquals("Workout entry not found", exception.getMessage());
        verify(workoutRepository).findById(1L);
        verify(workoutRepository, never()).delete(any());
    }

    @Test
    void deleteWorkout_UnauthorizedUser() {
        // Arrange
        testWorkout.setUser(otherUser);
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(testWorkout));

        // Act & Assert
        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> workoutService.deleteWorkout(1L, 1L)
        );
        
        assertEquals("You can only delete your own workout entries", exception.getMessage());
        verify(workoutRepository).findById(1L);
        verify(workoutRepository, never()).delete(any());
    }

    @Test
    void getWorkoutById_Success() {
        // Arrange
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(testWorkout));

        // Act
        WorkoutResponseDto result = workoutService.getWorkoutById(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Running", result.getActivity());
        assertEquals(30, result.getDurationMin());
        assertEquals(300, result.getCaloriesBurned());
        
        verify(workoutRepository).findById(1L);
    }

    @Test
    void getWorkoutById_EntryNotFound() {
        // Arrange
        when(workoutRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> workoutService.getWorkoutById(1L, 1L)
        );
        
        assertEquals("Workout entry not found", exception.getMessage());
        verify(workoutRepository).findById(1L);
    }

    @Test
    void getWorkoutById_UnauthorizedUser() {
        // Arrange
        testWorkout.setUser(otherUser);
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(testWorkout));

        // Act & Assert
        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> workoutService.getWorkoutById(1L, 1L)
        );
        
        assertEquals("You can only access your own workout entries", exception.getMessage());
        verify(workoutRepository).findById(1L);
    }
}