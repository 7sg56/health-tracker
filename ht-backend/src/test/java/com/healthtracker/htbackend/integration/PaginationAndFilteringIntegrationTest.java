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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for pagination and filtering functionality.
 * Tests pagination parameters, date filtering, and sorting for all health tracking endpoints.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PaginationAndFilteringIntegrationTest {

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
    void waterIntakePagination_ShouldWorkCorrectly() throws Exception {
        // Create and login user
        createAndLoginUser("paginationuser", "pagination@example.com", "Password123");

        // Create 15 water intake entries
        for (int i = 1; i <= 15; i++) {
            WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(1.0f + (i * 0.1f));
            mockMvc.perform(post("/api/water")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(waterRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());
        }

        // Test first page (default size 10)
        mockMvc.perform(get("/api/water")
                .param("page", "0")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.page.number", is(0)))
                .andExpect(jsonPath("$.page.size", is(10)))
                .andExpect(jsonPath("$.page.totalElements", is(15)))
                .andExpect(jsonPath("$.page.totalPages", is(2)));

        // Test second page
        mockMvc.perform(get("/api/water")
                .param("page", "1")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.page.number", is(1)))
                .andExpect(jsonPath("$.page.size", is(10)))
                .andExpect(jsonPath("$.page.totalElements", is(15)))
                .andExpect(jsonPath("$.page.totalPages", is(2)));

        // Test custom page size
        mockMvc.perform(get("/api/water")
                .param("page", "0")
                .param("size", "5")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.page.number", is(0)))
                .andExpect(jsonPath("$.page.size", is(5)))
                .andExpect(jsonPath("$.page.totalElements", is(15)))
                .andExpect(jsonPath("$.page.totalPages", is(3)));
    }

    @Test
    void foodIntakePagination_ShouldWorkCorrectly() throws Exception {
        // Create and login user
        createAndLoginUser("fooduser", "food@example.com", "Password123");

        // Create 12 food intake entries
        for (int i = 1; i <= 12; i++) {
            FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("Food " + i, 100 + (i * 50));
            mockMvc.perform(post("/api/food")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(foodRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());
        }

        // Test pagination with different page sizes
        mockMvc.perform(get("/api/food")
                .param("page", "0")
                .param("size", "8")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(8)))
                .andExpect(jsonPath("$.page.totalElements", is(12)))
                .andExpect(jsonPath("$.page.totalPages", is(2)));

        mockMvc.perform(get("/api/food")
                .param("page", "1")
                .param("size", "8")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(4)))
                .andExpect(jsonPath("$.page.totalElements", is(12)));
    }

    @Test
    void workoutPagination_ShouldWorkCorrectly() throws Exception {
        // Create and login user
        createAndLoginUser("workoutuser", "workout@example.com", "Password123");

        // Create 20 workout entries
        for (int i = 1; i <= 20; i++) {
            WorkoutRequestDto workoutRequest = new WorkoutRequestDto("Activity " + i, 15 + i, 100 + (i * 10));
            mockMvc.perform(post("/api/workouts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(workoutRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());
        }

        // Test large page size
        mockMvc.perform(get("/api/workouts")
                .param("page", "0")
                .param("size", "25")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(20)))
                .andExpect(jsonPath("$.page.totalElements", is(20)))
                .andExpect(jsonPath("$.page.totalPages", is(1)));

        // Test small page size
        mockMvc.perform(get("/api/workouts")
                .param("page", "0")
                .param("size", "3")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.page.totalElements", is(20)))
                .andExpect(jsonPath("$.page.totalPages", is(7)));
    }

    @Test
    void dateFiltering_ShouldWorkCorrectly() throws Exception {
        // Create and login user
        createAndLoginUser("dateuser", "date@example.com", "Password123");

        // Create entries for different dates (this would require modifying entities to accept custom dates)
        // For now, we'll test with current date and verify the filtering parameters are accepted
        
        // Create some current date entries
        WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(2.0f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(waterRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("Test Food", 500);
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(foodRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        WorkoutRequestDto workoutRequest = new WorkoutRequestDto("Test Workout", 30, 300);
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Test date filtering parameters (should accept the parameters without error)
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate tomorrow = today.plusDays(1);

        // Test water intake date filtering
        mockMvc.perform(get("/api/water")
                .param("startDate", yesterday.toString())
                .param("endDate", tomorrow.toString())
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        // Test food intake date filtering
        mockMvc.perform(get("/api/food")
                .param("startDate", today.toString())
                .param("endDate", today.toString())
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        // Test workout date filtering
        mockMvc.perform(get("/api/workouts")
                .param("startDate", yesterday.toString())
                .param("endDate", tomorrow.toString())
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        // Test filtering with no results (future date range)
        LocalDate futureStart = today.plusDays(10);
        LocalDate futureEnd = today.plusDays(20);

        mockMvc.perform(get("/api/water")
                .param("startDate", futureStart.toString())
                .param("endDate", futureEnd.toString())
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    @Test
    void sortingParameters_ShouldBeAccepted() throws Exception {
        // Create and login user
        createAndLoginUser("sortuser", "sort@example.com", "Password123");

        // Create multiple entries
        for (int i = 1; i <= 5; i++) {
            WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(1.0f + i);
            mockMvc.perform(post("/api/water")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(waterRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());

            FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("Food " + i, 100 * i);
            mockMvc.perform(post("/api/food")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(foodRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());

            WorkoutRequestDto workoutRequest = new WorkoutRequestDto("Workout " + i, 10 + i, 50 * i);
            mockMvc.perform(post("/api/workouts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(workoutRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());
        }

        // Test sorting by date descending (default)
        mockMvc.perform(get("/api/water")
                .param("sort", "date,desc")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)));

        // Test sorting by date ascending
        mockMvc.perform(get("/api/food")
                .param("sort", "date,asc")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)));

        // Test sorting by calories descending for food
        mockMvc.perform(get("/api/food")
                .param("sort", "calories,desc")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)));

        // Test sorting by duration for workouts
        mockMvc.perform(get("/api/workouts")
                .param("sort", "durationMin,asc")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)));
    }

    @Test
    void combinedPaginationAndFiltering_ShouldWorkCorrectly() throws Exception {
        // Create and login user
        createAndLoginUser("combineduser", "combined@example.com", "Password123");

        // Create 15 entries
        for (int i = 1; i <= 15; i++) {
            WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(1.0f + (i * 0.1f));
            mockMvc.perform(post("/api/water")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(waterRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());
        }

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate tomorrow = today.plusDays(1);

        // Test combined pagination, filtering, and sorting
        mockMvc.perform(get("/api/water")
                .param("page", "0")
                .param("size", "5")
                .param("startDate", yesterday.toString())
                .param("endDate", tomorrow.toString())
                .param("sort", "amountLtr,desc")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.page.number", is(0)))
                .andExpect(jsonPath("$.page.size", is(5)))
                .andExpect(jsonPath("$.page.totalElements", is(15)));

        // Test second page with same filters
        mockMvc.perform(get("/api/water")
                .param("page", "1")
                .param("size", "5")
                .param("startDate", yesterday.toString())
                .param("endDate", tomorrow.toString())
                .param("sort", "amountLtr,desc")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.page.number", is(1)))
                .andExpect(jsonPath("$.page.size", is(5)));
    }

    @Test
    void invalidPaginationParameters_ShouldUseDefaults() throws Exception {
        // Create and login user
        createAndLoginUser("invaliduser", "invalid@example.com", "Password123");

        // Create some entries
        WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(2.0f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(waterRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Test negative page number (should default to 0)
        mockMvc.perform(get("/api/water")
                .param("page", "-1")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.number", is(0)));

        // Test zero size (should use default)
        mockMvc.perform(get("/api/water")
                .param("page", "0")
                .param("size", "0")
                .session(session))
                .andExpect(status().isOk());

        // Test very large page number (should return empty content)
        mockMvc.perform(get("/api/water")
                .param("page", "999")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.page.number", is(999)));
    }

    @Test
    void emptyResultsPagination_ShouldReturnEmptyPage() throws Exception {
        // Create and login user (but don't add any data)
        createAndLoginUser("emptyuser", "empty@example.com", "Password123");

        // Test pagination with no data
        mockMvc.perform(get("/api/water")
                .param("page", "0")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.page.number", is(0)))
                .andExpect(jsonPath("$.page.size", is(10)))
                .andExpect(jsonPath("$.page.totalElements", is(0)))
                .andExpect(jsonPath("$.page.totalPages", is(0)));

        mockMvc.perform(get("/api/food")
                .param("page", "0")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.page.totalElements", is(0)));

        mockMvc.perform(get("/api/workouts")
                .param("page", "0")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.page.totalElements", is(0)));
    }

    private User createAndLoginUser(String username, String email, String password) throws Exception {
        // Register user
        UserRegistrationDto registrationDto = new UserRegistrationDto(username, email, password);
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDto))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Login user
        UserLoginDto loginDto = new UserLoginDto(username, password);
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto))
                .with(csrf())
                .session(session))
                .andExpect(status().isOk());

        return userRepository.findByUsername(username).orElseThrow();
    }
}