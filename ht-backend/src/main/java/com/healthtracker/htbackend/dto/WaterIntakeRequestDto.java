package com.healthtracker.htbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for water intake creation requests
 */
@Schema(description = "Water intake entry request data")
public class WaterIntakeRequestDto {
    
    @Schema(description = "Amount of water consumed in liters", example = "0.5", 
            minimum = "0.1", maximum = "10.0", type = "number", format = "float")
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