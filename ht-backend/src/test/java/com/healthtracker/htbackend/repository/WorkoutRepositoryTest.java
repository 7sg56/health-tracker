package com.healthtracker.htbackend.repository;

import com.healthtracker.htbackend.entity.User;
import com.healthtracker.htbackend.entity.Workout;
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
class WorkoutRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private WorkoutRepository workoutRepository;

    private User testUser;
    private User otherUser;
    private Workout workout1;
    private Workout workout2;
    private Workout workout3;

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

        // Create test workout entries
        workout1 = new Workout();
        workout1.setUser(testUser);
        workout1.setActivity("Running");
        workout1.setDurationMin(30);
        workout1.setCaloriesBurned(300);
        workout1.setDate(LocalDate.now().minusDays(2));
        workout1.setCreatedAt(LocalDateTime.now());

        workout2 = new Workout();
        workout2.setUser(testUser);
        workout2.setActivity("Swimming");
        workout2.setDurationMin(45);
        workout2.setCaloriesBurned(400);
        workout2.setDate(LocalDate.now().minusDays(1));
        workout2.setCreatedAt(LocalDateTime.now());

        workout3 = new Workout();
        workout3.setUser(testUser);
        workout3.setActivity("Yoga");
        workout3.setDurationMin(60);
        workout3.setCaloriesBurned(null); // No calories burned data
        workout3.setDate(LocalDate.now());
        workout3.setCreatedAt(LocalDateTime.now());

        // Create entry for other user
        Workout otherUserWorkout = new Workout();
        otherUserWorkout.setUser(otherUser);
        otherUserWorkout.setActivity("Cycling");
        otherUserWorkout.setDurationMin(40);
        otherUserWorkout.setCaloriesBurned(350);
        otherUserWorkout.setDate(LocalDate.now());
        otherUserWorkout.setCreatedAt(LocalDateTime.now());

        entityManager.persistAndFlush(workout1);
        entityManager.persistAndFlush(workout2);
        entityManager.persistAndFlush(workout3);
        entityManager.persistAndFlush(otherUserWorkout);
    }

    @Test
    void findByUserIdOrderByDateDesc_ShouldReturnUserEntriesOrderedByDateDesc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Workout> result = workoutRepository.findByUserIdOrderByDateDesc(testUser.getId(), pageable);

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
        Page<Workout> result = workoutRepository.findByUserIdAndDateBetweenOrderByDateDesc(
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
        List<Workout> result = workoutRepository.findByUserIdAndDate(testUser.getId(), today);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDate()).isEqualTo(today);
        assertThat(result.get(0).getActivity()).isEqualTo("Yoga");
        assertThat(result.get(0).getDurationMin()).isEqualTo(60);
    }

    @Test
    void findByUserIdOrderByDurationMinDesc_ShouldReturnEntriesOrderedByDurationDesc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Workout> result = workoutRepository.findByUserIdOrderByDurationMinDesc(testUser.getId(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent().get(0).getDurationMin()).isEqualTo(60); // Yoga
        assertThat(result.getContent().get(1).getDurationMin()).isEqualTo(45); // Swimming
        assertThat(result.getContent().get(2).getDurationMin()).isEqualTo(30); // Running
    }

    @Test
    void findByUserIdOrderByDurationMinAsc_ShouldReturnEntriesOrderedByDurationAsc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Workout> result = workoutRepository.findByUserIdOrderByDurationMinAsc(testUser.getId(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent().get(0).getDurationMin()).isEqualTo(30); // Running
        assertThat(result.getContent().get(1).getDurationMin()).isEqualTo(45); // Swimming
        assertThat(result.getContent().get(2).getDurationMin()).isEqualTo(60); // Yoga
    }

    @Test
    void findByUserIdOrderByCaloriesBurnedDesc_ShouldReturnEntriesOrderedByCaloriesDesc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Workout> result = workoutRepository.findByUserIdOrderByCaloriesBurnedDesc(testUser.getId(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(3);
        // Note: Entries with null calories should appear last in descending order
        assertThat(result.getContent().get(0).getCaloriesBurned()).isEqualTo(400); // Swimming
        assertThat(result.getContent().get(1).getCaloriesBurned()).isEqualTo(300); // Running
        assertThat(result.getContent().get(2).getCaloriesBurned()).isNull(); // Yoga
    }

    @Test
    void getTotalDurationByUserAndDate_ShouldReturnCorrectSum() {
        // Given - Add another entry for the same date
        Workout additionalWorkout = new Workout();
        additionalWorkout.setUser(testUser);
        additionalWorkout.setActivity("Walking");
        additionalWorkout.setDurationMin(20);
        additionalWorkout.setDate(LocalDate.now());
        additionalWorkout.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(additionalWorkout);

        // When
        Integer total = workoutRepository.getTotalDurationByUserAndDate(testUser.getId(), LocalDate.now());

        // Then
        assertThat(total).isEqualTo(80); // 60 + 20
    }

    @Test
    void getTotalDurationByUserAndDate_WhenNoEntries_ShouldReturnZero() {
        // Given
        LocalDate futureDate = LocalDate.now().plusDays(1);

        // When
        Integer total = workoutRepository.getTotalDurationByUserAndDate(testUser.getId(), futureDate);

        // Then
        assertThat(total).isEqualTo(0);
    }

    @Test
    void getTotalCaloriesBurnedByUserAndDate_ShouldReturnCorrectSum() {
        // Given - Add another entry for the same date with calories
        Workout additionalWorkout = new Workout();
        additionalWorkout.setUser(testUser);
        additionalWorkout.setActivity("Walking");
        additionalWorkout.setDurationMin(20);
        additionalWorkout.setCaloriesBurned(100);
        additionalWorkout.setDate(LocalDate.now());
        additionalWorkout.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(additionalWorkout);

        // When
        Integer total = workoutRepository.getTotalCaloriesBurnedByUserAndDate(testUser.getId(), LocalDate.now());

        // Then
        assertThat(total).isEqualTo(100); // Only the new entry, Yoga has null calories
    }

    @Test
    void getTotalCaloriesBurnedByUserAndDate_WhenNoEntriesWithCalories_ShouldReturnZero() {
        // Given - Today only has Yoga with null calories
        // When
        Integer total = workoutRepository.getTotalCaloriesBurnedByUserAndDate(testUser.getId(), LocalDate.now());

        // Then
        assertThat(total).isEqualTo(0);
    }

    @Test
    void findByUserIdAndActivityContainingIgnoreCaseOrderByDateDesc_ShouldReturnMatchingEntries() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Workout> result = workoutRepository.findByUserIdAndActivityContainingIgnoreCaseOrderByDateDesc(
                testUser.getId(), "run", pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getActivity()).isEqualTo("Running");
    }

    @Test
    void findByUserIdAndActivityContainingIgnoreCaseOrderByDateDesc_ShouldBeCaseInsensitive() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Workout> result = workoutRepository.findByUserIdAndActivityContainingIgnoreCaseOrderByDateDesc(
                testUser.getId(), "SWIM", pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getActivity()).isEqualTo("Swimming");
    }

    @Test
    void findByUserIdAndDurationMinBetweenOrderByDateDesc_ShouldReturnEntriesInDurationRange() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Workout> result = workoutRepository.findByUserIdAndDurationMinBetweenOrderByDateDesc(
                testUser.getId(), 40, 50, pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getActivity()).isEqualTo("Swimming");
        assertThat(result.getContent().get(0).getDurationMin()).isEqualTo(45);
    }

    @Test
    void findByUserIdAndCaloriesBurnedBetweenOrderByDateDesc_ShouldReturnEntriesInCalorieRange() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Workout> result = workoutRepository.findByUserIdAndCaloriesBurnedBetweenOrderByDateDesc(
                testUser.getId(), 350, 450, pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getActivity()).isEqualTo("Swimming");
        assertThat(result.getContent().get(0).getCaloriesBurned()).isEqualTo(400);
    }

    @Test
    void findByUserIdAndCaloriesBurnedIsNotNullOrderByDateDesc_ShouldReturnOnlyEntriesWithCalories() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Workout> result = workoutRepository.findByUserIdAndCaloriesBurnedIsNotNullOrderByDateDesc(
                testUser.getId(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(Workout::getActivity)
                .containsExactlyInAnyOrder("Running", "Swimming");
        result.getContent().forEach(workout -> 
            assertThat(workout.getCaloriesBurned()).isNotNull()
        );
    }

    @Test
    void findByUserIdAndDateGreaterThanEqualOrderByDateDesc_ShouldReturnEntriesFromStartDate() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(1);
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Workout> result = workoutRepository.findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
                testUser.getId(), startDate, pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getDate()).isEqualTo(LocalDate.now());
        assertThat(result.getContent().get(1).getDate()).isEqualTo(LocalDate.now().minusDays(1));
    }

    @Test
    void findByUserIdOrderByDateDesc_WithPagination_ShouldRespectPageSize() {
        // Given
        Pageable pageable = PageRequest.of(0, 2);

        // When
        Page<Workout> result = workoutRepository.findByUserIdOrderByDateDesc(testUser.getId(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getTotalPages()).isEqualTo(2);
        assertThat(result.hasNext()).isTrue();
    }
}