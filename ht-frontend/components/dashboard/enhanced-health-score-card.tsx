'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DailyHealthIndex, HealthScoreBreakdown } from '@/lib/types/health';

interface EnhancedHealthScoreCardProps {
  healthScore: DailyHealthIndex | null;
  breakdown?: HealthScoreBreakdown;
  isLoading?: boolean;
  showTrend?: boolean;
  previousScore?: number;
  className?: string;
}

export function EnhancedHealthScoreCard({
  healthScore,
  breakdown,
  isLoading = false,
  showTrend = false,
  previousScore,
  className,
}: EnhancedHealthScoreCardProps) {
  const score = healthScore?.healthScore ?? 0;
  const trend = previousScore ? score - previousScore : 0;

  // Score categorization
  const getScoreCategory = (score: number) => {
    if (score >= 90)
      return {
        label: 'Excellent',
        variant: 'success' as const,
        color: 'text-green-600 dark:text-green-400',
      };
    if (score >= 80)
      return {
        label: 'Very Good',
        variant: 'success' as const,
        color: 'text-green-600 dark:text-green-400',
      };
    if (score >= 70)
      return {
        label: 'Good',
        variant: 'warning' as const,
        color: 'text-amber-600 dark:text-amber-400',
      };
    if (score >= 60)
      return {
        label: 'Fair',
        variant: 'warning' as const,
        color: 'text-amber-600 dark:text-amber-400',
      };
    if (score >= 40)
      return {
        label: 'Poor',
        variant: 'danger' as const,
        color: 'text-red-600 dark:text-red-400',
      };
    return {
      label: 'Very Poor',
      variant: 'danger' as const,
      color: 'text-red-600 dark:text-red-400',
    };
  };

  const category = getScoreCategory(score);

  // Component score colors and icons
  const getComponentStyle = (componentScore: number) => {
    if (componentScore >= 80)
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        icon: '✅',
      };
    if (componentScore >= 60)
      return {
        color: 'text-amber-600',
        bgColor: 'bg-amber-100 dark:bg-amber-900/20',
        icon: '⚠️',
      };
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      icon: '❌',
    };
  };

  if (isLoading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle>Health Score</CardTitle>
          <CardDescription>Your overall health performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-muted mx-auto mb-4 h-20 w-20 animate-pulse rounded-full" />
              <div className="bg-muted mb-2 h-6 animate-pulse rounded-md" />
              <div className="bg-muted mx-auto h-4 w-24 animate-pulse rounded-md" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="bg-muted h-8 animate-pulse rounded-md"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Background gradient based on score */}
      <div
        className={cn(
          'absolute inset-0 opacity-5',
          score >= 80 && 'bg-gradient-to-br from-green-400 to-green-600',
          score >= 60 &&
            score < 80 &&
            'bg-gradient-to-br from-amber-400 to-amber-600',
          score < 60 && 'bg-gradient-to-br from-red-400 to-red-600'
        )}
      />

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Health Score</CardTitle>
            <CardDescription>Your overall health performance</CardDescription>
          </div>
          {showTrend && previousScore !== undefined && (
            <Badge
              variant={trend >= 0 ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                trend > 0 &&
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                trend < 0 &&
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                trend === 0 &&
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
              )}
            >
              {trend > 0 ? '+' : ''}
              {trend.toFixed(1)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-6">
          {/* Circular Progress Score Display */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              {/* Circular progress background */}
              <svg
                className="h-32 w-32 -rotate-90 transform"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted opacity-20"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
                  className={cn(
                    'transition-all duration-1000 ease-out',
                    category.color
                  )}
                  strokeLinecap="round"
                />
              </svg>

              {/* Score text overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={cn('text-4xl font-bold', category.color)}>
                  {Math.round(score)}
                </div>
                <div className="text-muted-foreground text-xs">out of 100</div>
              </div>
            </div>

            <Badge
              variant={category.variant === 'success' ? 'default' : 'secondary'}
              className={cn(
                'mt-3',
                category.variant === 'success' &&
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                category.variant === 'warning' &&
                  'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
                category.variant === 'danger' &&
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              )}
            >
              {category.label}
            </Badge>
          </div>

          {/* Component Breakdown */}
          {breakdown && (
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                📊 Score Breakdown
              </h4>

              <div className="space-y-3">
                {/* Water Score */}
                <div
                  className={cn(
                    'flex items-center justify-between rounded-lg p-3',
                    getComponentStyle(breakdown.water).bgColor
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💧</span>
                    <div>
                      <div className="text-sm font-medium">Water Intake</div>
                      <div className="text-muted-foreground text-xs">
                        Hydration level
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {getComponentStyle(breakdown.water).icon}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        getComponentStyle(breakdown.water).color
                      )}
                    >
                      {breakdown.water}%
                    </span>
                  </div>
                </div>

                {/* Food Score */}
                <div
                  className={cn(
                    'flex items-center justify-between rounded-lg p-3',
                    getComponentStyle(breakdown.food).bgColor
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🍎</span>
                    <div>
                      <div className="text-sm font-medium">Nutrition</div>
                      <div className="text-muted-foreground text-xs">
                        Calorie balance
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {getComponentStyle(breakdown.food).icon}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        getComponentStyle(breakdown.food).color
                      )}
                    >
                      {breakdown.food}%
                    </span>
                  </div>
                </div>

                {/* Exercise Score */}
                <div
                  className={cn(
                    'flex items-center justify-between rounded-lg p-3',
                    getComponentStyle(breakdown.exercise).bgColor
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏃</span>
                    <div>
                      <div className="text-sm font-medium">Exercise</div>
                      <div className="text-muted-foreground text-xs">
                        Activity level
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {getComponentStyle(breakdown.exercise).icon}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        getComponentStyle(breakdown.exercise).color
                      )}
                    >
                      {breakdown.exercise}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!healthScore && !isLoading && (
            <div className="py-8 text-center">
              <div className="mb-2 text-4xl">📊</div>
              <div className="text-muted-foreground mb-4 text-sm">
                Start tracking your health activities to see your score!
              </div>
              <div className="text-muted-foreground text-xs">
                Log water intake, food, and workouts to calculate your daily
                health score.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
