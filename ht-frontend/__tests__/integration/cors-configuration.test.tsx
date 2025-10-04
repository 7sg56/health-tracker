/**
 * CORS Configuration Tests
 * Tests cross-origin request handling and CORS configuration
 */

describe('CORS Configuration Tests', () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const FRONTEND_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://test.vercel.app',
  ];

  describe('Preflight Requests', () => {
    it.each(FRONTEND_ORIGINS)('should handle preflight OPTIONS requests from %s', async (origin) => {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, X-CSRF-TOKEN',
        },
      });

      expect(response.status).toBe(200);
      
      const corsHeaders = {
        allowOrigin: response.headers.get('Access-Control-Allow-Origin'),
        allowMethods: response.headers.get('Access-Control-Allow-Methods'),
        allowHeaders: response.headers.get('Access-Control-Allow-Headers'),
        allowCredentials: response.headers.get('Access-Control-Allow-Credentials'),
        maxAge: response.headers.get('Access-Control-Max-Age'),
      };

      // Verify CORS headers are present and correct
      expect(corsHeaders.allowOrigin).toBeTruthy();
      expect(corsHeaders.allowMethods).toContain('POST');
      expect(corsHeaders.allowHeaders).toBeTruthy();
      expect(corsHeaders.allowCredentials).toBe('true');
      expect(corsHeaders.maxAge).toBeTruthy();
    });

    it('should reject preflight requests from unauthorized origins', async () => {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      // Should either return 403 or not include CORS headers
      const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
      expect(allowOrigin).not.toBe('https://malicious-site.com');
    });
  });

  describe('Actual Requests', () => {
    it.each(FRONTEND_ORIGINS)('should allow actual requests from %s', async (origin) => {
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Origin': origin,
        },
        credentials: 'include',
      });

      const corsHeaders = {
        allowOrigin: response.headers.get('Access-Control-Allow-Origin'),
        allowCredentials: response.headers.get('Access-Control-Allow-Credentials'),
      };

      expect(corsHeaders.allowOrigin).toBeTruthy();
      expect(corsHeaders.allowCredentials).toBe('true');
    });

    it('should handle POST requests with credentials', async () => {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Origin': 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const corsHeaders = {
        allowOrigin: response.headers.get('Access-Control-Allow-Origin'),
        allowCredentials: response.headers.get('Access-Control-Allow-Credentials'),
      };

      expect(corsHeaders.allowOrigin).toBeTruthy();
      expect(corsHeaders.allowCredentials).toBe('true');
    });
  });

  describe('HTTP Methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

    it.each(methods)('should allow %s method in preflight response', async (method) => {
      const response = await fetch(`${BACKEND_URL}/api/water`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': method,
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      const allowedMethods = response.headers.get('Access-Control-Allow-Methods');
      expect(allowedMethods).toContain(method);
    });
  });

  describe('Headers', () => {
    const requiredHeaders = [
      'Content-Type',
      'X-CSRF-TOKEN',
      'Authorization',
      'Accept',
    ];

    it.each(requiredHeaders)('should allow %s header in preflight response', async (header) => {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': header,
        },
      });

      const allowedHeaders = response.headers.get('Access-Control-Allow-Headers');
      expect(allowedHeaders).toBeTruthy();
      // Most CORS configs allow all headers with '*' or specific header should be included
      expect(allowedHeaders === '*' || allowedHeaders?.includes(header)).toBe(true);
    });
  });

  describe('Exposed Headers', () => {
    it('should expose necessary headers for frontend consumption', async () => {
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:3000',
        },
        credentials: 'include',
      });

      const exposedHeaders = response.headers.get('Access-Control-Expose-Headers');
      
      if (exposedHeaders) {
        // Check if important headers are exposed
        const expectedExposedHeaders = ['X-CSRF-TOKEN', 'Authorization', 'Content-Type'];
        expectedExposedHeaders.forEach(header => {
          expect(exposedHeaders.includes(header)).toBe(true);
        });
      }
    });
  });

  describe('Credentials Support', () => {
    it('should support credentials in cross-origin requests', async () => {
      // First, make a request to establish a session
      const loginResponse = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Origin': 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: `testuser_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: 'TestPassword123!',
        }),
      });

      // Check if cookies are set (session cookies)
      const setCookieHeader = loginResponse.headers.get('Set-Cookie');
      
      // Make a subsequent request that should include the session cookie
      const profileResponse = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:3000',
        },
        credentials: 'include',
      });

      expect(profileResponse.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle CORS errors gracefully', async () => {
      // Test request without Origin header (should still work for same-origin)
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
      });

      expect(response.ok).toBe(true);
    });

    it('should handle complex preflight scenarios', async () => {
      const response = await fetch(`${BACKEND_URL}/api/food`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'PUT',
          'Access-Control-Request-Headers': 'Content-Type, X-CSRF-TOKEN, Authorization',
        },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('PUT');
    });
  });
});