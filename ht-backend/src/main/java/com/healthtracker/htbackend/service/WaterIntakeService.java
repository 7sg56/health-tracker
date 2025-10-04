package com.healthtracker.htbackend.service;

import com.healthtracker.htbackend.dto.WaterIntakeRequestDto;
import com.healthtracker.htbackend.dto.WaterIntakeResponseDto;
import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.entity.WaterIntake;
import com.healthtracker.htbackend.exception.ForbiddenException;
import com.healthtracker.htbackend.exception.ResourceNotFoundException;
import com.healthtracker.htbackend.exception.UnauthorizedException;
import com.healthtracker.htbackend.repository.UserRepository;
import com.healthtracker.htbackend.repository.WaterIntakeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Service class for handling water intake operations.
 * Provides CRUD operations for water intake entries with user association and validation.
 */
@Service
@Transactional
public class WaterIntakeService {

    private final WaterIntakeRepository waterIntakeRepository;
    private final UserRepository userRepository;

    @Autowired
    public WaterIntakeService(WaterIntakeRepository waterIntakeRepository, UserRepository userRepository) {
        this.waterIntakeRepository = waterIntakeRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new water intake entry for the specified user.
     * Associates the entry with the user and sets the current date.
     * 
     * @param requestDto the water intake request data
     * @param userId the ID of the user creating the entry
     * @return WaterIntakeResponseDto containing the created entry information
     * @throws ResourceNotFoundException if user is not found
     */
    public WaterIntakeResponseDto createWaterIntake(WaterIntakeRequestDto requestDto, Long userId) {
        // Find user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create new water intake entry
        WaterIntake waterIntake = new WaterIntake();
        waterIntake.setUser(user);
        waterIntake.setAmountLtr(requestDto.getAmountLtr());
        waterIntake.setDate(LocalDate.now());
        waterIntake.setCreatedAt(LocalDateTime.now());

        // Save to database
        WaterIntake savedWaterIntake = waterIntakeRepository.save(waterIntake);

        return mapToWaterIntakeResponseDto(savedWaterIntake);
    }

    /**
     * Get paginated water intake entries for a user with optional date filtering.
     * 
     * @param userId the ID of the user
     * @param pageable pagination information
     * @param startDate optional start date for filtering (inclusive)
     * @param endDate optional end date for filtering (inclusive)
     * @return Page of WaterIntakeResponseDto entries
     * @throws ResourceNotFoundException if user is not found
     */
    public Page<WaterIntakeResponseDto> getWaterIntakes(Long userId, Pageable pageable, 
                                                       LocalDate startDate, LocalDate endDate) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        Page<WaterIntake> waterIntakes;

        // Apply date filtering if both dates are provided
        if (startDate != null && endDate != null) {
            waterIntakes = waterIntakeRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                    userId, startDate, endDate, pageable);
        } 
        // Apply start date filtering only
        else if (startDate != null) {
            waterIntakes = waterIntakeRepository.findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
                    userId, startDate, pageable);
        } 
        // Apply end date filtering only
        else if (endDate != null) {
            waterIntakes = waterIntakeRepository.findByUserIdAndDateLessThanEqualOrderByDateDesc(
                    userId, endDate, pageable);
        } 
        // No date filtering
        else {
            waterIntakes = waterIntakeRepository.findByUserIdOrderByDateDesc(userId, pageable);
        }

        return waterIntakes.map(this::mapToWaterIntakeResponseDto);
    }

    /**
     * Delete a water intake entry with ownership validation.
     * Only allows users to delete their own entries.
     * 
     * @param id the ID of the water intake entry to delete
     * @param userId the ID of the user requesting the deletion
     * @throws ResourceNotFoundException if water intake entry is not found
     * @throws ForbiddenException if user doesn't own the entry
     */
    public void deleteWaterIntake(Long id, Long userId) {
        // Find water intake entry
        WaterIntake waterIntake = waterIntakeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Water intake entry not found"));

        // Verify ownership
        if (!waterIntake.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own water intake entries");
        }

        // Delete the entry
        waterIntakeRepository.delete(waterIntake);
    }

    /**
     * Helper method to map WaterIntake entity to WaterIntakeResponseDto.
     * 
     * @param waterIntake the WaterIntake entity
     * @return WaterIntakeResponseDto
     */
    private WaterIntakeResponseDto mapToWaterIntakeResponseDto(WaterIntake waterIntake) {
        return new WaterIntakeResponseDto(
                waterIntake.getId(),
                waterIntake.getAmountLtr(),
                waterIntake.getDate(),
                waterIntake.getCreatedAt()
        );
    }
}