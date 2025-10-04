package com.healthtracker.htbackend.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class FoodIntakeResponseDtoTest {

    @Test
    void testDefaultConstructor() {
        FoodIntakeResponseDto dto = new FoodIntakeResponseDto();
        
        assertNull(dto.getId());
        assertNull(dto.getFoodItem());
        assertNull(dto.getCalories());
        assertNull(dto.getDate());
        assertNull(dto.getCreatedAt());
    }

    @Test
    void testConstructorWithParameters() {
        Long id = 1L;
        String foodItem = "Apple";
        Integer calories = 95;
        LocalDate date = LocalDate.now();
        LocalDateTime createdAt = LocalDateTime.now();
        
        FoodIntakeResponseDto dto = new FoodIntakeResponseDto(id, foodItem, calories, date, createdAt);
        
        assertEquals(id, dto.getId());
        assertEquals(foodItem, dto.getFoodItem());
        assertEquals(calories, dto.getCalories());
        assertEquals(date, dto.getDate());
        assertEquals(createdAt, dto.getCreatedAt());
    }

    @Test
    void testGettersAndSetters() {
        FoodIntakeResponseDto dto = new FoodIntakeResponseDto();
        
        Long id = 2L;
        String foodItem = "Banana";
        Integer calories = 105;
        LocalDate date = LocalDate.of(2024, 1, 15);
        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 15, 12, 0);
        
        dto.setId(id);
        dto.setFoodItem(foodItem);
        dto.setCalories(calories);
        dto.setDate(date);
        dto.setCreatedAt(createdAt);
        
        assertEquals(id, dto.getId());
        assertEquals(foodItem, dto.getFoodItem());
        assertEquals(calories, dto.getCalories());
        assertEquals(date, dto.getDate());
        assertEquals(createdAt, dto.getCreatedAt());
    }

    @Test
    void testSettersWithNullValues() {
        FoodIntakeResponseDto dto = new FoodIntakeResponseDto(1L, "Orange", 62, LocalDate.now(), LocalDateTime.now());
        
        dto.setId(null);
        dto.setFoodItem(null);
        dto.setCalories(null);
        dto.setDate(null);
        dto.setCreatedAt(null);
        
        assertNull(dto.getId());
        assertNull(dto.getFoodItem());
        assertNull(dto.getCalories());
        assertNull(dto.getDate());
        assertNull(dto.getCreatedAt());
    }
}