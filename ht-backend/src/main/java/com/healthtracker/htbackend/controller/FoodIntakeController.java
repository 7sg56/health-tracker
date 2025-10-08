package com.healthtracker.htbackend.controller;

import com.healthtracker.htbackend.dto.FoodIntakeRequestDto;
import com.healthtracker.htbackend.dto.FoodIntakeResponseDto;
import com.healthtracker.htbackend.dto.PageInfo;
import com.healthtracker.htbackend.dto.PaginatedResponse;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.service.FoodIntakeService;
import com.healthtracker.htbackend.repository.UserRepository;
import com.healthtracker.htbackend.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
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
 * REST Controller for food intake endpoints.
 * Handles CRUD operations for food intake tracking with user authentication.
 */
@RestController
@RequestMapping("/api/food")
public class FoodIntakeController {

    private final FoodIntakeService foodIntakeService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public FoodIntakeController(FoodIntakeService foodIntakeService,
                                 UserRepository userRepository,
                                 PasswordEncoder passwordEncoder) {
        this.foodIntakeService = foodIntakeService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create a new food intake entry.
     * 
     * @param requestDto the food intake request data
     * @param request the HTTP request for session management
     * @return ResponseEntity with FoodIntakeResponseDto and HTTP 201 status
     */
    @PostMapping
    public ResponseEntity<FoodIntakeResponseDto> createFoodIntake(
            @Valid @RequestBody FoodIntakeRequestDto requestDto,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        FoodIntakeResponseDto response = foodIntakeService.createFoodIntake(requestDto, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get paginated food intake entries with optional date filtering.
     * 
     * @param page the page number (0-based, default: 0)
     * @param size the page size (default: 10)
     * @param startDate optional start date for filtering (inclusive)
     * @param endDate optional end date for filtering (inclusive)
     * @param sort optional sort parameters (default: date,desc)
     * @param request the HTTP request for session management
     * @return ResponseEntity with paginated food intake entries
     */
    @GetMapping
    public ResponseEntity<PaginatedResponse<FoodIntakeResponseDto>> getFoodIntakes(
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
        
        Page<FoodIntakeResponseDto> foodIntakes = foodIntakeService.getFoodIntakes(
                userId, pageable, startDate, endDate);
        
        PageInfo pageInfo = new PageInfo(
                foodIntakes.getNumber(),
                foodIntakes.getSize(),
                foodIntakes.getTotalElements(),
                foodIntakes.getTotalPages()
        );
        
        PaginatedResponse<FoodIntakeResponseDto> response = new PaginatedResponse<>(
                foodIntakes.getContent(), pageInfo);
        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific food intake entry by ID.
     * 
     * @param id the ID of the food intake entry
     * @param request the HTTP request for session management
     * @return ResponseEntity with FoodIntakeResponseDto
     */
    @GetMapping("/{id}")
    public ResponseEntity<FoodIntakeResponseDto> getFoodIntakeById(
            @PathVariable Long id,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        FoodIntakeResponseDto response = foodIntakeService.getFoodIntakeById(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update an existing food intake entry with ownership validation.
     * 
     * @param id the ID of the food intake entry to update
     * @param requestDto the updated food intake data
     * @param request the HTTP request for session management
     * @return ResponseEntity with updated FoodIntakeResponseDto
     */
    @PutMapping("/{id}")
    public ResponseEntity<FoodIntakeResponseDto> updateFoodIntake(
            @PathVariable Long id,
            @Valid @RequestBody FoodIntakeRequestDto requestDto,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        FoodIntakeResponseDto response = foodIntakeService.updateFoodIntake(id, requestDto, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a food intake entry with ownership validation.
     * 
     * @param id the ID of the food intake entry to delete
     * @param request the HTTP request for session management
     * @return ResponseEntity with HTTP 204 status
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodIntake(
            @PathVariable Long id,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        foodIntakeService.deleteFoodIntake(id, userId);
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