package com.healthtracker.htbackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthtracker.htbackend.dto.PaginatedResponse;
import com.healthtracker.htbackend.dto.WorkoutRequestDto;
import com.healthtracker.htbackend.dto.WorkoutResponseDto;
import com.healthtracker.htbackend.exception.ForbiddenException;
import com.healthtracker.htbackend.exception.ResourceNotFoundException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.service.WorkoutService;
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
 * Integration tests for WorkoutController endpoints.
 * Tests all workout functionality including CRUD operations.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WorkoutControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private WorkoutService workoutService;

    @Test
    @WithMockUser
    void createWorkout_WithValidData_ShouldReturnCreatedEntry() throws Exception {
        // Given
        WorkoutRequestDto requestDto = new WorkoutRequestDto("Running", 30, 300);
        WorkoutResponseDto expectedResponse = new WorkoutResponseDto(
                1L, "Running", 30, 300, LocalDate.now(), LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(workoutService.createWorkout(any(WorkoutRequestDto.class), eq(1L)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.activity", is("Running")))
                .andExpect(jsonPath("$.durationMin", is(30)))
                .andExpect(jsonPath("$.caloriesBurned", is(300)))
                .andExpect(jsonPath("$.date", notNullValue()))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        verify(workoutService).createWorkout(any(WorkoutRequestDto.class), eq(1L));
    }

    @Test
    @WithMockUser
    void createWorkout_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Given - Invalid duration (too high)
        WorkoutRequestDto requestDto = new WorkoutRequestDto("Running", 700, 300);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);

        // When & Then
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isBadRequest());

        verify(workoutService, never()).createWorkout(any(), any());
    }

    @Test
    @WithMockUser
    void getWorkouts_WithDefaultParameters_ShouldReturnPaginatedEntries() throws Exception {
        // Given
        List<WorkoutResponseDto> workouts = Arrays.asList(
                new WorkoutResponseDto(1L, "Running", 30, 300, LocalDate.now(), LocalDateTime.now()),
                new WorkoutResponseDto(2L, "Cycling", 45, 400, LocalDate.now().minusDays(1), LocalDateTime.now())
        );
        
        Page<WorkoutResponseDto> page = new PageImpl<>(workouts, PageRequest.of(0, 10), 2);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(workoutService.getWorkouts(eq(1L), any(Pageable.class), eq(null), eq(null)))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/workouts")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].id", is(1)))
                .andExpect(jsonPath("$.content[0].activity", is("Running")))
                .andExpect(jsonPath("$.content[0].durationMin", is(30)))
                .andExpect(jsonPath("$.content[1].id", is(2)))
                .andExpect(jsonPath("$.content[1].activity", is("Cycling")))
                .andExpect(jsonPath("$.content[1].durationMin", is(45)))
                .andExpect(jsonPath("$.page.number", is(0)))
                .andExpect(jsonPath("$.page.size", is(10)))
                .andExpect(jsonPath("$.page.totalElements", is(2)))
                .andExpect(jsonPath("$.page.totalPages", is(1)));

        verify(workoutService).getWorkouts(eq(1L), any(Pageable.class), eq(null), eq(null));
    }

    @Test
    @WithMockUser
    void getWorkoutById_WithValidId_ShouldReturnEntry() throws Exception {
        // Given
        Long entryId = 1L;
        WorkoutResponseDto expectedResponse = new WorkoutResponseDto(
                entryId, "Running", 30, 300, LocalDate.now(), LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(workoutService.getWorkoutById(entryId, 1L))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(get("/api/workouts/{id}", entryId)
                .session(session))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.activity", is("Running")))
                .andExpect(jsonPath("$.durationMin", is(30)));

        verify(workoutService).getWorkoutById(entryId, 1L);
    }

    @Test
    @WithMockUser
    void updateWorkout_WithValidData_ShouldReturnUpdatedEntry() throws Exception {
        // Given
        Long entryId = 1L;
        WorkoutRequestDto requestDto = new WorkoutRequestDto("Updated Running", 45, 450);
        WorkoutResponseDto expectedResponse = new WorkoutResponseDto(
                entryId, "Updated Running", 45, 450, LocalDate.now(), LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(workoutService.updateWorkout(eq(entryId), any(WorkoutRequestDto.class), eq(1L)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(put("/api/workouts/{id}", entryId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.activity", is("Updated Running")))
                .andExpect(jsonPath("$.durationMin", is(45)))
                .andExpect(jsonPath("$.caloriesBurned", is(450)));

        verify(workoutService).updateWorkout(eq(entryId), any(WorkoutRequestDto.class), eq(1L));
    }

    @Test
    @WithMockUser
    void updateWorkout_WithUnauthorizedUser_ShouldReturnForbidden() throws Exception {
        // Given
        Long entryId = 1L;
        WorkoutRequestDto requestDto = new WorkoutRequestDto("Updated Running", 45, 450);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 2L); // Different user
        
        when(workoutService.updateWorkout(eq(entryId), any(WorkoutRequestDto.class), eq(2L)))
                .thenThrow(new ForbiddenException("You can only update your own workout entries"));

        // When & Then
        mockMvc.perform(put("/api/workouts/{id}", entryId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isForbidden());

        verify(workoutService).updateWorkout(eq(entryId), any(WorkoutRequestDto.class), eq(2L));
    }

    @Test
    @WithMockUser
    void deleteWorkout_WithValidId_ShouldReturnNoContent() throws Exception {
        // Given
        Long entryId = 1L;
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        doNothing().when(workoutService).deleteWorkout(entryId, 1L);

        // When & Then
        mockMvc.perform(delete("/api/workouts/{id}", entryId)
                .session(session)
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(workoutService).deleteWorkout(entryId, 1L);
    }

    @Test
    @WithMockUser
    void deleteWorkout_WithUnauthorizedUser_ShouldReturnForbidden() throws Exception {
        // Given
        Long entryId = 1L;
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 2L); // Different user
        
        doThrow(new ForbiddenException("You can only delete your own workout entries"))
                .when(workoutService).deleteWorkout(entryId, 2L);

        // When & Then
        mockMvc.perform(delete("/api/workouts/{id}", entryId)
                .session(session)
                .with(csrf()))
                .andExpect(status().isForbidden());

        verify(workoutService).deleteWorkout(entryId, 2L);
    }

    @Test
    @WithMockUser
    void createWorkout_WithoutSession_ShouldReturnUnauthorized() throws Exception {
        // Given
        WorkoutRequestDto requestDto = new WorkoutRequestDto("Running", 30, 300);

        // When & Then
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        verify(workoutService, never()).createWorkout(any(), any());
    }

    @Test
    @WithMockUser
    void getWorkoutById_WithNonExistentId_ShouldReturnNotFound() throws Exception {
        // Given
        Long entryId = 999L;
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(workoutService.getWorkoutById(entryId, 1L))
                .thenThrow(new ResourceNotFoundException("Workout entry not found"));

        // When & Then
        mockMvc.perform(get("/api/workouts/{id}", entryId)
                .session(session))
                .andExpect(status().isNotFound());

        verify(workoutService).getWorkoutById(entryId, 1L);
    }

    @Test
    @WithMockUser
    void createWorkout_WithNullCaloriesBurned_ShouldReturnCreatedEntry() throws Exception {
        // Given - Calories burned is optional
        WorkoutRequestDto requestDto = new WorkoutRequestDto("Running", 30, null);
        WorkoutResponseDto expectedResponse = new WorkoutResponseDto(
                1L, "Running", 30, null, LocalDate.now(), LocalDateTime.now()
        );
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        
        when(workoutService.createWorkout(any(WorkoutRequestDto.class), eq(1L)))
                .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.caloriesBurned").doesNotExist());

        verify(workoutService).createWorkout(any(WorkoutRequestDto.class), eq(1L));
    }

    @Test
    @WithMockUser
    void createWorkout_WithBlankActivity_ShouldReturnBadRequest() throws Exception {
        // Given - Blank activity
        WorkoutRequestDto requestDto = new WorkoutRequestDto("", 30, 300);
        
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);

        // When & Then
        mockMvc.perform(post("/api/workouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))
                .session(session)
                .with(csrf()))
                .andExpect(status().isBadRequest());

        verify(workoutService, never()).createWorkout(any(), any());
    }
}