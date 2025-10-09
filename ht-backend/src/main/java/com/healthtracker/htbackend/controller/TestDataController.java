package com.healthtracker.htbackend.controller;

import com.healthtracker.htbackend.service.TestDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test-data")
public class TestDataController {

    @Autowired
    private TestDataService testDataService;

    @PostMapping("/setup")
    public ResponseEntity<Map<String, Object>> setupTestData(
            @RequestBody TestDataSetupRequest request) {
        Map<String, Object> result = testDataService.setupTestData(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/setup/users")
    public ResponseEntity<List<TestUser>> createTestUsers(
            @RequestParam(defaultValue = "5") int count) {
        List<TestUser> users = testDataService.createTestUsers(count);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/setup/health-data")
    public ResponseEntity<Map<String, Object>> createTestHealthData(
            @RequestParam String userId,
            @RequestParam(defaultValue = "30") int days) {
        Map<String, Object> result = testDataService.createTestHealthData(userId, days);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users")
    public ResponseEntity<List<TestUser>> getTestUsers() {
        List<TestUser> users = testDataService.getTestUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getTestDataStatus() {
        Map<String, Object> status = testDataService.getTestDataStatus();
        return ResponseEntity.ok(status);
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupTestData(
            @RequestParam(defaultValue = "false") boolean force) {
        Map<String, Object> result = testDataService.cleanupTestData(force);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/cleanup/users")
    public ResponseEntity<Map<String, Object>> cleanupTestUsers() {
        Map<String, Object> result = testDataService.cleanupTestUsers();
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/cleanup/health-data")
    public ResponseEntity<Map<String, Object>> cleanupTestHealthData(
            @RequestParam(required = false) String userId) {
        Map<String, Object> result = testDataService.cleanupTestHealthData(userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset")
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