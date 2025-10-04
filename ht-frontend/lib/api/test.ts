/**
 * Test service for verifying API connectivity
 */

import { apiClient } from './client';
import { AuthService } from './auth';
import { HealthService } from './health';
import { HealthScoreService } from './health-score';
import { ApiResponse } from '../types';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  service: string;
}

interface TestResults {
  connectivity: boolean;
  cors: boolean;
  session: boolean;
  auth: boolean;
  health: boolean;
  healthScore: boolean;
  errors: string[];
}

export class TestService {
  /**
   * Test basic API connectivity
   * This will attempt to connect to a simple endpoint to verify CORS and basic communication
   */
  static async testConnectivity(): Promise<ApiResponse<HealthCheckResponse>> {
    try {
      // Try to hit the health check endpoint
      const response = await apiClient.get<HealthCheckResponse>('/api/health');
      return response;
    } catch (error) {
      console.error('Connectivity test failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Connectivity test failed',
        status: 0,
      };
    }
  }

  /**
   * Test CORS configuration by making a preflight request
   */
  static async testCORS(): Promise<boolean> {
    try {
      // Make an OPTIONS request to test CORS preflight
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('CORS test failed:', error);
      return false;
    }
  }

  /**
   * Test session management by checking session status
   */
  static async testSession(): Promise<boolean> {
    try {
      // Check if session management works
      const sessionValid = await AuthService.refreshSession();
      return sessionValid !== undefined; // Even false is a valid response
    } catch (error) {
      console.error('Session test failed:', error);
      return false;
    }
  }

  /**
   * Test authentication endpoints
   */
  static async testAuth(): Promise<boolean> {
    try {
      // Test session check endpoint (should work even without authentication)
      const response = await AuthService.checkSession();
      return response.status !== 0; // Any response means the endpoint is reachable
    } catch (error) {
      console.error('Auth test failed:', error);
      return false;
    }
  }

  /**
   * Test health tracking endpoints
   */
  static async testHealth(): Promise<boolean> {
    try {
      // Test getting health data (might fail with 401 but endpoint should be reachable)
      const response = await HealthService.getWaterIntakes({ page: 0, size: 1 });
      return response.status !== 0; // Any response means the endpoint is reachable
    } catch (error) {
      console.error('Health test failed:', error);
      return false;
    }
  }

  /**
   * Test health score endpoints
   */
  static async testHealthScore(): Promise<boolean> {
    try {
      // Test getting current health score (might fail with 401 but endpoint should be reachable)
      const response = await HealthScoreService.getCurrentHealthScore();
      return response.status !== 0; // Any response means the endpoint is reachable
    } catch (error) {
      console.error('Health score test failed:', error);
      return false;
    }
  }

  /**
   * Run comprehensive API tests
   */
  static async runAllTests(): Promise<TestResults> {
    const results: TestResults = {
      connectivity: false,
      cors: false,
      session: false,
      auth: false,
      health: false,
      healthScore: false,
      errors: []
    };

    try {
      // Test connectivity
      const connectivityResult = await this.testConnectivity();
      results.connectivity = connectivityResult.status !== 0;
      if (!results.connectivity) {
        results.errors.push(`Connectivity: ${connectivityResult.error || 'Failed'}`);
      }

      // Test CORS
      results.cors = await this.testCORS();
      if (!results.cors) {
        results.errors.push('CORS: Preflight request failed');
      }

      // Test session management
      results.session = await this.testSession();
      if (!results.session) {
        results.errors.push('Session: Session management test failed');
      }

      // Test auth endpoints
      results.auth = await this.testAuth();
      if (!results.auth) {
        results.errors.push('Auth: Authentication endpoints unreachable');
      }

      // Test health endpoints
      results.health = await this.testHealth();
      if (!results.health) {
        results.errors.push('Health: Health tracking endpoints unreachable');
      }

      // Test health score endpoints
      results.healthScore = await this.testHealthScore();
      if (!results.healthScore) {
        results.errors.push('Health Score: Health score endpoints unreachable');
      }

    } catch (error) {
      results.errors.push(`Test suite error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  /**
   * Get API configuration info
   */
  static getApiConfig(): {
    baseUrl: string;
    environment: string;
    sessionInfo: any;
  } {
    return {
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
      environment: process.env.NODE_ENV || 'development',
      sessionInfo: apiClient.getSessionInfo()
    };
  }
}