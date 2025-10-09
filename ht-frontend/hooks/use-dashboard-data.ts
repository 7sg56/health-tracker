'use client';

import { useState, useEffect, useCallback } from 'react';
import { HealthService } from '@/lib/api/health';
import { HealthScoreService } from '@/lib/api/health-score';
import {
  WaterIntake,
  FoodIntake,
  Workout,
  DailyHealthIndex,
  HealthScoreBreakdown,
} from '@/lib/types/health';

interface DashboardData {
  waterIntakes: WaterIntake[];
  foodIntakes: FoodIntake[];
  workouts: Workout[];
  healthScore: DailyHealthIndex | null;
  breakdown: HealthScoreBreakdown | null;
  isLoading: boolean;
  error: string | null;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    waterIntakes: [],
    foodIntakes: [],
    workouts: [],
    healthScore: null,
    breakdown: null,
    isLoading: true,
    error: null,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch all data in parallel
      const [healthDataResponse, healthScoreResponse] = await Promise.all([
        HealthService.getTodaysHealthData(),
        HealthScoreService.getCurrentHealthScore(),
      ]);

      // Handle health data
      const healthData = healthDataResponse.data || {
        waterIntakes: [],
        foodIntakes: [],
        workouts: [],
      };

      // Handle health score
      const healthScore = healthScoreResponse.data || null;

      // Calculate breakdown if we have health data
      let breakdown: HealthScoreBreakdown | null = null;
      if (
        healthData.waterIntakes.length > 0 ||
        healthData.foodIntakes.length > 0 ||
        healthData.workouts.length > 0
      ) {
        breakdown = HealthScoreService.calculateHealthScoreBreakdown(
          healthData.waterIntakes,
          healthData.foodIntakes,
          healthData.workouts
        );
      }

      setData({
        waterIntakes: healthData.waterIntakes,
        foodIntakes: healthData.foodIntakes,
        workouts: healthData.workouts,
        healthScore,
        breakdown,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load dashboard data',
      }));
    }
  }, []);

  // Refresh specific data type
  const refreshHealthScore = useCallback(async () => {
    try {
      const response = await HealthScoreService.getCurrentHealthScore();
      setData(prev => ({
        ...prev,
        healthScore: response.data || null,
      }));
    } catch (error) {
      console.error('Failed to refresh health score:', error);
    }
  }, []);

  const refreshHealthData = useCallback(async () => {
    try {
      const response = await HealthService.getTodaysHealthData();
      const healthData = response.data || {
        waterIntakes: [],
        foodIntakes: [],
        workouts: [],
      };

      // Recalculate breakdown
      const breakdown = HealthScoreService.calculateHealthScoreBreakdown(
        healthData.waterIntakes,
        healthData.foodIntakes,
        healthData.workouts
      );

      setData(prev => ({
        ...prev,
        waterIntakes: healthData.waterIntakes,
        foodIntakes: healthData.foodIntakes,
        workouts: healthData.workouts,
        breakdown,
      }));
    } catch (error) {
      console.error('Failed to refresh health data:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...data,
    refresh: fetchDashboardData,
    refreshHealthScore,
    refreshHealthData,
  };
}
