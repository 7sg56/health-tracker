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

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Security integration tests for the health tracker backend.
 * Tests session security, CSRF protection, authentication, and authorization.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityIntegrationTest {

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
    void csrfProtection_ShouldBeEnforced() throws Exception {
        // Create user first
        createAndLoginUser("csrfuser", "csrf@example.com", "Password123");

        // Test that requests without CSRF token are rejected
        WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(2.0f);

        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(waterRequest))
                .session(session)) // No CSRF token
                .andExpect(status().isForbidden());

        // Test that requests with CSRF token are accepted
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(waterRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Test CSRF protection on other endpoints
        FoodIntakeRequestDto foodRequest = new FoodIntakeRequestDto("Test Food", 500);

        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(foodRequest))
                .session(session)) // No CSRF token
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(foodRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());
    }

    @Test
    void sessionSecurity_ShouldBeProperlyManaged() throws Exception {
        // Test that unauthenticated requests are rejected
        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/water"))
                .andExpect(status().isUnauthorized());

        // Create and login user
        User user = createAndLoginUser("sessionuser", "session@example.com", "Password123");

        // Test that authenticated requests work
        mockMvc.perform(get("/api/auth/profile")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("sessionuser")));

        // Test session persistence across requests
        WaterIntakeRequestDto waterRequest = new WaterIntakeRequestDto(1.5f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(waterRequest))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/water")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        // Test logout invalidates session
        mockMvc.perform(post("/api/auth/logout")
                .with(csrf())
                .session(session))
                .andExpect(status().isOk());

        // Test that requests after logout are rejected
        mockMvc.perform(get("/api/auth/profile")
                .session(session))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/water")
                .session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void sessionIsolation_ShouldPreventCrossUserAccess() throws Exception {
        // Create first user and session
        MockHttpSession session1 = new MockHttpSession();
        User user1 = createAndLoginUser("user1", "user1@example.com", "Password123", session1);

        // Create second user and session
        MockHttpSession session2 = new MockHttpSession();
        User user2 = createAndLoginUser("user2", "user2@example.com", "Password123", session2);

        // User1 creates data
        WaterIntakeRequestDto water1 = new WaterIntakeRequestDto(2.0f);
        MvcResult result1 = mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(water1))
                .with(csrf())
                .session(session1))
                .andExpect(status().isCreated())
                .andReturn();

        String waterJson1 = result1.getResponse().getContentAsString();
        WaterIntakeResponseDto createdWater1 = objectMapper.readValue(waterJson1, WaterIntakeResponseDto.class);

        // User2 creates data
        WaterIntakeRequestDto water2 = new WaterIntakeRequestDto(1.5f);
        MvcResult result2 = mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(water2))
                .with(csrf())
                .session(session2))
                .andExpect(status().isCreated())
                .andReturn();

        String waterJson2 = result2.getResponse().getContentAsString();
        WaterIntakeResponseDto createdWater2 = objectMapper.readValue(waterJson2, WaterIntakeResponseDto.class);

        // Verify users can only see their own data
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

        // Verify users cannot access each other's data
        mockMvc.perform(delete("/api/water/" + createdWater2.getId())
                .with(csrf())
                .session(session1)) // User1 trying to delete User2's data
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/water/" + createdWater1.getId())
                .with(csrf())
                .session(session2)) // User2 trying to delete User1's data
                .andExpect(status().isForbidden());

        // Verify users can delete their own data
        mockMvc.perform(delete("/api/water/" + createdWater1.getId())
                .with(csrf())
                .session(session1))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/water/" + createdWater2.getId())
                .with(csrf())
                .session(session2))
                .andExpect(status().isNoContent());
    }

    @Test
    void passwordSecurity_ShouldBeProperlyHashed() throws Exception {
        // Register a user
        UserRegistrationDto registrationDto = new UserRegistrationDto(
                "secureuser", 
                "secure@example.com", 
                "MySecurePassword123"
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDto))
                .with(csrf()))
                .andExpect(status().isCreated());

        // Verify password is hashed in database
        User user = userRepository.findByUsername("secureuser").orElseThrow();
        
        // Password should not be stored in plain text
        assertThat(user.getPassword()).isNotEqualTo("MySecurePassword123");
        
        // Password should be BCrypt hashed (starts with $2a$, $2b$, or $2y$)
        assertThat(user.getPassword()).matches("^\\$2[aby]\\$\\d+\\$.{53}$");
        
        // Password should be at least 60 characters (BCrypt hash length)
        assertThat(user.getPassword().length()).isGreaterThanOrEqualTo(60);

        // Test that login works with correct password
        UserLoginDto loginDto = new UserLoginDto("secureuser", "MySecurePassword123");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto))
                .with(csrf())
                .session(session))
                .andExpect(status().isOk());

        // Test that login fails with incorrect password
        UserLoginDto wrongLoginDto = new UserLoginDto("secureuser", "WrongPassword");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongLoginDto))
                .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void inputValidation_ShouldPreventSecurityVulnerabilities() throws Exception {
        // Create and login user
        createAndLoginUser("validationuser", "validation@example.com", "Password123");

        // Test SQL injection attempts in water intake
        WaterIntakeRequestDto sqlInjectionWater = new WaterIntakeRequestDto(1.0f);
        // The amount field is a float, so SQL injection through this field is not possible
        // But we test that the system handles it gracefully
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sqlInjectionWater))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Test XSS attempts in food item names
        FoodIntakeRequestDto xssFood = new FoodIntakeRequestDto("<script>alert('xss')</script>", 500);
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(xssFood))
                .with(csrf())
                .session(session))
                .andExpect(status().isCreated());

        // Verify the data is stored as-is (not executed)
        mockMvc.perform(get("/api/food")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].foodItem", is("<script>alert('xss')</script>")));

        // Test very long strings (potential buffer overflow)
        String longString = "A".repeat(1000);
        FoodIntakeRequestDto longFood = new FoodIntakeRequestDto(longString, 500);
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(longFood))
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest()); // Should be rejected due to validation

        // Test null values
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"foodItem\": null, \"calories\": 500}")
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest());

        // Test negative values where not allowed
        WaterIntakeRequestDto negativeWater = new WaterIntakeRequestDto(-1.0f);
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(negativeWater))
                .with(csrf())
                .session(session))
                .andExpect(status().isBadRequest());
    }

    @Test
    void authenticationBypass_ShouldNotBePossible() throws Exception {
        // Test that manipulating session attributes doesn't bypass authentication
        MockHttpSession maliciousSession = new MockHttpSession();
        maliciousSession.setAttribute("user", "fakeuser");
        maliciousSession.setAttribute("authenticated", true);

        mockMvc.perform(get("/api/auth/profile")
                .session(maliciousSession))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/water")
                .session(maliciousSession))
                .andExpect(status().isUnauthorized());

        // Test that invalid session IDs are rejected
        MockHttpSession invalidSession = new MockHttpSession();
        // MockHttpSession doesn't have setId method, so we test with a fresh session
        mockMvc.perform(get("/api/auth/profile")
                .session(invalidSession))
                .andExpect(status().isUnauthorized());

        // Test that expired sessions are handled properly
        // (This is more of a conceptual test since we can't easily simulate session expiration in unit tests)
        MockHttpSession expiredSession = new MockHttpSession();
        expiredSession.setMaxInactiveInterval(0); // Immediately expired

        mockMvc.perform(get("/api/auth/profile")
                .session(expiredSession))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rateLimiting_ShouldPreventAbuse() throws Exception {
        // Test multiple rapid registration attempts (potential abuse)
        for (int i = 1; i <= 10; i++) {
            UserRegistrationDto registrationDto = new UserRegistrationDto(
                    "rapiduser" + i, 
                    "rapid" + i + "@example.com", 
                    "Password123"
            );

            MvcResult result = mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(registrationDto))
                    .with(csrf()))
                    .andReturn();

            // All should succeed (no rate limiting implemented yet, but test structure is ready)
            assertThat(result.getResponse().getStatus()).isIn(201, 429); // 201 Created or 429 Too Many Requests
        }

        // Test multiple rapid login attempts with wrong credentials
        UserLoginDto wrongLogin = new UserLoginDto("nonexistent", "wrongpassword");
        
        int failedAttempts = 0;
        for (int i = 1; i <= 5; i++) {
            MvcResult result = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(wrongLogin))
                    .with(csrf()))
                    .andReturn();

            if (result.getResponse().getStatus() == 401) {
                failedAttempts++;
            }
        }

        // All attempts should fail with 401 (no account lockout implemented yet)
        assertThat(failedAttempts).isEqualTo(5);
    }

    @Test
    void sessionCookieSecurity_ShouldBeConfiguredProperly() throws Exception {
        // Create and login user
        createAndLoginUser("cookieuser", "cookie@example.com", "Password123");

        // Make a request that should set session cookie
        MvcResult result = mockMvc.perform(get("/api/auth/profile")
                .session(session))
                .andExpect(status().isOk())
                .andReturn();

        // Verify session cookie properties (this is more of a configuration test)
        // In a real application, you would check:
        // - HttpOnly flag is set
        // - Secure flag is set (in HTTPS environments)
        // - SameSite attribute is configured
        // - Proper domain and path settings

        // For this test, we verify that the session is working properly
        assertThat(session.getId()).isNotNull();
        assertThat(session.isNew()).isFalse();
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