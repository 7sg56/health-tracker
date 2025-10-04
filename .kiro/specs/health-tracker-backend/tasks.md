# Implementation Plan

- [x] 1. Set up project foundation and configuration

  - Update application.properties with proper MySQL configuration and session settings
  - Configure Spring Security for session-based authentication
  - Set up global exception handler and error response structure
  - _Requirements: 1.7, 7.1-7.6, 8.4_

- [x] 2. Create core entity models

  - [x] 2.1 Update User entity to match database schema

    - Modify existing User.java to include username, email, password fields with proper validation
    - Add relationships to other entities with cascade settings
    - _Requirements: 1.1, 1.2, 8.1_

  - [x] 2.2 Create WaterIntake entity

    - Implement WaterIntake entity with proper JPA annotations matching database schema
    - Add validation constraints for amount_ltr field (0.1-10.0)
    - _Requirements: 3.1, 3.4, 8.1_

  - [x] 2.3 Create FoodIntake entity

    - Implement FoodIntake entity with food_item and calories fields
    - Add validation for food_item (1-100 chars) and calories (1-5000)
    - _Requirements: 4.1, 4.5, 8.1_

  - [x] 2.4 Create Workout entity

    - Implement Workout entity with activity, duration_min, and optional calories_burned
    - Add validation for activity (1-100 chars), duration (1-600 min), calories_burned (0-2000)
    - _Requirements: 5.1, 5.2, 5.6, 8.1_

  - [x] 2.5 Create DailyHealthIndex entity
    - Implement DailyHealthIndex entity with unique constraint on user_id and date
    - Add validation for health_score (0.0-100.0)
    - _Requirements: 6.5, 6.6, 8.1_

- [x] 3. Create repository interfaces

  - [x] 3.1 Create UserRepository

    - Implement UserRepository with methods for finding by username and email
    - Add existence check methods for username and email uniqueness
    - Write unit tests for repository methods
    - _Requirements: 1.1, 1.2_

  - [x] 3.2 Create WaterIntakeRepository

    - Implement repository with pagination and date filtering methods
    - Add methods for finding by user and date combinations
    - Write unit tests for custom query methods
    - _Requirements: 3.2, 9.1, 9.2, 9.3_

  - [x] 3.3 Create FoodIntakeRepository

    - Implement repository with pagination, date filtering, and sorting
    - Add methods for finding user-specific food entries
    - Write unit tests for repository operations
    - _Requirements: 4.2, 9.1, 9.2, 9.3_

  - [x] 3.4 Create WorkoutRepository

    - Implement repository with pagination and date range filtering
    - Add methods for finding user workouts with sorting options
    - Write unit tests for workout queries
    - _Requirements: 5.3, 9.1, 9.2, 9.3_

  - [x] 3.5 Create DailyHealthIndexRepository
    - Implement repository for finding health index by user and date
    - Add method for unique constraint handling
    - Write unit tests for health index queries
    - _Requirements: 6.1, 6.2, 6.5_

- [x] 4. Create Data Transfer Objects (DTOs)

  - [x] 4.1 Create authentication DTOs

    - Implement UserRegistrationDto with validation annotations
    - Create UserLoginDto and UserResponseDto
    - Add unit tests for DTO validation
    - _Requirements: 1.1, 1.3, 1.7, 8.1_

  - [x] 4.2 Create health tracking request DTOs

    - Implement WaterIntakeRequestDto with amount validation
    - Create FoodIntakeRequestDto with food item and calorie validation
    - Implement WorkoutRequestDto with activity and duration validation
    - _Requirements: 3.4, 4.5, 5.6, 8.1_

  - [x] 4.3 Create response DTOs and pagination wrapper
    - Implement response DTOs for all health tracking entities
    - Create paginated response wrapper matching Spring Data format
    - Add unit tests for DTO mapping
    - _Requirements: 9.1, 9.5_

- [x] 5. Implement authentication service layer

  - [x] 5.1 Create AuthService with user registration

    - Implement user registration with password encryption using BCrypt
    - Add username and email uniqueness validation
    - Handle registration conflicts and return appropriate errors
    - Write unit tests for registration scenarios
    - _Requirements: 1.1, 1.2, 8.2_

  - [x] 5.2 Implement login functionality

    - Create login method with credential validation
    - Implement session creation and management
    - Handle authentication failures with proper error responses
    - Write unit tests for login scenarios
    - _Requirements: 1.3, 1.4, 1.5_

  - [x] 5.3 Add logout and profile methods
    - Implement logout with session invalidation
    - Create getCurrentUser method for profile retrieval
    - Write unit tests for logout and profile operations
    - _Requirements: 1.6, 2.1, 2.2_

