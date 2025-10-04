package com.healthtracker.htbackend.repository;

import com.healthtracker.htbackend.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("hashedpassword");
        testUser.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void findByUsername_WhenUserExists_ShouldReturnUser() {
        // Given
        entityManager.persistAndFlush(testUser);

        // When
        Optional<User> found = userRepository.findByUsername("testuser");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("testuser");
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void findByUsername_WhenUserDoesNotExist_ShouldReturnEmpty() {
        // When
        Optional<User> found = userRepository.findByUsername("nonexistent");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    void findByEmail_WhenUserExists_ShouldReturnUser() {
        // Given
        entityManager.persistAndFlush(testUser);

        // When
        Optional<User> found = userRepository.findByEmail("test@example.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
        assertThat(found.get().getUsername()).isEqualTo("testuser");
    }

    @Test
    void findByEmail_WhenUserDoesNotExist_ShouldReturnEmpty() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    void existsByUsername_WhenUserExists_ShouldReturnTrue() {
        // Given
        entityManager.persistAndFlush(testUser);

        // When
        boolean exists = userRepository.existsByUsername("testuser");

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void existsByUsername_WhenUserDoesNotExist_ShouldReturnFalse() {
        // When
        boolean exists = userRepository.existsByUsername("nonexistent");

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void existsByEmail_WhenUserExists_ShouldReturnTrue() {
        // Given
        entityManager.persistAndFlush(testUser);

        // When
        boolean exists = userRepository.existsByEmail("test@example.com");

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void existsByEmail_WhenUserDoesNotExist_ShouldReturnFalse() {
        // When
        boolean exists = userRepository.existsByEmail("nonexistent@example.com");

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void findByUsername_ShouldBeCaseInsensitive() {
        // Given
        entityManager.persistAndFlush(testUser);

        // When
        Optional<User> found = userRepository.findByUsername("TESTUSER");

        // Then - This test will fail if case sensitivity is enforced
        // The behavior depends on database collation settings
        // For MySQL with default collation, this should work
        assertThat(found).isPresent();
    }
}