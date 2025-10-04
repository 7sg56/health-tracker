package com.healthtracker.htbackend.controller;

import com.healthtracker.htbackend.dto.ErrorResponse;
import com.healthtracker.htbackend.dto.UserLoginDto;
import com.healthtracker.htbackend.dto.UserRegistrationDto;
import com.healthtracker.htbackend.dto.UserResponseDto;
import com.healthtracker.htbackend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication endpoints.
 * Handles user registration, login, logout, and profile retrieval.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and session management endpoints")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user.
     * 
     * @param registrationDto the user registration data
     * @return ResponseEntity with UserResponseDto and HTTP 201 status
     */
    @Operation(
        summary = "Register new user",
        description = "Create a new user account with username, email, and password. " +
                     "Username must be 3-50 characters (alphanumeric and underscore only). " +
                     "Password must be at least 8 characters with uppercase, lowercase, and digit."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "User successfully registered",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserResponseDto.class),
                examples = @ExampleObject(
                    value = "{\"id\": 1, \"username\": \"john_doe\", \"email\": \"john@example.com\", \"createdAt\": \"2024-01-15T10:30:00\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-01-15T10:30:00Z\", \"status\": 400, \"error\": \"Bad Request\", \"message\": \"Validation failed\", \"details\": [{\"field\": \"email\", \"message\": \"Email format is invalid\"}], \"path\": \"/api/auth/register\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Username or email already exists",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-01-15T10:30:00Z\", \"status\": 409, \"error\": \"Conflict\", \"message\": \"Username already exists\", \"path\": \"/api/auth/register\"}"
                )
            )
        )
    })
    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(
        @Parameter(description = "User registration data", required = true)
        @Valid @RequestBody UserRegistrationDto registrationDto) {
        UserResponseDto userResponse = authService.register(registrationDto);
        return new ResponseEntity<>(userResponse, HttpStatus.CREATED);
    }

    /**
     * Login user and create session.
     * 
     * @param loginDto the user login credentials
     * @param request the HTTP request for session management
     * @return ResponseEntity with UserResponseDto and HTTP 200 status
     */
    @Operation(
        summary = "User login",
        description = "Authenticate user with username and password. Creates a session cookie (JSESSIONID) " +
                     "that must be included in subsequent requests for authentication."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Login successful, session created",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserResponseDto.class),
                examples = @ExampleObject(
                    value = "{\"id\": 1, \"username\": \"john_doe\", \"email\": \"john@example.com\", \"createdAt\": \"2024-01-15T10:30:00\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Invalid credentials",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-01-15T10:30:00Z\", \"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Invalid credentials\", \"path\": \"/api/auth/login\"}"
                )
            )
        )
    })
    @PostMapping("/login")
    public ResponseEntity<UserResponseDto> login(
        @Parameter(description = "User login credentials", required = true)
        @Valid @RequestBody UserLoginDto loginDto, 
        HttpServletRequest request) {
        UserResponseDto userResponse = authService.login(loginDto, request);
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Logout user by invalidating session.
     * 
     * @param request the HTTP request containing the session to invalidate
     * @return ResponseEntity with HTTP 200 status
     */
    @Operation(
        summary = "User logout",
        description = "Invalidate the current user session. The session cookie will no longer be valid."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Logout successful, session invalidated"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "No active session found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "sessionAuth")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.ok().build();
    }

    /**
     * Get current authenticated user profile.
     * 
     * @param request the HTTP request containing the session
     * @return ResponseEntity with UserResponseDto and HTTP 200 status
     */
    @Operation(
        summary = "Get user profile",
        description = "Retrieve the profile information of the currently authenticated user."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Profile retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserResponseDto.class),
                examples = @ExampleObject(
                    value = "{\"id\": 1, \"username\": \"john_doe\", \"email\": \"john@example.com\", \"createdAt\": \"2024-01-15T10:30:00\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User not authenticated",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-01-15T10:30:00Z\", \"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Authentication required\", \"path\": \"/api/auth/profile\"}"
                )
            )
        )
    })
    @SecurityRequirement(name = "sessionAuth")
    @GetMapping("/profile")
    public ResponseEntity<UserResponseDto> getProfile(HttpServletRequest request) {
        UserResponseDto userResponse = authService.getCurrentUser(request);
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Check current session validity.
     * 
     * @param request the HTTP request containing the session
     * @return ResponseEntity with session information
     */
    @Operation(
        summary = "Check session validity",
        description = "Check if the current session is valid and return session information including user data if authenticated."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Session check completed",
            content = @Content(
                mediaType = "application/json",
                examples = {
                    @ExampleObject(
                        name = "Valid session",
                        value = "{\"valid\": true, \"user\": {\"id\": 1, \"username\": \"john_doe\", \"email\": \"john@example.com\", \"createdAt\": \"2024-01-15T10:30:00\"}}"
                    ),
                    @ExampleObject(
                        name = "Invalid session",
                        value = "{\"valid\": false, \"user\": null}"
                    )
                }
            )
        )
    })
    @GetMapping("/session")
    public ResponseEntity<AuthService.SessionInfo> checkSession(HttpServletRequest request) {
        AuthService.SessionInfo sessionInfo = authService.checkSession(request);
        return ResponseEntity.ok(sessionInfo);
    }
}