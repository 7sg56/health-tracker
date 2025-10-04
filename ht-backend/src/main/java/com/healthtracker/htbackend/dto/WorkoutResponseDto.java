package com.healthtracker.htbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for workout response data
 */
public class WorkoutResponseDto {
    
    private Long id;
    private String activity;
    private Integer durationMin;
    private Integer caloriesBurned;
    private LocalDate date;
    private LocalDateTime createdAt;
    
    // Default constructor
    public WorkoutResponseDto() {}
    
    // Constructor with all fields
    public WorkoutResponseDto(Long id, String activity, Integer durationMin, Integer caloriesBurned, 
                             LocalDate date, LocalDateTime createdAt) {
        this.id = id;
        this.activity = activity;
        this.durationMin = durationMin;
        this.caloriesBurned = caloriesBurned;
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
    
    public String getActivity() {
        return activity;
    }
    
    public void setActivity(String activity) {
        this.activity = activity;
    }
    
    public Integer getDurationMin() {
        return durationMin;
    }
    
    public void setDurationMin(Integer durationMin) {
        this.durationMin = durationMin;
    }
    
    public Integer getCaloriesBurned() {
        return caloriesBurned;
    }
    
    public void setCaloriesBurned(Integer caloriesBurned) {
        this.caloriesBurned = caloriesBurned;
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