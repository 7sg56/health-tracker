/**
 * Health Score API Service
 * Handles daily health index retrieval and calculations
 */

import { apiClient } from './client';
import { 
  ApiResponse
} from '../types/api';
import {
  DailyHealthIndex,
  HealthScoreBreakdown,
  DateRange
} from '../types/health';

export class HealthScoreService {
  /**
   * Get current daily health score
   */
  static async getCurrentHealthScore(): Promise<ApiResponse<DailyHealthIndex>> {
    return apiClient.get<DailyHealthIndex>('/api/health-index/current');
  }

  /**
   * Get health score for a specific date
   */
  static async getHealthScoreByDate(date: string): Promise<ApiResponse<DailyHealthIndex>> {
    return apiClient.get<DailyHealthIndex>(`/api/health-index/date/${date}`);
  }

  /**
   * Get health scores for a date range
   */
  static async getHealthScoresByDateRange(dateRange: DateRange): Promise<ApiResponse<DailyHealthIndex[]>> {
    const queryParams = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
    
    return apiClient.get<DailyHealthIndex[]>(`/api/health-index/range?${queryParams.toString()}`);
  }

  /**
   * Get health scores for the last N days
   */
  static async getHealthScoresForLastDays(days: number): Promise<ApiResponse<DailyHealthIndex[]>> {
    return apiClient.get<DailyHealthIndex[]>(`/api/health-index/last-days/${days}`);
  }

  /**
   * Get health score breakdown (if backend supports it)
   * This might need to be calculated on the frontend if backend doesn't provide breakdown
   */
  static async getHealthScoreBreakdown(date?: string): Promise<ApiResponse<HealthScoreBreakdown>> {
    const endpoint = date 
      ? `/api/health-index/breakdown/${date}`
      : '/api/health-index/breakdown/current';
    
    return apiClient.get<HealthScoreBreakdown>(endpoint);
  }

  /**
   * Trigger health score recalculation for a specific date
   */
  static async recalculateHealthScore(date?: string): Promise<ApiResponse<DailyHealthIndex>> {
    const endpoint = date 
      ? `/api/health-index/recalculate/${date}`
      : '/api/health-index/recalculate/current';
    
    return apiClient.post<DailyHealthIndex>(endpoint);
  }

  /**
   * Get weekly health score summary
   */
  static async getWeeklyHealthScoreSummary(weekStartDate: string): Promise<ApiResponse<{
    weekStart: string;
    weekEnd: string;
    averageScore: number;
    dailyScores: DailyHealthIndex[];
    trend: 'improving' | 'declining' | 'stable';
  }>> {
    return apiClient.get(`/api/health-index/weekly-summary/${weekStartDate}`);
  }

  /**
   * Get monthly health score summary
   */
  static async getMonthlyHealthScoreSummary(year: number, month: number): Promise<ApiResponse<{
    year: number;
    month: number;
    averageScore: number;
    dailyScores: DailyHealthIndex[];
    bestDay: DailyHealthIndex;
    worstDay: DailyHealthIndex;
  }>> {
    return apiClient.get(`/api/health-index/monthly-summary/${year}/${month}`);
  }

  /**
   * Calculate client-side health score breakdown from raw data
   * This is a fallback if the backend doesn't provide breakdown endpoints
   */
  static calculateHealthScoreBreakdown(
    waterIntakes: any[],
    foodIntakes: any[],
    workouts: any[]
  ): HealthScoreBreakdown {
    // Basic calculation logic - this should match backend calculation
    const waterScore = Math.min(100, (waterIntakes.reduce((sum, w) => sum + w.amountLtr, 0) / 2.5) * 100);
    const foodScore = Math.min(100, Math.max(0, 100 - Math.abs(2000 - foodIntakes.reduce((sum, f) => sum + f.calories, 0)) / 20));
    const exerciseScore = Math.min(100, (workouts.reduce((sum, w) => sum + w.durationMin, 0) / 30) * 100);
    const total = (waterScore + foodScore + exerciseScore) / 3;

    return {
      water: Math.round(waterScore),
      food: Math.round(foodScore),
      exercise: Math.round(exerciseScore),
      total: Math.round(total)
    };
  }
}