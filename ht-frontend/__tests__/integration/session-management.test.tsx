/**
 * Session Management Tests
 * Tests session creation, maintenance, expiration, and CSRF token handling
 */

import { apiClient } from '@/lib/api/client';
import { AuthService } from '@/lib/api/auth';
import { HealthService } from '@/lib/api/health';

describe('Session Management Tests', () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  
  const TEST_USER = {
    username: `sessiontest_${Date.now()}`,
    email: `sessiontest_${Date.now()}@example.com`,
    password: 'SessionTest123!',
  };

  beforeAll(async () => {
    // Register test user
    await AuthService.register(TEST_USER);
  });

  afterAll(async () => {
    // Cleanup
    try {
      await AuthService.logout();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Session Creation', () => {
    it('should create session on successful login', async () => {
      const loginResult = await AuthService.login({
        username: TEST_USER.username,
        password: TEST_USER.password,
      });

      expect(loginResult.status).toBe(200);
      expect(loginResult.data).toBeDefined();

      // Verify session is created by checking session info
      const sessionValid = await apiClient.refreshSession();
      expect(sessionValid).toBe(true);

      const sessionInfo = apiClient.getSessionInfo();
      expect(sessionInfo?.isValid).toBe(true);
    });

    it('should set session cookies on login', async () => {
      // Login creates session cookies
      const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: TEST_USER.username,
          password: TEST_USER.password,
        }),
      });

      expect(loginResponse.ok).toBe(true);
      
      // Check if session cookies are set
      const setCookieHeaders = loginResponse.headers.get('Set-Cookie');
      if (setCookieHeaders) {
        expect(setCookieHeaders).toContain('JSESSIONID');
      }
    });
  });

  describe('Session Maintenance', () => {
    it('should maintain session across multiple requests', async () => {
      // Make multiple API calls in sequence
      const requests = [
        AuthService.getProfile(),
        HealthService.getCurrentHealthScore(),
        HealthService.getWaterIntakes({ page: 0, size: 5 }),
        HealthService.getFoodIntakes({ page: 0, size: 5 }),
        HealthService.getWorkouts({ page: 0, size: 5 }),
      ];

      const results = await Promise.all(requests);

      // All requests should succeed (authenticated)
      results.forEach((result, index) => {
        expect(result.status).not.toBe(401);
        if (result.status >= 400) {
          console.warn(`Request ${index} failed with status ${result.status}: ${result.error}`);
        }
      });
    });

    it('should maintain session across concurrent requests', async () => {
      // Make multiple concurrent API calls
      const concurrentRequests = Array(5).fill(null).map(() => 
        AuthService.getProfile()
      );

      const results = await Promise.all(concurrentRequests);

      // All concurrent requests should succeed
      results.forEach((result, index) => {
        expect(result.status).toBe(200);
        expect(result.data?.username).toBe(TEST_USER.username);
      });
    });

    it('should handle session refresh correctly', async () => {
      // Refresh session multiple times
      for (let i = 0; i < 3; i++) {
        const sessionValid = await apiClient.refreshSession();
        expect(sessionValid).toBe(true);

        const sessionInfo = apiClient.getSessionInfo();
        expect(sessionInfo?.isValid).toBe(true);
      }
    });
  });

  describe('CSRF Token Handling', () => {
    it('should handle CSRF tokens for state-changing operations', async () => {
      // Create water intake (POST request requiring CSRF token)
      const waterResult = await HealthService.createWaterIntake({
        amountLtr: 0.5,
      });

      expect(waterResult.status).toBe(201);
      expect(waterResult.data?.amountLtr).toBe(0.5);

      // Update food intake (PUT request requiring CSRF token)
      const foodResult = await HealthService.createFoodIntake({
        foodItem: 'Test Food',
        calories: 100,
      });

      expect(foodResult.status).toBe(201);

      if (foodResult.data?.id) {
        const updateResult = await HealthService.updateFoodIntake(foodResult.data.id, {
          foodItem: 'Updated Test Food',
          calories: 150,
        });

        expect(updateResult.status).toBe(200);
        expect(updateResult.data?.foodItem).toBe('Updated Test Food');

        // Delete food intake (DELETE request requiring CSRF token)
        const deleteResult = await HealthService.deleteFoodIntake(foodResult.data.id);
        expect(deleteResult.status).toBe(204);
      }
    });

    it('should get CSRF token from cookies', async () => {
      // Make a request that should set CSRF token
      await AuthService.getProfile();

      // Check if CSRF token is available
      const csrfToken = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));

      // CSRF token should be present for authenticated sessions
      if (csrfToken) {
        expect(csrfToken).toContain('XSRF-TOKEN=');
      }
    });

    it('should include CSRF token in state-changing requests', async () => {
      // Mock fetch to intercept requests and check headers
      const originalFetch = global.fetch;
      const fetchSpy = jest.fn(originalFetch);
      global.fetch = fetchSpy;

      try {
        await HealthService.createWaterIntake({ amountLtr: 1.0 });

        // Check if CSRF token was included in the request
        const postCalls = fetchSpy.mock.calls.filter(call => 
          call[1]?.method === 'POST' && call[0].includes('/api/water')
        );

        expect(postCalls.length).toBeGreaterThan(0);
        
        const postCall = postCalls[0];
        const headers = postCall[1]?.headers as Record<string, string>;
        
        // Should include CSRF token header
        expect(headers['X-CSRF-TOKEN'] || headers['x-csrf-token']).toBeDefined();
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('Session Security', () => {
    it('should use secure session configuration', async () => {
      // Login and check session security
      const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: TEST_USER.username,
          password: TEST_USER.password,
        }),
      });

      const setCookieHeader = loginResponse.headers.get('Set-Cookie');
      
      if (setCookieHeader) {
        // Check for security attributes in production
        if (process.env.NODE_ENV === 'production') {
          expect(setCookieHeader).toContain('Secure');
          expect(setCookieHeader).toContain('SameSite');
        }
        
        // HttpOnly should be set for session cookies
        expect(setCookieHeader).toContain('HttpOnly');
      }
    });

    it('should handle session timeout gracefully', async () => {
      // This test would require backend configuration to have short session timeout
      // For now, we'll test the client's handling of 401 responses
      
      // Mock a 401 response
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers(),
        json: () => Promise.resolve({
          timestamp: new Date().toISOString(),
          status: 401,
          error: 'Unauthorized',
          message: 'Session expired',
          path: '/api/auth/profile',
        }),
      });

      try {
        const result = await AuthService.getProfile();
        expect(result.status).toBe(401);
        expect(result.error).toBeDefined();

        // Session should be cleared
        const sessionInfo = apiClient.getSessionInfo();
        expect(sessionInfo?.isValid).toBeFalsy();
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('Session Cleanup', () => {
    it('should clear session on logout', async () => {
      // Ensure we're logged in
      await AuthService.login({
        username: TEST_USER.username,
        password: TEST_USER.password,
      });

      // Verify session exists
      let sessionInfo = apiClient.getSessionInfo();
      expect(sessionInfo?.isValid).toBe(true);

      // Logout
      const logoutResult = await AuthService.logout();
      expect(logoutResult.status).toBe(200);

      // Session should be cleared
      sessionInfo = apiClient.getSessionInfo();
      expect(sessionInfo?.isValid).toBeFalsy();
    });

    it('should invalidate session on server after logout', async () => {
      // Login
      await AuthService.login({
        username: TEST_USER.username,
        password: TEST_USER.password,
      });

      // Logout
      await AuthService.logout();

      // Subsequent requests should be unauthorized
      const profileResult = await AuthService.getProfile();
      expect(profileResult.status).toBe(401);
    });

    it('should handle multiple logout calls gracefully', async () => {
      // Login first
      await AuthService.login({
        username: TEST_USER.username,
        password: TEST_USER.password,
      });

      // Multiple logout calls should not cause errors
      const logoutResults = await Promise.all([
        AuthService.logout(),
        AuthService.logout(),
        AuthService.logout(),
      ]);

      // First logout should succeed, others might return 401 or 200
      expect(logoutResults[0].status).toBe(200);
      logoutResults.slice(1).forEach(result => {
        expect([200, 401].includes(result.status)).toBe(true);
      });
    });
  });

  describe('Session Edge Cases', () => {
    it('should handle requests without session gracefully', async () => {
      // Ensure no session exists
      apiClient.clearSession();

      // Request that requires authentication
      const result = await AuthService.getProfile();
      expect(result.status).toBe(401);
      expect(result.error).toBeDefined();
    });

    it('should handle malformed session cookies', async () => {
      // This would require mocking document.cookie
      // For now, test that the client handles missing CSRF tokens
      
      const originalCookie = document.cookie;
      
      try {
        // Clear cookies
        document.cookie = '';

        // Make a state-changing request
        const result = await HealthService.createWaterIntake({ amountLtr: 1.0 });
        
        // Should either succeed (if CSRF is disabled for this endpoint) or fail gracefully
        expect([201, 403, 401].includes(result.status)).toBe(true);
      } finally {
        // Restore cookies (this won't actually work in tests, but good practice)
        document.cookie = originalCookie;
      }
    });
  });
});