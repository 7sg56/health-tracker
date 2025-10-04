package com.healthtracker.htbackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthtracker.htbackend.dto.PaginatedResponse;
import com.healthtracker.htbackend.dto.WaterIntakeRequestDto;
import com.healthtracker.htbackend.dto.WaterIntakeResponseDto;
import com.healthtracker.htbackend.exception.ForbiddenException;
import com.healthtracker.htbackend.exception.ResourceNotFoundException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.service.WaterIntakeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for WaterIntakeController endpoints.
 * Tests all water intake functionality including creation, retrieval, and deletion.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WaterIntakeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private WaterIntakeService waterIntakeService;

    @Test
    @WithMockUser
    void createWaterIntake_WithValidData_ShouldReturnCreatedEntry() throws Exception {
        // Given
        WaterIntakeRequestDto requestDto = new WaterIntakeRequestDto(2.5f);
        WaterIntakeResponseDto expectedResponse = new WaterIntakeResponseDto(
                1L, 2.5f, LocalDate.now(), LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(waterIntakeService.createWaterIntake(any(WaterIntakeRequestDto.class), eq(1L)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.amountLtr", is(2.5)))
                .andExpect(jsonPath("$.date", notNullValue()))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        verify(waterIntakeService).createWaterIntake(any(WaterIntakeRequestDto.class), eq(1L));
    }

    @Test
    @WithMockUser
    void createWaterIntake_WithInvalidAmount_ShouldReturnBadRequest() throws Exception {
        // Given - Invalid amount (too high)
        WaterIntakeRequestDto requestDto = new WaterIntakeRequestDto(15.0f);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);

        // When & Then
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isBadRequest());

        // Service should not be called due to validation failure
        verify(waterIntakeService, never()).createWaterIntake(any(), any());
    }

    @Test
    @WithMockUser
    void createWaterIntake_WithoutSession_ShouldReturnUnauthorized() throws Exception {
        // Given
        WaterIntakeRequestDto requestDto = new WaterIntakeRequestDto(2.5f);

        // When & Then
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        verify(waterIntakeService, never()).createWaterIntake(any(), any());
    }

    @Test
    @WithMockUser
    void createWaterIntake_WithInvalidSession_ShouldReturnUnauthorized() throws Exception {
        // Given
        WaterIntakeRequestDto requestDto = new WaterIntakeRequestDto(2.5f);
        MockHttpSession session = new MockHttpSession();
        // No userId in session

        // When & Then
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        verify(waterIntakeService, never()).createWaterIntake(any(), any());
    }

    @Test
    @WithMockUser
    void getWaterIntakes_WithDefaultParameters_ShouldReturnPaginatedEntries() throws Exception {
        // Given
        List<WaterIntakeResponseDto> waterIntakes = Arrays.asList(
                new WaterIntakeResponseDto(1L, 2.5f, LocalDate.now(), LocalDateTime.now()),
                new WaterIntakeResponseDto(2L, 1.5f, LocalDate.now().minusDays(1), LocalDateTime.now())
        );
        
        Page<WaterIntakeResponseDto> page = new PageImpl<>(waterIntakes, PageRequest.of(0, 10), 2);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(waterIntakeService.getWaterIntakes(eq(1L), any(Pageable.class), eq(null), eq(null)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/water")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].id", is(1)))
                .andExpect(jsonPath("$.content[0].amountLtr", is(2.5)))
                .andExpect(jsonPath("$.content[1].id", is(2)))
                .andExpect(jsonPath("$.content[1].amountLtr", is(1.5)))
                .andExpect(jsonPath("$.page.number", is(0)))
                .andExpect(jsonPath("$.page.size", is(10)))
                .andExpect(jsonPath("$.page.totalElements", is(2)))
                .andExpect(jsonPath("$.page.totalPages", is(1)));

        verify(waterIntakeService).getWaterIntakes(eq(1L), any(Pageable.class), eq(null), eq(null));
    }

    @Test
    @WithMockUser
    void getWaterIntakes_WithPaginationParameters_ShouldReturnCorrectPage() throws Exception {
        // Given
        List<WaterIntakeResponseDto> waterIntakes = Arrays.asList(
                new WaterIntakeResponseDto(3L, 3.0f, LocalDate.now(), LocalDateTime.now())
        );
        
        Page<WaterIntakeResponseDto> page = new PageImpl<>(waterIntakes, PageRequest.of(1, 5), 6);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(waterIntakeService.getWaterIntakes(eq(1L), any(Pageable.class), eq(null), eq(null)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/water")
                .param("page", "1")
                .param("size", "5")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.page.number", is(1)))
                .andExpect(jsonPath("$.page.size", is(5)))
                .andExpect(jsonPath("$.page.totalElements", is(6)))
                .andExpect(jsonPath("$.page.totalPages", is(2)));

        verify(waterIntakeService).getWaterIntakes(eq(1L), any(Pageable.class), eq(null), eq(null));
    }

    @Test
    @WithMockUser
    void getWaterIntakes_WithDateFiltering_ShouldReturnFilteredEntries() throws Exception {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        
        List<WaterIntakeResponseDto> waterIntakes = Arrays.asList(
                new WaterIntakeResponseDto(1L, 2.5f, LocalDate.now(), LocalDateTime.now())
        );
        
        Page<WaterIntakeResponseDto> page = new PageImpl<>(waterIntakes, PageRequest.of(0, 10), 1);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(waterIntakeService.getWaterIntakes(eq(1L), any(Pageable.class), eq(startDate), eq(endDate)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/water")
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString())
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        verify(waterIntakeService).getWaterIntakes(eq(1L), any(Pageable.class), eq(startDate), eq(endDate));
    }

    @Test
    @WithMockUser
    void getWaterIntakes_WithSortParameters_ShouldReturnSortedEntries() throws Exception {
        // Given
        List<WaterIntakeResponseDto> waterIntakes = Arrays.asList(
                new WaterIntakeResponseDto(1L, 1.5f, LocalDate.now().minusDays(1), LocalDateTime.now()),
                new WaterIntakeResponseDto(2L, 2.5f, LocalDate.now(), LocalDateTime.now())
        );
        
        Page<WaterIntakeResponseDto> page = new PageImpl<>(waterIntakes, PageRequest.of(0, 10), 2);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(waterIntakeService.getWaterIntakes(eq(1L), any(Pageable.class), eq(null), eq(null)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/water")
                .param("sort", "date,asc")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)));

        verify(waterIntakeService).getWaterIntakes(eq(1L), any(Pageable.class), eq(null), eq(null));
    }

    @Test
    @WithMockUser
    void getWaterIntakes_WithoutSession_ShouldReturnUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/water"))
                .andExpect(status().isUnauthorized());

        verify(waterIntakeService, never()).getWaterIntakes(any(), any(), any(), any());
    }

    @Test
    @WithMockUser
    void deleteWaterIntake_WithValidId_ShouldReturnNoContent() throws Exception {
        // Given
        Long entryId = 1L;
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        doNothing().when(waterIntakeService).deleteWaterIntake(entryId, 1L);

        // When & Then
        mockMvc.perform(delete("/api/water/{id}", entryId)
                .session(session)
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(waterIntakeService).deleteWaterIntake(entryId, 1L);
    }

    @Test
    @WithMockUser
    void deleteWaterIntake_WithNonExistentId_ShouldReturnNotFound() throws Exception {
        // Given
        Long entryId = 999L;
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        doThrow(new ResourceNotFoundException("Water intake entry not found"))
                .when(waterIntakeService).deleteWaterIntake(entryId, 1L);

        // When & Then
        mockMvc.perform(delete("/api/water/{id}", entryId)
                .session(session)
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(waterIntakeService).deleteWaterIntake(entryId, 1L);
    }

    @Test
    @WithMockUser
    void deleteWaterIntake_WithUnauthorizedUser_ShouldReturnForbidden() throws Exception {
        // Given
        Long entryId = 1L;
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 2L); // Different user
        
        doThrow(new ForbiddenException("You can only delete your own water intake entries"))
                .when(waterIntakeService).deleteWaterIntake(entryId, 2L);

        // When & Then
        mockMvc.perform(delete("/api/water/{id}", entryId)
                .session(session)
                .with(csrf()))
                .andExpect(status().isForbidden());

        verify(waterIntakeService).deleteWaterIntake(entryId, 2L);
    }

    @Test
    @WithMockUser
    void deleteWaterIntake_WithoutSession_ShouldReturnUnauthorized() throws Exception {
        // Given
        Long entryId = 1L;

        // When & Then
        mockMvc.perform(delete("/api/water/{id}", entryId)
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        verify(waterIntakeService, never()).deleteWaterIntake(any(), any());
    }

    @Test
    @WithMockUser
    void createWaterIntake_WithNullAmount_ShouldReturnBadRequest() throws Exception {
        // Given - Null amount
        WaterIntakeRequestDto requestDto = new WaterIntakeRequestDto(null);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);

        // When & Then
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isBadRequest());

        verify(waterIntakeService, never()).createWaterIntake(any(), any());
    }

    @Test
    @WithMockUser
    void createWaterIntake_WithTooLowAmount_ShouldReturnBadRequest() throws Exception {
        // Given - Amount too low
        WaterIntakeRequestDto requestDto = new WaterIntakeRequestDto(0.05f);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);

        // When & Then
        mockMvc.perform(post("/api/water")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isBadRequest());

        verify(waterIntakeService, never()).createWaterIntake(any(), any());
    }

    @Test
    @WithMockUser
    void getWaterIntakes_WithInvalidDateFormat_ShouldReturnBadRequest() throws Exception {
        // Given
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);

        // When & Then
        mockMvc.perform(get("/api/water")
                .param("startDate", "invalid-date")
                .session(session))
                .andExpect(status().isBadRequest());

        verify(waterIntakeService, never()).getWaterIntakes(any(), any(), any(), any());
    }
}