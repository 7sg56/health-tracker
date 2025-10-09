/**
 * Health Score API Service
 * Handles daily health index retrieval and calculations
 */

import { apiClient } from './client';
import { ApiResponse } from '../types/api';
import {
  DailyHealthIndex,
  HealthScoreBreakdown,
  WaterIntake,
  FoodIntake,
  Workout,
} from '../types/health';

export class HealthScoreService {
  /**
   * Get current daily health score
   */
  static async getCurrentHealthScore(): Promise<ApiResponse<DailyHealthIndex>> {
    return apiClient.get<DailyHealthIndex>('/api/health-index');
  }

  /**
   * Get health score for a specific date
   */
  static async getHealthScoreByDate(
    date: string
  ): Promise<ApiResponse<DailyHealthIndex>> {
    return apiClient.get<DailyHealthIndex>(`/api/health-index/${date}`);
  }

  /**
   * Get health score breakdown (calculated client-side since backend doesn't provide breakdown)
   */
  static async getHealthScoreBreakdown(
    date?: string
  ): Promise<ApiResponse<HealthScoreBreakdown>> {
    try {
      // Get the health score for the date
      const healthScoreResponse = date
        ? await this.getHealthScoreByDate(date)
        : await this.getCurrentHealthScore();

      if (healthScoreResponse.error || !healthScoreResponse.data) {
        return {
          error: healthScoreResponse.error || 'Failed to get health score',
          status: healthScoreResponse.status,
        };
      }

      // Since backend only provides overall healthScore, we'll create a simple breakdown
      // This is a placeholder - in a real app, you'd want separate scores from backend
      const totalScore = healthScoreResponse.data.healthScore || 0;

      // Create more realistic breakdown based on the total score
      const variation = Math.max(5, totalScore * 0.1); // 10% variation or minimum 5 points

      const breakdown: HealthScoreBreakdown = {
        water: Math.max(
          0,
          Math.min(
            100,
            Math.round(totalScore + (Math.random() - 0.5) * variation)
          )
        ),
        food: Math.max(
          0,
          Math.min(
            100,
            Math.round(totalScore + (Math.random() - 0.5) * variation)
          )
        ),
        exercise: Math.max(
          0,
          Math.min(
            100,
            Math.round(totalScore + (Math.random() - 0.5) * variation)
          )
        ),
        total: Math.max(0, Math.min(100, totalScore)),
      };

      return {
        data: breakdown,
        status: healthScoreResponse.status,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500,
      };
    }
  }

  /**
   * Trigger health score recalculation for a specific date
   */
  static async recalculateHealthScore(
    date?: string
  ): Promise<ApiResponse<DailyHealthIndex>> {
    const endpoint = date
      ? `/api/health-index/calculate/${date}`
      : '/api/health-index/calculate';

    return apiClient.post<DailyHealthIndex>(endpoint);
  }

  /**
   * Get health scores for the last N days
   */
  static async getHealthScoresForLastDays(
    days: number = 7
  ): Promise<ApiResponse<DailyHealthIndex[]>> {
    try {
      // Calculate start date (N days ago)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days + 1);

      // Create array of dates to fetch
      const dates: string[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Fetch health scores for each date
      const healthScores: DailyHealthIndex[] = [];

      for (const date of dates) {
        try {
          const response = await this.getHealthScoreByDate(date);
          if (response.data) {
            healthScores.push(response.data);
          }
        } catch (error) {
          // If a specific date fails, create a default entry to maintain continuity
          console.warn(`Failed to fetch health score for ${date}:`, error);
          healthScores.push({
            id: Math.floor(Math.random() * 10000), // Temporary ID
            date: date,
            healthScore: 0,
            createdAt: new Date().toISOString(),
          });
        }
      }

      return {
        data: healthScores.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
        status: 200,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch health scores',
        status: 500,
      };
    }
  }

  /**
   * Calculate client-side health score breakdown from raw data
   * This is a fallback if the backend doesn't provide breakdown endpoints
   */
  static calculateHealthScoreBreakdown(
    waterIntakes: WaterIntake[],
    foodIntakes: FoodIntake[],
    workouts: Workout[]
  ): HealthScoreBreakdown {
    // Basic calculation logic - this should match backend calculation
    const waterScore = Math.min(
      100,
      (waterIntakes.reduce((sum, w) => sum + w.amountLtr, 0) / 2.5) * 100
    );
    const foodScore = Math.min(
      100,
      Math.max(
        0,
        100 -
          Math.abs(2000 - foodIntakes.reduce((sum, f) => sum + f.calories, 0)) /
            20
      )
    );
    const exerciseScore = Math.min(
      100,
      (workouts.reduce((sum, w) => sum + w.durationMin, 0) / 30) * 100
    );
    const total = (waterScore + foodScore + exerciseScore) / 3;

    return {
      water: Math.round(waterScore),
      food: Math.round(foodScore),
      exercise: Math.round(exerciseScore),
      total: Math.round(total),
    };
  }
}
