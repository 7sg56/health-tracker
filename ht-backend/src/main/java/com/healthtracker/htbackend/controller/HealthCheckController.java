package com.healthtracker.htbackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Health Check", description = "API connectivity and health check endpoints")
public class HealthCheckController {

    /**
     * Basic health check endpoint to verify API connectivity.
     * This endpoint does not require authentication and can be used to test CORS configuration.
     * 
     * @return ResponseEntity with health status information
     */
    @Operation(
        summary = "API Health Check",
        description = "Verify that the API is running and accessible. This endpoint does not require authentication."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "API is healthy and accessible",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Map.class),
                examples = @ExampleObject(
                    value = "{\"status\": \"UP\", \"timestamp\": \"2024-01-15T10:30:00\", \"service\": \"Health Tracker API\", \"version\": \"1.0.0\"}"
                )
            )
        )
    })
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
    @Operation(
        summary = "Get CSRF Token",
        description = "Obtain a CSRF token for session-based authentication. The token will be set as a cookie."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "CSRF token provided successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Map.class),
                examples = @ExampleObject(
                    value = "{\"message\": \"CSRF token set in cookie\", \"timestamp\": \"2024-01-15T10:30:00\"}"
                )
            )
        )
    })
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
    @Operation(
        summary = "CORS Preflight Test",
        description = "Handle CORS preflight requests to test cross-origin configuration."
    )
    @RequestMapping(value = "/cors-test", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> corsPreflightTest() {
        return ResponseEntity.ok().build();
    }

    /**
     * Simple ping endpoint for connectivity testing.
     * 
     * @return ResponseEntity with pong message
     */
    @Operation(
        summary = "Ping Test",
        description = "Simple ping endpoint that returns 'pong' to test basic connectivity."
    )
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "pong");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        return ResponseEntity.ok(response);
    }
}