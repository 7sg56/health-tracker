package com.healthtracker.htbackend.controller;

import com.healthtracker.htbackend.dto.ErrorResponse;
import com.healthtracker.htbackend.dto.PageInfo;
import com.healthtracker.htbackend.dto.PaginatedResponse;
import com.healthtracker.htbackend.dto.WaterIntakeRequestDto;
import com.healthtracker.htbackend.dto.WaterIntakeResponseDto;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.service.WaterIntakeService;
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
 * REST Controller for water intake endpoints.
 * Handles CRUD operations for water intake tracking with user authentication.
 */
@RestController
@RequestMapping("/api/water")
@Tag(name = "Water Intake", description = "Water intake tracking endpoints for monitoring daily hydration")
@SecurityRequirement(name = "sessionAuth")
public class WaterIntakeController {

    private final WaterIntakeService waterIntakeService;

    @Autowired
    public WaterIntakeController(WaterIntakeService waterIntakeService) {
        this.waterIntakeService = waterIntakeService;
    }

    /**
     * Create a new water intake entry.
     * 
     * @param requestDto the water intake request data
     * @param request the HTTP request for session management
     * @return ResponseEntity with WaterIntakeResponseDto and HTTP 201 status
     */
    @Operation(
        summary = "Create water intake entry",
        description = "Record a new water intake entry for the authenticated user. " +
                     "Amount must be between 0.1 and 10.0 liters."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Water intake entry created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = WaterIntakeResponseDto.class),
                examples = @ExampleObject(
                    value = "{\"id\": 1, \"amountLtr\": 0.5, \"date\": \"2024-01-15\", \"createdAt\": \"2024-01-15T10:30:00\"}"
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
                    value = "{\"timestamp\": \"2024-01-15T10:30:00Z\", \"status\": 400, \"error\": \"Bad Request\", \"message\": \"Validation failed\", \"details\": [{\"field\": \"amountLtr\", \"message\": \"Amount must be between 0.1 and 10.0 liters\"}], \"path\": \"/api/water\"}"
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
    @PostMapping
    public ResponseEntity<WaterIntakeResponseDto> createWaterIntake(
            @Parameter(description = "Water intake data", required = true)
            @Valid @RequestBody WaterIntakeRequestDto requestDto,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        WaterIntakeResponseDto response = waterIntakeService.createWaterIntake(requestDto, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get paginated water intake entries with optional date filtering.
     * 
     * @param page the page number (0-based, default: 0)
     * @param size the page size (default: 10)
     * @param startDate optional start date for filtering (inclusive)
     * @param endDate optional end date for filtering (inclusive)
     * @param sort optional sort parameters (default: date,desc)
     * @param request the HTTP request for session management
     * @return ResponseEntity with paginated water intake entries
     */
    @Operation(
        summary = "Get water intake history",
        description = "Retrieve paginated water intake entries for the authenticated user. " +
                     "Supports date range filtering and sorting by date or amount."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Water intake entries retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = PaginatedResponse.class),
                examples = @ExampleObject(
                    value = "{\"content\": [{\"id\": 1, \"amountLtr\": 0.5, \"date\": \"2024-01-15\", \"createdAt\": \"2024-01-15T10:30:00\"}], \"page\": {\"number\": 0, \"size\": 10, \"totalElements\": 1, \"totalPages\": 1}}"
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
    public ResponseEntity<PaginatedResponse<WaterIntakeResponseDto>> getWaterIntakes(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Start date for filtering (YYYY-MM-DD)", example = "2024-01-01")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date for filtering (YYYY-MM-DD)", example = "2024-01-31")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Sort parameters (property,direction)", example = "date,desc")
            @RequestParam(defaultValue = "date,desc") String[] sort,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        
        // Create sort object from sort parameters
        Sort sortObj = createSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        Page<WaterIntakeResponseDto> waterIntakes = waterIntakeService.getWaterIntakes(
                userId, pageable, startDate, endDate);
        
        PageInfo pageInfo = new PageInfo(
                waterIntakes.getNumber(),
                waterIntakes.getSize(),
                waterIntakes.getTotalElements(),
                waterIntakes.getTotalPages()
        );
        
        PaginatedResponse<WaterIntakeResponseDto> response = new PaginatedResponse<>(
                waterIntakes.getContent(), pageInfo);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a water intake entry with ownership validation.
     * 
     * @param id the ID of the water intake entry to delete
     * @param request the HTTP request for session management
     * @return ResponseEntity with HTTP 204 status
     */
    @Operation(
        summary = "Delete water intake entry",
        description = "Delete a specific water intake entry. Users can only delete their own entries."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "204",
            description = "Water intake entry deleted successfully"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User not authenticated",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "User not authorized to delete this entry",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-01-15T10:30:00Z\", \"status\": 403, \"error\": \"Forbidden\", \"message\": \"Access denied\", \"path\": \"/api/water/1\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Water intake entry not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-01-15T10:30:00Z\", \"status\": 404, \"error\": \"Not Found\", \"message\": \"Water intake entry not found\", \"path\": \"/api/water/999\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWaterIntake(
            @Parameter(description = "Water intake entry ID", required = true, example = "1")
            @PathVariable Long id,
            HttpServletRequest request) {
        
        Long userId = getCurrentUserId(request);
        waterIntakeService.deleteWaterIntake(id, userId);
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