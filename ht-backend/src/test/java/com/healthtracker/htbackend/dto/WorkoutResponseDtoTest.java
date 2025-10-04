package com.healthtracker.htbackend.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class WorkoutResponseDtoTest {

    @Test
    void testDefaultConstructor() {
        WorkoutResponseDto dto = new WorkoutResponseDto();
        
        assertNull(dto.getId());
        assertNull(dto.getActivity());
        assertNull(dto.getDurationMin());
        assertNull(dto.getCaloriesBurned());
        assertNull(dto.getDate());
        assertNull(dto.getCreatedAt());
    }

    @Test
    void testConstructorWithParameters() {
        Long id = 1L;
        String activity = "Running";
        Integer durationMin = 30;
        Integer caloriesBurned = 300;
        LocalDate date = LocalDate.now();
        LocalDateTime createdAt = LocalDateTime.now();
        
        WorkoutResponseDto dto = new WorkoutResponseDto(id, activity, durationMin, caloriesBurned, date, createdAt);
        
        assertEquals(id, dto.getId());
        assertEquals(activity, dto.getActivity());
        assertEquals(durationMin, dto.getDurationMin());
        assertEquals(caloriesBurned, dto.getCaloriesBurned());
        assertEquals(date, dto.getDate());
        assertEquals(createdAt, dto.getCreatedAt());
    }

    @Test
    void testGettersAndSetters() {
        WorkoutResponseDto dto = new WorkoutResponseDto();
        
        Long id = 2L;
        String activity = "Swimming";
        Integer durationMin = 45;
        Integer caloriesBurned = 400;
        LocalDate date = LocalDate.of(2024, 1, 15);
        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 15, 18, 0);
        
        dto.setId(id);
        dto.setActivity(activity);
        dto.setDurationMin(durationMin);
        dto.setCaloriesBurned(caloriesBurned);
        dto.setDate(date);
        dto.setCreatedAt(createdAt);
        
        assertEquals(id, dto.getId());
        assertEquals(activity, dto.getActivity());
        assertEquals(durationMin, dto.getDurationMin());
        assertEquals(caloriesBurned, dto.getCaloriesBurned());
        assertEquals(date, dto.getDate());
        assertEquals(createdAt, dto.getCreatedAt());
    }

    @Test
    void testSettersWithNullValues() {
        WorkoutResponseDto dto = new WorkoutResponseDto(1L, "Cycling", 60, 350, LocalDate.now(), LocalDateTime.now());
        
        dto.setId(null);
        dto.setActivity(null);
        dto.setDurationMin(null);
        dto.setCaloriesBurned(null);
        dto.setDate(null);
        dto.setCreatedAt(null);
        
        assertNull(dto.getId());
        assertNull(dto.getActivity());
        assertNull(dto.getDurationMin());
        assertNull(dto.getCaloriesBurned());
        assertNull(dto.getDate());
        assertNull(dto.getCreatedAt());
    }

    @Test
    void testConstructorWithNullCaloriesBurned() {
        Long id = 3L;
        String activity = "Stretching";
        Integer durationMin = 15;
        LocalDate date = LocalDate.now();
        LocalDateTime createdAt = LocalDateTime.now();
        
        WorkoutResponseDto dto = new WorkoutResponseDto(id, activity, durationMin, null, date, createdAt);
        
        assertEquals(id, dto.getId());
        assertEquals(activity, dto.getActivity());
        assertEquals(durationMin, dto.getDurationMin());
        assertNull(dto.getCaloriesBurned());
        assertEquals(date, dto.getDate());
        assertEquals(createdAt, dto.getCreatedAt());
    }
}