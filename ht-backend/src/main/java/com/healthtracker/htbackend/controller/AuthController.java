package com.healthtracker.htbackend.controller;

import com.healthtracker.htbackend.dto.ErrorResponse;
import com.healthtracker.htbackend.dto.UserLoginDto;
import com.healthtracker.htbackend.dto.UserRegistrationDto;
import com.healthtracker.htbackend.dto.UserResponseDto;
import com.healthtracker.htbackend.service.AuthService;
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
    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(
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
    @PostMapping("/login")
    public ResponseEntity<UserResponseDto> login(
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
    @GetMapping("/session")
    public ResponseEntity<AuthService.SessionInfo> checkSession(HttpServletRequest request) {
        AuthService.SessionInfo sessionInfo = authService.checkSession(request);
        return ResponseEntity.ok(sessionInfo);
    }
}