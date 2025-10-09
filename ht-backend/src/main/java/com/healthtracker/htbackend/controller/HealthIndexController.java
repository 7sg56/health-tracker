package com.healthtracker.htbackend.controller;

import com.healthtracker.htbackend.dto.DailyHealthIndexResponseDto;
import com.healthtracker.htbackend.dto.ErrorResponse;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.service.HealthScoreService;
import com.healthtracker.htbackend.repository.UserRepository;
import com.healthtracker.htbackend.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST Controller for health index endpoints.
 * Handles health score calculation and retrieval with user authentication.
 */
@RestController
@RequestMapping("/api/health-index")
public class HealthIndexController {

    private final HealthScoreService healthScoreService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public HealthIndexController(HealthScoreService healthScoreService,
                                 UserRepository userRepository,
                                 PasswordEncoder passwordEncoder) {
        this.healthScoreService = healthScoreService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Get daily health index for the current date.
     * Automatically calculates and caches the health score if not already calculated.
     * 
     * @param request the HTTP request for session management
     * @return ResponseEntity with DailyHealthIndexResponseDto
     */
    @GetMapping
    public ResponseEntity<DailyHealthIndexResponseDto> getCurrentHealthIndex(
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        LocalDate currentDate = LocalDate.now();
        
        DailyHealthIndexResponseDto response = healthScoreService.getHealthScore(userId, currentDate);
        return ResponseEntity.ok(response);
    }

    /**
     * Get daily health index for a specific date.
     * Automatically calculates and caches the health score if not already calculated.
     * 
     * @param date the specific date to get health index for
     * @param request the HTTP request for session management
     * @return ResponseEntity with DailyHealthIndexResponseDto
     */
    @GetMapping("/{date}")
    public ResponseEntity<DailyHealthIndexResponseDto> getHealthIndexByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        
        DailyHealthIndexResponseDto response = healthScoreService.getHealthScore(userId, date);
        return ResponseEntity.ok(response);
    }

    /**
     * Force recalculation of health index for the current date.
     * This endpoint will recalculate and update the health score even if it already exists.
     * 
     * @param request the HTTP request for session management
     * @return ResponseEntity with updated DailyHealthIndexResponseDto
     */
    @PostMapping("/calculate")
    public ResponseEntity<DailyHealthIndexResponseDto> calculateCurrentHealthIndex(
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        LocalDate currentDate = LocalDate.now();
        
        DailyHealthIndexResponseDto response = healthScoreService.calculateHealthScore(userId, currentDate);
        return ResponseEntity.ok(response);
    }

    /**
     * Force recalculation of health index for a specific date.
     * This endpoint will recalculate and update the health score even if it already exists.
     * 
     * @param date the specific date to recalculate health index for
     * @param request the HTTP request for session management
     * @return ResponseEntity with updated DailyHealthIndexResponseDto
     */
    @PostMapping("/calculate/{date}")
    public ResponseEntity<DailyHealthIndexResponseDto> calculateHealthIndexByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        
        DailyHealthIndexResponseDto response = healthScoreService.calculateHealthScore(userId, date);
        return ResponseEntity.ok(response);
    }

    /**
     * Extract the current user ID from the session.
     * 
     * @param request the HTTP request containing the session
     * @return the user ID
     * @throws UnauthorizedException if session is invalid or user is not authenticated
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Long userId = (Long) session.getAttribute("userId");
            if (userId != null) {
                return userId;
            }
        }
        // Auth removed on frontend: fall back to demo user for anonymous access
        return getOrCreateDemoUserId();
    }

    private Long getOrCreateDemoUserId() {
        return userRepository.findByUsername("demo")
                .map(User::getId)
                .orElseGet(() -> {
                    User demo = new User(
                            "demo",
                            "demo@example.com",
                            passwordEncoder.encode("DemoPass123")
                    );
                    User saved = userRepository.save(demo);
                    return saved.getId();
                });
    }
}