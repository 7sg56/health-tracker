package com.healthtracker.htbackend.controller;

import com.healthtracker.htbackend.service.TestDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test-data")
@Tag(name = "Test Data Management", description = "Endpoints for managing test data setup and cleanup")
public class TestDataController {

    @Autowired
    private TestDataService testDataService;

    @PostMapping("/setup")
    @Operation(summary = "Setup test data", description = "Creates test data for connectivity testing")
    public ResponseEntity<Map<String, Object>> setupTestData(
            @Parameter(description = "Test data configuration") @RequestBody TestDataSetupRequest request) {
        Map<String, Object> result = testDataService.setupTestData(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/setup/users")
    @Operation(summary = "Create test users", description = "Creates test users for authentication testing")
    public ResponseEntity<List<TestUser>> createTestUsers(
            @Parameter(description = "Number of users to create") @RequestParam(defaultValue = "5") int count) {
        List<TestUser> users = testDataService.createTestUsers(count);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/setup/health-data")
    @Operation(summary = "Create test health data", description = "Creates test health tracking data")
    public ResponseEntity<Map<String, Object>> createTestHealthData(
            @Parameter(description = "User ID") @RequestParam String userId,
            @Parameter(description = "Days of data") @RequestParam(defaultValue = "30") int days) {
        Map<String, Object> result = testDataService.createTestHealthData(userId, days);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users")
    @Operation(summary = "Get test users", description = "Retrieves list of test users")
    public ResponseEntity<List<TestUser>> getTestUsers() {
        List<TestUser> users = testDataService.getTestUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/status")
    @Operation(summary = "Get test data status", description = "Retrieves current test data setup status")
    public ResponseEntity<Map<String, Object>> getTestDataStatus() {
        Map<String, Object> status = testDataService.getTestDataStatus();
        return ResponseEntity.ok(status);
    }

    @DeleteMapping("/cleanup")
    @Operation(summary = "Cleanup test data", description = "Removes all test data from the system")
    public ResponseEntity<Map<String, Object>> cleanupTestData(
            @Parameter(description = "Force cleanup even if tests are running") @RequestParam(defaultValue = "false") boolean force) {
        Map<String, Object> result = testDataService.cleanupTestData(force);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/cleanup/users")
    @Operation(summary = "Cleanup test users", description = "Removes test users and their associated data")
    public ResponseEntity<Map<String, Object>> cleanupTestUsers() {
        Map<String, Object> result = testDataService.cleanupTestUsers();
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/cleanup/health-data")
    @Operation(summary = "Cleanup test health data", description = "Removes test health tracking data")
    public ResponseEntity<Map<String, Object>> cleanupTestHealthData(
            @Parameter(description = "User ID") @RequestParam(required = false) String userId) {
        Map<String, Object> result = testDataService.cleanupTestHealthData(userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset test environment", description = "Completely resets the test environment")
    public ResponseEntity<Map<String, Object>> resetTestEnvironment() {
        Map<String, Object> result = testDataService.resetTestEnvironment();
        return ResponseEntity.ok(result);
    }

    // DTOs
    public static class TestDataSetupRequest {
        private int userCount = 5;
        private int daysOfData = 30;
        private boolean includeHealthData = true;
        private boolean includeWorkouts = true;
        private boolean includeFoodIntake = true;
        private boolean includeWaterIntake = true;

        // Getters and setters
        public int getUserCount() { return userCount; }
        public void setUserCount(int userCount) { this.userCount = userCount; }
        
        public int getDaysOfData() { return daysOfData; }
        public void setDaysOfData(int daysOfData) { this.daysOfData = daysOfData; }
        
        public boolean isIncludeHealthData() { return includeHealthData; }
        public void setIncludeHealthData(boolean includeHealthData) { this.includeHealthData = includeHealthData; }
        
        public boolean isIncludeWorkouts() { return includeWorkouts; }
        public void setIncludeWorkouts(boolean includeWorkouts) { this.includeWorkouts = includeWorkouts; }
        
        public boolean isIncludeFoodIntake() { return includeFoodIntake; }
        public void setIncludeFoodIntake(boolean includeFoodIntake) { this.includeFoodIntake = includeFoodIntake; }
        
        public boolean isIncludeWaterIntake() { return includeWaterIntake; }
        public void setIncludeWaterIntake(boolean includeWaterIntake) { this.includeWaterIntake = includeWaterIntake; }
    }

    public static class TestUser {
        private String id;
        private String username;
        private String email;
        private String password;
        private boolean isTestUser;

        public TestUser(String id, String username, String email, String password) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.password = password;
            this.isTestUser = true;
        }

        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public boolean isTestUser() { return isTestUser; }
        public void setTestUser(boolean testUser) { isTestUser = testUser; }
    }
}