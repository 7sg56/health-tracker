/**
 * Backend Integration Tests
 * Tests real API endpoints, session management, authentication flows, and CORS configuration
 */

import { apiClient } from '@/lib/api/client';
import { AuthService } from '@/lib/api/auth';
import { HealthService } from '@/lib/api/health';
import { 
  LoginRequest, 
  RegisterRequest, 
  WaterIntakeRequest, 
  FoodIntakeRequest, 
  WorkoutRequest 
} from '@/lib/types';

// Test configuration
const TEST_CONFIG = {
  backendUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000, // 10 seconds timeout for integration tests
};

// Test user data
const TEST_USER = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

describe('Backend Integration Tests', () => {
  const authToken: string | null = null;
  let userId: number | null = null;

  beforeAll(async () => {
    // Ensure backend is running
    try {
      const response = await fetch(`${TEST_CONFIG.backendUrl}/api/health`);
      if (!response.ok) {
        throw new Error('Backend health check failed');
      }
    } catch (error) {
      console.warn('Backend may not be running. Some tests may fail.');
    }
  }, TEST_CONFIG.timeout);

  afterAll(async () => {
    // Cleanup: logout if authenticated
    if (authToken) {
      try {
        await AuthService.logout();
      } catch (error) {
        console.warn('Cleanup logout failed:', error);
      }
    }
  });

  describe('CORS Configuration', () => {
    it('should handle preflight OPTIONS requests correctly', async () => {
      const response = await fetch(`${TEST_CONFIG.backendUrl}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });

    it('should allow cross-origin requests with credentials', async () => {
      const response = await fetch(`${TEST_CONFIG.backendUrl}/api/health`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Origin': 'http://localhost:3000',
        },
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });
  });

  describe('Authentication Flow', () => {
    it('should register a new user successfully', async () => {
      const registerData: RegisterRequest = {
        username: TEST_USER.username,
        email: TEST_USER.email,
        password: TEST_USER.password,
      };

      const result = await AuthService.register(registerData);

      expect(result.status).toBe(201);
      expect(result.data).toBeDefined();
      expect(result.data?.username).toBe(TEST_USER.username);
      expect(result.data?.email).toBe(TEST_USER.email);
      expect(result.data?.id).toBeDefined();
      
      userId = result.data?.id || null;
    });

    it('should reject duplicate user registration', async () => {
      const registerData: RegisterRequest = {
        username: TEST_USER.username,
        email: TEST_USER.email,
        password: TEST_USER.password,
      };

      const result = await AuthService.register(registerData);

      expect(result.status).toBe(409); // Conflict
      expect(result.error).toBeDefined();
    });

    it('should login with valid credentials', async () => {
      const loginData: LoginRequest = {
        username: TEST_USER.username,
        password: TEST_USER.password,
      };

      const result = await AuthService.login(loginData);

      expect(result.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data?.username).toBe(TEST_USER.username);
      expect(result.data?.id).toBe(userId);
    });

    it('should reject login with invalid credentials', async () => {
      const loginData: LoginRequest = {
        username: TEST_USER.username,
        password: 'wrongpassword',
      };

      const result = await AuthService.login(loginData);

      expect(result.status).toBe(401);
      expect(result.error).toBeDefined();
    });

    it('should get user profile when authenticated', async () => {
      const result = await AuthService.getProfile();

      expect(result.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data?.username).toBe(TEST_USER.username);
      expect(result.data?.id).toBe(userId);
    });
  });

  describe('Session Management', () => {
    it('should maintain session across requests', async () => {
      // Make multiple requests and verify session is maintained
      const requests = [
        AuthService.getProfile(),
        HealthService.getCurrentHealthScore(),
        HealthService.getWaterIntakes({ page: 0, size: 10 }),
      ];

      const results = await Promise.all(requests);

      // All requests should succeed (not return 401)
      results.forEach(result => {
        expect(result.status).not.toBe(401);
      });
    });

    it('should handle CSRF token correctly', async () => {
      // Create a water intake entry (POST request that requires CSRF token)
      const waterData: WaterIntakeRequest = {
        amountLtr: 0.5,
      };

      const result = await HealthService.createWaterIntake(waterData);

      expect(result.status).toBe(201);
      expect(result.data).toBeDefined();
      expect(result.data?.amountLtr).toBe(0.5);
    });

    it('should refresh session info correctly', async () => {
      const sessionValid = await apiClient.refreshSession();
      expect(sessionValid).toBe(true);

      const sessionInfo = apiClient.getSessionInfo();
      expect(sessionInfo?.isValid).toBe(true);
    });
  });

  describe('Health Data API Integration', () => {
    let waterIntakeId: number;
    let foodIntakeId: number;
    let workoutId: number;

    describe('Water Intake API', () => {
      it('should create water intake entry', async () => {
        const waterData: WaterIntakeRequest = {
          amountLtr: 1.5,
        };

        const result = await HealthService.createWaterIntake(waterData);

        expect(result.status).toBe(201);
        expect(result.data).toBeDefined();
        expect(result.data?.amountLtr).toBe(1.5);
        expect(result.data?.id).toBeDefined();
        
        waterIntakeId = result.data?.id!;
      });

      it('should get water intake entries with pagination', async () => {
        const result = await HealthService.getWaterIntakes({ page: 0, size: 10 });

        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(result.data?.content).toBeInstanceOf(Array);
        expect(result.data?.page).toBeDefined();
        expect(result.data?.content.length).toBeGreaterThan(0);
      });

      it('should delete water intake entry', async () => {
        const result = await HealthService.deleteWaterIntake(waterIntakeId);

        expect(result.status).toBe(204);
      });
    });

    describe('Food Intake API', () => {
      it('should create food intake entry', async () => {
        const foodData: FoodIntakeRequest = {
          foodItem: 'Apple',
          calories: 95,
        };

        const result = await HealthService.createFoodIntake(foodData);

        expect(result.status).toBe(201);
        expect(result.data).toBeDefined();
        expect(result.data?.foodItem).toBe('Apple');
        expect(result.data?.calories).toBe(95);
        expect(result.data?.id).toBeDefined();
        
        foodIntakeId = result.data?.id!;
      });

      it('should update food intake entry', async () => {
        const updatedData: FoodIntakeRequest = {
          foodItem: 'Large Apple',
          calories: 120,
        };

        const result = await HealthService.updateFoodIntake(foodIntakeId, updatedData);

        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(result.data?.foodItem).toBe('Large Apple');
        expect(result.data?.calories).toBe(120);
      });

      it('should get food intake entries with pagination', async () => {
        const result = await HealthService.getFoodIntakes({ page: 0, size: 10 });

        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(result.data?.content).toBeInstanceOf(Array);
        expect(result.data?.content.length).toBeGreaterThan(0);
      });

      it('should delete food intake entry', async () => {
        const result = await HealthService.deleteFoodIntake(foodIntakeId);

        expect(result.status).toBe(204);
      });
    });

    describe('Workout API', () => {
      it('should create workout entry', async () => {
        const workoutData: WorkoutRequest = {
          activity: 'Running',
          durationMin: 30,
          caloriesBurned: 300,
        };

        const result = await HealthService.createWorkout(workoutData);

        expect(result.status).toBe(201);
        expect(result.data).toBeDefined();
        expect(result.data?.activity).toBe('Running');
        expect(result.data?.durationMin).toBe(30);
        expect(result.data?.caloriesBurned).toBe(300);
        expect(result.data?.id).toBeDefined();
        
        workoutId = result.data?.id!;
      });

      it('should update workout entry', async () => {
        const updatedData: WorkoutRequest = {
          activity: 'Jogging',
          durationMin: 45,
          caloriesBurned: 400,
        };

        const result = await HealthService.updateWorkout(workoutId, updatedData);

        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(result.data?.activity).toBe('Jogging');
        expect(result.data?.durationMin).toBe(45);
        expect(result.data?.caloriesBurned).toBe(400);
      });

      it('should get workout entries with pagination', async () => {
        const result = await HealthService.getWorkouts({ page: 0, size: 10 });

        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(result.data?.content).toBeInstanceOf(Array);
        expect(result.data?.content.length).toBeGreaterThan(0);
      });

      it('should delete workout entry', async () => {
        const result = await HealthService.deleteWorkout(workoutId);

        expect(result.status).toBe(204);
      });
    });

    describe('Health Score API', () => {
      it('should get current health score', async () => {
        const result = await HealthService.getCurrentHealthScore();

        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(typeof result.data?.healthScore).toBe('number');
        expect(result.data?.date).toBeDefined();
      });

      it('should get health score by date', async () => {
        const today = new Date().toISOString().split('T')[0];
        const result = await HealthService.getHealthScoreByDate(today);

        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(result.data?.date).toBe(today);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Temporarily change API base URL to simulate network error
      const originalBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      process.env.NEXT_PUBLIC_API_BASE_URL = 'http://nonexistent-server:9999';

      const result = await AuthService.getProfile();

      expect(result.status).toBe(0); // Network error status
      expect(result.error).toBeDefined();

      // Restore original URL
      process.env.NEXT_PUBLIC_API_BASE_URL = originalBaseURL;
    });

    it('should handle 404 errors correctly', async () => {
      const result = await apiClient.get('/api/nonexistent-endpoint');

      expect(result.status).toBe(404);
      expect(result.error).toBeDefined();
    });

    it('should handle validation errors correctly', async () => {
      const invalidData: WaterIntakeRequest = {
        amountLtr: -1, // Invalid amount
      };

      const result = await HealthService.createWaterIntake(invalidData);

      expect(result.status).toBe(400);
      expect(result.error).toBeDefined();
    });
  });

  describe('Authentication State Management', () => {
    it('should logout successfully', async () => {
      const result = await AuthService.logout();

      expect(result.status).toBe(200);
    });

    it('should return 401 for protected endpoints after logout', async () => {
      const result = await AuthService.getProfile();

      expect(result.status).toBe(401);
      expect(result.error).toBeDefined();
    });

    it('should clear session info after logout', async () => {
      const sessionInfo = apiClient.getSessionInfo();
      expect(sessionInfo?.isValid).toBeFalsy();
    });
  });
});