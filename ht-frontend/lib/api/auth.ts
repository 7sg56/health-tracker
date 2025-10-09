/**
 * Authentication API Service
 * Handles user registration, login, logout, and profile management
 */

import { apiClient } from './client';
import { ApiResponse, User, LoginRequest, RegisterRequest } from '../types';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/api/auth/register', data);
  }

  /**
   * Login user with credentials
   */
  static async login(data: LoginRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/api/auth/login', data);
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<ApiResponse<void>> {
    const result = await apiClient.post<void>('/api/auth/logout');

    // Clear session info on successful logout
    if (result.status === 200) {
      apiClient.clearSession();
    }

    return result;
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/api/auth/profile');
  }

  /**
   * Check if user session is valid
   */
  static async checkSession(): Promise<
    ApiResponse<{ valid: boolean; user?: User }>
  > {
    return apiClient.get<{ valid: boolean; user?: User }>('/api/auth/session');
  }

  /**
   * Refresh authentication session
   */
  static async refreshSession(): Promise<boolean> {
    return apiClient.refreshSession();
  }
}
