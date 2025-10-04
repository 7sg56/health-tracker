package com.healthtracker.htbackend.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class WaterIntakeResponseDtoTest {

    @Test
    void testDefaultConstructor() {
        WaterIntakeResponseDto dto = new WaterIntakeResponseDto();
        
        assertNull(dto.getId());
        assertNull(dto.getAmountLtr());
        assertNull(dto.getDate());
        assertNull(dto.getCreatedAt());
    }

    @Test
    void testConstructorWithParameters() {
        Long id = 1L;
        Float amountLtr = 2.5f;
        LocalDate date = LocalDate.now();
        LocalDateTime createdAt = LocalDateTime.now();
        
        WaterIntakeResponseDto dto = new WaterIntakeResponseDto(id, amountLtr, date, createdAt);
        
        assertEquals(id, dto.getId());
        assertEquals(amountLtr, dto.getAmountLtr());
        assertEquals(date, dto.getDate());
        assertEquals(createdAt, dto.getCreatedAt());
    }

    @Test
    void testGettersAndSetters() {
        WaterIntakeResponseDto dto = new WaterIntakeResponseDto();
        
        Long id = 1L;
        Float amountLtr = 1.8f;
        LocalDate date = LocalDate.of(2024, 1, 15);
        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 15, 10, 30);
        
        dto.setId(id);
        dto.setAmountLtr(amountLtr);
        dto.setDate(date);
        dto.setCreatedAt(createdAt);
        
        assertEquals(id, dto.getId());
        assertEquals(amountLtr, dto.getAmountLtr());
        assertEquals(date, dto.getDate());
        assertEquals(createdAt, dto.getCreatedAt());
    }

    @Test
    void testSettersWithNullValues() {
        WaterIntakeResponseDto dto = new WaterIntakeResponseDto(1L, 2.0f, LocalDate.now(), LocalDateTime.now());
        
        dto.setId(null);
        dto.setAmountLtr(null);
        dto.setDate(null);
        dto.setCreatedAt(null);
        
        assertNull(dto.getId());
        assertNull(dto.getAmountLtr());
        assertNull(dto.getDate());
        assertNull(dto.getCreatedAt());
    }
}