- [x] 6. Implement health tracking service layer

  - [x] 6.1 Create WaterIntakeService

    - Implement createWaterIntake with user association and validation
    - Add getWaterIntakes with pagination and date filtering
    - Implement deleteWaterIntake with ownership validation
    - Write unit tests for all water intake operations
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 6.2 Create FoodIntakeService

    - Implement CRUD operations for food intake entries
    - Add updateFoodIntake with ownership validation
    - Implement pagination and filtering for food history
    - Write unit tests for all food intake operations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

  - [x] 6.3 Create WorkoutService
    - Implement CRUD operations for workout entries
    - Add updateWorkout with proper validation
    - Implement pagination and date filtering for workout history
    - Write unit tests for all workout operations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

- [x] 7. Implement health score calculation service

  - [x] 7.1 Create HealthScoreService with calculation logic

    - Implement calculateWaterScore method (30% weight, target 2.5L)
    - Implement calculateCalorieScore method (40% weight, target 2000 calories)
    - Implement calculateExerciseScore method (30% weight, target 30 minutes)
    - Write unit tests for each calculation method
    - _Requirements: 6.1, 6.5, 6.6_

  - [x] 7.2 Add health index retrieval and storage
    - Implement getHealthScore method with automatic calculation
    - Add storage/update logic for daily_health_index table
    - Handle date-specific health score requests
    - Write unit tests for health score operations
    - _Requirements: 6.1, 6.2, 6.3, 6.6_

- [x] 8. Create authentication controller

  - [x] 8.1 Implement AuthController endpoints
    - Create POST /api/auth/register endpoint with validation
    - Implement POST /api/auth/login with session management
    - Add POST /api/auth/logout and GET /api/auth/profile endpoints
    - Write integration tests for all authentication endpoints
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 2.1_

- [x] 9. Create health tracking controllers

  - [x] 9.1 Implement WaterIntakeController

    - Create POST /api/water endpoint for creating entries
    - Implement GET /api/water with pagination and filtering
    - Add DELETE /api/water/{id} with ownership validation
    - Write integration tests for water intake endpoints
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 9.1, 9.2_

  - [x] 9.2 Implement FoodIntakeController

    - Create CRUD endpoints for food intake management
    - Add PUT /api/food/{id} for updating entries
    - Implement pagination and filtering for GET /api/food
    - Write integration tests for food intake endpoints
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 9.1, 9.2_

  - [x] 9.3 Implement WorkoutController

    - Create CRUD endpoints for workout management
    - Add PUT /api/workouts/{id} for updating entries
    - Implement pagination and filtering for GET /api/workouts
    - Write integration tests for workout endpoints
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7, 9.1, 9.2_

  - [x] 9.4 Implement HealthIndexController
    - Create GET /api/health-index for current date health score
    - Add GET /api/health-index/{date} for specific date queries
    - Implement automatic health score calculation and caching
    - Write integration tests for health index endpoints
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 10. Configure Spring Security and session management

  - [x] 10.1 Set up SecurityConfig

    - Configure session-based authentication with proper settings
    - Set up CSRF protection and session security
    - Configure password encoder with BCrypt strength 12
    - Write security integration tests
    - _Requirements: 8.2, 8.4, 8.5_

  - [x] 10.2 Add session configuration
    - Configure session timeout and management settings
    - Set up HttpOnly and Secure flags for session cookies
    - Implement session event handling
    - Write tests for session management
    - _Requirements: 1.5, 8.4_

- [x] 11. Implement global exception handling

  - [x] 11.1 Create custom exception classes

    - Implement ResourceNotFoundException, UnauthorizedException, ConflictException
    - Create base exception classes with proper inheritance
    - Write unit tests for exception classes
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 11.2 Create GlobalExceptionHandler
    - Implement @RestControllerAdvice with consistent error response format
    - Handle validation exceptions with field-specific error details
    - Add generic exception handling with proper logging
    - Write integration tests for error handling scenarios
    - _Requirements: 7.1, 7.5, 7.6_

- [x] 12. Add comprehensive testing and validation

  - [x] 12.1 Create integration tests for complete workflows

    - Write end-to-end tests for user registration and login flow
    - Test complete health tracking workflows with authentication
    - Add tests for health score calculation with real data
    - _Requirements: All requirements integration testing_

  - [x] 12.2 Add performance and security tests
    - Test pagination performance with large datasets
    - Validate session security and CSRF protection
    - Test concurrent user scenarios and data isolation
    - _Requirements: 8.3, 8.4, 8.5, 9.1_

- [-] 13. Final configuration and deployment preparation

  - [x] 13.1 Update application configuration

    - Configure production-ready database settings
    - Set up proper logging configuration
    - Add health check endpoints and monitoring
    - _Requirements: System reliability and monitoring_

  - [x] 13.2 Create API documentation and testing setup
    - Add Swagger/OpenAPI documentation for all endpoints
    - Create Postman collection for API testing
    - Document authentication flow and session management
    - _Requirements: API documentation and usability_
