package com.healthtracker.htbackend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for water intake creation requests
 */
public class WaterIntakeRequestDto {
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.1", message = "Amount must be at least 0.1 liters")
    @DecimalMax(value = "10.0", message = "Amount must not exceed 10.0 liters")
    private Float amountLtr;
    
    // Default constructor
    public WaterIntakeRequestDto() {}
    
    // Constructor with amount
    public WaterIntakeRequestDto(Float amountLtr) {
        this.amountLtr = amountLtr;
    }
    
    // Getter and setter
    public Float getAmountLtr() {
        return amountLtr;
    }
    
    public void setAmountLtr(Float amountLtr) {
        this.amountLtr = amountLtr;
    }
}