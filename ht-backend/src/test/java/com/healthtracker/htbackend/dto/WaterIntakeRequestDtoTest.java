package com.healthtracker.htbackend.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class WaterIntakeRequestDtoTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidWaterIntakeRequestDto() {
        WaterIntakeRequestDto dto = new WaterIntakeRequestDto(2.5f);
        
        Set<ConstraintViolation<WaterIntakeRequestDto>> violations = validator.validate(dto);
        
        assertTrue(violations.isEmpty());
    }

    @Test
    void testAmountValidation() {
        // Test null amount
        WaterIntakeRequestDto dto = new WaterIntakeRequestDto(null);
        Set<ConstraintViolation<WaterIntakeRequestDto>> violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Amount is required")));

        // Test amount too small
        dto = new WaterIntakeRequestDto(0.05f);
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Amount must be at least 0.1 liters")));

        // Test amount too large
        dto = new WaterIntakeRequestDto(15.0f);
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Amount must not exceed 10.0 liters")));
    }

    @Test
    void testBoundaryValues() {
        // Test minimum valid value
        WaterIntakeRequestDto dto = new WaterIntakeRequestDto(0.1f);
        Set<ConstraintViolation<WaterIntakeRequestDto>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());

        // Test maximum valid value
        dto = new WaterIntakeRequestDto(10.0f);
        violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testGettersAndSetters() {
        WaterIntakeRequestDto dto = new WaterIntakeRequestDto();
        
        dto.setAmountLtr(2.5f);
        
        assertEquals(2.5f, dto.getAmountLtr());
    }

    @Test
    void testConstructorWithParameter() {
        WaterIntakeRequestDto dto = new WaterIntakeRequestDto(1.5f);
        
        assertEquals(1.5f, dto.getAmountLtr());
    }
}