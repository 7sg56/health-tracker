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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service class for handling user authentication operations.
 * Provides user registration, login, logout, and profile retrieval functionality.
 */
@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder(12);
    }

    /**
     * Register a new user with encrypted password.
     * Validates username and email uniqueness before creating the user.
     * 
     * @param registrationDto the user registration data
     * @return UserResponseDto containing the created user information
     * @throws ConflictException if username or email already exists
     */
    public UserResponseDto register(UserRegistrationDto registrationDto) {
        // Check username uniqueness
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new ConflictException("Username already exists");
        }

        // Check email uniqueness
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        // Create new user with encrypted password
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setCreatedAt(LocalDateTime.now());

        // Save user to database
        User savedUser = userRepository.save(user);

        // Return user response DTO
        return mapToUserResponseDto(savedUser);
    }

    /**
     * Authenticate user and create session.
     * 
     * @param loginDto the user login credentials
     * @param request the HTTP request for session management
     * @return UserResponseDto containing the authenticated user information
     * @throws UnauthorizedException if credentials are invalid
     */
    public UserResponseDto login(UserLoginDto loginDto, HttpServletRequest request) {
        // Find user by username
        User user = userRepository.findByUsername(loginDto.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        // Verify password
        if (!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        // Create session
        HttpSession session = request.getSession(true);
        session.setAttribute("userId", user.getId());
        session.setAttribute("username", user.getUsername());

        return mapToUserResponseDto(user);
    }

    /**
     * Logout user by invalidating session.
     * 
     * @param request the HTTP request containing the session to invalidate
     */
    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    /**
     * Get current authenticated user profile.
     * 
     * @param request the HTTP request containing the session
     * @return UserResponseDto containing the current user information
     * @throws UnauthorizedException if user is not authenticated or session is invalid
     */
    public UserResponseDto getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            throw new UnauthorizedException("No active session");
        }

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new UnauthorizedException("Invalid session");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return mapToUserResponseDto(user);
    }

    /**
     * Check if current session is valid and return session information.
     * 
     * @param request the HTTP request containing the session
     * @return SessionInfo containing session validity and user information
     */
    public SessionInfo checkSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return new SessionInfo(false, null);
        }

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return new SessionInfo(false, null);
        }

        try {
            User user = userRepository.findById(userId)
                    .orElse(null);
            
            if (user == null) {
                return new SessionInfo(false, null);
            }

            return new SessionInfo(true, mapToUserResponseDto(user));
        } catch (Exception e) {
            return new SessionInfo(false, null);
        }
    }

    /**
     * Helper method to map User entity to UserResponseDto.
     * 
     * @param user the User entity
     * @return UserResponseDto
     */
    private UserResponseDto mapToUserResponseDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    /**
     * Inner class to represent session information.
     */
    public static class SessionInfo {
        private final boolean valid;
        private final UserResponseDto user;

        public SessionInfo(boolean valid, UserResponseDto user) {
            this.valid = valid;
            this.user = user;
        }

        public boolean isValid() {
            return valid;
        }

        public UserResponseDto getUser() {
            return user;
        }
    }
}