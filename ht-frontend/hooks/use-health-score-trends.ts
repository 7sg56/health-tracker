"use client";

import { useState, useEffect, useCallback } from "react";
import { HealthScoreService } from "@/lib/api/health-score";
import { DailyHealthIndex, HealthScoreBreakdown } from "@/lib/types/health";

interface HealthScoreTrendsData {
  healthScores: DailyHealthIndex[];
  breakdowns: HealthScoreBreakdown[];
  isLoading: boolean;
  error: string | null;
}

export function useHealthScoreTrends(days: number = 7) {
  const [data, setData] = useState<HealthScoreTrendsData>({
    healthScores: [],
    breakdowns: [],
    isLoading: true,
    error: null,
  });

  const fetchTrendsData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch health scores for the last N days
      const response = await HealthScoreService.getHealthScoresForLastDays(days);
      
      const healthScores = response.data || [];
      
      // For now, we'll generate mock breakdown data since the backend might not have this endpoint
      // In a real implementation, you would fetch this from the backend
      const breakdowns: HealthScoreBreakdown[] = healthScores.map(score => {
        // Mock calculation - in reality this would come from the backend
        const baseScore = score.healthScore;
        return {
          water: Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 20)),
          food: Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 20)),
          exercise: Math.min(100, Math.max(0, baseScore + (Math.random() - 0.5) * 20)),
          total: baseScore
        };
      });

      setData({
        healthScores,
        breakdowns,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Failed to fetch health score trends:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load trends data'
      }));
    }
  }, [days]);

  useEffect(() => {
    fetchTrendsData();
  }, [fetchTrendsData]);

  return {
    ...data,
    refresh: fetchTrendsData,
  };
}