package com.healthtracker.htbackend.controller;

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
public class RootController {

    /**
     * Root endpoint that provides basic API information.
     * 
     * @return ResponseEntity with API information
     */
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
            "health-index", "/api/health-index"
        ));
        
        return ResponseEntity.ok(response);
    }
}