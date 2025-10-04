package com.healthtracker.htbackend.controller;

import com.healthtracker.htbackend.dto.PageInfo;
import com.healthtracker.htbackend.dto.PaginatedResponse;
import com.healthtracker.htbackend.dto.WorkoutRequestDto;
import com.healthtracker.htbackend.dto.WorkoutResponseDto;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.service.WorkoutService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST Controller for workout endpoints.
 * Handles CRUD operations for workout tracking with user authentication.
 */
@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    @Autowired
    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    /**
     * Create a new workout entry.
     * 
     * @param requestDto the workout request data
     * @param request the HTTP request for session management
     * @return ResponseEntity with WorkoutResponseDto and HTTP 201 status
     */
    @PostMapping
    public ResponseEntity<WorkoutResponseDto> createWorkout(
            @Valid @RequestBody WorkoutRequestDto requestDto,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        WorkoutResponseDto response = workoutService.createWorkout(requestDto, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get paginated workout entries with optional date filtering.
     * 
     * @param page the page number (0-based, default: 0)
     * @param size the page size (default: 10)
     * @param startDate optional start date for filtering (inclusive)
     * @param endDate optional end date for filtering (inclusive)
     * @param sort optional sort parameters (default: date,desc)
     * @param request the HTTP request for session management
     * @return ResponseEntity with paginated workout entries
     */
    @GetMapping
    public ResponseEntity<PaginatedResponse<WorkoutResponseDto>> getWorkouts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "date,desc") String[] sort,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        
        // Create sort object from sort parameters
        Sort sortObj = createSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        Page<WorkoutResponseDto> workouts = workoutService.getWorkouts(
                userId, pageable, startDate, endDate);
        
        PageInfo pageInfo = new PageInfo(
                workouts.getNumber(),
                workouts.getSize(),
                workouts.getTotalElements(),
                workouts.getTotalPages()
        );
        
        PaginatedResponse<WorkoutResponseDto> response = new PaginatedResponse<>(
                workouts.getContent(), pageInfo);
        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific workout entry by ID.
     * 
     * @param id the ID of the workout entry
     * @param request the HTTP request for session management
     * @return ResponseEntity with WorkoutResponseDto
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkoutResponseDto> getWorkoutById(
            @PathVariable Long id,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        WorkoutResponseDto response = workoutService.getWorkoutById(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update an existing workout entry with ownership validation.
     * 
     * @param id the ID of the workout entry to update
     * @param requestDto the updated workout data
     * @param request the HTTP request for session management
     * @return ResponseEntity with updated WorkoutResponseDto
     */
    @PutMapping("/{id}")
    public ResponseEntity<WorkoutResponseDto> updateWorkout(
            @PathVariable Long id,
            @Valid @RequestBody WorkoutRequestDto requestDto,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        WorkoutResponseDto response = workoutService.updateWorkout(id, requestDto, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a workout entry with ownership validation.
     * 
     * @param id the ID of the workout entry to delete
     * @param request the HTTP request for session management
     * @return ResponseEntity with HTTP 204 status
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(
            @PathVariable Long id,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        workoutService.deleteWorkout(id, userId);
        return ResponseEntity.noContent().build();
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
        if (session == null) {
            throw new UnauthorizedException("No active session");
        }

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new UnauthorizedException("Invalid session");
        }

        return userId;
    }

    /**
     * Create a Sort object from sort parameters.
     * 
     * @param sort array of sort parameters in format "property,direction"
     * @return Sort object
     */
    private Sort createSort(String[] sort) {
        if (sort.length == 0) {
            return Sort.by(Sort.Direction.DESC, "date");
        }

        String property = sort[0];
        Sort.Direction direction = Sort.Direction.DESC;
        
        if (sort.length > 1) {
            direction = sort[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        }

        return Sort.by(direction, property);
    }
}