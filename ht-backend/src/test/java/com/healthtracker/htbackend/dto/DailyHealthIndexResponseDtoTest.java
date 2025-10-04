package com.healthtracker.htbackend.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class DailyHealthIndexResponseDtoTest {

    @Test
    void testDefaultConstructor() {
        DailyHealthIndexResponseDto dto = new DailyHealthIndexResponseDto();
        
        assertNull(dto.getId());
        assertNull(dto.getDate());
        assertNull(dto.getHealthScore());
        assertNull(dto.getCreatedAt());
    }

    @Test
    void testConstructorWithParameters() {
        Long id = 1L;
        LocalDate date = LocalDate.now();
        Float healthScore = 85.5f;
        LocalDateTime createdAt = LocalDateTime.now();
        
        DailyHealthIndexResponseDto dto = new DailyHealthIndexResponseDto(id, date, healthScore, createdAt);
        
        assertEquals(id, dto.getId());
        assertEquals(date, dto.getDate());
        assertEquals(healthScore, dto.getHealthScore());
        assertEquals(createdAt, dto.getCreatedAt());
    }

    @Test
    void testGettersAndSetters() {
        DailyHealthIndexResponseDto dto = new DailyHealthIndexResponseDto();
        
        Long id = 2L;
        LocalDate date = LocalDate.of(2024, 1, 15);
        Float healthScore = 92.3f;
        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 15, 23, 59);
        
        dto.setId(id);
        dto.setDate(date);
        dto.setHealthScore(healthScore);
        dto.setCreatedAt(createdAt);
        
        assertEquals(id, dto.getId());
        assertEquals(date, dto.getDate());
        assertEquals(healthScore, dto.getHealthScore());
        assertEquals(createdAt, dto.getCreatedAt());
    }

    @Test
    void testSettersWithNullValues() {
        DailyHealthIndexResponseDto dto = new DailyHealthIndexResponseDto(1L, LocalDate.now(), 75.0f, LocalDateTime.now());
        
        dto.setId(null);
        dto.setDate(null);
        dto.setHealthScore(null);
        dto.setCreatedAt(null);
        
        assertNull(dto.getId());
        assertNull(dto.getDate());
        assertNull(dto.getHealthScore());
        assertNull(dto.getCreatedAt());
    }

    @Test
    void testHealthScoreBoundaryValues() {
        DailyHealthIndexResponseDto dto = new DailyHealthIndexResponseDto();
        
        // Test minimum score
        dto.setHealthScore(0.0f);
        assertEquals(0.0f, dto.getHealthScore());
        
        // Test maximum score
        dto.setHealthScore(100.0f);
        assertEquals(100.0f, dto.getHealthScore());
        
        // Test decimal score
        dto.setHealthScore(67.89f);
        assertEquals(67.89f, dto.getHealthScore());
    }
}