package com.healthtracker.htbackend.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class UserRegistrationDtoTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidUserRegistrationDto() {
        UserRegistrationDto dto = new UserRegistrationDto("testuser", "test@example.com", "Password123");
        
        Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);
        
        assertTrue(violations.isEmpty());
    }

    @Test
    void testUsernameValidation() {
        // Test blank username
        UserRegistrationDto dto = new UserRegistrationDto("", "test@example.com", "Password123");
        Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Username is required")));

        // Test username too short
        dto = new UserRegistrationDto("ab", "test@example.com", "Password123");
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Username must be between 3 and 50 characters")));

        // Test username too long
        dto = new UserRegistrationDto("a".repeat(51), "test@example.com", "Password123");
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Username must be between 3 and 50 characters")));

        // Test invalid characters in username
        dto = new UserRegistrationDto("test-user", "test@example.com", "Password123");
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Username can only contain letters, numbers, and underscores")));
    }

    @Test
    void testEmailValidation() {
        // Test blank email
        UserRegistrationDto dto = new UserRegistrationDto("testuser", "", "Password123");
        Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Email is required")));

        // Test invalid email format
        dto = new UserRegistrationDto("testuser", "invalid-email", "Password123");
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Email format is invalid")));

        // Test email too long
        dto = new UserRegistrationDto("testuser", "a".repeat(140) + "@example.com", "Password123");
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Email must not exceed 150 characters")));
    }

    @Test
    void testPasswordValidation() {
        // Test blank password
        UserRegistrationDto dto = new UserRegistrationDto("testuser", "test@example.com", "");
        Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Password is required")));

        // Test password too short
        dto = new UserRegistrationDto("testuser", "test@example.com", "Pass1");
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Password must be at least 8 characters long")));

        // Test password without uppercase
        dto = new UserRegistrationDto("testuser", "test@example.com", "password123");
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Password must contain at least one uppercase letter, one lowercase letter, and one digit")));

        // Test password without lowercase
        dto = new UserRegistrationDto("testuser", "test@example.com", "PASSWORD123");
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Password must contain at least one uppercase letter, one lowercase letter, and one digit")));

        // Test password without digit
        dto = new UserRegistrationDto("testuser", "test@example.com", "Password");
        violations = validator.validate(dto);
        assertTrue(violations.size() >= 1);
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Password must contain at least one uppercase letter, one lowercase letter, and one digit")));
    }

    @Test
    void testGettersAndSetters() {
        UserRegistrationDto dto = new UserRegistrationDto();
        
        dto.setUsername("testuser");
        dto.setEmail("test@example.com");
        dto.setPassword("Password123");
        
        assertEquals("testuser", dto.getUsername());
        assertEquals("test@example.com", dto.getEmail());
        assertEquals("Password123", dto.getPassword());
    }
}