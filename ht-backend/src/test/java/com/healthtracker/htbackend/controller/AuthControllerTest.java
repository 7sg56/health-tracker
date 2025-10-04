package com.healthtracker.htbackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthtracker.htbackend.dto.UserLoginDto;
import com.healthtracker.htbackend.dto.UserRegistrationDto;
import com.healthtracker.htbackend.dto.UserResponseDto;
import com.healthtracker.htbackend.exception.ConflictException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController endpoints.
 * Tests all authentication functionality including registration, login, logout, and profile retrieval.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Test
    void register_WithValidData_ShouldReturnCreatedUser() throws Exception {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
                "testuser123", 
                "test@example.com", 
                "Password123"
        );
        
        UserResponseDto expectedResponse = new UserResponseDto(
                1L, 
                "testuser123", 
                "test@example.com", 
                LocalDateTime.now()
        );
        
        when(authService.register(any(UserRegistrationDto.class))).thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDto))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username", is("testuser123")))
                .andExpect(jsonPath("$.email", is("test@example.com")))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.createdAt", notNullValue()))
                .andExpect(jsonPath("$.password").doesNotExist());

        // Verify service was called
        verify(authService).register(any(UserRegistrationDto.class));
    }

    @Test
    void register_WithExistingUsername_ShouldReturnConflict() throws Exception {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
                "testuser123", 
                "new@example.com", 
                "Password123"
        );
        
        when(authService.register(any(UserRegistrationDto.class)))
                .thenThrow(new ConflictException("Username already exists"));

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDto))
                .with(csrf()))
                .andExpect(status().isConflict());

        verify(authService).register(any(UserRegistrationDto.class));
    }

    @Test
    void register_WithExistingEmail_ShouldReturnConflict() throws Exception {
        // Given
        UserRegistrationDto registrationDto = new UserRegistrationDto(
                "newuser123", 
                "test@example.com", 
                "Password123"
        );
        
        when(authService.register(any(UserRegistrationDto.class)))
                .thenThrow(new ConflictException("Email already exists"));

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDto))
                .with(csrf()))
                .andExpect(status().isConflict());

        verify(authService).register(any(UserRegistrationDto.class));
    }

    @Test
    void register_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Given - Invalid registration data
        UserRegistrationDto registrationDto = new UserRegistrationDto(
                "ab", // Too short username
                "invalid-email", // Invalid email format
                "weak" // Weak password
        );

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDto))
                .with(csrf()))
                .andExpect(status().isBadRequest());

        // Service should not be called due to validation failure
        verify(authService, never()).register(any(UserRegistrationDto.class));
    }

    @Test
    void login_WithValidCredentials_ShouldReturnUserAndCreateSession() throws Exception {
        // Given
        UserLoginDto loginDto = new UserLoginDto("testuser123", "Password123");
        UserResponseDto expectedResponse = new UserResponseDto(
                1L, 
                "testuser123", 
                "test@example.com", 
                LocalDateTime.now()
        );
        
        when(authService.login(any(UserLoginDto.class), any())).thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username", is("testuser123")))
                .andExpect(jsonPath("$.email", is("test@example.com")))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.password").doesNotExist());

        verify(authService).login(any(UserLoginDto.class), any());
    }

    @Test
    void login_WithInvalidUsername_ShouldReturnUnauthorized() throws Exception {
        // Given
        UserLoginDto loginDto = new UserLoginDto("nonexistent", "Password123");
        
        when(authService.login(any(UserLoginDto.class), any()))
                .thenThrow(new UnauthorizedException("Invalid username or password"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto))
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        verify(authService).login(any(UserLoginDto.class), any());
    }

    @Test
    void login_WithInvalidPassword_ShouldReturnUnauthorized() throws Exception {
        // Given
        UserLoginDto loginDto = new UserLoginDto("testuser123", "WrongPassword");
        
        when(authService.login(any(UserLoginDto.class), any()))
                .thenThrow(new UnauthorizedException("Invalid username or password"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto))
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        verify(authService).login(any(UserLoginDto.class), any());
    }

    @Test
    @WithMockUser
    void logout_WithValidSession_ShouldInvalidateSession() throws Exception {
        // Given
        doNothing().when(authService).logout(any());

        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                .with(csrf()))
                .andExpect(status().isOk());

        verify(authService).logout(any());
    }

    @Test
    @WithMockUser
    void logout_WithoutSession_ShouldReturnOk() throws Exception {
        // Given
        doNothing().when(authService).logout(any());

        // When & Then - Should not fail even without session
        mockMvc.perform(post("/api/auth/logout")
                .with(csrf()))
                .andExpect(status().isOk());

        verify(authService).logout(any());
    }

    @Test
    @WithMockUser
    void getProfile_WithValidSession_ShouldReturnUserProfile() throws Exception {
        // Given
        UserResponseDto expectedResponse = new UserResponseDto(
                1L, 
                "testuser123", 
                "test@example.com", 
                LocalDateTime.now()
        );
        
        when(authService.getCurrentUser(any())).thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username", is("testuser123")))
                .andExpect(jsonPath("$.email", is("test@example.com")))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.password").doesNotExist());

        verify(authService).getCurrentUser(any());
    }

    @Test
    @WithMockUser
    void getProfile_WithoutSession_ShouldReturnUnauthorized() throws Exception {
        // Given
        when(authService.getCurrentUser(any()))
                .thenThrow(new UnauthorizedException("No active session"));

        // When & Then
        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isUnauthorized());

        verify(authService).getCurrentUser(any());
    }

    @Test
    @WithMockUser
    void getProfile_WithInvalidSession_ShouldReturnUnauthorized() throws Exception {
        // Given
        when(authService.getCurrentUser(any()))
                .thenThrow(new UnauthorizedException("Invalid session"));

        // When & Then
        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isUnauthorized());

        verify(authService).getCurrentUser(any());
    }

    @Test
    @WithMockUser
    void getProfile_WithNonExistentUser_ShouldReturnUnauthorized() throws Exception {
        // Given
        when(authService.getCurrentUser(any()))
                .thenThrow(new UnauthorizedException("User not found"));

        // When & Then
        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isUnauthorized());

        verify(authService).getCurrentUser(any());
    }

    @Test
    void register_WithBlankFields_ShouldReturnBadRequest() throws Exception {
        // Given - Registration with blank fields
        UserRegistrationDto registrationDto = new UserRegistrationDto("", "", "");

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDto))
                .with(csrf()))
                .andExpect(status().isBadRequest());

        // Service should not be called due to validation failure
        verify(authService, never()).register(any(UserRegistrationDto.class));
    }

    @Test
    void login_WithBlankFields_ShouldReturnBadRequest() throws Exception {
        // Given - Login with blank fields
        UserLoginDto loginDto = new UserLoginDto("", "");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto))
                .with(csrf()))
                .andExpect(status().isBadRequest());

        // Service should not be called due to validation failure
        verify(authService, never()).login(any(UserLoginDto.class), any());
    }
}