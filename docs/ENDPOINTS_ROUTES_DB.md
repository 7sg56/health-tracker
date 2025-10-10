# System Catalog: API Endpoints, Frontend Routes, and Data Access

Generated: 2025-10-10

This document provides a concise, professional overview of the backend API surface, frontend routes, and data access (JPA/JDBC) in this project.


## Backend API Endpoints (Spring Boot)

Base path: varies by controller

- Food Intake (base: /api/food)
  - POST /api/food — Create a new food intake entry
  - GET /api/food — List food intakes (paginated)
    - Query params: page=0, size=10, startDate=ISO_DATE?, endDate=ISO_DATE?, sort=property,direction (default: date,desc)
  - GET /api/food/{id} — Get food intake by ID
  - PUT /api/food/{id} — Update food intake by ID
  - DELETE /api/food/{id} — Delete food intake by ID

- Workouts (base: /api/workouts)
  - POST /api/workouts — Create a new workout entry
  - GET /api/workouts — List workouts (paginated)
    - Query params: page=0, size=10, startDate=ISO_DATE?, endDate=ISO_DATE?, sort=property,direction (default: date,desc)
  - GET /api/workouts/{id} — Get workout by ID
  - PUT /api/workouts/{id} — Update workout by ID
  - DELETE /api/workouts/{id} — Delete workout by ID

- Water Intake (base: /api/water)
  - POST /api/water — Create a new water intake entry
  - GET /api/water — List water intakes (paginated)
    - Query params: page=0, size=10, startDate=ISO_DATE?, endDate=ISO_DATE?, sort=property,direction (default: date,desc)
  - GET /api/water/{id} — Get water intake by ID
  - DELETE /api/water/{id} — Delete water intake by ID

- Test Data (base: /api/test-data)
  - POST /api/test-data/setup — Initialize test data
    - Body: TestDataSetupRequest { userCount, daysOfData, includeHealthData, includeWorkouts, includeFoodIntake, includeWaterIntake }
  - POST /api/test-data/setup/users?count=N — Create N test users
  - POST /api/test-data/setup/health-data?userId=ID&days=N — Create health data
  - GET /api/test-data/users — List test users
  - GET /api/test-data/status — Test data status
  - DELETE /api/test-data/cleanup?force=bool — Cleanup test data
  - DELETE /api/test-data/cleanup/users — Cleanup test users
  - DELETE /api/test-data/cleanup/health-data?userId=ID? — Cleanup health data
  - POST /api/test-data/reset — Reset test environment

Notes
- Authentication/session: Controllers resolve current userId from session when present; otherwise fall back to a demo user that is created on-demand if missing.


## Frontend Routes (Next.js App Router)

Discovered app routes
- /auth/login — Login page
- /auth/register — Registration page
- /dashboard — Dashboard overview
- /dashboard/food — Food intake view
- /dashboard/water — Water intake view
- /dashboard/workout — Workout view
- /dashboard/profile — User profile

Navigation configuration (used by UI navigation)
- Primary: /dashboard, /dashboard/water, /dashboard/food, /dashboard/workout, /dashboard/profile
- Extended (present in navigation config; pages may be planned/optional): /dashboard/analytics, /dashboard/goals, /dashboard/history, /dashboard/achievements
- Secondary: /settings

Route guards and redirects
- Protected routes: /dashboard and all children
- Public routes: /auth/login, /auth/register
- Legacy redirects: /home → /dashboard and specific mappings
  - /home/waterIntake → /dashboard/water
  - /home/foodIntake → /dashboard/food
  - /home/workout → /dashboard/workout
  - /home/profile → /dashboard/profile


## Data Access Layer (JPA/JDBC)

ORM: Spring Data JPA
Direct JDBC: None detected (no JdbcTemplate/NamedParameterJdbcTemplate/EntityManager native queries outside @Query)

Entities
- User
- Workout
- FoodIntake
- WaterIntake
- DailyHealthIndex

Repositories (Spring Data JPA)
- UserRepository (User, Long)
  - findByUsername(String)
  - findByEmail(String)
  - existsByUsername(String)
  - existsByEmail(String)
  - findByUsernameStartingWith(String)

- FoodIntakeRepository (FoodIntake, Long)
  - Pagination/sorting and filters by user/date/calories/foodItem
  - Key methods: findByUserIdOrderByDateDesc, findByUserIdAndDateBetweenOrderByDateDesc, findByUserIdAndDate, findByUserIdAndDateGreaterThanEqualOrderByDateDesc, findByUserIdAndDateLessThanEqualOrderByDateDesc, findByUserIdOrderByCaloriesDesc/Asc, findByUserIdAndFoodItemContainingIgnoreCaseOrderByDateDesc, findByUserIdAndCaloriesBetweenOrderByDateDesc
  - Aggregations (@Query): getTotalCaloriesByUserAndDate(userId, date)
  - Maintenance: countByUserIdIn, deleteByUserId, deleteByUserIdIn

- WorkoutRepository (Workout, Long)
  - Pagination/sorting and filters by user/date/duration/calories/activity
  - Key methods: findByUserIdOrderByDateDesc, findByUserIdAndDateBetweenOrderByDateDesc, findByUserIdAndDate, findByUserIdAndDateGreaterThanEqualOrderByDateDesc, findByUserIdAndDateLessThanEqualOrderByDateDesc, findByUserIdOrderByDurationMinDesc/Asc, findByUserIdOrderByCaloriesBurnedDesc, findByUserIdAndActivityContainingIgnoreCaseOrderByDateDesc, findByUserIdAndDurationMinBetweenOrderByDateDesc, findByUserIdAndCaloriesBurnedBetweenOrderByDateDesc, findByUserIdAndCaloriesBurnedIsNotNullOrderByDateDesc
  - Aggregations (@Query): getTotalDurationByUserAndDate(userId, date), getTotalCaloriesBurnedByUserAndDate(userId, date)
  - Maintenance: countByUserIdIn, deleteByUserId, deleteByUserIdIn

- WaterIntakeRepository (WaterIntake, Long)
  - Pagination/sorting and filters by user/date
  - Key methods: findByUserIdOrderByDateDesc, findByUserIdAndDateBetweenOrderByDateDesc, findByUserIdAndDate, findByUserIdAndDateGreaterThanEqualOrderByDateDesc, findByUserIdAndDateLessThanEqualOrderByDateDesc
  - Aggregations (@Query): getTotalWaterIntakeByUserAndDate(userId, date)
  - Maintenance: countByUserIdIn, deleteByUserId, deleteByUserIdIn

- DailyHealthIndexRepository (DailyHealthIndex, Long)
  - Key methods: findByUserIdAndDate, findByUserIdOrderByDateDesc, findByUserIdAndDateBetweenOrderByDateDesc, findByUserIdAndDateGreaterThanEqualOrderByDateDesc, findByUserIdAndDateLessThanEqualOrderByDateDesc, findByUserIdAndHealthScoreBetweenOrderByDateDesc, findFirstByUserIdOrderByDateDesc, existsByUserIdAndDate, findByUserIdAndDateIn
  - Aggregations (@Query): getAverageHealthScoreByUserAndDateRange, getMaxHealthScoreByUserAndDateRange, getMinHealthScoreByUserAndDateRange, countDaysAboveThreshold


## Notes
- Pagination defaults for list endpoints: page=0, size=10; sorting default is by date desc. Many list endpoints support date range filters.
- Demo user fallback is used if no authenticated session is present.
