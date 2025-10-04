package com.healthtracker.htbackend.service;

import com.healthtracker.htbackend.dto.WorkoutRequestDto;
import com.healthtracker.htbackend.dto.WorkoutResponseDto;
import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.entity.Workout;
import com.healthtracker.htbackend.exception.ForbiddenException;
import com.healthtracker.htbackend.exception.ResourceNotFoundException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.repository.UserRepository;
import com.healthtracker.htbackend.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Service class for handling workout operations.
 * Provides CRUD operations for workout entries with user association and validation.
 */
@Service
@Transactional
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;

    @Autowired
    public WorkoutService(WorkoutRepository workoutRepository, UserRepository userRepository) {
        this.workoutRepository = workoutRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new workout entry for the specified user.
     * Associates the entry with the user and sets the current date.
     * 
     * @param requestDto the workout request data
     * @param userId the ID of the user creating the entry
     * @return WorkoutResponseDto containing the created entry information
     * @throws ResourceNotFoundException if user is not found
     */
    public WorkoutResponseDto createWorkout(WorkoutRequestDto requestDto, Long userId) {
        // Find user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create new workout entry
        Workout workout = new Workout();
        workout.setUser(user);
        workout.setActivity(requestDto.getActivity());
        workout.setDurationMin(requestDto.getDurationMin());
        workout.setCaloriesBurned(requestDto.getCaloriesBurned());
        workout.setDate(LocalDate.now());
        workout.setCreatedAt(LocalDateTime.now());

        // Save to database
        Workout savedWorkout = workoutRepository.save(workout);

        return mapToWorkoutResponseDto(savedWorkout);
    }

    /**
     * Get paginated workout entries for a user with optional date filtering.
     * 
     * @param userId the ID of the user
     * @param pageable pagination information
     * @param startDate optional start date for filtering (inclusive)
     * @param endDate optional end date for filtering (inclusive)
     * @return Page of WorkoutResponseDto entries
     * @throws ResourceNotFoundException if user is not found
     */
    public Page<WorkoutResponseDto> getWorkouts(Long userId, Pageable pageable, 
                                               LocalDate startDate, LocalDate endDate) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        Page<Workout> workouts;

        // Apply date filtering if both dates are provided
        if (startDate != null && endDate != null) {
            workouts = workoutRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                    userId, startDate, endDate, pageable);
        } 
        // Apply start date filtering only
        else if (startDate != null) {
            workouts = workoutRepository.findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
                    userId, startDate, pageable);
        } 
        // Apply end date filtering only
        else if (endDate != null) {
            workouts = workoutRepository.findByUserIdAndDateLessThanEqualOrderByDateDesc(
                    userId, endDate, pageable);
        } 
        // No date filtering
        else {
            workouts = workoutRepository.findByUserIdOrderByDateDesc(userId, pageable);
        }

        return workouts.map(this::mapToWorkoutResponseDto);
    }

    /**
     * Update an existing workout entry with ownership validation.
     * Only allows users to update their own entries.
     * 
     * @param id the ID of the workout entry to update
     * @param requestDto the updated workout data
     * @param userId the ID of the user requesting the update
     * @return WorkoutResponseDto containing the updated entry information
     * @throws ResourceNotFoundException if workout entry is not found
     * @throws ForbiddenException if user doesn't own the entry
     */
    public WorkoutResponseDto updateWorkout(Long id, WorkoutRequestDto requestDto, Long userId) {
        // Find workout entry
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout entry not found"));

        // Verify ownership
        if (!workout.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only update your own workout entries");
        }

        // Update the entry
        workout.setActivity(requestDto.getActivity());
        workout.setDurationMin(requestDto.getDurationMin());
        workout.setCaloriesBurned(requestDto.getCaloriesBurned());

        // Save updated entry
        Workout updatedWorkout = workoutRepository.save(workout);

        return mapToWorkoutResponseDto(updatedWorkout);
    }

    /**
     * Delete a workout entry with ownership validation.
     * Only allows users to delete their own entries.
     * 
     * @param id the ID of the workout entry to delete
     * @param userId the ID of the user requesting the deletion
     * @throws ResourceNotFoundException if workout entry is not found
     * @throws ForbiddenException if user doesn't own the entry
     */
    public void deleteWorkout(Long id, Long userId) {
        // Find workout entry
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout entry not found"));

        // Verify ownership
        if (!workout.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own workout entries");
        }

        // Delete the entry
        workoutRepository.delete(workout);
    }

    /**
     * Get a specific workout entry by ID with ownership validation.
     * 
     * @param id the ID of the workout entry
     * @param userId the ID of the user requesting the entry
     * @return WorkoutResponseDto containing the entry information
     * @throws ResourceNotFoundException if workout entry is not found
     * @throws ForbiddenException if user doesn't own the entry
     */
    public WorkoutResponseDto getWorkoutById(Long id, Long userId) {
        // Find workout entry
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout entry not found"));

        // Verify ownership
        if (!workout.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only access your own workout entries");
        }

        return mapToWorkoutResponseDto(workout);
    }

    /**
     * Helper method to map Workout entity to WorkoutResponseDto.
     * 
     * @param workout the Workout entity
     * @return WorkoutResponseDto
     */
    private WorkoutResponseDto mapToWorkoutResponseDto(Workout workout) {
        return new WorkoutResponseDto(
                workout.getId(),
                workout.getActivity(),
                workout.getDurationMin(),
                workout.getCaloriesBurned(),
                workout.getDate(),
                workout.getCreatedAt()
        );
    }
}