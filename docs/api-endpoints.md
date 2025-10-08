# API Endpoints

Base URL: `${NEXT_PUBLIC_API_BASE_URL}` (default: http://localhost:8080)
All endpoints return JSON. Responses are normalized in the frontend as `{ data?, error?, status }`.

- Health Index
  - GET /api/health-index
    - Description: Get today’s DailyHealthIndex
    - Response: { id: number, date: string (YYYY-MM-DD), healthScore: number, createdAt: string }
  - GET /api/health-index/{date}
    - Description: Get DailyHealthIndex for a specific date (YYYY-MM-DD)
  - POST /api/health-index/calculate
    - Description: Trigger recalculation for today
  - POST /api/health-index/calculate/{date}
    - Description: Trigger recalculation for a specific date

- Water Intake
  - POST /api/water
    - Body: { amountLtr: number }
    - Response: WaterIntake
  - GET /api/water?page={n}&size={n}&sort={field,dir}
    - Response: { content: WaterIntake[], page: { number, size, totalElements, totalPages } }
  - GET /api/water/{id}
    - Response: WaterIntake
  - DELETE /api/water/{id}

- Food Intake
  - POST /api/food
    - Body: { foodItem: string, calories: number }
    - Response: FoodIntake
  - GET /api/food?page={n}&size={n}&sort={field,dir}
    - Response: { content: FoodIntake[], page: { number, size, totalElements, totalPages } }
  - GET /api/food/{id}
    - Response: FoodIntake
  - PUT /api/food/{id}
    - Body: { foodItem: string, calories: number }
    - Response: FoodIntake
  - DELETE /api/food/{id}

- Workouts
  - POST /api/workouts
    - Body: { activity: string, durationMin: number, caloriesBurned?: number }
    - Response: Workout
  - GET /api/workouts?page={n}&size={n}&sort={field,dir}
    - Response: { content: Workout[], page: { number, size, totalElements, totalPages } }
  - GET /api/workouts/{id}
    - Response: Workout
  - PUT /api/workouts/{id}
    - Body: { activity: string, durationMin: number, caloriesBurned?: number }
    - Response: Workout
  - DELETE /api/workouts/{id}

- Health (Utilities)
  - GET /api/health (optional health check endpoint if implemented)

- Auth (dormant, present in code but not used by UI; backend may still expose these)
  - POST /api/auth/register
    - Body: { username, email, password }
    - Response: User
  - POST /api/auth/login
    - Body: { username, password }
    - Response: User
  - POST /api/auth/logout
  - GET /api/auth/profile
    - Response: User
  - GET /api/auth/session
    - Response: { valid: boolean, user?: User }

Types (frontend)
- WaterIntake: { id, amountLtr, date, createdAt }
- FoodIntake: { id, foodItem, calories, date, createdAt }
- Workout: { id, activity, durationMin, caloriesBurned?, date, createdAt }
- DailyHealthIndex: { id, date, healthScore, createdAt }

Notes
- Pagination parameters are optional. Sorting is backend-defined (e.g., `sort=date,desc`).
- Some list endpoints are paginated on the server; client may filter by date.
- Health score breakdown is currently computed client-side for UI (backend returns only the overall score).