/**
 * API Services Index
 * Re-exports all API service classes and the API client
 */

export { apiClient, ApiClient } from './client';
export { AuthService } from './auth';
export { HealthService } from './health';
export { HealthScoreService } from './health-score';

// Re-export types for convenience
export type { RequestInterceptor, ResponseInterceptor } from './client';