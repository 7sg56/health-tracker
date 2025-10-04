package com.healthtracker.htbackend.repository;

import com.healthtracker.htbackend.entity.DailyHealthIndex;
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
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class DailyHealthIndexRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DailyHealthIndexRepository dailyHealthIndexRepository;

    private User testUser;
    private User otherUser;
    private DailyHealthIndex healthIndex1;
    private DailyHealthIndex healthIndex2;
    private DailyHealthIndex healthIndex3;

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

        // Create test health index entries
        healthIndex1 = new DailyHealthIndex();
        healthIndex1.setUser(testUser);
        healthIndex1.setDate(LocalDate.now().minusDays(2));
        healthIndex1.setHealthScore(75.5f);
        healthIndex1.setCreatedAt(LocalDateTime.now());

        healthIndex2 = new DailyHealthIndex();
        healthIndex2.setUser(testUser);
        healthIndex2.setDate(LocalDate.now().minusDays(1));
        healthIndex2.setHealthScore(82.3f);
        healthIndex2.setCreatedAt(LocalDateTime.now());

        healthIndex3 = new DailyHealthIndex();
        healthIndex3.setUser(testUser);
        healthIndex3.setDate(LocalDate.now());
        healthIndex3.setHealthScore(68.7f);
        healthIndex3.setCreatedAt(LocalDateTime.now());

        // Create entry for other user
        DailyHealthIndex otherUserIndex = new DailyHealthIndex();
        otherUserIndex.setUser(otherUser);
        otherUserIndex.setDate(LocalDate.now());
        otherUserIndex.setHealthScore(90.0f);
        otherUserIndex.setCreatedAt(LocalDateTime.now());

        entityManager.persistAndFlush(healthIndex1);
        entityManager.persistAndFlush(healthIndex2);
        entityManager.persistAndFlush(healthIndex3);
        entityManager.persistAndFlush(otherUserIndex);
    }

    @Test
    void findByUserIdAndDate_WhenEntryExists_ShouldReturnHealthIndex() {
        // Given
        LocalDate today = LocalDate.now();

        // When
        Optional<DailyHealthIndex> result = dailyHealthIndexRepository.findByUserIdAndDate(testUser.getId(), today);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getDate()).isEqualTo(today);
        assertThat(result.get().getHealthScore()).isEqualTo(68.7f);
        assertThat(result.get().getUser().getId()).isEqualTo(testUser.getId());
    }

    @Test
    void findByUserIdAndDate_WhenEntryDoesNotExist_ShouldReturnEmpty() {
        // Given
        LocalDate futureDate = LocalDate.now().plusDays(1);

        // When
        Optional<DailyHealthIndex> result = dailyHealthIndexRepository.findByUserIdAndDate(testUser.getId(), futureDate);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void findByUserIdOrderByDateDesc_ShouldReturnUserEntriesOrderedByDateDesc() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<DailyHealthIndex> result = dailyHealthIndexRepository.findByUserIdOrderByDateDesc(testUser.getId(), pageable);

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
        Page<DailyHealthIndex> result = dailyHealthIndexRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                testUser.getId(), startDate, endDate, pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getDate()).isEqualTo(LocalDate.now());
        assertThat(result.getContent().get(1).getDate()).isEqualTo(LocalDate.now().minusDays(1));
    }

    @Test
    void findByUserIdAndHealthScoreBetweenOrderByDateDesc_ShouldReturnEntriesInScoreRange() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<DailyHealthIndex> result = dailyHealthIndexRepository.findByUserIdAndHealthScoreBetweenOrderByDateDesc(
                testUser.getId(), 70.0f, 85.0f, pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(DailyHealthIndex::getHealthScore)
                .containsExactlyInAnyOrder(75.5f, 82.3f);
    }

    @Test
    void findFirstByUserIdOrderByDateDesc_ShouldReturnMostRecentEntry() {
        // When
        Optional<DailyHealthIndex> result = dailyHealthIndexRepository.findFirstByUserIdOrderByDateDesc(testUser.getId());

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getDate()).isEqualTo(LocalDate.now());
        assertThat(result.get().getHealthScore()).isEqualTo(68.7f);
    }

    @Test
    void getAverageHealthScoreByUserAndDateRange_ShouldReturnCorrectAverage() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(2);
        LocalDate endDate = LocalDate.now();

        // When
        Float average = dailyHealthIndexRepository.getAverageHealthScoreByUserAndDateRange(
                testUser.getId(), startDate, endDate);

        // Then
        // Average of 75.5, 82.3, 68.7 = 75.5
        assertThat(average).isEqualTo((75.5f + 82.3f + 68.7f) / 3);
    }

    @Test
    void getMaxHealthScoreByUserAndDateRange_ShouldReturnHighestScore() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(2);
        LocalDate endDate = LocalDate.now();

        // When
        Float maxScore = dailyHealthIndexRepository.getMaxHealthScoreByUserAndDateRange(
                testUser.getId(), startDate, endDate);

        // Then
        assertThat(maxScore).isEqualTo(82.3f);
    }

    @Test
    void getMinHealthScoreByUserAndDateRange_ShouldReturnLowestScore() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(2);
        LocalDate endDate = LocalDate.now();

        // When
        Float minScore = dailyHealthIndexRepository.getMinHealthScoreByUserAndDateRange(
                testUser.getId(), startDate, endDate);

        // Then
        assertThat(minScore).isEqualTo(68.7f);
    }

    @Test
    void countDaysAboveThreshold_ShouldReturnCorrectCount() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(2);
        LocalDate endDate = LocalDate.now();
        Float threshold = 70.0f;

        // When
        Long count = dailyHealthIndexRepository.countDaysAboveThreshold(
                testUser.getId(), threshold, startDate, endDate);

        // Then
        // Scores above 70.0: 75.5 and 82.3 (2 entries)
        assertThat(count).isEqualTo(2L);
    }

    @Test
    void existsByUserIdAndDate_WhenEntryExists_ShouldReturnTrue() {
        // Given
        LocalDate today = LocalDate.now();

        // When
        boolean exists = dailyHealthIndexRepository.existsByUserIdAndDate(testUser.getId(), today);

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void existsByUserIdAndDate_WhenEntryDoesNotExist_ShouldReturnFalse() {
        // Given
        LocalDate futureDate = LocalDate.now().plusDays(1);

        // When
        boolean exists = dailyHealthIndexRepository.existsByUserIdAndDate(testUser.getId(), futureDate);

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void findByUserIdAndDateIn_ShouldReturnEntriesForSpecifiedDates() {
        // Given
        List<LocalDate> dates = Arrays.asList(
                LocalDate.now(),
                LocalDate.now().minusDays(2),
                LocalDate.now().plusDays(1) // This date has no entry
        );

        // When
        List<DailyHealthIndex> result = dailyHealthIndexRepository.findByUserIdAndDateIn(testUser.getId(), dates);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(DailyHealthIndex::getDate)
                .containsExactlyInAnyOrder(LocalDate.now(), LocalDate.now().minusDays(2));
    }

    @Test
    void findByUserIdAndDateGreaterThanEqualOrderByDateDesc_ShouldReturnEntriesFromStartDate() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(1);
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<DailyHealthIndex> result = dailyHealthIndexRepository.findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
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
        Page<DailyHealthIndex> result = dailyHealthIndexRepository.findByUserIdAndDateLessThanEqualOrderByDateDesc(
                testUser.getId(), endDate, pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getDate()).isEqualTo(LocalDate.now().minusDays(1));
        assertThat(result.getContent().get(1).getDate()).isEqualTo(LocalDate.now().minusDays(2));
    }

    @Test
    void getAverageHealthScoreByUserAndDateRange_WhenNoEntries_ShouldReturnNull() {
        // Given
        LocalDate startDate = LocalDate.now().plusDays(1);
        LocalDate endDate = LocalDate.now().plusDays(5);

        // When
        Float average = dailyHealthIndexRepository.getAverageHealthScoreByUserAndDateRange(
                testUser.getId(), startDate, endDate);

        // Then
        assertThat(average).isNull();
    }

    @Test
    void findByUserIdOrderByDateDesc_WithPagination_ShouldRespectPageSize() {
        // Given
        Pageable pageable = PageRequest.of(0, 2);

        // When
        Page<DailyHealthIndex> result = dailyHealthIndexRepository.findByUserIdOrderByDateDesc(testUser.getId(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getTotalPages()).isEqualTo(2);
        assertThat(result.hasNext()).isTrue();
    }
}