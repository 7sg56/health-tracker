# Health Tracker Backend API - Testing Guide

## Quick Start

### 1. Start the Application
```bash
cd ht-backend
./mvnw spring-boot:run
```

### 2. Access API Documentation
Once the application is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8080/swagger-ui/index.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs
- **Static Documentation**: http://localhost:8080/api-documentation.md

## Testing Methods

### Method 1: Swagger UI (Recommended for Beginners)

1. Open http://localhost:8080/swagger-ui/index.html
2. Click on "Authentication" section
3. Try the "Register User" endpoint:
   - Click "Try it out"
   - Fill in the request body with valid data
   - Click "Execute"
4. Use the "Login User" endpoint to authenticate
5. Test other endpoints (they require authentication)

**Note**: Swagger UI automatically handles session cookies after login.

### Method 2: Postman Collection

1. Import the Postman collection: `postman-collection.json`
2. Set up environment variables:
   - `baseUrl`: http://localhost:8080
3. Run the collection in order:
   - Authentication → Register User
   - Authentication → Login User
   - Test other endpoints

### Method 3: cURL Commands

#### Authentication Flow
```bash
# 1. Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# 2. Login and save session cookie
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "TestPass123"
  }' \
  -c cookies.txt

# 3. Get user profile (using saved cookie)
curl -X GET http://localhost:8080/api/auth/profile \
  -b cookies.txt

# 4. Create water intake entry
curl -X POST http://localhost:8080/api/water \
  -H "Content-Type: application/json" \
  -d '{"amountLtr": 0.5}' \
  -b cookies.txt

# 5. Get water intake history
curl -X GET "http://localhost:8080/api/water?page=0&size=10" \
  -b cookies.txt

# 6. Get current health index
curl -X GET http://localhost:8080/api/health-index \
  -b cookies.txt

# 7. Logout
curl -X POST http://localhost:8080/api/auth/logout \
  -b cookies.txt
```

## Authentication Flow Testing

### Session-Based Authentication
The API uses session-based authentication with HTTP cookies. Here's how to test it:

1. **Register**: Create a new user account
2. **Login**: Authenticate and receive session cookie
3. **Access Protected Endpoints**: Use session cookie for subsequent requests
4. **Logout**: Invalidate session

### Testing Session Security
```bash
# Test accessing protected endpoint without authentication
curl -X GET http://localhost:8080/api/auth/profile
# Expected: 401 Unauthorized

# Test with invalid session cookie
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Cookie: JSESSIONID=invalid-session-id"
# Expected: 401 Unauthorized
```

## Data Validation Testing

### Valid Data Examples
```json
// User Registration
{
  "username": "john_doe123",
  "email": "john@example.com", 
  "password": "SecurePass123"
}

// Water Intake
{
  "amountLtr": 2.5
}

// Food Intake
{
  "foodItem": "Grilled Chicken Breast",
  "calories": 250
}

// Workout
{
  "activity": "Running",
  "durationMin": 30,
  "caloriesBurned": 300
}
```

### Invalid Data Testing
```bash
# Test invalid registration data
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ab",
    "email": "invalid-email",
    "password": "weak"
  }'
# Expected: 400 Bad Request with validation details

# Test invalid water amount
curl -X POST http://localhost:8080/api/water \
  -H "Content-Type: application/json" \
  -d '{"amountLtr": 15.0}' \
  -b cookies.txt
# Expected: 400 Bad Request (exceeds 10.0 limit)
```

## Pagination Testing

Test pagination with large datasets:

```bash
# Create multiple entries first, then test pagination
curl -X GET "http://localhost:8080/api/water?page=0&size=5&sort=date,desc" \
  -b cookies.txt

curl -X GET "http://localhost:8080/api/water?page=1&size=5&sort=amountLtr,asc" \
  -b cookies.txt
```

## Health Score Testing

Test the health score calculation:

```bash
# 1. Create health data for today
curl -X POST http://localhost:8080/api/water \
  -H "Content-Type: application/json" \
  -d '{"amountLtr": 2.5}' \
  -b cookies.txt

curl -X POST http://localhost:8080/api/food \
  -H "Content-Type: application/json" \
  -d '{"foodItem": "Lunch", "calories": 600}' \
  -b cookies.txt

curl -X POST http://localhost:8080/api/workouts \
  -H "Content-Type: application/json" \
  -d '{"activity": "Running", "durationMin": 30}' \
  -b cookies.txt

# 2. Get calculated health score
curl -X GET http://localhost:8080/api/health-index \
  -b cookies.txt

# 3. Force recalculation
curl -X POST http://localhost:8080/api/health-index/calculate \
  -b cookies.txt
```

## Error Scenarios Testing

### Common Error Responses
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate username/email

### Test Error Handling
```bash
# Test duplicate registration
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
# Expected: 409 Conflict (if user already exists)

# Test accessing another user's data
# (This requires creating two users and trying to access data cross-user)
```

## Performance Testing

### Load Testing with cURL
```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl -X GET http://localhost:8080/api/water \
    -b cookies.txt &
done
wait
```

### Pagination Performance
```bash
# Test large page sizes
curl -X GET "http://localhost:8080/api/water?page=0&size=100" \
  -b cookies.txt
```

## Troubleshooting

### Common Issues

1. **Session Cookie Not Working**
   - Ensure cookies are enabled in your client
   - Check that the cookie is being sent with requests
   - Verify session hasn't expired (24 hours)

2. **CORS Issues** (if testing from browser)
   - Use the same origin (localhost:8080)
   - Or configure CORS in the application

3. **Validation Errors**
   - Check the error response details
   - Ensure data types match requirements
   - Verify required fields are provided

### Debug Commands
```bash
# Check application health
curl -X GET http://localhost:8080/actuator/health

# View detailed error responses
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "wrong", "password": "wrong"}' \
  -v  # Verbose output shows headers and status codes
```

## Test Data Cleanup

After testing, you may want to clean up test data:

1. **Delete Test Entries**: Use the DELETE endpoints
2. **Logout**: Always logout to clean up sessions
3. **Database Reset**: Restart the application (if using H2 in-memory for testing)

## Automated Testing

The application includes comprehensive test suites:

```bash
# Run all tests
./mvnw test

# Run integration tests only
./mvnw test -Dtest="*IntegrationTest"

# Run with coverage report
./mvnw test jacoco:report
```

## Security Testing

### Session Security
- Test session timeout (24 hours)
- Test concurrent session limits
- Test session fixation protection

### Input Security
- Test SQL injection attempts
- Test XSS prevention
- Test input validation bypasses

### CSRF Protection
The application includes CSRF protection. When testing with tools other than Swagger UI, you may need to handle CSRF tokens.

## Next Steps

1. **Explore Swagger UI**: Most comprehensive testing interface
2. **Import Postman Collection**: For automated testing workflows  
3. **Review API Documentation**: Complete endpoint reference
4. **Check Application Logs**: For debugging and monitoring

For more detailed API documentation, visit: http://localhost:8080/api-documentation.md