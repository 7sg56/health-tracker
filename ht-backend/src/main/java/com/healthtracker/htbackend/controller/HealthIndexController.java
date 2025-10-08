package com.healthtracker.htbackend.controller;

import com.healthtracker.htbackend.dto.DailyHealthIndexResponseDto;
import com.healthtracker.htbackend.dto.ErrorResponse;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.service.HealthScoreService;
import com.healthtracker.htbackend.repository.UserRepository;
import com.healthtracker.htbackend.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
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
@Tag(name = "Health Index", description = "Daily health score calculation and retrieval based on water intake, food consumption, and exercise")
@SecurityRequirement(name = "sessionAuth")
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
    @Operation(
        summary = "Get current daily health index",
        description = "Retrieve the health score for today. The score (0-100) is calculated based on: " +
                     "Water intake (30% weight, target 2.5L), Calorie balance (40% weight, target 2000 calories), " +
                     "Exercise activity (30% weight, target 30 minutes). Automatically calculates if not cached."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Health index retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DailyHealthIndexResponseDto.class),
                examples = @ExampleObject(
                    value = "{\"id\": 1, \"date\": \"2024-01-15\", \"healthScore\": 85.5, \"waterScore\": 90.0, \"calorieScore\": 80.0, \"exerciseScore\": 87.0, \"createdAt\": \"2024-01-15T10:30:00\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User not authenticated",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
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
    @Operation(
        summary = "Get health index for specific date",
        description = "Retrieve the health score for a specific date. Returns score of 0 if no health data exists for that date."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Health index retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DailyHealthIndexResponseDto.class),
                examples = @ExampleObject(
                    value = "{\"id\": 1, \"date\": \"2024-01-10\", \"healthScore\": 72.3, \"waterScore\": 80.0, \"calorieScore\": 65.0, \"exerciseScore\": 73.0, \"createdAt\": \"2024-01-10T15:45:00\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid date format",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-01-15T10:30:00Z\", \"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid date format\", \"path\": \"/api/health-index/invalid-date\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User not authenticated",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    @GetMapping("/{date}")
    public ResponseEntity<DailyHealthIndexResponseDto> getHealthIndexByDate(
            @Parameter(description = "Date in YYYY-MM-DD format", required = true, example = "2024-01-15")
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