package com.healthtracker.htbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for water intake response data
 */
public class WaterIntakeResponseDto {
    
    private Long id;
    private Float amountLtr;
    private LocalDate date;
    private LocalDateTime createdAt;
    
    // Default constructor
    public WaterIntakeResponseDto() {}
    
    // Constructor with all fields
    public WaterIntakeResponseDto(Long id, Float amountLtr, LocalDate date, LocalDateTime createdAt) {
        this.id = id;
        this.amountLtr = amountLtr;
        this.date = date;
        this.createdAt = createdAt;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Float getAmountLtr() {
        return amountLtr;
    }
    
    public void setAmountLtr(Float amountLtr) {
        this.amountLtr = amountLtr;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}