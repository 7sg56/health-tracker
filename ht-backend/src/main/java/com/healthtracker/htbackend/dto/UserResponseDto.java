package com.healthtracker.htbackend.dto;

import java.time.LocalDateTime;

/**
 * DTO for user response data (excludes password)
 */
public class UserResponseDto {
    
    private Long id;
    private String username;
    private String email;
    private LocalDateTime createdAt;
    
    // Default constructor
    public UserResponseDto() {}
    
    // Constructor with all fields
    public UserResponseDto(Long id, String username, String email, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.createdAt = createdAt;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}