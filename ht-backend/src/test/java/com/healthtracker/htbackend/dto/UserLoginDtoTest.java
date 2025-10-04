package com.healthtracker.htbackend.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class UserLoginDtoTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidUserLoginDto() {
        UserLoginDto dto = new UserLoginDto("testuser", "password123");
        
        Set<ConstraintViolation<UserLoginDto>> violations = validator.validate(dto);
        
        assertTrue(violations.isEmpty());
    }

    @Test
    void testUsernameValidation() {
        // Test blank username
        UserLoginDto dto = new UserLoginDto("", "password123");
        Set<ConstraintViolation<UserLoginDto>> violations = validator.validate(dto);
        assertEquals(1, violations.size());
        assertTrue(violations.iterator().next().getMessage().contains("Username is required"));

        // Test null username
        dto = new UserLoginDto(null, "password123");
        violations = validator.validate(dto);
        assertEquals(1, violations.size());
        assertTrue(violations.iterator().next().getMessage().contains("Username is required"));
    }

    @Test
    void testPasswordValidation() {
        // Test blank password
        UserLoginDto dto = new UserLoginDto("testuser", "");
        Set<ConstraintViolation<UserLoginDto>> violations = validator.validate(dto);
        assertEquals(1, violations.size());
        assertTrue(violations.iterator().next().getMessage().contains("Password is required"));

        // Test null password
        dto = new UserLoginDto("testuser", null);
        violations = validator.validate(dto);
        assertEquals(1, violations.size());
        assertTrue(violations.iterator().next().getMessage().contains("Password is required"));
    }

    @Test
    void testGettersAndSetters() {
        UserLoginDto dto = new UserLoginDto();
        
        dto.setUsername("testuser");
        dto.setPassword("password123");
        
        assertEquals("testuser", dto.getUsername());
        assertEquals("password123", dto.getPassword());
    }

    @Test
    void testConstructorWithParameters() {
        UserLoginDto dto = new UserLoginDto("testuser", "password123");
        
        assertEquals("testuser", dto.getUsername());
        assertEquals("password123", dto.getPassword());
    }
}