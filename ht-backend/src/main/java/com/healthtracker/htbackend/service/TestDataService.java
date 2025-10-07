package com.healthtracker.htbackend.service;

import com.healthtracker.htbackend.controller.TestDataController.TestDataSetupRequest;
import com.healthtracker.htbackend.controller.TestDataController.TestUser;
import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.entity.FoodIntake;
import com.healthtracker.htbackend.entity.WaterIntake;
import com.healthtracker.htbackend.entity.Workout;
import com.healthtracker.htbackend.repository.UserRepository;
import com.healthtracker.htbackend.repository.FoodIntakeRepository;
import com.healthtracker.htbackend.repository.WaterIntakeRepository;
import com.healthtracker.htbackend.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class TestDataService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodIntakeRepository foodIntakeRepository;

    @Autowired
    private WaterIntakeRepository waterIntakeRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String TEST_USER_PREFIX = "testuser_";
    private static final String TEST_PASSWORD = "TestPassword123!";

    @Transactional
    public Map<String, Object> setupTestData(TestDataSetupRequest request) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Create test users
            List<TestUser> users = createTestUsers(request.getUserCount());
            result.put("usersCreated", users.size());

            // Create health data for each user
            int totalHealthRecords = 0;
            for (TestUser testUser : users) {
                Map<String, Object> healthData = createTestHealthData(testUser.getId(), request.getDaysOfData());
                totalHealthRecords += (Integer) healthData.getOrDefault("totalRecords", 0);
            }
            
            result.put("healthRecordsCreated", totalHealthRecords);
            result.put("daysOfData", request.getDaysOfData());
            result.put("setupTime", LocalDateTime.now());
            result.put("status", "SUCCESS");

        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("error", e.getMessage());
        }

        return result;
    }

    @Transactional
    public List<TestUser> createTestUsers(int count) {
        List<TestUser> testUsers = new ArrayList<>();
        
        for (int i = 1; i <= count; i++) {
            String username = TEST_USER_PREFIX + i;
            String email = username + "@test.com";
            
            // Check if user already exists
            if (userRepository.findByUsername(username).isPresent()) {
                continue;
            }

            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(TEST_PASSWORD));
            user.setCreatedAt(LocalDateTime.now());
            
            User savedUser = userRepository.save(user);
            
            TestUser testUser = new TestUser(
                savedUser.getId().toString(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                TEST_PASSWORD
            );
            testUsers.add(testUser);
        }
        
        return testUsers;
    }

    @Transactional
    public Map<String, Object> createTestHealthData(String userId, int days) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            User user = userRepository.findById(Long.parseLong(userId))
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            int foodRecords = 0;
            int waterRecords = 0;
            int workoutRecords = 0;

            Random random = new Random();
            LocalDate startDate = LocalDate.now().minusDays(days);

            for (int i = 0; i < days; i++) {
                LocalDate currentDate = startDate.plusDays(i);
                
                // Create food intake records (2-4 per day)
                int mealsPerDay = 2 + random.nextInt(3);
                for (int j = 0; j < mealsPerDay; j++) {
                    FoodIntake food = new FoodIntake();
                    food.setUser(user);
                    food.setFoodItem("Test Food " + (j + 1));
                    food.setCalories(200 + random.nextInt(400));
                    food.setDate(currentDate);
                    foodIntakeRepository.save(food);
                    foodRecords++;
                }

                // Create water intake records (4-8 per day)
                int waterIntakesPerDay = 4 + random.nextInt(5);
                for (int j = 0; j < waterIntakesPerDay; j++) {
                    WaterIntake water = new WaterIntake();
                    water.setUser(user);
                    water.setAmountLtr((250 + random.nextInt(250)) / 1000.0f); // Convert ml to liters
                    water.setDate(currentDate);
                    waterIntakeRepository.save(water);
                    waterRecords++;
                }

                // Create workout records (0-2 per day)
                if (random.nextBoolean()) {
                    Workout workout = new Workout();
                    workout.setUser(user);
                    workout.setActivity("Test Workout");
                    workout.setDurationMin(30 + random.nextInt(60));
                    workout.setCaloriesBurned(100 + random.nextInt(300));
                    workout.setDate(currentDate);
                    workoutRepository.save(workout);
                    workoutRecords++;
                }
            }

            result.put("foodRecords", foodRecords);
            result.put("waterRecords", waterRecords);
            result.put("workoutRecords", workoutRecords);
            result.put("totalRecords", foodRecords + waterRecords + workoutRecords);
            result.put("userId", userId);
            result.put("days", days);

        } catch (Exception e) {
            result.put("error", e.getMessage());
        }

        return result;
    }

    public List<TestUser> getTestUsers() {
        List<User> users = userRepository.findByUsernameStartingWith(TEST_USER_PREFIX);
        return users.stream()
                .map(user -> new TestUser(
                    user.getId().toString(),
                    user.getUsername(),
                    user.getEmail(),
                    TEST_PASSWORD
                ))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getTestDataStatus() {
        Map<String, Object> status = new HashMap<>();
        
        List<User> testUsers = userRepository.findByUsernameStartingWith(TEST_USER_PREFIX);
        status.put("testUserCount", testUsers.size());

        if (!testUsers.isEmpty()) {
            List<Long> userIds = testUsers.stream()
                    .map(User::getId)
                    .collect(Collectors.toList());

            long foodRecords = foodIntakeRepository.countByUserIdIn(userIds);
            long waterRecords = waterIntakeRepository.countByUserIdIn(userIds);
            long workoutRecords = workoutRepository.countByUserIdIn(userIds);

            status.put("foodRecords", foodRecords);
            status.put("waterRecords", waterRecords);
            status.put("workoutRecords", workoutRecords);
            status.put("totalHealthRecords", foodRecords + waterRecords + workoutRecords);
        } else {
            status.put("foodRecords", 0);
            status.put("waterRecords", 0);
            status.put("workoutRecords", 0);
            status.put("totalHealthRecords", 0);
        }

        status.put("lastUpdated", LocalDateTime.now());
        return status;
    }

    @Transactional
    public Map<String, Object> cleanupTestData(boolean force) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<User> testUsers = userRepository.findByUsernameStartingWith(TEST_USER_PREFIX);
            
            if (testUsers.isEmpty()) {
                result.put("message", "No test data found");
                result.put("deletedUsers", 0);
                result.put("deletedRecords", 0);
                return result;
            }

            List<Long> userIds = testUsers.stream()
                    .map(User::getId)
                    .collect(Collectors.toList());

            // Delete health records
            long deletedFood = foodIntakeRepository.deleteByUserIdIn(userIds);
            long deletedWater = waterIntakeRepository.deleteByUserIdIn(userIds);
            long deletedWorkouts = workoutRepository.deleteByUserIdIn(userIds);

            // Delete test users
            userRepository.deleteAll(testUsers);

            result.put("deletedUsers", testUsers.size());
            result.put("deletedFoodRecords", deletedFood);
            result.put("deletedWaterRecords", deletedWater);
            result.put("deletedWorkoutRecords", deletedWorkouts);
            result.put("deletedRecords", deletedFood + deletedWater + deletedWorkouts);
            result.put("cleanupTime", LocalDateTime.now());

        } catch (Exception e) {
            result.put("error", e.getMessage());
        }

        return result;
    }

    @Transactional
    public Map<String, Object> cleanupTestUsers() {
        List<User> testUsers = userRepository.findByUsernameStartingWith(TEST_USER_PREFIX);
        userRepository.deleteAll(testUsers);
        
        return Map.of(
            "deletedUsers", testUsers.size(),
            "cleanupTime", LocalDateTime.now()
        );
    }

    @Transactional
    public Map<String, Object> cleanupTestHealthData(String userId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (userId != null) {
                User user = userRepository.findById(Long.parseLong(userId))
                        .orElseThrow(() -> new RuntimeException("User not found: " + userId));
                
                if (!user.getUsername().startsWith(TEST_USER_PREFIX)) {
                    throw new RuntimeException("Not a test user: " + userId);
                }

                long deletedFood = foodIntakeRepository.deleteByUserId(user.getId());
                long deletedWater = waterIntakeRepository.deleteByUserId(user.getId());
                long deletedWorkouts = workoutRepository.deleteByUserId(user.getId());

                result.put("userId", userId);
                result.put("deletedFoodRecords", deletedFood);
                result.put("deletedWaterRecords", deletedWater);
                result.put("deletedWorkoutRecords", deletedWorkouts);
                result.put("totalDeleted", deletedFood + deletedWater + deletedWorkouts);
            } else {
                // Clean all test user health data
                List<User> testUsers = userRepository.findByUsernameStartingWith(TEST_USER_PREFIX);
                List<Long> userIds = testUsers.stream()
                        .map(User::getId)
                        .collect(Collectors.toList());

                long deletedFood = foodIntakeRepository.deleteByUserIdIn(userIds);
                long deletedWater = waterIntakeRepository.deleteByUserIdIn(userIds);
                long deletedWorkouts = workoutRepository.deleteByUserIdIn(userIds);

                result.put("affectedUsers", testUsers.size());
                result.put("deletedFoodRecords", deletedFood);
                result.put("deletedWaterRecords", deletedWater);
                result.put("deletedWorkoutRecords", deletedWorkouts);
                result.put("totalDeleted", deletedFood + deletedWater + deletedWorkouts);
            }

            result.put("cleanupTime", LocalDateTime.now());

        } catch (Exception e) {
            result.put("error", e.getMessage());
        }

        return result;
    }

    @Transactional
    public Map<String, Object> resetTestEnvironment() {
        Map<String, Object> result = cleanupTestData(true);
        result.put("operation", "RESET");
        result.put("resetTime", LocalDateTime.now());
        return result;
    }
}