package com.healthtracker.htbackend.repository;

import com.healthtracker.htbackend.entity.FoodIntake;
import com.healthtracker.htbackend.entity.User;
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
class FoodIntakeRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private FoodIntakeRepository foodIntakeRepository;

    private User testUser;
    private User otherUser;
    private FoodIntake foodIntake1;
    private FoodIntake foodIntake2;
    private FoodIntake foodIntake3;

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

        // Create test food intake entries
        foodIntake1 = new FoodIntake();
        foodIntake1.setUser(testUser);
        foodIntake1.setFoodItem("Apple");
        foodIntake1.setCalories(95);
        foodIntake1.setDate(LocalDate.now().minusDays(2));
        foodIntake1.setCreatedAt(LocalDateTime.now());

        foodIntake2 = new FoodIntake();
        foodIntake2.setUser(testUser);
        foodIntake2.setFoodItem("Banana");
        foodIntake2.setCalories(105);
        foodIntake2.setDate(LocalDate.now().minusDays(1));
        foodIntake2.setCreatedAt(LocalDateTime.now());

        foodIntake3 = new FoodIntake();
        foodIntake3.setUser(testUser);
        foodIntake3.setFoodItem("Orange");
        foodIntake3.setCalories(62);
        foodIntake3.setDate(LocalDate.now());
        foodIntake3.setCreatedAt(LocalDateTime.now());

        // Create entry for other user
        FoodIntake otherUserIntake = new FoodIntake();
        otherUserIntake.setUser(otherUser);
        otherUserIntake.setFoodItem("Grapes");
        otherUserIntake.setCalories(100);
        otherUserIntake.setDate(LocalDate.now());
        otherUserIntake.setCreatedAt(LocalDateTime.now());

        entityManager.persistAndFlush(foodIntake1);
        entityManager.persistAndFlush(foodIntake2);
        entityManager.persistAndFlush(foodIntake3);
        entityManager.persistAndFlush(otherUserIntake);
    }

    @Test
    void findByUserIdOrderByDateDesc_ShouldReturnUserEntriesOrderedByDateDesc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<FoodIntake> result = foodIntakeRepository.findByUserIdOrderByDateDesc(testUser.getId(), pageable);

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
        Page<FoodIntake> result = foodIntakeRepository.findByUserIdAndDateBetweenOrderByDateDesc(
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
        List<FoodIntake> result = foodIntakeRepository.findByUserIdAndDate(testUser.getId(), today);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDate()).isEqualTo(today);
        assertThat(result.get(0).getFoodItem()).isEqualTo("Orange");
        assertThat(result.get(0).getCalories()).isEqualTo(62);
    }

    @Test
    void findByUserIdOrderByCaloriesDesc_ShouldReturnEntriesOrderedByCaloriesDesc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<FoodIntake> result = foodIntakeRepository.findByUserIdOrderByCaloriesDesc(testUser.getId(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent().get(0).getCalories()).isEqualTo(105); // Banana
        assertThat(result.getContent().get(1).getCalories()).isEqualTo(95);  // Apple
        assertThat(result.getContent().get(2).getCalories()).isEqualTo(62);  // Orange
    }

    @Test
    void findByUserIdOrderByCaloriesAsc_ShouldReturnEntriesOrderedByCaloriesAsc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<FoodIntake> result = foodIntakeRepository.findByUserIdOrderByCaloriesAsc(testUser.getId(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent().get(0).getCalories()).isEqualTo(62);  // Orange
        assertThat(result.getContent().get(1).getCalories()).isEqualTo(95);  // Apple
        assertThat(result.getContent().get(2).getCalories()).isEqualTo(105); // Banana
    }

    @Test
    void getTotalCaloriesByUserAndDate_ShouldReturnCorrectSum() {
        // Given - Add another entry for the same date
        FoodIntake additionalIntake = new FoodIntake();
        additionalIntake.setUser(testUser);
        additionalIntake.setFoodItem("Bread");
        additionalIntake.setCalories(80);
        additionalIntake.setDate(LocalDate.now());
        additionalIntake.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(additionalIntake);

        // When
        Integer total = foodIntakeRepository.getTotalCaloriesByUserAndDate(testUser.getId(), LocalDate.now());

        // Then
        assertThat(total).isEqualTo(142); // 62 + 80
    }

    @Test
    void getTotalCaloriesByUserAndDate_WhenNoEntries_ShouldReturnZero() {
        // Given
        LocalDate futureDate = LocalDate.now().plusDays(1);

        // When
        Integer total = foodIntakeRepository.getTotalCaloriesByUserAndDate(testUser.getId(), futureDate);

        // Then
        assertThat(total).isEqualTo(0);
    }

    @Test
    void findByUserIdAndFoodItemContainingIgnoreCaseOrderByDateDesc_ShouldReturnMatchingEntries() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<FoodIntake> result = foodIntakeRepository.findByUserIdAndFoodItemContainingIgnoreCaseOrderByDateDesc(
                testUser.getId(), "app", pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getFoodItem()).isEqualTo("Apple");
    }

    @Test
    void findByUserIdAndFoodItemContainingIgnoreCaseOrderByDateDesc_ShouldBeCaseInsensitive() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<FoodIntake> result = foodIntakeRepository.findByUserIdAndFoodItemContainingIgnoreCaseOrderByDateDesc(
                testUser.getId(), "APPLE", pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getFoodItem()).isEqualTo("Apple");
    }

    @Test
    void findByUserIdAndCaloriesBetweenOrderByDateDesc_ShouldReturnEntriesInCalorieRange() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<FoodIntake> result = foodIntakeRepository.findByUserIdAndCaloriesBetweenOrderByDateDesc(
                testUser.getId(), 90, 110, pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(FoodIntake::getFoodItem)
                .containsExactlyInAnyOrder("Apple", "Banana");
    }

    @Test
    void findByUserIdAndDateGreaterThanEqualOrderByDateDesc_ShouldReturnEntriesFromStartDate() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(1);
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<FoodIntake> result = foodIntakeRepository.findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
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
        Page<FoodIntake> result = foodIntakeRepository.findByUserIdAndDateLessThanEqualOrderByDateDesc(
                testUser.getId(), endDate, pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getDate()).isEqualTo(LocalDate.now().minusDays(1));
        assertThat(result.getContent().get(1).getDate()).isEqualTo(LocalDate.now().minusDays(2));
    }

    @Test
    void findByUserIdOrderByDateDesc_WithPagination_ShouldRespectPageSize() {
        // Given
        Pageable pageable = PageRequest.of(0, 2);

        // When
        Page<FoodIntake> result = foodIntakeRepository.findByUserIdOrderByDateDesc(testUser.getId(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getTotalPages()).isEqualTo(2);
        assertThat(result.hasNext()).isTrue();
    }
}