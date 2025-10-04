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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Performance integration tests for the health tracker backend.
 * Tests pagination performance, concurrent user scenarios, and large dataset handling.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PerformanceIntegrationTest {

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
    void paginationPerformanceWithLargeDataset_ShouldPerformWell() throws Exception {
        // Create and login user
        createAndLoginUser("perfuser", "perf@example.com", "Password123");

        // Create a large dataset (100 water intake entries)
        long startTime = System.currentTimeMillis();
        
        for (int i = 1; i <= 100; i++) {
            WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(1.0f + (i * 0.01f));
            mockMvc.perform(post("/api/water")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(waterRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());
        }

        long creationTime = System.currentTimeMillis() - startTime;
        System.out.println("Created 100 water entries in: " + creationTime + "ms");

        // Test pagination performance with different page sizes
        startTime = System.currentTimeMillis();
        
        // Test first page with size 10
        mockMvc.perform(get("/api/water")
                .param("page", "0")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.page.totalElements", is(100)));

        long firstPageTime = System.currentTimeMillis() - startTime;
        System.out.println("First page (10 items) retrieved in: " + firstPageTime + "ms");

        // Test middle page
        startTime = System.currentTimeMillis();
        
        mockMvc.perform(get("/api/water")
                .param("page", "5")
                .param("size", "10")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.page.number", is(5)));

        long middlePageTime = System.currentTimeMillis() - startTime;
        System.out.println("Middle page (10 items) retrieved in: " + middlePageTime + "ms");

        // Test large page size
        startTime = System.currentTimeMillis();
        
        mockMvc.perform(get("/api/water")
                .param("page", "0")
                .param("size", "50")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(50)))
                .andExpect(jsonPath("$.page.totalElements", is(100)));

        long largePageTime = System.currentTimeMillis() - startTime;
        System.out.println("Large page (50 items) retrieved in: " + largePageTime + "ms");

        // Verify performance is reasonable (all operations should complete within 1 second)
        assertThat(firstPageTime).isLessThan(1000);
        assertThat(middlePageTime).isLessThan(1000);
        assertThat(largePageTime).isLessThan(1000);

        // Verify database state
        long totalEntries = waterIntakeRepository.count();
        assertThat(totalEntries).isEqualTo(100);
    }

    @Test
    void concurrentUserScenarios_ShouldMaintainDataIsolation() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(5);
        
        try {
            // Create multiple concurrent user scenarios
            @SuppressWarnings("unchecked")
            CompletableFuture<Void>[] futures = IntStream.range(1, 6)
                .mapToObj(i -> CompletableFuture.runAsync(() -> {
                    try {
                        // Each thread creates its own session and user
                        MockHttpSession userSession = new MockHttpSession();
                        String username = "concurrentuser" + i;
                        String email = "concurrent" + i + "@example.com";
                        
                        createAndLoginUser(username, email, "Password123", userSession);
                        
                        // Each user creates 10 water entries
                        for (int j = 1; j <= 10; j++) {
                            WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(1.0f + (j * 0.1f));
                            mockMvc.perform(post("/api/water")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(waterRequest))
                                    .with(csrf())
                                    .session(userSession))
                                    .andExpect(status().isCreated());
                        }
                        
                        // Each user creates 5 food entries
                        for (int j = 1; j <= 5; j++) {
                            FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("Food " + j, 100 + (j * 50));
                            mockMvc.perform(post("/api/food")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(foodRequest))
                                    .with(csrf())
                                    .session(userSession))
                                    .andExpect(status().isCreated());
                        }
                        
                        // Verify each user only sees their own data
                        mockMvc.perform(get("/api/water")
                                .session(userSession))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content", hasSize(10)))
                                .andExpect(jsonPath("$.page.totalElements", is(10)));
                        
                        mockMvc.perform(get("/api/food")
                                .session(userSession))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content", hasSize(5)))
                                .andExpect(jsonPath("$.page.totalElements", is(5)));
                        
                    } catch (Exception e) {
                        throw new RuntimeException("Concurrent test failed for user " + i, e);
                    }
                }, executor))
                .toArray(CompletableFuture[]::new);

            // Wait for all concurrent operations to complete
            CompletableFuture.allOf(futures).get(30, TimeUnit.SECONDS);

            // Verify total data integrity
            long totalUsers = userRepository.count();
            long totalWaterEntries = waterIntakeRepository.count();
            long totalFoodEntries = foodIntakeRepository.count();

            assertThat(totalUsers).isEqualTo(5);
            assertThat(totalWaterEntries).isEqualTo(50); // 5 users * 10 entries each
            assertThat(totalFoodEntries).isEqualTo(25);  // 5 users * 5 entries each

            System.out.println("Concurrent test completed successfully:");
            System.out.println("- Total users: " + totalUsers);
            System.out.println("- Total water entries: " + totalWaterEntries);
            System.out.println("- Total food entries: " + totalFoodEntries);

        } finally {
            executor.shutdown();
        }
    }

    @Test
    void bulkDataOperations_ShouldPerformEfficiently() throws Exception {
        // Create and login user
        createAndLoginUser("bulkuser", "bulk@example.com", "Password123");

        // Test bulk creation performance
        long startTime = System.currentTimeMillis();
        
        // Create 50 food entries in sequence
        for (int i = 1; i <= 50; i++) {
            FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("Bulk Food " + i, 100 + i);
            mockMvc.perform(post("/api/food")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(foodRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());
        }

        long bulkCreationTime = System.currentTimeMillis() - startTime;
        System.out.println("Created 50 food entries in: " + bulkCreationTime + "ms");

        // Test bulk retrieval performance
        startTime = System.currentTimeMillis();
        
        mockMvc.perform(get("/api/food")
                .param("page", "0")
                .param("size", "50")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(50)))
                .andExpect(jsonPath("$.page.totalElements", is(50)));

        long bulkRetrievalTime = System.currentTimeMillis() - startTime;
        System.out.println("Retrieved 50 food entries in: " + bulkRetrievalTime + "ms");

        // Performance assertions (should complete within reasonable time)
        assertThat(bulkCreationTime).isLessThan(5000); // 5 seconds for 50 creations
        assertThat(bulkRetrievalTime).isLessThan(1000); // 1 second for retrieval
    }

    @Test
    void healthScoreCalculationPerformance_ShouldBeEfficient() throws Exception {
        // Create and login user
        createAndLoginUser("scoreuser", "score@example.com", "Password123");

        // Create comprehensive health data
        long startTime = System.currentTimeMillis();

        // Add multiple water entries
        for (int i = 1; i <= 10; i++) {
            WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(0.25f);
            mockMvc.perform(post("/api/water")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(waterRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());
        }

        // Add multiple food entries
        for (int i = 1; i <= 8; i++) {
            FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("Meal " + i, 250);
            mockMvc.perform(post("/api/food")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(foodRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());
        }

        // Add multiple workout entries
        for (int i = 1; i <= 3; i++) {
            WorkoutRequestDto workoutRequest = new WorkoutRequestDto("Exercise " + i, 10, 100);
            mockMvc.perform(post("/api/workouts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(workoutRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());
        }

        long dataCreationTime = System.currentTimeMillis() - startTime;
        System.out.println("Created comprehensive health data in: " + dataCreationTime + "ms");

        // Test health score calculation performance
        startTime = System.currentTimeMillis();

        mockMvc.perform(get("/api/health-index")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore", notNullValue()))
                .andExpect(jsonPath("$.date", is(LocalDate.now().toString())));

        long calculationTime = System.currentTimeMillis() - startTime;
        System.out.println("Health score calculated in: " + calculationTime + "ms");

        // Test repeated calculations (should use caching)
        startTime = System.currentTimeMillis();

        mockMvc.perform(get("/api/health-index")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore", notNullValue()));

        long cachedCalculationTime = System.currentTimeMillis() - startTime;
        System.out.println("Cached health score retrieved in: " + cachedCalculationTime + "ms");

        // Performance assertions
        assertThat(calculationTime).isLessThan(2000); // 2 seconds for calculation
        assertThat(cachedCalculationTime).isLessThan(500); // 500ms for cached result
    }

    @Test
    void paginationWithFiltering_ShouldPerformWell() throws Exception {
        // Create and login user
        createAndLoginUser("filteruser", "filter@example.com", "Password123");

        // Create mixed data over time (simulating historical data)
        for (int i = 1; i <= 30; i++) {
            // Create water entries
            WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(1.0f + (i * 0.05f));
            mockMvc.perform(post("/api/water")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(waterRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());

            // Create food entries with varying calories
            FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("Food " + i, 100 + (i * 25));
            mockMvc.perform(post("/api/food")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(foodRequest))
                    .with(csrf())
                    .session(session))
                    .andExpect(status().isCreated());
        }

        // Test filtered pagination performance
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate tomorrow = today.plusDays(1);

        long startTime = System.currentTimeMillis();

        // Test date filtering with pagination
        mockMvc.perform(get("/api/water")
                .param("page", "0")
                .param("size", "10")
                .param("startDate", yesterday.toString())
                .param("endDate", tomorrow.toString())
                .param("sort", "amountLtr,desc")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.page.totalElements", is(30)));

        long filteredPaginationTime = System.currentTimeMillis() - startTime;
        System.out.println("Filtered pagination completed in: " + filteredPaginationTime + "ms");

        // Test sorting performance
        startTime = System.currentTimeMillis();

        mockMvc.perform(get("/api/food")
                .param("page", "0")
                .param("size", "15")
                .param("sort", "calories,desc")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(15)));

        long sortingTime = System.currentTimeMillis() - startTime;
        System.out.println("Sorting completed in: " + sortingTime + "ms");

        // Performance assertions
        assertThat(filteredPaginationTime).isLessThan(1000);
        assertThat(sortingTime).isLessThan(1000);
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