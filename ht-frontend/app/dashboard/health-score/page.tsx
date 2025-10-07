'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartSkeleton } from '@/components/ui/skeleton-loaders';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { 
  Heart, 
  TrendingUp, 
  Calendar,
  Activity,
  AlertCircle,
  Target,
  Droplets,
  Utensils,
  Dumbbell,
  Award
} from 'lucide-react';

export default function HealthScorePage() {
  const {
    healthScore,
    breakdown,
    waterIntakes,
    foodIntakes,
    workouts,
    isLoading,
    error
  } = useDashboardData();

  // Calculate weekly averages (mock data for now)
  const weeklyData = {
    healthScore: 78,
    water: 85,
    food: 72,
    exercise: 68
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <ChartSkeleton height="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md border-destructive/50">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Activity className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Error Loading Health Score</CardTitle>
              <CardDescription className="text-center">
                {error}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl">
            <Heart className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Score Analysis</h1>
            <p className="text-muted-foreground">
              Detailed breakdown of your wellness metrics and trends
            </p>
          </div>
        </div>
      </div>

      {/* Current Health Score Overview */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-xl shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  Current Health Score
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-300">
                  Based on today&apos;s activities and goals
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-red-600">
                {healthScore?.healthScore || 0}
              </div>
              <div className="text-lg text-muted-foreground">out of 100</div>
              <Badge variant="default" className="mt-2">
                {healthScore?.healthScore && healthScore.healthScore > 80 
                  ? 'Excellent' 
                  : healthScore?.healthScore && healthScore.healthScore > 60 
                  ? 'Good' 
                  : 'Needs Improvement'
                }
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Hydration Score */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Hydration</CardTitle>
            <Droplets className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {breakdown?.water || 0}%
                </span>
                <Badge variant={breakdown?.water && breakdown.water >= 80 ? "default" : "secondary"}>
                  {breakdown?.water && breakdown.water >= 80 ? "Great" : "Needs Work"}
                </Badge>
              </div>
              <Progress value={breakdown?.water || 0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Based on daily water intake vs. goal
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Score */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Nutrition</CardTitle>
            <Utensils className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600">
                  {breakdown?.food || 0}%
                </span>
                <Badge variant={breakdown?.food && breakdown.food >= 80 ? "default" : "secondary"}>
                  {breakdown?.food && breakdown.food >= 80 ? "Great" : "Needs Work"}
                </Badge>
              </div>
              <Progress value={breakdown?.food || 0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Based on calorie intake and meal balance
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Score */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Exercise</CardTitle>
            <Dumbbell className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {breakdown?.exercise || 0}%
                </span>
                <Badge variant={breakdown?.exercise && breakdown.exercise >= 80 ? "default" : "secondary"}>
                  {breakdown?.exercise && breakdown.exercise >= 80 ? "Great" : "Needs Work"}
                </Badge>
              </div>
              <Progress value={breakdown?.exercise || 0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Based on workout duration and frequency
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Weekly Trends</span>
            </CardTitle>
            <CardDescription>
              Your average scores over the past week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Health Score</span>
                <span className="text-sm text-muted-foreground">{weeklyData.healthScore}%</span>
              </div>
              <Progress value={weeklyData.healthScore} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hydration</span>
                <span className="text-sm text-muted-foreground">{weeklyData.water}%</span>
              </div>
              <Progress value={weeklyData.water} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nutrition</span>
                <span className="text-sm text-muted-foreground">{weeklyData.food}%</span>
              </div>
              <Progress value={weeklyData.food} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Exercise</span>
                <span className="text-sm text-muted-foreground">{weeklyData.exercise}%</span>
              </div>
              <Progress value={weeklyData.exercise} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-500" />
              <span>Recommendations</span>
            </CardTitle>
            <CardDescription>
              Personalized tips to improve your health score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {breakdown?.water && breakdown.water < 80 && (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Droplets className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Increase Water Intake</p>
                    <p className="text-xs text-muted-foreground">
                      Try to drink more water throughout the day to reach your hydration goals.
                    </p>
                  </div>
                </div>
              )}
              {breakdown?.food && breakdown.food < 80 && (
                <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <Utensils className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Balance Your Nutrition</p>
                    <p className="text-xs text-muted-foreground">
                      Focus on balanced meals with proper calorie distribution.
                    </p>
                  </div>
                </div>
              )}
              {breakdown?.exercise && breakdown.exercise < 80 && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Dumbbell className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Increase Physical Activity</p>
                    <p className="text-xs text-muted-foreground">
                      Add more exercise sessions to meet your daily activity goals.
                    </p>
                  </div>
                </div>
              )}
              {(!breakdown || (breakdown.water >= 80 && breakdown.food >= 80 && breakdown.exercise >= 80)) && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Award className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Great Job!</p>
                    <p className="text-xs text-muted-foreground">
                      You&apos;re doing excellent across all health metrics. Keep it up!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}