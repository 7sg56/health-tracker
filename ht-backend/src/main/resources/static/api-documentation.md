# Health Tracker Backend API Documentation

## Overview

The Health Tracker Backend API is a comprehensive REST API built with Spring Boot 3.5.6 that provides health tracking functionality with session-based authentication. The API allows users to track water intake, food consumption, workouts, and view their daily health scores.

## Base URL

- **Development**: `http://localhost:8080`
- **Production**: `https://api.healthtracker.com`

## Interactive API Documentation

Once the application is running, you can access the interactive Swagger UI documentation at:
- **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

## Authentication Flow

### Session-Based Authentication

The API uses session-based authentication with HTTP cookies. Here's how the authentication flow works:

#### 1. User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00"
}
```

#### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00"
}
```

**Important**: The server will set a `JSESSIONID` cookie in the response headers. This cookie must be included in all subsequent requests.

#### 3. Making Authenticated Requests

After login, include the session cookie in all requests:

```http
GET /api/auth/profile
Cookie: JSESSIONID=ABC123...
```

#### 4. User Logout
```http
POST /api/auth/logout
Cookie: JSESSIONID=ABC123...
```

**Response (200 OK):** Empty response body. The session is invalidated.

### Session Management Details

- **Session Lifetime**: 24 hours of inactivity
- **Session Storage**: Server-side session storage
- **Cookie Security**: 
  - `HttpOnly` flag enabled (prevents JavaScript access)
  - `Secure` flag enabled in production (HTTPS only)
  - `SameSite=Lax` for CSRF protection
- **Concurrent Sessions**: Maximum 1 session per user (new login invalidates previous session)

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/profile` | Get user profile | Yes |

### Water Intake Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| POST | `/api/water` | Create water intake entry | Yes |
| GET | `/api/water` | Get water intake history (paginated) | Yes |
| DELETE | `/api/water/{id}` | Delete water intake entry | Yes |

### Food Intake Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| POST | `/api/food` | Create food intake entry | Yes |
| GET | `/api/food` | Get food intake history (paginated) | Yes |
| PUT | `/api/food/{id}` | Update food intake entry | Yes |
| DELETE | `/api/food/{id}` | Delete food intake entry | Yes |

### Workout Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| POST | `/api/workouts` | Create workout entry | Yes |
| GET | `/api/workouts` | Get workout history (paginated) | Yes |
| PUT | `/api/workouts/{id}` | Update workout entry | Yes |
| DELETE | `/api/workouts/{id}` | Delete workout entry | Yes |

### Health Index Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| GET | `/api/health-index` | Get current daily health score | Yes |
| GET | `/api/health-index/{date}` | Get health score for specific date | Yes |
| POST | `/api/health-index/calculate` | Force recalculate current health score | Yes |
| POST | `/api/health-index/calculate/{date}` | Force recalculate health score for date | Yes |

## Data Models

### User Registration Request
```json
{
  "username": "string (3-50 chars, alphanumeric + underscore)",
  "email": "string (valid email, max 150 chars)",
  "password": "string (min 8 chars, must contain uppercase, lowercase, digit)"
}
```

### Water Intake Request
```json
{
  "amountLtr": "number (0.1-10.0, up to 2 decimal places)"
}
```

### Food Intake Request
```json
{
  "foodItem": "string (1-100 chars)",
  "calories": "integer (1-5000)"
}
```

### Workout Request
```json
{
  "activity": "string (1-100 chars)",
  "durationMin": "integer (1-600)",
  "caloriesBurned": "integer (0-2000, optional)"
}
```

## Pagination and Filtering

All list endpoints support pagination and filtering:

### Query Parameters
- `page`: Page number (0-based, default: 0)
- `size`: Page size (default: 10, max: 100)
- `startDate`: Start date for filtering (YYYY-MM-DD format)
- `endDate`: End date for filtering (YYYY-MM-DD format)
- `sort`: Sort parameters (format: `property,direction`)

### Example Request
```http
GET /api/water?page=0&size=20&startDate=2024-01-01&endDate=2024-01-31&sort=date,desc
Cookie: JSESSIONID=ABC123...
```

### Pagination Response Format
```json
{
  "content": [...],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 45,
    "totalPages": 3
  }
}
```

## Health Score Calculation

The daily health score (0-100) is calculated using the following formula:

### Components (with weights):
1. **Water Intake (30%)**: `min(100, (actual_liters / 2.5) * 100)`
2. **Calorie Balance (40%)**: `max(0, 100 - abs(actual_calories - 2000) / 20)`
3. **Exercise Activity (30%)**: `min(100, (actual_minutes / 30) * 100)`

### Final Score:
```
health_score = (water_score * 0.3) + (calorie_score * 0.4) + (exercise_score * 0.3)
```

## Error Handling

### Standard Error Response Format
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

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Successful deletion
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Access denied (e.g., trying to modify another user's data)
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (e.g., duplicate username/email)
- `500 Internal Server Error`: Server error

## Security Considerations

### Input Validation
- All inputs are validated using Bean Validation annotations
- SQL injection protection through JPA parameterized queries
- XSS protection through proper input sanitization

### Password Security
- Passwords are hashed using BCrypt with strength 12
- Plain text passwords are never stored or logged

### Session Security
- CSRF protection enabled
- Session fixation protection
- Secure session cookie configuration
- Session timeout after 24 hours of inactivity

### Data Privacy
- Users can only access their own data
- Proper authorization checks on all endpoints
- Sensitive data (passwords) excluded from API responses

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing:
- Request rate limiting per IP/user
- API key-based access control
- DDoS protection

## Testing the API

### Using cURL

1. **Register a user:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123"}'
```

2. **Login and save session:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123"}' \
  -c cookies.txt
```

3. **Make authenticated request:**
```bash
curl -X GET http://localhost:8080/api/auth/profile \
  -b cookies.txt
```

### Using Postman

1. Import the provided Postman collection (see postman-collection.json)
2. Set up environment variables for base URL
3. Use the authentication endpoints to obtain session cookies
4. Test all endpoints with proper authentication

## Support and Contact

For API support or questions:
- **Email**: support@healthtracker.com
- **Documentation**: Available at `/swagger-ui/index.html` when running
- **GitHub**: [Repository URL]

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Session-based authentication
- CRUD operations for health tracking
- Health score calculation
- Comprehensive API documentation