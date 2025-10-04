package com.healthtracker.htbackend.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class WorkoutRequestDtoTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidWorkoutRequestDto() {
        WorkoutRequestDto dto = new WorkoutRequestDto("Running", 30, 300);
        
        Set<ConstraintViolation<WorkoutRequestDto>> violations = validator.validate(dto);
        
        assertTrue(violations.isEmpty());
    }

    @Test
    void testValidWorkoutRequestDtoWithoutCalories() {
        WorkoutRequestDto dto = new WorkoutRequestDto("Walking", 45);
        
        Set<ConstraintViolation<WorkoutRequestDto>> violations = validator.validate(dto);
        
        assertTrue(violations.isEmpty());
    }

    @Test
    void testActivityValidation() {
        // Test null activity
        WorkoutRequestDto dto = new WorkoutRequestDto(null, 30, 300);
        Set<ConstraintViolation<WorkoutRequestDto>> violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Activity is required")));

        // Test blank activity
        dto = new WorkoutRequestDto("", 30, 300);
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Activity is required")));

        // Test activity too long
        dto = new WorkoutRequestDto("a".repeat(101), 30, 300);
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Activity must be between 1 and 100 characters")));
    }

    @Test
    void testDurationValidation() {
        // Test null duration
        WorkoutRequestDto dto = new WorkoutRequestDto("Running", null, 300);
        Set<ConstraintViolation<WorkoutRequestDto>> violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Duration is required")));

        // Test duration too small
        dto = new WorkoutRequestDto("Running", 0, 300);
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Duration must be at least 1 minute")));

        // Test duration too large
        dto = new WorkoutRequestDto("Running", 601, 300);
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Duration must not exceed 600 minutes")));
    }

    @Test
    void testCaloriesBurnedValidation() {
        // Test negative calories burned
        WorkoutRequestDto dto = new WorkoutRequestDto("Running", 30, -1);
        Set<ConstraintViolation<WorkoutRequestDto>> violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Calories burned must be at least 0")));

        // Test calories burned too large
        dto = new WorkoutRequestDto("Running", 30, 2001);
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Calories burned must not exceed 2000")));

        // Test valid zero calories burned
        dto = new WorkoutRequestDto("Stretching", 15, 0);
        violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testBoundaryValues() {
        // Test minimum valid duration
        WorkoutRequestDto dto = new WorkoutRequestDto("Quick stretch", 1, 0);
        Set<ConstraintViolation<WorkoutRequestDto>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());

        // Test maximum valid duration
        dto = new WorkoutRequestDto("Marathon", 600, 2000);
        violations = validator.validate(dto);
        assertTrue(violations.isEmpty());

        // Test minimum valid activity length
        dto = new WorkoutRequestDto("A", 30, 100);
        violations = validator.validate(dto);
        assertTrue(violations.isEmpty());

        // Test maximum valid activity length
        dto = new WorkoutRequestDto("a".repeat(100), 30, 100);
        violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testGettersAndSetters() {
        WorkoutRequestDto dto = new WorkoutRequestDto();
        
        dto.setActivity("Swimming");
        dto.setDurationMin(60);
        dto.setCaloriesBurned(400);
        
        assertEquals("Swimming", dto.getActivity());
        assertEquals(60, dto.getDurationMin());
        assertEquals(400, dto.getCaloriesBurned());
    }

    @Test
    void testConstructorWithRequiredFields() {
        WorkoutRequestDto dto = new WorkoutRequestDto("Cycling", 45);
        
        assertEquals("Cycling", dto.getActivity());
        assertEquals(45, dto.getDurationMin());
        assertNull(dto.getCaloriesBurned());
    }

    @Test
    void testConstructorWithAllFields() {
        WorkoutRequestDto dto = new WorkoutRequestDto("Weight lifting", 90, 250);
        
        assertEquals("Weight lifting", dto.getActivity());
        assertEquals(90, dto.getDurationMin());
        assertEquals(250, dto.getCaloriesBurned());
    }
}