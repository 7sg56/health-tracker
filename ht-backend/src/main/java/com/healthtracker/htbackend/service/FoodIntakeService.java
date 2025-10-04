package com.healthtracker.htbackend.service;

import com.healthtracker.htbackend.dto.FoodIntakeRequestDto;
import com.healthtracker.htbackend.dto.FoodIntakeResponseDto;
import com.healthtracker.htbackend.entity.FoodIntake;
import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.exception.ForbiddenException;
import com.healthtracker.htbackend.exception.ResourceNotFoundException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.repository.FoodIntakeRepository;
import com.healthtracker.htbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Service class for handling food intake operations.
 * Provides CRUD operations for food intake entries with user association and validation.
 */
@Service
@Transactional
public class FoodIntakeService {

    private final FoodIntakeRepository foodIntakeRepository;
    private final UserRepository userRepository;

    @Autowired
    public FoodIntakeService(FoodIntakeRepository foodIntakeRepository, UserRepository userRepository) {
        this.foodIntakeRepository = foodIntakeRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new food intake entry for the specified user.
     * Associates the entry with the user and sets the current date.
     * 
     * @param requestDto the food intake request data
     * @param userId the ID of the user creating the entry
     * @return FoodIntakeResponseDto containing the created entry information
     * @throws ResourceNotFoundException if user is not found
     */
    public FoodIntakeResponseDto createFoodIntake(FoodIntakeRequestDto requestDto, Long userId) {
        // Find user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create new food intake entry
        FoodIntake foodIntake = new FoodIntake();
        foodIntake.setUser(user);
        foodIntake.setFoodItem(requestDto.getFoodItem());
        foodIntake.setCalories(requestDto.getCalories());
        foodIntake.setDate(LocalDate.now());
        foodIntake.setCreatedAt(LocalDateTime.now());

        // Save to database
        FoodIntake savedFoodIntake = foodIntakeRepository.save(foodIntake);

        return mapToFoodIntakeResponseDto(savedFoodIntake);
    }

    /**
     * Get paginated food intake entries for a user with optional date filtering.
     * 
     * @param userId the ID of the user
     * @param pageable pagination information
     * @param startDate optional start date for filtering (inclusive)
     * @param endDate optional end date for filtering (inclusive)
     * @return Page of FoodIntakeResponseDto entries
     * @throws ResourceNotFoundException if user is not found
     */
    public Page<FoodIntakeResponseDto> getFoodIntakes(Long userId, Pageable pageable, 
                                                     LocalDate startDate, LocalDate endDate) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        Page<FoodIntake> foodIntakes;

        // Apply date filtering if both dates are provided
        if (startDate != null && endDate != null) {
            foodIntakes = foodIntakeRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                    userId, startDate, endDate, pageable);
        } 
        // Apply start date filtering only
        else if (startDate != null) {
            foodIntakes = foodIntakeRepository.findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
                    userId, startDate, pageable);
        } 
        // Apply end date filtering only
        else if (endDate != null) {
            foodIntakes = foodIntakeRepository.findByUserIdAndDateLessThanEqualOrderByDateDesc(
                    userId, endDate, pageable);
        } 
        // No date filtering
        else {
            foodIntakes = foodIntakeRepository.findByUserIdOrderByDateDesc(userId, pageable);
        }

        return foodIntakes.map(this::mapToFoodIntakeResponseDto);
    }

    /**
     * Update an existing food intake entry with ownership validation.
     * Only allows users to update their own entries.
     * 
     * @param id the ID of the food intake entry to update
     * @param requestDto the updated food intake data
     * @param userId the ID of the user requesting the update
     * @return FoodIntakeResponseDto containing the updated entry information
     * @throws ResourceNotFoundException if food intake entry is not found
     * @throws ForbiddenException if user doesn't own the entry
     */
    public FoodIntakeResponseDto updateFoodIntake(Long id, FoodIntakeRequestDto requestDto, Long userId) {
        // Find food intake entry
        FoodIntake foodIntake = foodIntakeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food intake entry not found"));

        // Verify ownership
        if (!foodIntake.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only update your own food intake entries");
        }

        // Update the entry
        foodIntake.setFoodItem(requestDto.getFoodItem());
        foodIntake.setCalories(requestDto.getCalories());

        // Save updated entry
        FoodIntake updatedFoodIntake = foodIntakeRepository.save(foodIntake);

        return mapToFoodIntakeResponseDto(updatedFoodIntake);
    }

    /**
     * Delete a food intake entry with ownership validation.
     * Only allows users to delete their own entries.
     * 
     * @param id the ID of the food intake entry to delete
     * @param userId the ID of the user requesting the deletion
     * @throws ResourceNotFoundException if food intake entry is not found
     * @throws ForbiddenException if user doesn't own the entry
     */
    public void deleteFoodIntake(Long id, Long userId) {
        // Find food intake entry
        FoodIntake foodIntake = foodIntakeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food intake entry not found"));

        // Verify ownership
        if (!foodIntake.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own food intake entries");
        }

        // Delete the entry
        foodIntakeRepository.delete(foodIntake);
    }

    /**
     * Get a specific food intake entry by ID with ownership validation.
     * 
     * @param id the ID of the food intake entry
     * @param userId the ID of the user requesting the entry
     * @return FoodIntakeResponseDto containing the entry information
     * @throws ResourceNotFoundException if food intake entry is not found
     * @throws ForbiddenException if user doesn't own the entry
     */
    public FoodIntakeResponseDto getFoodIntakeById(Long id, Long userId) {
        // Find food intake entry
        FoodIntake foodIntake = foodIntakeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food intake entry not found"));

        // Verify ownership
        if (!foodIntake.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only access your own food intake entries");
        }

        return mapToFoodIntakeResponseDto(foodIntake);
    }

    /**
     * Helper method to map FoodIntake entity to FoodIntakeResponseDto.
     * 
     * @param foodIntake the FoodIntake entity
     * @return FoodIntakeResponseDto
     */
    private FoodIntakeResponseDto mapToFoodIntakeResponseDto(FoodIntake foodIntake) {
        return new FoodIntakeResponseDto(
                foodIntake.getId(),
                foodIntake.getFoodItem(),
                foodIntake.getCalories(),
                foodIntake.getDate(),
                foodIntake.getCreatedAt()
        );
    }
}