package com.healthtracker.htbackend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthtracker.htbackend.dto.*;
import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for error handling scenarios and edge cases.
 * Tests validation errors, authorization failures, and resource not found scenarios.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ErrorHandlingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WaterIntakeRepository waterIntakeRepository;

    @Autowired
    private FoodIntakeRepository foodIntakeRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private DailyHealthIndexRepository dailyHealthIndexRepository;

    private MockHttpSession session;

    @BeforeEach
    void setUp() {
        // Clean up repositories - use try-catch to handle cases where tables don't exist yet
        try {
            dailyHealthIndexRepository.deleteAll();
        } catch (Exception e) {
            // Ignore - table may not exist yet
        }
        try {
            waterIntakeRepository.deleteAll();
        } catch (Exception e) {
            // Ignore - table may not exist exist yet
        }
        try {
            foodIntakeRepository.deleteAll();
        } catch (Exception e) {
            // Ignore - table may not exist yet
        }
        try {
            workoutRepository.deleteAll();
        } catch (Exception e) {
            // Ignore - table may not exist yet
        }
        try {
            userRepository.deleteAll();
        } catch (Exception e) {
            // Ignore - table may not exist yet
        }
        
        session = new MockHttpSession();
    }

    @Test
    void registrationValidationErrors_ShouldReturnBadRequest() throws Exception {
        // Test invalid username (too short)
        UserRegistrationDto invalidUsername = new UserRegistrationDto("ab", "test@example.com", "Password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidUsername))
                .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Validation failed")));

        // Test invalid email format
        UserRegistrationDto invalidEmail = new UserRegistrationDto("testuser", "invalid-email", "Password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidEmail))
                .with(csrf()))
                .andExpect(status().isBadRequest());

        // Test weak password
        UserRegistrationDto weakPassword = new UserRegistrationDto("testuser", "test@example.com", "weak");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(weakPassword))
                .with(csrf()))
                .andExpect(status().isBadRequest());

        // Test blank fields
        UserRegistrationDto blankFields = new UserRegistrationDto("", "", "");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(blankFields))
                .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void duplicateRegistration_ShouldReturnConflict() throws Exception {
        // Register first user
        UserRegistrationDto firstUser = new UserRegistrationDto("testuser", "test@example.com", "Password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(firstUser))
                .with(csrf()))
                .andExpect(status().isCreated());

        // Try to register with same username
        UserRegistrationDto sameUsername = new UserRegistrationDto("testuser", "different@example.com", "Password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sameUsername))
                .with(csrf()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Username already exists")));

        // Try to register with same email
        UserRegistrationDto sameEmail = new UserRegistrationDto("differentuser", "test@example.com", "Password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sameEmail))
                .with(csrf()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Email already exists")));
    }

    @Test
    void unauthorizedAccess_ShouldReturnUnauthorized() throws Exception {
        // Try to access protected endpoints without authentication
        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/water"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"amountLtr\": 1.0}")
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/food"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/workouts"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/health-index"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidLoginCredentials_ShouldReturnUnauthorized() throws Exception {
        // Register a user first
        UserRegistrationDto registrationDto = new UserRegistrationDto("testuser", "test@example.com", "Password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDto))
                .with(csrf()))
                .andExpect(status().isCreated());

        // Try login with wrong username
        UserLoginDto wrongUsername = new UserLoginDto("wronguser", "Password123");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongUsername))
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        // Try login with wrong password
        UserLoginDto wrongPassword = new UserLoginDto("testuser", "WrongPassword");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongPassword))
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        // Try login with blank credentials
        UserLoginDto blankCredentials = new UserLoginDto("", "");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(blankCredentials))
                .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void healthDataValidationErrors_ShouldReturnBadRequest() throws Exception {
        // Create and login user
        createAndLoginUser("testuser", "test@example.com", "Password123");

        // Test invalid water intake (too low)
        WaterIntakeRequestDto invalidWaterLow = new WaterIntakeRequestDto(0.05f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidWaterLow))
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest());

        // Test invalid water intake (too high)
        WaterIntakeRequestDto invalidWaterHigh = new WaterIntakeRequestDto(15.0f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidWaterHigh))
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest());

        // Test invalid food intake (empty food item)
        FoodIntakeRequestDto invalidFood = new FoodIntakeRequestDto("", 500);
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidFood))
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest());

        // Test invalid food intake (calories too high)
        FoodIntakeRequestDto invalidCalories = new FoodIntakeRequestDto("Food", 6000);
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCalories))
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest());

        // Test invalid workout (duration too high)
        WorkoutRequestDto invalidWorkout = new WorkoutRequestDto("Running", 700, 500);
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidWorkout))
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest());

        // Test invalid workout (calories burned too high)
        WorkoutRequestDto invalidCaloriesBurned = new WorkoutRequestDto("Running", 30, 2500);
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCaloriesBurned))
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest());
    }

    @Test
    void resourceNotFound_ShouldReturnNotFound() throws Exception {
        // Create and login user
        createAndLoginUser("testuser", "test@example.com", "Password123");

        // Try to update non-existent food entry
        FoodIntakeRequestDto updateRequest = new FoodIntakeRequestDto("Updated Food", 600);
        mockMvc.perform(put("/api/food/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isNotFound());

        // Try to delete non-existent water entry
        mockMvc.perform(delete("/api/water/999")
                .with(csrf())
                .session(session))
                .andExpect(status().isNotFound());

        // Try to update non-existent workout
        WorkoutRequestDto workoutUpdate = new WorkoutRequestDto("Updated Workout", 45, 300);
        mockMvc.perform(put("/api/workouts/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutUpdate))
                .with(csrf())
                .session(session))
                .andExpect(status().isNotFound());

        // Try to delete non-existent food entry
        mockMvc.perform(delete("/api/food/999")
                .with(csrf())
                .session(session))
                .andExpect(status().isNotFound());

        // Try to delete non-existent workout
        mockMvc.perform(delete("/api/workouts/999")
                .with(csrf())
                .session(session))
                .andExpect(status().isNotFound());
    }

    @Test
    void crossUserDataAccess_ShouldReturnForbidden() throws Exception {
        // Create first user and add data
        MockHttpSession session1 = new MockHttpSession();
        createAndLoginUser("user1", "user1@example.com", "Password123", session1);

        // Create water entry for user1
        WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(2.0f);
        MvcResult waterResult = mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(waterRequest))
                .with(csrf())
                .session(session1))
                .andExpect(status().isCreated())
                .andReturn();

        String waterJson = waterResult.getResponse().getContentAsString();
        WaterIntakeResponseDto createdWater = objectMapper.readValue(waterJson, WaterIntakeResponseDto.class);

        // Create food entry for user1
        FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("User1 Food", 500);
        MvcResult foodResult = mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(foodRequest))
                .with(csrf())
                .session(session1))
                .andExpect(status().isCreated())
                .andReturn();

        String foodJson = foodResult.getResponse().getContentAsString();
        FoodIntakeResponseDto createdFood = objectMapper.readValue(foodJson, FoodIntakeResponseDto.class);

        // Create workout entry for user1
        WorkoutRequestDto workoutRequest = new WorkoutRequestDto("User1 Workout", 30, 300);
        MvcResult workoutResult = mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest))
                .with(csrf())
                .session(session1))
                .andExpect(status().isCreated())
                .andReturn();

        String workoutJson = workoutResult.getResponse().getContentAsString();
        WorkoutResponseDto createdWorkout = objectMapper.readValue(workoutJson, WorkoutResponseDto.class);

        // Create second user
        MockHttpSession session2 = new MockHttpSession();
        createAndLoginUser("user2", "user2@example.com", "Password123", session2);

        // Try to delete user1's water entry as user2
        mockMvc.perform(delete("/api/water/" + createdWater.getId())
                .with(csrf())
                .session(session2))
                .andExpect(status().isForbidden());

        // Try to update user1's food entry as user2
        FoodIntakeRequestDto updateFood = new FoodIntakeRequestDto("Hacked Food", 999);
        mockMvc.perform(put("/api/food/" + createdFood.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateFood))
                .with(csrf())
                .session(session2))
                .andExpect(status().isForbidden());

        // Try to delete user1's food entry as user2
        mockMvc.perform(delete("/api/food/" + createdFood.getId())
                .with(csrf())
                .session(session2))
                .andExpect(status().isForbidden());

        // Try to update user1's workout as user2
        WorkoutRequestDto updateWorkout = new WorkoutRequestDto("Hacked Workout", 60, 500);
        mockMvc.perform(put("/api/workouts/" + createdWorkout.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateWorkout))
                .with(csrf())
                .session(session2))
                .andExpect(status().isForbidden());

        // Try to delete user1's workout as user2
        mockMvc.perform(delete("/api/workouts/" + createdWorkout.getId())
                .with(csrf())
                .session(session2))
                .andExpect(status().isForbidden());
    }

    @Test
    void healthScoreWithNoData_ShouldReturnZeroScore() throws Exception {
        // Create and login user
        createAndLoginUser("emptyuser", "empty@example.com", "Password123");

        // Get health score with no data
        mockMvc.perform(get("/api/health-index")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore", is(0.0)))
                .andExpect(jsonPath("$.message", containsString("No health data found")));
    }

    @Test
    void malformedJsonRequests_ShouldReturnBadRequest() throws Exception {
        // Create and login user
        createAndLoginUser("testuser", "test@example.com", "Password123");

        // Test malformed JSON for water intake
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"amountLtr\": \"not-a-number\"}")
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest());

        // Test malformed JSON for food intake
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"foodItem\": \"Food\", \"calories\": \"not-a-number\"}")
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest());

        // Test incomplete JSON for workout
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"activity\": \"Running\"}")
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest());
    }

    private User createAndLoginUser(String username, String email, String password) throws Exception {
        return createAndLoginUser(username, email, password, session);
    }

    private User createAndLoginUser(String username, String email, String password, MockHttpSession userSession) throws Exception {
        // Register user
        UserRegistrationDto registrationDto = new UserRegistrationDto(username, email, password);
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDto))
                .with(csrf())
                .session(userSession))
                .andExpect(status().isCreated());

        // Login user
        UserLoginDto loginDto = new UserLoginDto(username, password);
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto))
                .with(csrf())
                .session(userSession))
                .andExpect(status().isOk());

        return userRepository.findByUsername(username).orElseThrow();
    }
}