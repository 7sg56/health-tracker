package com.healthtracker.htbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for food intake response data
 */
public class FoodIntakeResponseDto {
    
    private Long id;
    private String foodItem;
    private Integer calories;
    private LocalDate date;
    private LocalDateTime createdAt;
    
    // Default constructor
    public FoodIntakeResponseDto() {}
    
    // Constructor with all fields
    public FoodIntakeResponseDto(Long id, String foodItem, Integer calories, LocalDate date, LocalDateTime createdAt) {
        this.id = id;
        this.foodItem = foodItem;
        this.calories = calories;
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
    
    public String getFoodItem() {
        return foodItem;
    }
    
    public void setFoodItem(String foodItem) {
        this.foodItem = foodItem;
    }
    
    public Integer getCalories() {
        return calories;
    }
    
    public void setCalories(Integer calories) {
        this.calories = calories;
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