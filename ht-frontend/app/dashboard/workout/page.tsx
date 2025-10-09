'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FormSkeleton, ListSkeleton } from '@/components/ui/skeleton-loaders';
import { WorkoutForm, WorkoutList } from '@/components/forms';
import { useWorkout } from '@/hooks/use-workout';
import { useResponsive } from '@/hooks/use-responsive';
import {
  Dumbbell,
  Target,
  TrendingUp,
  Calendar,
  Activity,
  AlertCircle,
  Timer,
  Flame,
  Trophy,
  Zap,
  BarChart3,
} from 'lucide-react';

export default function WorkoutPage() {
  const {
    workouts,
    isLoading,
    error,
    addWorkout,
    deleteWorkout,
    updateWorkout,
  } = useWorkout({ pageSize: 50 });

  const { isMobile, isTablet } = useResponsive();

  // Calculate comprehensive stats
  const today = new Date().toISOString().split('T')[0];
  const todayWorkouts = workouts.filter(workout =>
    workout.date.startsWith(today)
  );

  // Weekly stats (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyWorkouts = workouts.filter(
    workout => new Date(workout.date) >= weekAgo
  );

  // Calculate totals
  const totalMinutes = todayWorkouts.reduce(
    (sum, workout) => sum + workout.durationMin,
    0
  );
  const totalCalories = todayWorkouts.reduce(
    (sum, workout) => sum + (workout.caloriesBurned || 0),
    0
  );
  const weeklyMinutes = weeklyWorkouts.reduce(
    (sum, workout) => sum + workout.durationMin,
    0
  );
  const weeklyCalories = weeklyWorkouts.reduce(
    (sum, workout) => sum + (workout.caloriesBurned || 0),
    0
  );

  // Goals and progress
  const dailyGoal = 30; // Default 30 minute goal
  const weeklyGoal = 150; // WHO recommended 150 minutes per week
  const dailyProgress = Math.min((totalMinutes / dailyGoal) * 100, 100);
  const weeklyProgress = Math.min((weeklyMinutes / weeklyGoal) * 100, 100);

  // Streak calculation
  const calculateStreak = () => {
    let streak = 0;
    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const workoutDates = [...new Set(sortedWorkouts.map(w => w.date))];

    for (let i = 0; i < workoutDates.length; i++) {
      const currentDate = new Date(workoutDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (currentDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/20">
              <Dumbbell className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
              <p className="text-muted-foreground">
                Track your exercise and fitness activities. Goal: {dailyGoal}{' '}
                min per day
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Calendar className="mr-1 h-3 w-3" />
              Today
            </Badge>
            <Badge
              variant={dailyProgress >= 100 ? 'default' : 'secondary'}
              className="text-xs"
            >
              <Target className="mr-1 h-3 w-3" />
              {dailyProgress.toFixed(0)}% Complete
            </Badge>
          </div>
        </div>

        {/* Error Display with enhanced styling */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-destructive h-4 w-4" />
                <span className="text-destructive text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Progress Cards */}
      <div
        className={`grid gap-4 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-4'}`}
      >
        {/* Daily Progress Card */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Goal
            </CardTitle>
            <Timer className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalMinutes} min
            </div>
            <p className="text-muted-foreground mb-2 text-xs">
              Goal: {dailyGoal} minutes
            </p>
            <Progress value={dailyProgress} className="mb-2 h-2" />
            <p className="text-muted-foreground text-xs">
              {dailyProgress >= 100
                ? `🎉 ${totalMinutes - dailyGoal} min over goal!`
                : `${dailyGoal - totalMinutes} min remaining`}
            </p>
          </CardContent>
        </Card>

        {/* Weekly Progress Card */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {weeklyMinutes} min
            </div>
            <p className="text-muted-foreground mb-2 text-xs">
              Goal: {weeklyGoal} minutes
            </p>
            <Progress value={weeklyProgress} className="mb-2 h-2" />
            <p className="text-muted-foreground text-xs">
              {weeklyProgress >= 100
                ? `🏆 Weekly goal achieved!`
                : `${Math.round((weeklyGoal - weeklyMinutes) / 7)} min/day needed`}
            </p>
          </CardContent>
        </Card>

        {/* Calories Burned Card */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:border-orange-800 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Calories Today
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalCalories}
            </div>
            <p className="text-muted-foreground mb-2 text-xs">
              This week: {weeklyCalories} cal
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="mr-1 h-3 w-3" />
                {todayWorkouts.length} sessions
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currentStreak}
            </div>
            <p className="text-muted-foreground mb-2 text-xs">
              {currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
            <Badge
              variant={
                currentStreak >= 7
                  ? 'default'
                  : currentStreak >= 3
                    ? 'secondary'
                    : 'outline'
              }
            >
              {currentStreak >= 7
                ? '🔥 On Fire!'
                : currentStreak >= 3
                  ? '💪 Building'
                  : '🌱 Starting'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Responsive Layout */}
      <div
        className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}
      >
        {/* Add New Workout */}
        <div className={isMobile ? 'order-2' : ''}>
          {isLoading ? (
            <FormSkeleton fields={4} />
          ) : (
            <WorkoutForm
              onSubmit={async data => {
                await addWorkout(data);
              }}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>

        {/* Workout List */}
        <div className={isMobile ? 'order-1' : ''}>
          {isLoading ? (
            <ListSkeleton items={5} />
          ) : (
            <WorkoutList
              workouts={workouts.slice(0, isMobile ? 5 : 10)}
              onEdit={workout => {
                // For now, just log the edit action - full edit functionality would need a modal or form
                console.log('Edit workout:', workout);
              }}
              onDelete={deleteWorkout}
              isLoading={isLoading}
              error={error}
              paginationType={isMobile ? 'loadMore' : 'none'}
              isMobile={isMobile}
              emptyMessage="No workouts recorded yet. Start by logging your first workout above!"
            />
          )}
        </div>
      </div>

      {/* Additional Progress Insights for Desktop */}
      {!isMobile && workouts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Workout Insights
            </CardTitle>
            <CardDescription>Your fitness journey at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Most Popular Activity */}
              <div className="space-y-2">
                <h4 className="text-muted-foreground text-sm font-medium">
                  Most Popular Activity
                </h4>
                {(() => {
                  const activityCounts = workouts.reduce(
                    (acc, workout) => {
                      acc[workout.activity] = (acc[workout.activity] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>
                  );
                  const mostPopular = Object.entries(activityCounts).sort(
                    ([, a], [, b]) => b - a
                  )[0];
                  return mostPopular ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{mostPopular[0]}</Badge>
                      <span className="text-muted-foreground text-sm">
                        {mostPopular[1]} times
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No data yet
                    </span>
                  );
                })()}
              </div>

              {/* Average Session */}
              <div className="space-y-2">
                <h4 className="text-muted-foreground text-sm font-medium">
                  Average Session
                </h4>
                {workouts.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {Math.round(
                        workouts.reduce((sum, w) => sum + w.durationMin, 0) /
                          workouts.length
                      )}{' '}
                      min
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      per workout
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No data yet
                  </span>
                )}
              </div>

              {/* Total This Month */}
              <div className="space-y-2">
                <h4 className="text-muted-foreground text-sm font-medium">
                  This Month
                </h4>
                {(() => {
                  const thisMonth = new Date();
                  thisMonth.setDate(1);
                  const monthlyWorkouts = workouts.filter(
                    w => new Date(w.date) >= thisMonth
                  );
                  const monthlyMinutes = monthlyWorkouts.reduce(
                    (sum, w) => sum + w.durationMin,
                    0
                  );
                  return monthlyMinutes > 0 ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{monthlyMinutes} min</Badge>
                      <span className="text-muted-foreground text-sm">
                        {monthlyWorkouts.length} workouts
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No workouts yet
                    </span>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
