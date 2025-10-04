# Requirements Document

## Introduction

This document outlines the requirements for implementing a comprehensive health tracker backend API using Spring Boot 3.5.6, JPA, and MySQL. The system will provide session-based authentication and CRUD operations for tracking water intake, food consumption, workouts, and daily health scores. The backend will serve a frontend application with specific routes for authentication and health tracking features.

## API Endpoints Overview

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Health Tracking Endpoints
- `GET /api/water` - Get user's water intake history
- `POST /api/water` - Create water intake entry
- `DELETE /api/water/{id}` - Delete water intake entry

- `GET /api/food` - Get user's food intake history
- `POST /api/food` - Create food intake entry
- `PUT /api/food/{id}` - Update food intake entry
- `DELETE /api/food/{id}` - Delete food intake entry

- `GET /api/workouts` - Get user's workout history
- `POST /api/workouts` - Create workout entry
- `PUT /api/workouts/{id}` - Update workout entry
- `DELETE /api/workouts/{id}` - Delete workout entry

- `GET /api/health-index` - Get daily health index for current date
- `GET /api/health-index/{date}` - Get health index for specific date

## Data Relationships and Constraints

### Database Relationships
- All health tracking tables (water_intake, food_intake, workouts, daily_health_index) have foreign key relationships to users table
- CASCADE DELETE: When a user is deleted, all associated health data is automatically removed
- UNIQUE CONSTRAINT: daily_health_index has unique constraint on (user_id, date) combination

### Input Validation Rules
- **Username**: 3-50 characters, alphanumeric and underscore only
- **Email**: Valid email format, max 150 characters
- **Password**: Minimum 8 characters, must contain at least one uppercase, one lowercase, one digit
- **Water Amount**: 0.1 to 10.0 liters, up to 2 decimal places
- **Food Calories**: 1 to 5000 calories, integer values only
- **Food Item**: 1-100 characters, non-empty string
- **Workout Duration**: 1 to 600 minutes, integer values only
- **Workout Activity**: 1-100 characters, non-empty string
- **Calories Burned**: 0 to 2000 calories, integer values, optional field
- **Dates**: ISO 8601 format (YYYY-MM-DD), cannot be future dates for entries

### Session Management
- **Session Lifetime**: 24 hours of inactivity
- **Session Storage**: Server-side session storage with secure session IDs
- **Session Security**: HttpOnly and Secure flags enabled for session cookies

### Daily Health Score Calculation
The daily health score (0-100) is calculated based on:
- **Water Intake (30%)**: Target 2.5L daily, score = min(100, (actual_liters / 2.5) * 100)
- **Calorie Balance (40%)**: Target 2000 calories daily, score = max(0, 100 - abs(actual_calories - 2000) / 20)
- **Exercise Activity (30%)**: Target 30 minutes daily, score = min(100, (actual_minutes / 30) * 100)

## Requirements

### Requirement 1: User Authentication System

**User Story:** As a user, I want to register and login to the health tracker application, so that I can securely access my personal health data.

#### Acceptance Criteria

1. WHEN a user posts to `/api/auth/register` with valid username, email, and password THEN the system SHALL create a new user account with BCrypt encrypted password and return HTTP 201
2. WHEN a user attempts to register with an existing username or email THEN the system SHALL return HTTP 409 with conflict error message
3. WHEN a user posts to `/api/auth/login` with valid credentials THEN the system SHALL create a session and return HTTP 200 with user details
4. WHEN a user posts to `/api/auth/login` with invalid credentials THEN the system SHALL return HTTP 401 with authentication error
5. WHEN an authenticated user makes a request to protected endpoints THEN the system SHALL validate the session before processing
6. WHEN a user posts to `/api/auth/logout` THEN the system SHALL invalidate the session and return HTTP 200
7. WHEN registration input violates validation rules THEN the system SHALL return HTTP 400 with specific field errors

### Requirement 2: User Profile Management

**User Story:** As an authenticated user, I want to view my profile information, so that I can see my account details.

#### Acceptance Criteria

1. WHEN an authenticated user gets `/api/auth/profile` THEN the system SHALL return HTTP 200 with user details (id, username, email, created_at) excluding password
2. WHEN an unauthenticated user gets `/api/auth/profile` THEN the system SHALL return HTTP 401 with authentication error
3. WHEN session is invalid or expired THEN the system SHALL return HTTP 401 with session expired message

### Requirement 3: Water Intake Tracking

**User Story:** As an authenticated user, I want to track my daily water intake, so that I can monitor my hydration levels.

#### Acceptance Criteria

1. WHEN a user posts to `/api/water` with valid amount (0.1-10.0 liters) THEN the system SHALL store the entry with current date and return HTTP 201
2. WHEN a user gets `/api/water` THEN the system SHALL return HTTP 200 with paginated water entries for that user only
3. WHEN a user deletes `/api/water/{id}` for their own entry THEN the system SHALL remove the entry and return HTTP 204
4. WHEN a user posts to `/api/water` with invalid amount THEN the system SHALL return HTTP 400 with validation error
5. WHEN a user attempts to delete another user's water entry THEN the system SHALL return HTTP 403 with authorization error
6. WHEN a user deletes non-existent water entry THEN the system SHALL return HTTP 404

### Requirement 4: Food Intake Management

**User Story:** As an authenticated user, I want to track my food consumption and calories, so that I can monitor my nutritional intake.

