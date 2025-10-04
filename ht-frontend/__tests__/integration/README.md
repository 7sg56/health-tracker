# Backend Integration Tests

This directory contains comprehensive integration tests for the Health Tracker frontend-backend communication.

## Test Files

### 1. `backend-integration.test.tsx`
- **Purpose**: Tests all API endpoints with real backend integration
- **Coverage**: Authentication, CRUD operations, session management, error handling
- **Requirements**: Backend must be running at `http://localhost:8080`

### 2. `cors-configuration.test.tsx`
- **Purpose**: Tests CORS configuration and cross-origin request handling
- **Coverage**: Preflight requests, allowed origins, headers, credentials
- **Requirements**: Backend must be running with CORS enabled

### 3. `session-management.test.tsx`
- **Purpose**: Tests session creation, maintenance, and cleanup
- **Coverage**: Session cookies, CSRF tokens, session expiration
- **Requirements**: Backend must be running with session management enabled

## Running Integration Tests

### Prerequisites
1. **Backend Running**: Start the Spring Boot backend:
   ```bash
   cd ht-backend
   ./mvnw spring-boot:run
   ```

2. **Database**: Ensure MySQL database is running and configured

3. **Environment Variables**: Set up proper environment variables:
   ```bash
   export NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

### Running Tests

#### Option 1: Run All Integration Tests
```bash
npm test -- __tests__/integration/ --verbose
```

#### Option 2: Run Specific Test File
```bash
npm test -- __tests__/integration/backend-integration.test.tsx --verbose
```

#### Option 3: Use the Integration Test Script
```bash
node scripts/test-backend-integration.js
```

### Test Configuration

The tests use the following configuration:
- **Backend URL**: `process.env.NEXT_PUBLIC_API_BASE_URL` or `http://localhost:8080`
- **Timeout**: 10 seconds per test
- **Test User**: Dynamically generated with timestamp to avoid conflicts

## Test Coverage

### Authentication Flow
- ✅ User registration with validation
- ✅ User login with session creation
- ✅ Profile retrieval for authenticated users
- ✅ Logout with session cleanup
- ✅ Error handling for invalid credentials

### CORS Configuration
- ✅ Preflight OPTIONS requests
- ✅ Cross-origin requests with credentials
- ✅ Allowed origins verification
- ✅ HTTP methods and headers validation
- ✅ Credentials support testing

### Session Management
- ✅ Session creation on login
- ✅ Session maintenance across requests
- ✅ CSRF token handling
- ✅ Session refresh functionality
- ✅ Session cleanup on logout

### Health Data APIs
- ✅ Water intake CRUD operations
- ✅ Food intake CRUD operations
- ✅ Workout CRUD operations
- ✅ Health score retrieval
- ✅ Pagination and filtering

### Error Handling
- ✅ Network error handling
- ✅ HTTP error status codes
- ✅ Validation error mapping
- ✅ Authentication error handling

## Troubleshooting

### Common Issues

#### 1. Backend Not Running
**Error**: `Backend may not be running. Some tests may fail.`
**Solution**: Start the backend server:
```bash
cd ht-backend
./mvnw spring-boot:run
```

#### 2. CORS Errors
**Error**: CORS policy blocks requests
**Solution**: Verify CORS configuration in `SecurityConfig.java`:
```java
configuration.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:3000",
    "http://127.0.0.1:3000"
));
```

#### 3. Database Connection Issues
**Error**: Database connection failures
**Solution**: 
1. Ensure MySQL is running
2. Check database configuration in `application.properties`
3. Verify database credentials

#### 4. Session/CSRF Issues
**Error**: CSRF token validation failures
**Solution**: 
1. Check CSRF configuration in `SecurityConfig.java`
2. Verify cookie settings
3. Ensure credentials are included in requests

### Test Environment Setup

For consistent test results, ensure:

1. **Clean Database State**: Tests create unique users but may leave data
2. **Port Availability**: Backend runs on port 8080, frontend on 3000
3. **Network Access**: No firewall blocking localhost connections
4. **Browser Cookies**: Tests may set cookies that persist

### Debugging Tests

To debug failing tests:

1. **Enable Verbose Logging**:
   ```bash
   npm test -- __tests__/integration/ --verbose --no-coverage
   ```

2. **Check Network Tab**: Use browser dev tools to inspect requests

3. **Backend Logs**: Check Spring Boot console output for errors

4. **Database State**: Verify data is being created/modified correctly

## Test Data Management

### User Creation
- Tests create unique users with timestamp-based usernames
- Format: `testuser_${Date.now()}`
- Email: `test_${Date.now()}@example.com`

### Data Cleanup
- Tests attempt to clean up created data
- Some data may persist if tests fail
- Consider periodic database cleanup for test environments

### Test Isolation
- Each test suite uses unique user accounts
- Tests are designed to be independent
- Parallel execution should be safe

## Performance Considerations

### Test Execution Time
- Full integration test suite: ~30-60 seconds
- Individual test files: ~10-20 seconds
- Network latency affects timing

### Resource Usage
- Tests create real database entries
- Network requests to actual backend
- Consider test database size over time

## Continuous Integration

For CI/CD pipelines:

1. **Docker Compose**: Use docker-compose for backend + database
2. **Wait Scripts**: Ensure backend is ready before running tests
3. **Environment Variables**: Set proper API URLs for CI environment
4. **Test Reports**: Generate JUnit XML for CI integration

Example CI script:
```bash
#!/bin/bash
# Start backend services
docker-compose up -d backend database

# Wait for backend to be ready
./scripts/wait-for-backend.sh

# Run integration tests
npm run test:integration

# Cleanup
docker-compose down
```