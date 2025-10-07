package com.healthtracker.htbackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Root Controller for handling requests to the root path.
 * Provides basic information about the Health Tracker API.
 */
@RestController
@Tag(name = "Root", description = "Root endpoint for API information")
public class RootController {

    /**
     * Root endpoint that provides basic API information.
     * 
     * @return ResponseEntity with API information
     */
    @Operation(
        summary = "API Information",
        description = "Get basic information about the Health Tracker API"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "API information retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Map.class),
                examples = @ExampleObject(
                    value = "{\"name\": \"Health Tracker API\", \"version\": \"1.0.0\", \"status\": \"running\", \"timestamp\": \"2024-01-15T10:30:00\"}"
                )
            )
        )
    })
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("name", "Health Tracker API");
        response.put("version", "1.0.0");
        response.put("status", "running");
        response.put("description", "Backend API for Health Tracker application");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.put("endpoints", Map.of(
            "health", "/api/health",
            "auth", "/api/auth/*",
            "water", "/api/water",
            "food", "/api/food",
            "workouts", "/api/workouts",
            "health-index", "/api/health-index",
            "documentation", "/swagger-ui.html"
        ));
        
        return ResponseEntity.ok(response);
    }
}