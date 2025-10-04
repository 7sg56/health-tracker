package com.healthtracker.htbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

/**
 * DTO for user registration requests
 */
@Schema(description = "User registration request data")
public class UserRegistrationDto {
    
    @Schema(description = "Username for the account", example = "john_doe123", 
            minLength = 3, maxLength = 50, pattern = "^[a-zA-Z0-9_]+$")
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    private String username;
    
    @Schema(description = "Email address for the account", example = "john@example.com", 
            maxLength = 150, format = "email")
    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;
    
    @Schema(description = "Password for the account (must contain uppercase, lowercase, and digit)", 
            example = "SecurePass123", minLength = 8, format = "password")
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", 
             message = "Password must contain at least one uppercase letter, one lowercase letter, and one digit")
    private String password;
    
    // Default constructor
    public UserRegistrationDto() {}
    
    // Constructor with all fields
    public UserRegistrationDto(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
    
    // Getters and setters
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
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}