/**
 * Health Tracking API Service
 * Handles CRUD operations for water intake, food intake, and workouts
 */

import { apiClient } from './client';
import { HealthScoreService } from './health-score';
import { 
  ApiResponse, 
  PaginatedResponse,
  PaginationParams
} from '../types/api';
import {
  WaterIntake,
  WaterIntakeRequest,
  FoodIntake,
  FoodIntakeRequest,
  Workout,
  WorkoutRequest,
  DailyHealthIndex
} from '../types/health';

export class HealthService {
  // ==================== Water Intake Methods ====================
  
  /**
   * Create a new water intake entry
   */
  static async createWaterIntake(data: WaterIntakeRequest): Promise<ApiResponse<WaterIntake>> {
    return apiClient.post<WaterIntake>('/api/water', data);
  }

  /**
   * Get paginated water intake entries
   */
  static async getWaterIntakes(params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<WaterIntake>>> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    
    const endpoint = `/api/water${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<PaginatedResponse<WaterIntake>>(endpoint);
  }

  /**
   * Get water intake entry by ID
   */
  static async getWaterIntakeById(id: number): Promise<ApiResponse<WaterIntake>> {
    return apiClient.get<WaterIntake>(`/api/water/${id}`);
  }

  /**
   * Delete water intake entry
   */
  static async deleteWaterIntake(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/water/${id}`);
  }

  // ==================== Food Intake Methods ====================
  
  /**
   * Create a new food intake entry
   */
  static async createFoodIntake(data: FoodIntakeRequest): Promise<ApiResponse<FoodIntake>> {
    return apiClient.post<FoodIntake>('/api/food', data);
  }

  /**
   * Get paginated food intake entries
   */
  static async getFoodIntakes(params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<FoodIntake>>> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    
    const endpoint = `/api/food${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<PaginatedResponse<FoodIntake>>(endpoint);
  }

  /**
   * Get food intake entry by ID
   */
  static async getFoodIntakeById(id: number): Promise<ApiResponse<FoodIntake>> {
    return apiClient.get<FoodIntake>(`/api/food/${id}`);
  }

  /**
   * Update food intake entry
   */
  static async updateFoodIntake(id: number, data: FoodIntakeRequest): Promise<ApiResponse<FoodIntake>> {
    return apiClient.put<FoodIntake>(`/api/food/${id}`, data);
  }

  /**
   * Delete food intake entry
   */
  static async deleteFoodIntake(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/food/${id}`);
  }

  // ==================== Workout Methods ====================
  
  /**
   * Create a new workout entry
   */
  static async createWorkout(data: WorkoutRequest): Promise<ApiResponse<Workout>> {
    return apiClient.post<Workout>('/api/workouts', data);
  }

  /**
   * Get paginated workout entries
   */
  static async getWorkouts(params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<Workout>>> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    
    const endpoint = `/api/workouts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<PaginatedResponse<Workout>>(endpoint);
  }

  /**
   * Get workout entry by ID
   */
  static async getWorkoutById(id: number): Promise<ApiResponse<Workout>> {
    return apiClient.get<Workout>(`/api/workouts/${id}`);
  }

  /**
   * Update workout entry
   */
  static async updateWorkout(id: number, data: WorkoutRequest): Promise<ApiResponse<Workout>> {
    return apiClient.put<Workout>(`/api/workouts/${id}`, data);
  }

  /**
   * Delete workout entry
   */
  static async deleteWorkout(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/workouts/${id}`);
  }

  // ==================== Batch Operations ====================
  
  /**
   * Get all health data for a specific date
   */
  static async getHealthDataByDate(date: string): Promise<ApiResponse<{
    waterIntakes: WaterIntake[];
    foodIntakes: FoodIntake[];
    workouts: Workout[];
  }>> {
    const [waterResponse, foodResponse, workoutResponse] = await Promise.all([
      this.getWaterIntakes({ size: 100 }), // Get more entries for date filtering
      this.getFoodIntakes({ size: 100 }),
      this.getWorkouts({ size: 100 })
    ]);

    // Filter by date (this could be optimized with backend date filtering)
    const targetDate = new Date(date).toDateString();
    
    const waterIntakes = waterResponse.data?.content.filter(
      item => new Date(item.date).toDateString() === targetDate
    ) || [];
    
    const foodIntakes = foodResponse.data?.content.filter(
      item => new Date(item.date).toDateString() === targetDate
    ) || [];
    
    const workouts = workoutResponse.data?.content.filter(
      item => new Date(item.date).toDateString() === targetDate
    ) || [];

    return {
      data: { waterIntakes, foodIntakes, workouts },
      status: 200
    };
  }

  /**
   * Get today's health data
   */
  static async getTodaysHealthData(): Promise<ApiResponse<{
    waterIntakes: WaterIntake[];
    foodIntakes: FoodIntake[];
    workouts: Workout[];
  }>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getHealthDataByDate(today);
  }

  // ==================== Health Score Methods ====================
  
  /**
   * Get current daily health score
   */
  static async getCurrentHealthScore(): Promise<ApiResponse<DailyHealthIndex>> {
    return HealthScoreService.getCurrentHealthScore();
  }

  /**
   * Get health score for a specific date
   */
  static async getHealthScoreByDate(date: string): Promise<ApiResponse<DailyHealthIndex>> {
    return HealthScoreService.getHealthScoreByDate(date);
  }
}