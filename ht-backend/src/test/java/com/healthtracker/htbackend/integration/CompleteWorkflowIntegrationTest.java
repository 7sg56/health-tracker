package com.healthtracker.htbackend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthtracker.htbackend.dto.*;
import com.healthtracker.htbackend.entity.*;
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

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive integration tests for complete user workflows.
 * Tests end-to-end scenarios including user registration, login, health tracking, and health score calculation.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CompleteWorkflowIntegrationTest {

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
            // Ignore - table may not exist yet
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
    void completeUserRegistrationAndLoginFlow_ShouldWorkEndToEnd() throws Exception {
        // Step 1: Register a new user
        UserRegistrationDto registrationDto = new UserRegistrationDto(
                "testuser123", 
                "test@example.com", 
                "Password123"
        );

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDto))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("testuser123")))
                .andExpect(jsonPath("$.email", is("test@example.com")))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andReturn();

        // Verify user was created in database
        List<User> users = userRepository.findAll();
        assertThat(users).hasSize(1);
        assertThat(users.get(0).getUsername()).isEqualTo("testuser123");
        assertThat(users.get(0).getEmail()).isEqualTo("test@example.com");

        // Step 2: Login with the registered user
        UserLoginDto loginDto = new UserLoginDto("testuser123", "Password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto))
                .with(csrf())
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("testuser123")))
                .andExpect(jsonPath("$.email", is("test@example.com")));

        // Step 3: Verify profile access works
        mockMvc.perform(get("/api/auth/profile")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("testuser123")))
                .andExpect(jsonPath("$.email", is("test@example.com")));

        // Step 4: Logout
        mockMvc.perform(post("/api/auth/logout")
                .with(csrf())
                .session(session))
                .andExpect(status().isOk());

        // Step 5: Verify profile access is denied after logout
        mockMvc.perform(get("/api/auth/profile")
                .session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void completeHealthTrackingWorkflow_ShouldWorkEndToEnd() throws Exception {
        // Step 1: Register and login user
        User user = createAndLoginUser("healthuser", "health@example.com", "Password123");

        // Step 2: Add water intake entries
        WaterIntakeRequestDto waterRequest1 = new WaterIntakeRequestDto(1.5f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(waterRequest1))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amountLtr", is(1.5)))
                .andExpect(jsonPath("$.date", is(LocalDate.now().toString())));

        WaterIntakeRequestDto waterRequest2 = new WaterIntakeRequestDto(1.0f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(waterRequest2))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Step 3: Add food intake entries
        FoodIntakeRequestDto foodRequest1 = new FoodIntakeRequestDto("Breakfast", 500);
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(foodRequest1))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.foodItem", is("Breakfast")))
                .andExpect(jsonPath("$.calories", is(500)));

        FoodIntakeRequestDto foodRequest2 = new FoodIntakeRequestDto("Lunch", 800);
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(foodRequest2))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        FoodIntakeRequestDto foodRequest3 = new FoodIntakeRequestDto("Dinner", 700);
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(foodRequest3))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Step 4: Add workout entries
        WorkoutRequestDto workoutRequest1 = new WorkoutRequestDto("Running", 30, 300);
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest1))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.activity", is("Running")))
                .andExpect(jsonPath("$.durationMin", is(30)))
                .andExpect(jsonPath("$.caloriesBurned", is(300)));

        // Step 5: Verify data retrieval with pagination
        mockMvc.perform(get("/api/water")
                .param("page", "0")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.page.totalElements", is(2)));

        mockMvc.perform(get("/api/food")
                .param("page", "0")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.page.totalElements", is(3)));

        mockMvc.perform(get("/api/workouts")
                .param("page", "0")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.page.totalElements", is(1)));

        // Step 6: Verify database state
        List<WaterIntake> waterIntakes = waterIntakeRepository.findByUserIdAndDate(user.getId(), LocalDate.now());
        assertThat(waterIntakes).hasSize(2);
        assertThat(waterIntakes.stream().mapToDouble(WaterIntake::getAmountLtr).sum()).isEqualTo(2.5);

        List<FoodIntake> foodIntakes = foodIntakeRepository.findByUserIdAndDate(user.getId(), LocalDate.now());
        assertThat(foodIntakes).hasSize(3);
        assertThat(foodIntakes.stream().mapToInt(FoodIntake::getCalories).sum()).isEqualTo(2000);

        List<Workout> workouts = workoutRepository.findByUserIdAndDate(user.getId(), LocalDate.now());
        assertThat(workouts).hasSize(1);
        assertThat(workouts.stream().mapToInt(Workout::getDurationMin).sum()).isEqualTo(30);
    }

    @Test
    void healthScoreCalculationWithRealData_ShouldCalculateCorrectly() throws Exception {
        // Step 1: Register and login user
        User user = createAndLoginUser("scoreuser", "score@example.com", "Password123");

        // Step 2: Add perfect health data (should result in score of 100)
        // Water: 2.5L (target) = 100% * 30% = 30 points
        WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(2.5f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(waterRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Food: 2000 calories (target) = 100% * 40% = 40 points
        FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("Perfect Meal", 2000);
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(foodRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Exercise: 30 minutes (target) = 100% * 30% = 30 points
        WorkoutRequestDto workoutRequest = new WorkoutRequestDto("Perfect Workout", 30, 250);
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Step 3: Get health score for today
        mockMvc.perform(get("/api/health-index")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore", is(100.0)))
                .andExpect(jsonPath("$.date", is(LocalDate.now().toString())));

        // Step 4: Verify health score was stored in database
        var healthIndex = dailyHealthIndexRepository.findByUserIdAndDate(user.getId(), LocalDate.now());
        assertThat(healthIndex).isPresent();
        assertThat(healthIndex.get().getHealthScore()).isEqualTo(100.0f);
    }

    @Test
    void healthScoreCalculationWithPartialData_ShouldCalculateCorrectly() throws Exception {
        // Step 1: Register and login user
        User user = createAndLoginUser("partialuser", "partial@example.com", "Password123");

        // Step 2: Add partial health data
        // Water: 1.25L (50% of target) = 50% * 30% = 15 points
        WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(1.25f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(waterRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Food: 2400 calories (400 over target) = max(0, 100 - 400/20) = 80% * 40% = 32 points
        FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("High Calorie Meal", 2400);
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(foodRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Exercise: 15 minutes (50% of target) = 50% * 30% = 15 points
        WorkoutRequestDto workoutRequest = new WorkoutRequestDto("Short Workout", 15, 125);
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Step 3: Get health score (should be 15 + 32 + 15 = 62)
        mockMvc.perform(get("/api/health-index")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore", is(62.0)))
                .andExpect(jsonPath("$.date", is(LocalDate.now().toString())));
    }

    @Test
    void updateAndDeleteOperations_ShouldWorkCorrectly() throws Exception {
        // Step 1: Register and login user
        createAndLoginUser("cruduser", "crud@example.com", "Password123");

        // Step 2: Create food entry
        FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("Original Food", 500);
        MvcResult createResult = mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(foodRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated())
                .andReturn();

        String responseJson = createResult.getResponse().getContentAsString();
        FoodIntakeResponseDto createdFood = objectMapper.readValue(responseJson, FoodIntakeResponseDto.class);

        // Step 3: Update food entry
        FoodIntakeRequestDto updateRequest = new FoodIntakeRequestDto("Updated Food", 600);
        mockMvc.perform(put("/api/food/" + createdFood.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.foodItem", is("Updated Food")))
                .andExpect(jsonPath("$.calories", is(600)));

        // Step 4: Create workout entry
        WorkoutRequestDto workoutRequest = new WorkoutRequestDto("Test Workout", 45, 400);
        MvcResult workoutResult = mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated())
                .andReturn();

        String workoutJson = workoutResult.getResponse().getContentAsString();
        WorkoutResponseDto createdWorkout = objectMapper.readValue(workoutJson, WorkoutResponseDto.class);

        // Step 5: Update workout entry
        WorkoutRequestDto workoutUpdateRequest = new WorkoutRequestDto("Updated Workout", 60, 500);
        mockMvc.perform(put("/api/workouts/" + createdWorkout.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutUpdateRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activity", is("Updated Workout")))
                .andExpect(jsonPath("$.durationMin", is(60)))
                .andExpect(jsonPath("$.caloriesBurned", is(500)));

        // Step 6: Create water entry for deletion
        WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(1.0f);
        MvcResult waterResult = mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(waterRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated())
                .andReturn();

        String waterJson = waterResult.getResponse().getContentAsString();
        WaterIntakeResponseDto createdWater = objectMapper.readValue(waterJson, WaterIntakeResponseDto.class);

        // Step 7: Delete water entry
        mockMvc.perform(delete("/api/water/" + createdWater.getId())
                .with(csrf())
                .session(session))
                .andExpect(status().isNoContent());

        // Step 8: Verify deletion
        mockMvc.perform(get("/api/water")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    @Test
    void dataIsolationBetweenUsers_ShouldWorkCorrectly() throws Exception {
        // Step 1: Create first user and add data
        MockHttpSession session1 = new MockHttpSession();
        User user1 = createAndLoginUser("user1", "user1@example.com", "Password123", session1);

        WaterIntakeRequestDto water1 = new WaterIntakeRequestDto(2.0f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(water1))
                .with(csrf())
                .session(session1))
                .andExpect(status().isCreated());

        // Step 2: Create second user and add data
        MockHttpSession session2 = new MockHttpSession();
        User user2 = createAndLoginUser("user2", "user2@example.com", "Password123", session2);

        WaterIntakeRequestDto water2 = new WaterIntakeRequestDto(1.5f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(water2))
                .with(csrf())
                .session(session2))
                .andExpect(status().isCreated());

        // Step 3: Verify each user only sees their own data
        mockMvc.perform(get("/api/water")
                .session(session1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].amountLtr", is(2.0)));

        mockMvc.perform(get("/api/water")
                .session(session2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].amountLtr", is(1.5)));

        // Step 4: Verify database isolation
        List<WaterIntake> user1Water = waterIntakeRepository.findByUserIdAndDate(user1.getId(), LocalDate.now());
        List<WaterIntake> user2Water = waterIntakeRepository.findByUserIdAndDate(user2.getId(), LocalDate.now());

        assertThat(user1Water).hasSize(1);
        assertThat(user1Water.get(0).getAmountLtr()).isEqualTo(2.0f);

        assertThat(user2Water).hasSize(1);
        assertThat(user2Water.get(0).getAmountLtr()).isEqualTo(1.5f);
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