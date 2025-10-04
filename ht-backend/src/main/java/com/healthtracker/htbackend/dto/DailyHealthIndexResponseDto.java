package com.healthtracker.htbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for daily health index response data
 */
public class DailyHealthIndexResponseDto {
    
    private Long id;
    private LocalDate date;
    private Float healthScore;
    private LocalDateTime createdAt;
    
    // Default constructor
    public DailyHealthIndexResponseDto() {}
    
    // Constructor with all fields
    public DailyHealthIndexResponseDto(Long id, LocalDate date, Float healthScore, LocalDateTime createdAt) {
        this.id = id;
        this.date = date;
        this.healthScore = healthScore;
        this.createdAt = createdAt;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public Float getHealthScore() {
        return healthScore;
    }
    
    public void setHealthScore(Float healthScore) {
        this.healthScore = healthScore;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}