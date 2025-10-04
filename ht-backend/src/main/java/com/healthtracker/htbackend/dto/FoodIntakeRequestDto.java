package com.healthtracker.htbackend.dto;

import jakarta.validation.constraints.*;

/**
 * DTO for food intake creation and update requests
 */
public class FoodIntakeRequestDto {
    
    @NotBlank(message = "Food item is required")
    @Size(min = 1, max = 100, message = "Food item must be between 1 and 100 characters")
    private String foodItem;
    
    @NotNull(message = "Calories is required")
    @Min(value = 1, message = "Calories must be at least 1")
    @Max(value = 5000, message = "Calories must not exceed 5000")
    private Integer calories;
    
    // Default constructor
    public FoodIntakeRequestDto() {}
    
    // Constructor with all fields
    public FoodIntakeRequestDto(String foodItem, Integer calories) {
        this.foodItem = foodItem;
        this.calories = calories;
    }
    
    // Getters and setters
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
}