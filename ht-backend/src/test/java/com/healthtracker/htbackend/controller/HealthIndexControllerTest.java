package com.healthtracker.htbackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthtracker.htbackend.dto.DailyHealthIndexResponseDto;
import com.healthtracker.htbackend.exception.ResourceNotFoundException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.service.HealthScoreService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for HealthIndexController endpoints.
 * Tests all health index functionality including retrieval and calculation.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HealthIndexControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private HealthScoreService healthScoreService;

    @Test
    @WithMockUser
    void getCurrentHealthIndex_WithValidSession_ShouldReturnHealthScore() throws Exception {
        // Given
        LocalDate currentDate = LocalDate.now();
        DailyHealthIndexResponseDto expectedResponse = new DailyHealthIndexResponseDto(
                1L, currentDate, 85.5f, LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(healthScoreService.getHealthScore(eq(1L), eq(currentDate)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(get("/api/health-index")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.date", is(currentDate.toString())))
                .andExpect(jsonPath("$.healthScore", is(85.5)))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        verify(healthScoreService).getHealthScore(eq(1L), eq(currentDate));
    }

    @Test
    @WithMockUser
    void getHealthIndexByDate_WithValidDate_ShouldReturnHealthScore() throws Exception {
        // Given
        LocalDate specificDate = LocalDate.of(2024, 1, 15);
        DailyHealthIndexResponseDto expectedResponse = new DailyHealthIndexResponseDto(
                2L, specificDate, 75.0f, LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(healthScoreService.getHealthScore(eq(1L), eq(specificDate)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(get("/api/health-index/{date}", specificDate)
                .session(session))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(2)))
                .andExpect(jsonPath("$.date", is(specificDate.toString())))
                .andExpect(jsonPath("$.healthScore", is(75.0)))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        verify(healthScoreService).getHealthScore(eq(1L), eq(specificDate));
    }

    @Test
    @WithMockUser
    void calculateCurrentHealthIndex_WithValidSession_ShouldReturnCalculatedScore() throws Exception {
        // Given
        LocalDate currentDate = LocalDate.now();
        DailyHealthIndexResponseDto expectedResponse = new DailyHealthIndexResponseDto(
                1L, currentDate, 90.0f, LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(healthScoreService.calculateHealthScore(eq(1L), eq(currentDate)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post("/api/health-index/calculate")
                .session(session)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.date", is(currentDate.toString())))
                .andExpect(jsonPath("$.healthScore", is(90.0)))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        verify(healthScoreService).calculateHealthScore(eq(1L), eq(currentDate));
    }

    @Test
    @WithMockUser
    void calculateHealthIndexByDate_WithValidDate_ShouldReturnCalculatedScore() throws Exception {
        // Given
        LocalDate specificDate = LocalDate.of(2024, 1, 15);
        DailyHealthIndexResponseDto expectedResponse = new DailyHealthIndexResponseDto(
                2L, specificDate, 80.0f, LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(healthScoreService.calculateHealthScore(eq(1L), eq(specificDate)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post("/api/health-index/calculate/{date}", specificDate)
                .session(session)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(2)))
                .andExpect(jsonPath("$.date", is(specificDate.toString())))
                .andExpect(jsonPath("$.healthScore", is(80.0)))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        verify(healthScoreService).calculateHealthScore(eq(1L), eq(specificDate));
    }

    @Test
    @WithMockUser
    void getCurrentHealthIndex_WithoutSession_ShouldReturnUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/health-index"))
                .andExpect(status().isUnauthorized());

        verify(healthScoreService, never()).getHealthScore(any(), any());
    }

    @Test
    @WithMockUser
    void getCurrentHealthIndex_WithInvalidSession_ShouldReturnUnauthorized() throws Exception {
        // Given
        MockHttpSession session = new MockHttpSession();
        // No userId in session

        // When & Then
        mockMvc.perform(get("/api/health-index")
                .session(session))
                .andExpect(status().isUnauthorized());

        verify(healthScoreService, never()).getHealthScore(any(), any());
    }

    @Test
    @WithMockUser
    void getHealthIndexByDate_WithNonExistentUser_ShouldReturnNotFound() throws Exception {
        // Given
        LocalDate specificDate = LocalDate.of(2024, 1, 15);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 999L);
        
        when(healthScoreService.getHealthScore(eq(999L), eq(specificDate)))
                .thenThrow(new ResourceNotFoundException("User not found"));

        // When & Then
        mockMvc.perform(get("/api/health-index/{date}", specificDate)
                .session(session))
                .andExpect(status().isNotFound());

        verify(healthScoreService).getHealthScore(eq(999L), eq(specificDate));
    }

    @Test
    @WithMockUser
    void getHealthIndexByDate_WithInvalidDateFormat_ShouldReturnBadRequest() throws Exception {
        // Given
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);

        // When & Then
        mockMvc.perform(get("/api/health-index/{date}", "invalid-date")
                .session(session))
                .andExpect(status().isBadRequest());

        verify(healthScoreService, never()).getHealthScore(any(), any());
    }

    @Test
    @WithMockUser
    void calculateCurrentHealthIndex_WithoutSession_ShouldReturnUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/health-index/calculate")
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        verify(healthScoreService, never()).calculateHealthScore(any(), any());
    }

    @Test
    @WithMockUser
    void calculateHealthIndexByDate_WithNonExistentUser_ShouldReturnNotFound() throws Exception {
        // Given
        LocalDate specificDate = LocalDate.of(2024, 1, 15);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 999L);
        
        when(healthScoreService.calculateHealthScore(eq(999L), eq(specificDate)))
                .thenThrow(new ResourceNotFoundException("User not found"));

        // When & Then
        mockMvc.perform(post("/api/health-index/calculate/{date}", specificDate)
                .session(session)
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(healthScoreService).calculateHealthScore(eq(999L), eq(specificDate));
    }

    @Test
    @WithMockUser
    void getCurrentHealthIndex_WithZeroHealthScore_ShouldReturnZeroScore() throws Exception {
        // Given - User with no health data should get 0 score
        LocalDate currentDate = LocalDate.now();
        DailyHealthIndexResponseDto expectedResponse = new DailyHealthIndexResponseDto(
                1L, currentDate, 0.0f, LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(healthScoreService.getHealthScore(eq(1L), eq(currentDate)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(get("/api/health-index")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore", is(0.0)));

        verify(healthScoreService).getHealthScore(eq(1L), eq(currentDate));
    }

    @Test
    @WithMockUser
    void getHealthIndexByDate_WithPerfectHealthScore_ShouldReturnMaxScore() throws Exception {
        // Given - User with perfect health data should get 100 score
        LocalDate specificDate = LocalDate.of(2024, 1, 15);
        DailyHealthIndexResponseDto expectedResponse = new DailyHealthIndexResponseDto(
                1L, specificDate, 100.0f, LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(healthScoreService.getHealthScore(eq(1L), eq(specificDate)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(get("/api/health-index/{date}", specificDate)
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore", is(100.0)));

        verify(healthScoreService).getHealthScore(eq(1L), eq(specificDate));
    }
}