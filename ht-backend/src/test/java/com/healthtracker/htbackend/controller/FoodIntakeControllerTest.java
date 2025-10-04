package com.healthtracker.htbackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthtracker.htbackend.dto.FoodIntakeRequestDto;
import com.healthtracker.htbackend.dto.FoodIntakeResponseDto;
import com.healthtracker.htbackend.dto.PaginatedResponse;
import com.healthtracker.htbackend.exception.ForbiddenException;
import com.healthtracker.htbackend.exception.ResourceNotFoundException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.service.FoodIntakeService;
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
 * Integration tests for FoodIntakeController endpoints.
 * Tests all food intake functionality including CRUD operations.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FoodIntakeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FoodIntakeService foodIntakeService;

    @Test
    @WithMockUser
    void createFoodIntake_WithValidData_ShouldReturnCreatedEntry() throws Exception {
        // Given
        FoodIntakeRequestDto requestDto = new FoodIntakeRequestDto("Apple", 95);
        FoodIntakeResponseDto expectedResponse = new FoodIntakeResponseDto(
                1L, "Apple", 95, LocalDate.now(), LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(foodIntakeService.createFoodIntake(any(FoodIntakeRequestDto.class), eq(1L)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.foodItem", is("Apple")))
                .andExpect(jsonPath("$.calories", is(95)))
                .andExpect(jsonPath("$.date", notNullValue()))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        verify(foodIntakeService).createFoodIntake(any(FoodIntakeRequestDto.class), eq(1L));
    }

    @Test
    @WithMockUser
    void createFoodIntake_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Given - Invalid calories (too high)
        FoodIntakeRequestDto requestDto = new FoodIntakeRequestDto("Pizza", 6000);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);

        // When & Then
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isBadRequest());

        verify(foodIntakeService, never()).createFoodIntake(any(), any());
    }

    @Test
    @WithMockUser
    void getFoodIntakes_WithDefaultParameters_ShouldReturnPaginatedEntries() throws Exception {
        // Given
        List<FoodIntakeResponseDto> foodIntakes = Arrays.asList(
                new FoodIntakeResponseDto(1L, "Apple", 95, LocalDate.now(), LocalDateTime.now()),
                new FoodIntakeResponseDto(2L, "Banana", 105, LocalDate.now().minusDays(1), LocalDateTime.now())
        );
        
        Page<FoodIntakeResponseDto> page = new PageImpl<>(foodIntakes, PageRequest.of(0, 10), 2);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(foodIntakeService.getFoodIntakes(eq(1L), any(Pageable.class), eq(null), eq(null)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/food")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].id", is(1)))
                .andExpect(jsonPath("$.content[0].foodItem", is("Apple")))
                .andExpect(jsonPath("$.content[0].calories", is(95)))
                .andExpect(jsonPath("$.content[1].id", is(2)))
                .andExpect(jsonPath("$.content[1].foodItem", is("Banana")))
                .andExpect(jsonPath("$.content[1].calories", is(105)))
                .andExpect(jsonPath("$.page.number", is(0)))
                .andExpect(jsonPath("$.page.size", is(10)))
                .andExpect(jsonPath("$.page.totalElements", is(2)))
                .andExpect(jsonPath("$.page.totalPages", is(1)));

        verify(foodIntakeService).getFoodIntakes(eq(1L), any(Pageable.class), eq(null), eq(null));
    }

    @Test
    @WithMockUser
    void getFoodIntakeById_WithValidId_ShouldReturnEntry() throws Exception {
        // Given
        Long entryId = 1L;
        FoodIntakeResponseDto expectedResponse = new FoodIntakeResponseDto(
                entryId, "Apple", 95, LocalDate.now(), LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(foodIntakeService.getFoodIntakeById(entryId, 1L))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(get("/api/food/{id}", entryId)
                .session(session))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.foodItem", is("Apple")))
                .andExpect(jsonPath("$.calories", is(95)));

        verify(foodIntakeService).getFoodIntakeById(entryId, 1L);
    }

    @Test
    @WithMockUser
    void getFoodIntakeById_WithNonExistentId_ShouldReturnNotFound() throws Exception {
        // Given
        Long entryId = 999L;
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(foodIntakeService.getFoodIntakeById(entryId, 1L))
                .thenThrow(new ResourceNotFoundException("Food intake entry not found"));

        // When & Then
        mockMvc.perform(get("/api/food/{id}", entryId)
                .session(session))
                .andExpect(status().isNotFound());

        verify(foodIntakeService).getFoodIntakeById(entryId, 1L);
    }

    @Test
    @WithMockUser
    void updateFoodIntake_WithValidData_ShouldReturnUpdatedEntry() throws Exception {
        // Given
        Long entryId = 1L;
        FoodIntakeRequestDto requestDto = new FoodIntakeRequestDto("Updated Apple", 100);
        FoodIntakeResponseDto expectedResponse = new FoodIntakeResponseDto(
                entryId, "Updated Apple", 100, LocalDate.now(), LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(foodIntakeService.updateFoodIntake(eq(entryId), any(FoodIntakeRequestDto.class), eq(1L)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(put("/api/food/{id}", entryId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.foodItem", is("Updated Apple")))
                .andExpect(jsonPath("$.calories", is(100)));

        verify(foodIntakeService).updateFoodIntake(eq(entryId), any(FoodIntakeRequestDto.class), eq(1L));
    }

    @Test
    @WithMockUser
    void updateFoodIntake_WithUnauthorizedUser_ShouldReturnForbidden() throws Exception {
        // Given
        Long entryId = 1L;
        FoodIntakeRequestDto requestDto = new FoodIntakeRequestDto("Updated Apple", 100);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 2L); // Different user
        
        when(foodIntakeService.updateFoodIntake(eq(entryId), any(FoodIntakeRequestDto.class), eq(2L)))
                .thenThrow(new ForbiddenException("You can only update your own food intake entries"));

        // When & Then
        mockMvc.perform(put("/api/food/{id}", entryId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isForbidden());

        verify(foodIntakeService).updateFoodIntake(eq(entryId), any(FoodIntakeRequestDto.class), eq(2L));
    }

    @Test
    @WithMockUser
    void deleteFoodIntake_WithValidId_ShouldReturnNoContent() throws Exception {
        // Given
        Long entryId = 1L;
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        doNothing().when(foodIntakeService).deleteFoodIntake(entryId, 1L);

        // When & Then
        mockMvc.perform(delete("/api/food/{id}", entryId)
                .session(session)
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(foodIntakeService).deleteFoodIntake(entryId, 1L);
    }

    @Test
    @WithMockUser
    void deleteFoodIntake_WithUnauthorizedUser_ShouldReturnForbidden() throws Exception {
        // Given
        Long entryId = 1L;
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 2L); // Different user
        
        doThrow(new ForbiddenException("You can only delete your own food intake entries"))
                .when(foodIntakeService).deleteFoodIntake(entryId, 2L);

        // When & Then
        mockMvc.perform(delete("/api/food/{id}", entryId)
                .session(session)
                .with(csrf()))
                .andExpect(status().isForbidden());

        verify(foodIntakeService).deleteFoodIntake(entryId, 2L);
    }

    @Test
    @WithMockUser
    void createFoodIntake_WithoutSession_ShouldReturnUnauthorized() throws Exception {
        // Given
        FoodIntakeRequestDto requestDto = new FoodIntakeRequestDto("Apple", 95);

        // When & Then
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        verify(foodIntakeService, never()).createFoodIntake(any(), any());
    }

    @Test
    @WithMockUser
    void getFoodIntakes_WithDateFiltering_ShouldReturnFilteredEntries() throws Exception {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        
        List<FoodIntakeResponseDto> foodIntakes = Arrays.asList(
                new FoodIntakeResponseDto(1L, "Apple", 95, LocalDate.now(), LocalDateTime.now())
        );
        
        Page<FoodIntakeResponseDto> page = new PageImpl<>(foodIntakes, PageRequest.of(0, 10), 1);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(foodIntakeService.getFoodIntakes(eq(1L), any(Pageable.class), eq(startDate), eq(endDate)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/food")
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString())
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        verify(foodIntakeService).getFoodIntakes(eq(1L), any(Pageable.class), eq(startDate), eq(endDate));
    }

    @Test
    @WithMockUser
    void createFoodIntake_WithBlankFoodItem_ShouldReturnBadRequest() throws Exception {
        // Given - Blank food item
        FoodIntakeRequestDto requestDto = new FoodIntakeRequestDto("", 95);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);

        // When & Then
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isBadRequest());

        verify(foodIntakeService, never()).createFoodIntake(any(), any());
    }

    @Test
    @WithMockUser
    void createFoodIntake_WithNullCalories_ShouldReturnBadRequest() throws Exception {
        // Given - Null calories
        FoodIntakeRequestDto requestDto = new FoodIntakeRequestDto("Apple", null);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);

        // When & Then
        mockMvc.perform(post("/api/food")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isBadRequest());

        verify(foodIntakeService, never()).createFoodIntake(any(), any());
    }

    @Test
    @WithMockUser
    void getFoodIntakes_WithSortParameters_ShouldReturnSortedEntries() throws Exception {
        // Given
        List<FoodIntakeResponseDto> foodIntakes = Arrays.asList(
                new FoodIntakeResponseDto(1L, "Apple", 95, LocalDate.now().minusDays(1), LocalDateTime.now()),
                new FoodIntakeResponseDto(2L, "Banana", 105, LocalDate.now(), LocalDateTime.now())
        );
        
        Page<FoodIntakeResponseDto> page = new PageImpl<>(foodIntakes, PageRequest.of(0, 10), 2);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(foodIntakeService.getFoodIntakes(eq(1L), any(Pageable.class), eq(null), eq(null)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/food")
                .param("sort", "calories,asc")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)));

        verify(foodIntakeService).getFoodIntakes(eq(1L), any(Pageable.class), eq(null), eq(null));
    }

    @Test
    @WithMockUser
    void updateFoodIntake_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Given - Invalid calories (too low)
        Long entryId = 1L;
        FoodIntakeRequestDto requestDto = new FoodIntakeRequestDto("Apple", 0);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);

        // When & Then
        mockMvc.perform(put("/api/food/{id}", entryId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isBadRequest());

        verify(foodIntakeService, never()).updateFoodIntake(any(), any(), any());
    }
}