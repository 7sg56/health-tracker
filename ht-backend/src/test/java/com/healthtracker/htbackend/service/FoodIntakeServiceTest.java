package com.healthtracker.htbackend.service;

import com.healthtracker.htbackend.dto.FoodIntakeRequestDto;
import com.healthtracker.htbackend.dto.FoodIntakeResponseDto;
import com.healthtracker.htbackend.entity.FoodIntake;
import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.exception.ResourceNotFoundException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.repository.FoodIntakeRepository;
import com.healthtracker.htbackend.repository.UserRepository;
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
class FoodIntakeServiceTest {

    @Mock
    private FoodIntakeRepository foodIntakeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FoodIntakeService foodIntakeService;

    private User testUser;
    private User otherUser;
    private FoodIntake testFoodIntake;
    private FoodIntakeRequestDto testRequestDto;

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

        testFoodIntake = new FoodIntake();
        testFoodIntake.setId(1L);
        testFoodIntake.setUser(testUser);
        testFoodIntake.setFoodItem("Apple");
        testFoodIntake.setCalories(95);
        testFoodIntake.setDate(LocalDate.now());
        testFoodIntake.setCreatedAt(LocalDateTime.now());

        testRequestDto = new FoodIntakeRequestDto();
        testRequestDto.setFoodItem("Apple");
        testRequestDto.setCalories(95);
    }

    @Test
    void createFoodIntake_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(foodIntakeRepository.save(any(FoodIntake.class))).thenReturn(testFoodIntake);

        // Act
        FoodIntakeResponseDto result = foodIntakeService.createFoodIntake(testRequestDto, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Apple", result.getFoodItem());
        assertEquals(95, result.getCalories());
        assertEquals(LocalDate.now(), result.getDate());
        
        verify(userRepository).findById(1L);
        verify(foodIntakeRepository).save(any(FoodIntake.class));
    }

    @Test
    void createFoodIntake_UserNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> foodIntakeService.createFoodIntake(testRequestDto, 1L)
        );
        
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(foodIntakeRepository, never()).save(any());
    }

    @Test
    void getFoodIntakes_WithoutDateFilter_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<FoodIntake> foodIntakePage = new PageImpl<>(Arrays.asList(testFoodIntake));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(foodIntakeRepository.findByUserIdOrderByDateDesc(1L, pageable))
                .thenReturn(foodIntakePage);

        // Act
        Page<FoodIntakeResponseDto> result = foodIntakeService.getFoodIntakes(1L, pageable, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1L, result.getContent().get(0).getId());
        assertEquals("Apple", result.getContent().get(0).getFoodItem());
        assertEquals(95, result.getContent().get(0).getCalories());
        
        verify(userRepository).existsById(1L);
        verify(foodIntakeRepository).findByUserIdOrderByDateDesc(1L, pageable);
    }

    @Test
    void getFoodIntakes_WithDateRange_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        Page<FoodIntake> foodIntakePage = new PageImpl<>(Arrays.asList(testFoodIntake));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(foodIntakeRepository.findByUserIdAndDateBetweenOrderByDateDesc(1L, startDate, endDate, pageable))
                .thenReturn(foodIntakePage);

        // Act
        Page<FoodIntakeResponseDto> result = foodIntakeService.getFoodIntakes(1L, pageable, startDate, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        
        verify(userRepository).existsById(1L);
        verify(foodIntakeRepository).findByUserIdAndDateBetweenOrderByDateDesc(1L, startDate, endDate, pageable);
    }

    @Test
    void getFoodIntakes_WithStartDateOnly_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate startDate = LocalDate.now().minusDays(7);
        Page<FoodIntake> foodIntakePage = new PageImpl<>(Arrays.asList(testFoodIntake));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(foodIntakeRepository.findByUserIdAndDateGreaterThanEqualOrderByDateDesc(1L, startDate, pageable))
                .thenReturn(foodIntakePage);

        // Act
        Page<FoodIntakeResponseDto> result = foodIntakeService.getFoodIntakes(1L, pageable, startDate, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        
        verify(userRepository).existsById(1L);
        verify(foodIntakeRepository).findByUserIdAndDateGreaterThanEqualOrderByDateDesc(1L, startDate, pageable);
    }

    @Test
    void getFoodIntakes_WithEndDateOnly_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate endDate = LocalDate.now();
        Page<FoodIntake> foodIntakePage = new PageImpl<>(Arrays.asList(testFoodIntake));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(foodIntakeRepository.findByUserIdAndDateLessThanEqualOrderByDateDesc(1L, endDate, pageable))
                .thenReturn(foodIntakePage);

        // Act
        Page<FoodIntakeResponseDto> result = foodIntakeService.getFoodIntakes(1L, pageable, null, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        
        verify(userRepository).existsById(1L);
        verify(foodIntakeRepository).findByUserIdAndDateLessThanEqualOrderByDateDesc(1L, endDate, pageable);
    }

    @Test
    void getFoodIntakes_UserNotFound() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.existsById(1L)).thenReturn(false);

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> foodIntakeService.getFoodIntakes(1L, pageable, null, null)
        );
        
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).existsById(1L);
        verify(foodIntakeRepository, never()).findByUserIdOrderByDateDesc(any(), any());
    }

    @Test
    void updateFoodIntake_Success() {
        // Arrange
        FoodIntakeRequestDto updateDto = new FoodIntakeRequestDto("Banana", 105);
        FoodIntake updatedFoodIntake = new FoodIntake();
        updatedFoodIntake.setId(1L);
        updatedFoodIntake.setUser(testUser);
        updatedFoodIntake.setFoodItem("Banana");
        updatedFoodIntake.setCalories(105);
        updatedFoodIntake.setDate(LocalDate.now());
        updatedFoodIntake.setCreatedAt(LocalDateTime.now());
        
        when(foodIntakeRepository.findById(1L)).thenReturn(Optional.of(testFoodIntake));
        when(foodIntakeRepository.save(any(FoodIntake.class))).thenReturn(updatedFoodIntake);

        // Act
        FoodIntakeResponseDto result = foodIntakeService.updateFoodIntake(1L, updateDto, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Banana", result.getFoodItem());
        assertEquals(105, result.getCalories());
        
        verify(foodIntakeRepository).findById(1L);
        verify(foodIntakeRepository).save(any(FoodIntake.class));
    }

    @Test
    void updateFoodIntake_EntryNotFound() {
        // Arrange
        FoodIntakeRequestDto updateDto = new FoodIntakeRequestDto("Banana", 105);
        when(foodIntakeRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> foodIntakeService.updateFoodIntake(1L, updateDto, 1L)
        );
        
        assertEquals("Food intake entry not found", exception.getMessage());
        verify(foodIntakeRepository).findById(1L);
        verify(foodIntakeRepository, never()).save(any());
    }

    @Test
    void updateFoodIntake_UnauthorizedUser() {
        // Arrange
        testFoodIntake.setUser(otherUser);
        FoodIntakeRequestDto updateDto = new FoodIntakeRequestDto("Banana", 105);
        when(foodIntakeRepository.findById(1L)).thenReturn(Optional.of(testFoodIntake));

        // Act & Assert
        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> foodIntakeService.updateFoodIntake(1L, updateDto, 1L)
        );
        
        assertEquals("You can only update your own food intake entries", exception.getMessage());
        verify(foodIntakeRepository).findById(1L);
        verify(foodIntakeRepository, never()).save(any());
    }

    @Test
    void deleteFoodIntake_Success() {
        // Arrange
        when(foodIntakeRepository.findById(1L)).thenReturn(Optional.of(testFoodIntake));

        // Act
        foodIntakeService.deleteFoodIntake(1L, 1L);

        // Assert
        verify(foodIntakeRepository).findById(1L);
        verify(foodIntakeRepository).delete(testFoodIntake);
    }

    @Test
    void deleteFoodIntake_EntryNotFound() {
        // Arrange
        when(foodIntakeRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> foodIntakeService.deleteFoodIntake(1L, 1L)
        );
        
        assertEquals("Food intake entry not found", exception.getMessage());
        verify(foodIntakeRepository).findById(1L);
        verify(foodIntakeRepository, never()).delete(any());
    }

    @Test
    void deleteFoodIntake_UnauthorizedUser() {
        // Arrange
        testFoodIntake.setUser(otherUser);
        when(foodIntakeRepository.findById(1L)).thenReturn(Optional.of(testFoodIntake));

        // Act & Assert
        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> foodIntakeService.deleteFoodIntake(1L, 1L)
        );
        
        assertEquals("You can only delete your own food intake entries", exception.getMessage());
        verify(foodIntakeRepository).findById(1L);
        verify(foodIntakeRepository, never()).delete(any());
    }

    @Test
    void getFoodIntakeById_Success() {
        // Arrange
        when(foodIntakeRepository.findById(1L)).thenReturn(Optional.of(testFoodIntake));

        // Act
        FoodIntakeResponseDto result = foodIntakeService.getFoodIntakeById(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Apple", result.getFoodItem());
        assertEquals(95, result.getCalories());
        
        verify(foodIntakeRepository).findById(1L);
    }

    @Test
    void getFoodIntakeById_EntryNotFound() {
        // Arrange
        when(foodIntakeRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> foodIntakeService.getFoodIntakeById(1L, 1L)
        );
        
        assertEquals("Food intake entry not found", exception.getMessage());
        verify(foodIntakeRepository).findById(1L);
    }

    @Test
    void getFoodIntakeById_UnauthorizedUser() {
        // Arrange
        testFoodIntake.setUser(otherUser);
        when(foodIntakeRepository.findById(1L)).thenReturn(Optional.of(testFoodIntake));

        // Act & Assert
        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> foodIntakeService.getFoodIntakeById(1L, 1L)
        );
        
        assertEquals("You can only access your own food intake entries", exception.getMessage());
        verify(foodIntakeRepository).findById(1L);
    }
}