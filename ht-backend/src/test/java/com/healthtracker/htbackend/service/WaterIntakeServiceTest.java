package com.healthtracker.htbackend.service;

import com.healthtracker.htbackend.dto.WaterIntakeRequestDto;
import com.healthtracker.htbackend.dto.WaterIntakeResponseDto;
import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.entity.WaterIntake;
import com.healthtracker.htbackend.exception.ResourceNotFoundException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.repository.UserRepository;
import com.healthtracker.htbackend.repository.WaterIntakeRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WaterIntakeServiceTest {

    @Mock
    private WaterIntakeRepository waterIntakeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WaterIntakeService waterIntakeService;

    private User testUser;
    private WaterIntake testWaterIntake;
    private WaterIntakeRequestDto testRequestDto;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testWaterIntake = new WaterIntake();
        testWaterIntake.setId(1L);
        testWaterIntake.setUser(testUser);
        testWaterIntake.setAmountLtr(2.5f);
        testWaterIntake.setDate(LocalDate.now());
        testWaterIntake.setCreatedAt(LocalDateTime.now());

        testRequestDto = new WaterIntakeRequestDto();
        testRequestDto.setAmountLtr(2.5f);
    }

    @Test
    void createWaterIntake_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(waterIntakeRepository.save(any(WaterIntake.class))).thenReturn(testWaterIntake);

        // Act
        WaterIntakeResponseDto result = waterIntakeService.createWaterIntake(testRequestDto, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(2.5f, result.getAmountLtr());
        assertEquals(LocalDate.now(), result.getDate());
        
        verify(userRepository).findById(1L);
        verify(waterIntakeRepository).save(any(WaterIntake.class));
    }

    @Test
    void createWaterIntake_UserNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> waterIntakeService.createWaterIntake(testRequestDto, 1L)
        );
        
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(waterIntakeRepository, never()).save(any());
    }

    @Test
    void getWaterIntakes_WithoutDateFilter_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<WaterIntake> waterIntakePage = new PageImpl<>(Arrays.asList(testWaterIntake));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(waterIntakeRepository.findByUserIdOrderByDateDesc(1L, pageable))
                .thenReturn(waterIntakePage);

        // Act
        Page<WaterIntakeResponseDto> result = waterIntakeService.getWaterIntakes(1L, pageable, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1L, result.getContent().get(0).getId());
        assertEquals(2.5f, result.getContent().get(0).getAmountLtr());
        
        verify(userRepository).existsById(1L);
        verify(waterIntakeRepository).findByUserIdOrderByDateDesc(1L, pageable);
    }

    @Test
    void getWaterIntakes_WithDateRange_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        Page<WaterIntake> waterIntakePage = new PageImpl<>(Arrays.asList(testWaterIntake));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(waterIntakeRepository.findByUserIdAndDateBetweenOrderByDateDesc(1L, startDate, endDate, pageable))
                .thenReturn(waterIntakePage);

        // Act
        Page<WaterIntakeResponseDto> result = waterIntakeService.getWaterIntakes(1L, pageable, startDate, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        
        verify(userRepository).existsById(1L);
        verify(waterIntakeRepository).findByUserIdAndDateBetweenOrderByDateDesc(1L, startDate, endDate, pageable);
    }

    @Test
    void getWaterIntakes_WithStartDateOnly_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate startDate = LocalDate.now().minusDays(7);
        Page<WaterIntake> waterIntakePage = new PageImpl<>(Arrays.asList(testWaterIntake));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(waterIntakeRepository.findByUserIdAndDateGreaterThanEqualOrderByDateDesc(1L, startDate, pageable))
                .thenReturn(waterIntakePage);

        // Act
        Page<WaterIntakeResponseDto> result = waterIntakeService.getWaterIntakes(1L, pageable, startDate, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        
        verify(userRepository).existsById(1L);
        verify(waterIntakeRepository).findByUserIdAndDateGreaterThanEqualOrderByDateDesc(1L, startDate, pageable);
    }

    @Test
    void getWaterIntakes_WithEndDateOnly_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate endDate = LocalDate.now();
        Page<WaterIntake> waterIntakePage = new PageImpl<>(Arrays.asList(testWaterIntake));
        
        when(userRepository.existsById(1L)).thenReturn(true);
        when(waterIntakeRepository.findByUserIdAndDateLessThanEqualOrderByDateDesc(1L, endDate, pageable))
                .thenReturn(waterIntakePage);

        // Act
        Page<WaterIntakeResponseDto> result = waterIntakeService.getWaterIntakes(1L, pageable, null, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        
        verify(userRepository).existsById(1L);
        verify(waterIntakeRepository).findByUserIdAndDateLessThanEqualOrderByDateDesc(1L, endDate, pageable);
    }

    @Test
    void getWaterIntakes_UserNotFound() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.existsById(1L)).thenReturn(false);

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> waterIntakeService.getWaterIntakes(1L, pageable, null, null)
        );
        
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).existsById(1L);
        verify(waterIntakeRepository, never()).findByUserIdOrderByDateDesc(any(), any());
    }

    @Test
    void deleteWaterIntake_Success() {
        // Arrange
        when(waterIntakeRepository.findById(1L)).thenReturn(Optional.of(testWaterIntake));

        // Act
        waterIntakeService.deleteWaterIntake(1L, 1L);

        // Assert
        verify(waterIntakeRepository).findById(1L);
        verify(waterIntakeRepository).delete(testWaterIntake);
    }

    @Test
    void deleteWaterIntake_EntryNotFound() {
        // Arrange
        when(waterIntakeRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> waterIntakeService.deleteWaterIntake(1L, 1L)
        );
        
        assertEquals("Water intake entry not found", exception.getMessage());
        verify(waterIntakeRepository).findById(1L);
        verify(waterIntakeRepository, never()).delete(any());
    }

    @Test
    void deleteWaterIntake_UnauthorizedUser() {
        // Arrange
        User otherUser = new User();
        otherUser.setId(2L);
        testWaterIntake.setUser(otherUser);
        
        when(waterIntakeRepository.findById(1L)).thenReturn(Optional.of(testWaterIntake));

        // Act & Assert
        UnauthorizedException exception = assertThrows(
                UnauthorizedException.class,
                () -> waterIntakeService.deleteWaterIntake(1L, 1L)
        );
        
        assertEquals("You can only delete your own water intake entries", exception.getMessage());
        verify(waterIntakeRepository).findById(1L);
        verify(waterIntakeRepository, never()).delete(any());
    }
}