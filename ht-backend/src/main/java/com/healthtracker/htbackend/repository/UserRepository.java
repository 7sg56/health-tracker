package com.healthtracker.htbackend.repository;

import com.healthtracker.htbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity operations.
 * Provides methods for user authentication and uniqueness validation.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by username.
     * @param username the username to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find user by email address.
     * @param email the email to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if a username already exists.
     * @param username the username to check
     * @return true if username exists, false otherwise
     */
    boolean existsByUsername(String username);
    
    /**
     * Check if an email already exists.
     * @param email the email to check
     * @return true if email exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Find users by username prefix (for test data management).
     * @param prefix the username prefix to search for
     * @return List of users with usernames starting with the prefix
     */
    List<User> findByUsernameStartingWith(String prefix);
}