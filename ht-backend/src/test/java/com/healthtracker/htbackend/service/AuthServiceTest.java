package com.healthtracker.htbackend.service;

import com.healthtracker.htbackend.dto.UserLoginDto;
import com.healthtracker.htbackend.dto.UserRegistrationDto;
import com.healthtracker.htbackend.dto.UserResponseDto;
import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.exception.ConflictException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpSession session;

    @InjectMocks
    private AuthService authService;

    private UserRegistrationDto validRegistrationDto;
    private UserLoginDto validLoginDto;
    private User testUser;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(12);
        
        validRegistrationDto = new UserRegistrationDto();
        validRegistrationDto.setUsername("testuser");
        validRegistrationDto.setEmail("test@example.com");
        validRegistrationDto.setPassword("TestPass123");

        validLoginDto = new UserLoginDto();
        validLoginDto.setUsername("testuser");
        validLoginDto.setPassword("TestPass123");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("TestPass123"));
        testUser.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void register_WithValidData_ShouldCreateUser() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserResponseDto result = authService.register(validRegistrationDto);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        assertEquals(1L, result.getId());
        assertNotNull(result.getCreatedAt());

        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_WithExistingUsername_ShouldThrowConflictException() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // Act & Assert
        ConflictException exception = assertThrows(ConflictException.class, 
            () -> authService.register(validRegistrationDto));
        
        assertEquals("Username already exists", exception.getMessage());
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_WithExistingEmail_ShouldThrowConflictException() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // Act & Assert
        ConflictException exception = assertThrows(ConflictException.class, 
            () -> authService.register(validRegistrationDto));
        
        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_WithValidCredentials_ShouldCreateSessionAndReturnUser() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(request.getSession(true)).thenReturn(session);

        // Act
        UserResponseDto result = authService.login(validLoginDto, request);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        assertEquals(1L, result.getId());

        verify(userRepository).findByUsername("testuser");
        verify(request).getSession(true);
        verify(session).setAttribute("userId", 1L);
        verify(session).setAttribute("username", "testuser");
    }

    @Test
    void login_WithInvalidUsername_ShouldThrowUnauthorizedException() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, 
            () -> authService.login(validLoginDto, request));
        
        assertEquals("Invalid username or password", exception.getMessage());
        verify(userRepository).findByUsername("testuser");
        verify(request, never()).getSession(anyBoolean());
    }

    @Test
    void login_WithInvalidPassword_ShouldThrowUnauthorizedException() {
        // Arrange
        validLoginDto.setPassword("WrongPassword123");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, 
            () -> authService.login(validLoginDto, request));
        
        assertEquals("Invalid username or password", exception.getMessage());
        verify(userRepository).findByUsername("testuser");
        verify(request, never()).getSession(anyBoolean());
    }

    @Test
    void logout_WithValidSession_ShouldInvalidateSession() {
        // Arrange
        when(request.getSession(false)).thenReturn(session);

        // Act
        authService.logout(request);

        // Assert
        verify(request).getSession(false);
        verify(session).invalidate();
    }

    @Test
    void logout_WithNoSession_ShouldNotThrowException() {
        // Arrange
        when(request.getSession(false)).thenReturn(null);

        // Act & Assert
        assertDoesNotThrow(() -> authService.logout(request));
        verify(request).getSession(false);
        verify(session, never()).invalidate();
    }

    @Test
    void getCurrentUser_WithValidSession_ShouldReturnUser() {
        // Arrange
        when(request.getSession(false)).thenReturn(session);
        when(session.getAttribute("userId")).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act
        UserResponseDto result = authService.getCurrentUser(request);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        assertEquals(1L, result.getId());

        verify(request).getSession(false);
        verify(session).getAttribute("userId");
        verify(userRepository).findById(1L);
    }

    @Test
    void getCurrentUser_WithNoSession_ShouldThrowUnauthorizedException() {
        // Arrange
        when(request.getSession(false)).thenReturn(null);

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, 
            () -> authService.getCurrentUser(request));
        
        assertEquals("No active session", exception.getMessage());
        verify(request).getSession(false);
    }

    @Test
    void getCurrentUser_WithInvalidSession_ShouldThrowUnauthorizedException() {
        // Arrange
        when(request.getSession(false)).thenReturn(session);
        when(session.getAttribute("userId")).thenReturn(null);

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, 
            () -> authService.getCurrentUser(request));
        
        assertEquals("Invalid session", exception.getMessage());
        verify(request).getSession(false);
        verify(session).getAttribute("userId");
    }

    @Test
    void getCurrentUser_WithNonExistentUser_ShouldThrowUnauthorizedException() {
        // Arrange
        when(request.getSession(false)).thenReturn(session);
        when(session.getAttribute("userId")).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, 
            () -> authService.getCurrentUser(request));
        
        assertEquals("User not found", exception.getMessage());
        verify(request).getSession(false);
        verify(session).getAttribute("userId");
        verify(userRepository).findById(1L);
    }
}