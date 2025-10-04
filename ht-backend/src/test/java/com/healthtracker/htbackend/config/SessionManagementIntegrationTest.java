package com.healthtracker.htbackend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthtracker.htbackend.dto.UserLoginDto;
import com.healthtracker.htbackend.dto.UserRegistrationDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpSession;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = {
    "server.servlet.session.timeout=24h",
    "server.servlet.session.cookie.http-only=true",
    "server.servlet.session.cookie.secure=false",
    "server.servlet.session.cookie.name=HEALTHTRACKER_SESSION"
})
class SessionManagementIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private UserRegistrationDto testUser;
    private UserLoginDto loginDto;

    @BeforeEach
    void setUp() {
        testUser = new UserRegistrationDto();
        testUser.setUsername("sessiontestuser");
        testUser.setEmail("sessiontest@example.com");
        testUser.setPassword("TestPass123");

        loginDto = new UserLoginDto();
        loginDto.setUsername("sessiontestuser");
        loginDto.setPassword("TestPass123");
    }

    @Test
    void testSessionCreationOnLogin() throws Exception {
        // Register user first
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isCreated());

        // Login and verify session is created
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andReturn();

        // Verify session cookie is set
        Cookie sessionCookie = result.getResponse().getCookie("HEALTHTRACKER_SESSION");
        assertNotNull(sessionCookie, "Session cookie should be set");
        assertTrue(sessionCookie.isHttpOnly(), "Session cookie should be HttpOnly");
        assertEquals("/", sessionCookie.getPath(), "Session cookie path should be /");
        assertEquals(86400, sessionCookie.getMaxAge(), "Session cookie max age should be 24 hours");

        // Verify session exists
        HttpSession session = result.getRequest().getSession(false);
        assertNotNull(session, "Session should exist after login");
        assertEquals(86400, session.getMaxInactiveInterval(), "Session timeout should be 24 hours");
    }

    @Test
    void testSessionPersistenceAcrossRequests() throws Exception {
        // Register and login
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isCreated());

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andReturn();

        // Get session from login
        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession();
        assertNotNull(session);

        // Use session in subsequent request
        mockMvc.perform(get("/api/auth/profile")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("sessiontestuser"));
    }

    @Test
    void testSessionInvalidationOnLogout() throws Exception {
        // Register and login
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isCreated());

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession();
        String sessionId = session.getId();
        assertNotNull(sessionId);

        // Logout
        mockMvc.perform(post("/api/auth/logout")
                .session(session))
                .andExpect(status().isOk());

        // Verify session is invalidated
        assertTrue(session.isInvalid(), "Session should be invalidated after logout");

        // Verify subsequent requests with old session fail
        mockMvc.perform(get("/api/auth/profile")
                .session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testSessionAttributesAreSet() throws Exception {
        // Register and login
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isCreated());

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andReturn();

        HttpSession session = loginResult.getRequest().getSession();
        
        // Verify session security attributes are set by SessionConfig
        assertNotNull(session.getAttribute("createdAt"), "createdAt should be set");
        assertNotNull(session.getAttribute("lastAccessedAt"), "lastAccessedAt should be set");
        assertEquals(true, session.getAttribute("sessionSecure"), "sessionSecure should be true");
    }

    @Test
    void testSessionTimeoutConfiguration() throws Exception {
        // Register and login
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isCreated());

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andReturn();

        HttpSession session = loginResult.getRequest().getSession();
        
        // Verify session timeout is set to 24 hours (86400 seconds)
        assertEquals(86400, session.getMaxInactiveInterval(), 
            "Session timeout should be 24 hours (86400 seconds)");
    }

    @Test
    void testConcurrentSessionHandling() throws Exception {
        // Register user
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isCreated());

        // First login
        MvcResult firstLogin = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession firstSession = (MockHttpSession) firstLogin.getRequest().getSession();
        
        // Second login (should work due to maxSessionsPreventsLogin=false)
        MvcResult secondLogin = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession secondSession = (MockHttpSession) secondLogin.getRequest().getSession();
        
        // Both sessions should be valid initially
        assertNotEquals(firstSession.getId(), secondSession.getId(), 
            "Sessions should have different IDs");
        
        // Both sessions should work for API calls
        mockMvc.perform(get("/api/auth/profile")
                .session(firstSession))
                .andExpect(status().isOk());
                
        mockMvc.perform(get("/api/auth/profile")
                .session(secondSession))
                .andExpect(status().isOk());
    }

    @Test
    void testSessionCookieSecuritySettings() throws Exception {
        // Register and login
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie sessionCookie = result.getResponse().getCookie("HEALTHTRACKER_SESSION");
        assertNotNull(sessionCookie);
        
        // Verify security settings
        assertTrue(sessionCookie.isHttpOnly(), "Cookie should be HttpOnly");
        assertFalse(sessionCookie.getSecure(), "Cookie should not be Secure in test environment");
        assertEquals("HEALTHTRACKER_SESSION", sessionCookie.getName(), "Cookie name should match configuration");
        assertEquals("/", sessionCookie.getPath(), "Cookie path should be /");
        assertEquals(86400, sessionCookie.getMaxAge(), "Cookie max age should be 24 hours");
    }

    @Test
    void testSessionActiveCount() throws Exception {
        // Get initial active session count
        int initialCount = SessionConfig.CustomSessionListener.getActiveSessionCount();
        
        // Register and login to create a session
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isCreated());

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andReturn();

        // Verify session count increased
        assertEquals(initialCount + 1, SessionConfig.CustomSessionListener.getActiveSessionCount(),
            "Active session count should increase after login");

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession();
        
        // Logout to destroy session
        mockMvc.perform(post("/api/auth/logout")
                .session(session))
                .andExpect(status().isOk());

        // Verify session count decreased
        assertEquals(initialCount, SessionConfig.CustomSessionListener.getActiveSessionCount(),
            "Active session count should decrease after logout");
    }
}