#### Acceptance Criteria

1. WHEN a user posts to `/api/food` with valid food_item (1-100 chars) and calories (1-5000) THEN the system SHALL store the entry with current date and return HTTP 201
2. WHEN a user gets `/api/food` THEN the system SHALL return HTTP 200 with paginated food entries for that user only
3. WHEN a user puts to `/api/food/{id}` with valid data for their own entry THEN the system SHALL update the entry and return HTTP 200
4. WHEN a user deletes `/api/food/{id}` for their own entry THEN the system SHALL remove the entry and return HTTP 204
5. WHEN a user posts to `/api/food` with invalid data THEN the system SHALL return HTTP 400 with validation errors
6. WHEN a user attempts to modify another user's food entry THEN the system SHALL return HTTP 403 with authorization error
7. WHEN a user updates/deletes non-existent food entry THEN the system SHALL return HTTP 404

### Requirement 5: Workout Tracking

**User Story:** As an authenticated user, I want to log my workouts and exercise activities, so that I can track my fitness progress.

#### Acceptance Criteria

1. WHEN a user posts to `/api/workouts` with valid activity (1-100 chars) and duration (1-600 minutes) THEN the system SHALL store the entry with current date and return HTTP 201
2. WHEN a user posts to `/api/workouts` with optional calories_burned (0-2000) THEN the system SHALL store the calories value
3. WHEN a user gets `/api/workouts` THEN the system SHALL return HTTP 200 with paginated workout entries for that user only
4. WHEN a user puts to `/api/workouts/{id}` with valid data for their own entry THEN the system SHALL update the entry and return HTTP 200
5. WHEN a user deletes `/api/workouts/{id}` for their own entry THEN the system SHALL remove the entry and return HTTP 204
6. WHEN a user posts to `/api/workouts` with invalid data THEN the system SHALL return HTTP 400 with validation errors
7. WHEN a user attempts to modify another user's workout THEN the system SHALL return HTTP 403 with authorization error
8. WHEN a user updates/deletes non-existent workout THEN the system SHALL return HTTP 404

### Requirement 6: Daily Health Index

**User Story:** As an authenticated user, I want to view my daily health score, so that I can understand my overall health status.

#### Acceptance Criteria

1. WHEN a user gets `/api/health-index` THEN the system SHALL calculate and return HTTP 200 with health score for current date
2. WHEN a user gets `/api/health-index/{date}` with valid date format THEN the system SHALL return HTTP 200 with score for that date
3. WHEN no health data exists for a date THEN the system SHALL return HTTP 200 with score 0 and appropriate message
4. WHEN a user requests health index with invalid date format THEN the system SHALL return HTTP 400 with validation error
5. WHEN the system calculates a health score THEN it SHALL use the defined formula and ensure uniqueness per user per date
6. WHEN health score is calculated THEN it SHALL be automatically stored/updated in daily_health_index table

### Requirement 7: API Error Handling

**User Story:** As a frontend developer, I want consistent error responses from the API, so that I can handle errors appropriately in the UI.

#### Acceptance Criteria

1. WHEN any validation error occurs THEN the system SHALL return HTTP 400 with error details
2. WHEN authentication fails THEN the system SHALL return HTTP 401 with appropriate message
3. WHEN authorization fails THEN the system SHALL return HTTP 403 with appropriate message
4. WHEN a resource is not found THEN the system SHALL return HTTP 404 with appropriate message
5. WHEN an internal server error occurs THEN the system SHALL return HTTP 500 with generic error message
6. WHEN any error response is sent THEN it SHALL include a consistent JSON structure

#### Error Response Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email format is invalid"
    }
  ],
  "path": "/api/auth/register"
}
```

### Requirement 8: Data Validation and Security

**User Story:** As a system administrator, I want all user inputs to be validated and secured, so that the system maintains data integrity and security.

#### Acceptance Criteria

1. WHEN any user input is received THEN the system SHALL validate the input according to defined constraints
2. WHEN password is stored THEN the system SHALL encrypt it using BCrypt hashing with strength 12
3. WHEN database operations are performed THEN the system SHALL use JPA/Hibernate parameterized queries
4. WHEN user sessions are managed THEN the system SHALL implement secure session handling with CSRF protection
5. WHEN API endpoints are accessed THEN the system SHALL enforce proper authentication and authorization

### Requirement 9: Enhanced API Features

**User Story:** As a frontend developer, I want enhanced API features like pagination and filtering, so that I can build a responsive user interface.

#### Acceptance Criteria

1. WHEN requesting health data history THEN the system SHALL support pagination with page and size parameters
2. WHEN requesting health data THEN the system SHALL support date range filtering with startDate and endDate
3. WHEN requesting health data THEN the system SHALL support sorting by date (ascending/descending)
4. WHEN deleting health entries THEN the system SHALL implement soft deletes to maintain history
5. WHEN no data exists for a request THEN the system SHALL return empty arrays with appropriate metadata

#### Pagination and Filtering Examples
- `GET /api/water?page=0&size=10&startDate=2024-01-01&endDate=2024-01-31&sort=date,desc`
- `GET /api/food?page=1&size=20&sort=calories,asc`

#### Response Format for Paginated Data
```json
{
  "content": [...],
  "page": {
    "number": 0,
    "size": 10,
    "totalElements": 45,
    "totalPages": 5
  }
}
```