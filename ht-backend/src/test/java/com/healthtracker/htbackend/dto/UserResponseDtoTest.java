package com.healthtracker.htbackend.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserResponseDtoTest {

    @Test
    void testDefaultConstructor() {
        UserResponseDto dto = new UserResponseDto();
        
        assertNull(dto.getId());
        assertNull(dto.getUsername());
        assertNull(dto.getEmail());
        assertNull(dto.getCreatedAt());
    }

    @Test
    void testConstructorWithParameters() {
        Long id = 1L;
        String username = "testuser";
        String email = "test@example.com";
        LocalDateTime createdAt = LocalDateTime.now();
        
        UserResponseDto dto = new UserResponseDto(id, username, email, createdAt);
        
        assertEquals(id, dto.getId());
        assertEquals(username, dto.getUsername());
        assertEquals(email, dto.getEmail());
        assertEquals(createdAt, dto.getCreatedAt());
    }

    @Test
    void testGettersAndSetters() {
        UserResponseDto dto = new UserResponseDto();
        
        Long id = 1L;
        String username = "testuser";
        String email = "test@example.com";
        LocalDateTime createdAt = LocalDateTime.now();
        
        dto.setId(id);
        dto.setUsername(username);
        dto.setEmail(email);
        dto.setCreatedAt(createdAt);
        
        assertEquals(id, dto.getId());
        assertEquals(username, dto.getUsername());
        assertEquals(email, dto.getEmail());
        assertEquals(createdAt, dto.getCreatedAt());
    }

    @Test
    void testSettersWithNullValues() {
        UserResponseDto dto = new UserResponseDto(1L, "testuser", "test@example.com", LocalDateTime.now());
        
        dto.setId(null);
        dto.setUsername(null);
        dto.setEmail(null);
        dto.setCreatedAt(null);
        
        assertNull(dto.getId());
        assertNull(dto.getUsername());
        assertNull(dto.getEmail());
        assertNull(dto.getCreatedAt());
    }
}