package com.healthtracker.htbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for health check and connectivity testing.
 * Provides endpoints to verify API connectivity and CORS configuration.
 */
@RestController
@RequestMapping("/api")
public class HealthCheckController {

    /**
     * Basic health check endpoint to verify API connectivity.
     * This endpoint does not require authentication and can be used to test CORS configuration.
     * 
     * @return ResponseEntity with health status information
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.put("service", "Health Tracker API");
        response.put("version", "1.0.0");
        
        return ResponseEntity.ok(response);
    }

    /**
     * CSRF token endpoint for session-based authentication.
     * This endpoint can be used to obtain a CSRF token for subsequent requests.
     * 
     * @return ResponseEntity with CSRF token information
     */
    @GetMapping("/auth/csrf")
    public ResponseEntity<Map<String, Object>> getCsrfToken() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "CSRF token set in cookie");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        return ResponseEntity.ok(response);
    }

    /**
     * CORS preflight test endpoint.
     * This endpoint specifically handles OPTIONS requests to test CORS configuration.
     * 
     * @return ResponseEntity for CORS preflight
     */
    @RequestMapping(value = "/cors-test", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> corsPreflightTest() {
        return ResponseEntity.ok().build();
    }

    /**
     * Simple ping endpoint for connectivity testing.
     * 
     * @return ResponseEntity with pong message
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "pong");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        return ResponseEntity.ok(response);
    }
}