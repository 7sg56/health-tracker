package com.healthtracker.htbackend.repository;

import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.entity.WaterIntake;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class WaterIntakeRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private WaterIntakeRepository waterIntakeRepository;

    private User testUser;
    private User otherUser;
    private WaterIntake waterIntake1;
    private WaterIntake waterIntake2;
    private WaterIntake waterIntake3;

    @BeforeEach
    void setUp() {
        // Create test users
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("hashedpassword");
        testUser.setCreatedAt(LocalDateTime.now());
        testUser = entityManager.persistAndFlush(testUser);

        otherUser = new User();
        otherUser.setUsername("otheruser");
        otherUser.setEmail("other@example.com");
        otherUser.setPassword("hashedpassword");
        otherUser.setCreatedAt(LocalDateTime.now());
        otherUser = entityManager.persistAndFlush(otherUser);

        // Create test water intake entries
        waterIntake1 = new WaterIntake();
        waterIntake1.setUser(testUser);
        waterIntake1.setAmountLtr(1.5f);
        waterIntake1.setDate(LocalDate.now().minusDays(2));
        waterIntake1.setCreatedAt(LocalDateTime.now());

        waterIntake2 = new WaterIntake();
        waterIntake2.setUser(testUser);
        waterIntake2.setAmountLtr(2.0f);
        waterIntake2.setDate(LocalDate.now().minusDays(1));
        waterIntake2.setCreatedAt(LocalDateTime.now());

        waterIntake3 = new WaterIntake();
        waterIntake3.setUser(testUser);
        waterIntake3.setAmountLtr(0.5f);
        waterIntake3.setDate(LocalDate.now());
        waterIntake3.setCreatedAt(LocalDateTime.now());

        // Create entry for other user
        WaterIntake otherUserIntake = new WaterIntake();
        otherUserIntake.setUser(otherUser);
        otherUserIntake.setAmountLtr(1.0f);
        otherUserIntake.setDate(LocalDate.now());
        otherUserIntake.setCreatedAt(LocalDateTime.now());

        entityManager.persistAndFlush(waterIntake1);
        entityManager.persistAndFlush(waterIntake2);
        entityManager.persistAndFlush(waterIntake3);
        entityManager.persistAndFlush(otherUserIntake);
    }

    @Test
    void findByUserIdOrderByDateDesc_ShouldReturnUserEntriesOrderedByDateDesc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<WaterIntake> result = waterIntakeRepository.findByUserIdOrderByDateDesc(testUser.getId(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent().get(0).getDate()).isEqualTo(LocalDate.now());
        assertThat(result.getContent().get(1).getDate()).isEqualTo(LocalDate.now().minusDays(1));
        assertThat(result.getContent().get(2).getDate()).isEqualTo(LocalDate.now().minusDays(2));
        
        // Verify all entries belong to test user
        result.getContent().forEach(entry -> 
            assertThat(entry.getUser().getId()).isEqualTo(testUser.getId())
        );
    }

    @Test
    void findByUserIdAndDateBetweenOrderByDateDesc_ShouldReturnEntriesInDateRange() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(1);
        LocalDate endDate = LocalDate.now();
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<WaterIntake> result = waterIntakeRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                testUser.getId(), startDate, endDate, pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getDate()).isEqualTo(LocalDate.now());
        assertThat(result.getContent().get(1).getDate()).isEqualTo(LocalDate.now().minusDays(1));
    }

    @Test
    void findByUserIdAndDate_ShouldReturnEntriesForSpecificDate() {
        // Given
        LocalDate today = LocalDate.now();

        // When
        List<WaterIntake> result = waterIntakeRepository.findByUserIdAndDate(testUser.getId(), today);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDate()).isEqualTo(today);
        assertThat(result.get(0).getAmountLtr()).isEqualTo(0.5f);
    }

    @Test
    void findByUserIdAndDateGreaterThanEqualOrderByDateDesc_ShouldReturnEntriesFromStartDate() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(1);
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<WaterIntake> result = waterIntakeRepository.findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
                testUser.getId(), startDate, pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getDate()).isEqualTo(LocalDate.now());
        assertThat(result.getContent().get(1).getDate()).isEqualTo(LocalDate.now().minusDays(1));
    }

    @Test
    void findByUserIdAndDateLessThanEqualOrderByDateDesc_ShouldReturnEntriesUpToEndDate() {
        // Given
        LocalDate endDate = LocalDate.now().minusDays(1);
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<WaterIntake> result = waterIntakeRepository.findByUserIdAndDateLessThanEqualOrderByDateDesc(
                testUser.getId(), endDate, pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getDate()).isEqualTo(LocalDate.now().minusDays(1));
        assertThat(result.getContent().get(1).getDate()).isEqualTo(LocalDate.now().minusDays(2));
    }

    @Test
    void getTotalWaterIntakeByUserAndDate_ShouldReturnCorrectSum() {
        // Given - Add another entry for the same date
        WaterIntake additionalIntake = new WaterIntake();
        additionalIntake.setUser(testUser);
        additionalIntake.setAmountLtr(1.0f);
        additionalIntake.setDate(LocalDate.now());
        additionalIntake.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(additionalIntake);

        // When
        Float total = waterIntakeRepository.getTotalWaterIntakeByUserAndDate(testUser.getId(), LocalDate.now());

        // Then
        assertThat(total).isEqualTo(1.5f); // 0.5f + 1.0f
    }

    @Test
    void getTotalWaterIntakeByUserAndDate_WhenNoEntries_ShouldReturnZero() {
        // Given
        LocalDate futureDate = LocalDate.now().plusDays(1);

        // When
        Float total = waterIntakeRepository.getTotalWaterIntakeByUserAndDate(testUser.getId(), futureDate);

        // Then
        assertThat(total).isEqualTo(0.0f);
    }

    @Test
    void findByUserIdOrderByDateDesc_WithPagination_ShouldRespectPageSize() {
        // Given
        Pageable pageable = PageRequest.of(0, 2);

        // When
        Page<WaterIntake> result = waterIntakeRepository.findByUserIdOrderByDateDesc(testUser.getId(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getTotalPages()).isEqualTo(2);
        assertThat(result.hasNext()).isTrue();
    }

    @Test
    void findByUserIdAndDate_WhenNoEntries_ShouldReturnEmptyList() {
        // Given
        LocalDate futureDate = LocalDate.now().plusDays(10);

        // When
        List<WaterIntake> result = waterIntakeRepository.findByUserIdAndDate(testUser.getId(), futureDate);

        // Then
        assertThat(result).isEmpty();
    }
}