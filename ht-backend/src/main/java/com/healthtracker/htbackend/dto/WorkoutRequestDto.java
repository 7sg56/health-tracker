package com.healthtracker.htbackend.dto;

import jakarta.validation.constraints.*;

/**
 * DTO for workout creation and update requests
 */
public class WorkoutRequestDto {
    
    @NotBlank(message = "Activity is required")
    @Size(min = 1, max = 100, message = "Activity must be between 1 and 100 characters")
    private String activity;
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 600, message = "Duration must not exceed 600 minutes")
    private Integer durationMin;
    
    @Min(value = 0, message = "Calories burned must be at least 0")
    @Max(value = 2000, message = "Calories burned must not exceed 2000")
    private Integer caloriesBurned;
    
    // Default constructor
    public WorkoutRequestDto() {}
    
    // Constructor with required fields
    public WorkoutRequestDto(String activity, Integer durationMin) {
        this.activity = activity;
        this.durationMin = durationMin;
    }
    
    // Constructor with all fields
    public WorkoutRequestDto(String activity, Integer durationMin, Integer caloriesBurned) {
        this.activity = activity;
        this.durationMin = durationMin;
        this.caloriesBurned = caloriesBurned;
    }
    
    // Getters and setters
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
}