package com.healthtracker.htbackend.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class FoodIntakeRequestDtoTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidFoodIntakeRequestDto() {
        FoodIntakeRequestDto dto = new FoodIntakeRequestDto("Apple", 95);
        
        Set<ConstraintViolation<FoodIntakeRequestDto>> violations = validator.validate(dto);
        
        assertTrue(violations.isEmpty());
    }

    @Test
    void testFoodItemValidation() {
        // Test null food item
        FoodIntakeRequestDto dto = new FoodIntakeRequestDto(null, 100);
        Set<ConstraintViolation<FoodIntakeRequestDto>> violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Food item is required")));

        // Test blank food item
        dto = new FoodIntakeRequestDto("", 100);
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Food item is required")));

        // Test food item too long
        dto = new FoodIntakeRequestDto("a".repeat(101), 100);
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Food item must be between 1 and 100 characters")));
    }

    @Test
    void testCaloriesValidation() {
        // Test null calories
        FoodIntakeRequestDto dto = new FoodIntakeRequestDto("Apple", null);
        Set<ConstraintViolation<FoodIntakeRequestDto>> violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Calories is required")));

        // Test calories too small
        dto = new FoodIntakeRequestDto("Apple", 0);
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Calories must be at least 1")));

        // Test calories too large
        dto = new FoodIntakeRequestDto("Apple", 5001);
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Calories must not exceed 5000")));
    }

    @Test
    void testBoundaryValues() {
        // Test minimum valid calories
        FoodIntakeRequestDto dto = new FoodIntakeRequestDto("Apple", 1);
        Set<ConstraintViolation<FoodIntakeRequestDto>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());

        // Test maximum valid calories
        dto = new FoodIntakeRequestDto("Large meal", 5000);
        violations = validator.validate(dto);
        assertTrue(violations.isEmpty());

        // Test minimum valid food item length
        dto = new FoodIntakeRequestDto("A", 100);
        violations = validator.validate(dto);
        assertTrue(violations.isEmpty());

        // Test maximum valid food item length
        dto = new FoodIntakeRequestDto("a".repeat(100), 100);
        violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testGettersAndSetters() {
        FoodIntakeRequestDto dto = new FoodIntakeRequestDto();
        
        dto.setFoodItem("Banana");
        dto.setCalories(105);
        
        assertEquals("Banana", dto.getFoodItem());
        assertEquals(105, dto.getCalories());
    }

    @Test
    void testConstructorWithParameters() {
        FoodIntakeRequestDto dto = new FoodIntakeRequestDto("Orange", 62);
        
        assertEquals("Orange", dto.getFoodItem());
        assertEquals(62, dto.getCalories());
    }
}