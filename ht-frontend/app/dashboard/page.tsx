'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSkeleton } from '@/components/ui/skeleton-loaders';
import {
  PageTransition,
  FadeIn,
  SlideIn,
  StaggeredChildren,
} from '@/components/ui/page-transition';
import {
  createInteractiveElement,
  microInteractions,
} from '@/lib/utils/animations';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Heart,
  Droplets,
  Utensils,
  Dumbbell,
  TrendingUp,
  Plus,
  Target,
  Calendar,
  Zap,
  Award,
  Activity,
} from 'lucide-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export default function DashboardPage() {
  const {
    healthScore,
    breakdown,
    waterIntakes,
    foodIntakes,
    workouts,
    isLoading,
    error,
  } = useDashboardData();

  // Weekly aggregates (placeholder averages)
  const weeklyData = {
    healthScore: 78,
    water: 85,
    food: 72,
    exercise: 68,
  };

  const today = new Date().toISOString().split('T')[0];

  // Calculate today's stats
  const todayWater = waterIntakes.filter(w => w.date.startsWith(today));
  const totalWater = todayWater.reduce((sum, w) => sum + w.amountLtr, 0);
  const waterGoal = 2.5;
  const waterProgress = Math.min((totalWater / waterGoal) * 100, 100);

  const todayFood = foodIntakes.filter(f => f.date.startsWith(today));
  const totalCalories = todayFood.reduce((sum, f) => sum + f.calories, 0);
  const calorieGoal = 2000;
  const calorieProgress = Math.min((totalCalories / calorieGoal) * 100, 100);

  const todayWorkouts = workouts.filter(w => w.date.startsWith(today));
  const totalExercise = todayWorkouts.reduce(
    (sum, w) => sum + w.durationMin,
    0
  );
  const exerciseGoal = 30;
  const exerciseProgress = Math.min((totalExercise / exerciseGoal) * 100, 100);

  // Loading state with enhanced skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>

        {/* Health score skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="bg-background/50 rounded-lg border p-3 text-center"
                >
                  <Skeleton className="mx-auto mb-2 h-6 w-12" />
                  <Skeleton className="mx-auto h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress cards skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map(j => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state with enhanced styling
  if (error) {
    return (
      <div className="space-y-6">
        {/* Header for context */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your health tracking overview</p>
        </div>

        <div className="flex min-h-[400px] items-center justify-center">
          <Card className="border-destructive/50 bg-destructive/5 w-full max-w-md">
            <CardHeader className="text-center">
              <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Activity className="text-destructive h-8 w-8" />
              </div>
              <CardTitle className="text-destructive text-xl">
                Error Loading Dashboard
              </CardTitle>
              <CardDescription className="text-center">{error}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-center">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <p className="text-muted-foreground text-xs">
                If the problem persists, please check your internet connection
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <PageTransition variant="fade" className="space-y-6">
      {/* Enhanced Header with Welcome Message */}
      <FadeIn delay={100}>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back! 👋
              </h1>
              <p className="text-muted-foreground">
                Here&apos;s your health summary for{' '}
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Calendar className="mr-1 h-3 w-3" />
                Today
              </Badge>
              <Badge variant="default" className="text-xs">
                <Zap className="mr-1 h-3 w-3" />
                Active
              </Badge>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Enhanced Health Score Overview */}
      <SlideIn direction="up" delay={200}>
        <Card
          className={cn(
            'from-primary/5 via-primary/5 to-secondary/5 border-primary/20 bg-gradient-to-r',
            microInteractions.card
          )}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-xl shadow-lg">
                  <Heart className="text-primary-foreground h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Daily Health Score</CardTitle>
                  <CardDescription>
                    Your overall wellness rating
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-primary text-3xl font-bold">
                  {healthScore?.healthScore || 0}/100
                </div>
                <Badge variant="default">
                  {healthScore?.healthScore && healthScore.healthScore > 80
                    ? 'Excellent'
                    : healthScore?.healthScore && healthScore.healthScore > 60
                      ? 'Good'
                      : 'Needs Improvement'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background/50 rounded-lg border p-3 text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {breakdown?.water || 0}%
                </div>
                <div className="text-muted-foreground text-xs">Hydration</div>
              </div>
              <div className="bg-background/50 rounded-lg border p-3 text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {breakdown?.food || 0}%
                </div>
                <div className="text-muted-foreground text-xs">Nutrition</div>
              </div>
              <div className="bg-background/50 rounded-lg border p-3 text-center">
                <div className="text-lg font-semibold text-green-600">
                  {breakdown?.exercise || 0}%
                </div>
                <div className="text-muted-foreground text-xs">Fitness</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      {/* Enhanced Daily Progress Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Water Intake Card */}
        <SlideIn direction="up" delay={300}>
          <Card className={microInteractions.card}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Water Intake</CardTitle>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hover:bg-blue-50"
                >
                  <Link href="/dashboard/water">
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {totalWater.toFixed(1)}L
                  </div>
                  <div className="text-muted-foreground text-sm">
                    of {waterGoal}L goal
                  </div>
                </div>
                <Badge variant={waterProgress >= 100 ? 'default' : 'secondary'}>
                  {waterProgress.toFixed(0)}%
                </Badge>
              </div>
              <Progress value={waterProgress} className="h-2" />
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <span>{todayWater.length} entries</span>
                <span>
                  {Math.max(0, waterGoal - totalWater).toFixed(1)}L remaining
                </span>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Food Intake Card */}
        <SlideIn direction="up" delay={400}>
          <Card className={microInteractions.card}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Utensils className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">Food Intake</CardTitle>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hover:bg-orange-50"
                >
                  <Link href="/dashboard/food">
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {totalCalories}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    of {calorieGoal} cal goal
                  </div>
                </div>
                <Badge
                  variant={
                    calorieProgress >= 80 && calorieProgress <= 120
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {calorieProgress.toFixed(0)}%
                </Badge>
              </div>
              <Progress value={calorieProgress} className="h-2" />
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <span>{todayFood.length} meals</span>
                <span>
                  {Math.max(0, calorieGoal - totalCalories)} cal remaining
                </span>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Workouts Card */}
        <SlideIn direction="up" delay={500}>
          <Card className={microInteractions.card}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Exercise</CardTitle>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hover:bg-green-50"
                >
                  <Link href="/dashboard/workout">
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {totalExercise}min
                  </div>
                  <div className="text-muted-foreground text-sm">
                    of {exerciseGoal}min goal
                  </div>
                </div>
                <Badge
                  variant={exerciseProgress >= 100 ? 'default' : 'secondary'}
                >
                  {exerciseProgress.toFixed(0)}%
                </Badge>
              </div>
              <Progress value={exerciseProgress} className="h-2" />
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <span>{todayWorkouts.length} workouts</span>
                <span>
                  {Math.max(0, exerciseGoal - totalExercise)}min remaining
                </span>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>

      {/* Detailed Breakdown (merged from Health Score page) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SlideIn direction="up" delay={260}>
          <Card className="transition-shadow hover:shadow-md">
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
                  <Badge
                    variant={
                      breakdown?.water && breakdown.water >= 80
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {breakdown?.water && breakdown.water >= 80
                      ? 'Great'
                      : 'Needs Work'}
                  </Badge>
                </div>
                <Progress value={breakdown?.water || 0} className="h-2" />
                <p className="text-muted-foreground text-xs">
                  Based on daily water intake vs. goal
                </p>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
        <SlideIn direction="up" delay={280}>
          <Card className="transition-shadow hover:shadow-md">
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
                  <Badge
                    variant={
                      breakdown?.food && breakdown.food >= 80
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {breakdown?.food && breakdown.food >= 80
                      ? 'Great'
                      : 'Needs Work'}
                  </Badge>
                </div>
                <Progress value={breakdown?.food || 0} className="h-2" />
                <p className="text-muted-foreground text-xs">
                  Based on calorie intake and meal balance
                </p>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
        <SlideIn direction="up" delay={300}>
          <Card className="transition-shadow hover:shadow-md">
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
                  <Badge
                    variant={
                      breakdown?.exercise && breakdown.exercise >= 80
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {breakdown?.exercise && breakdown.exercise >= 80
                      ? 'Great'
                      : 'Needs Work'}
                  </Badge>
                </div>
                <Progress value={breakdown?.exercise || 0} className="h-2" />
                <p className="text-muted-foreground text-xs">
                  Based on workout duration and frequency
                </p>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>

      {/* Enhanced Quick Actions & Goals Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <SlideIn direction="left" delay={600}>
          <Card className={microInteractions.card}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>
                Quickly log your daily activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/dashboard/water">
                  <Droplets className="mr-2 h-4 w-4" />
                  Log Water Intake
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/dashboard/food">
                  <Utensils className="mr-2 h-4 w-4" />
                  Add Meal/Snack
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/dashboard/workout">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Record Workout
                </Link>
              </Button>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Today's Goals */}
        <SlideIn direction="right" delay={700}>
          <Card className={microInteractions.card}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-500" />
                <span>Today&apos;s Goals</span>
              </CardTitle>
              <CardDescription>Track your daily progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Hydration Goal</span>
                  </div>
                  <Badge variant={waterProgress >= 100 ? 'default' : 'outline'}>
                    {waterProgress >= 100
                      ? '✓ Complete'
                      : `${waterProgress.toFixed(0)}%`}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Nutrition Goal</span>
                  </div>
                  <Badge
                    variant={
                      calorieProgress >= 80 && calorieProgress <= 120
                        ? 'default'
                        : 'outline'
                    }
                  >
                    {calorieProgress >= 80 && calorieProgress <= 120
                      ? '✓ Complete'
                      : `${calorieProgress.toFixed(0)}%`}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Exercise Goal</span>
                  </div>
                  <Badge
                    variant={exerciseProgress >= 100 ? 'default' : 'outline'}
                  >
                    {exerciseProgress >= 100
                      ? '✓ Complete'
                      : `${exerciseProgress.toFixed(0)}%`}
                  </Badge>
                </div>
              </div>

              {/* Overall completion */}
              <div className="border-t pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-muted-foreground text-sm">
                    {Math.round(
                      (waterProgress +
                        Math.min(calorieProgress, 100) +
                        exerciseProgress) /
                        3
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (waterProgress +
                      Math.min(calorieProgress, 100) +
                      exerciseProgress) /
                    3
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>

      {/* Weekly Trends and Recommendations (merged) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SlideIn direction="left" delay={820}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span>Weekly Trends</span>
              </CardTitle>
              <CardDescription>
                Your average scores over the past week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Overall Health Score
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {weeklyData.healthScore}%
                  </span>
                </div>
                <Progress value={weeklyData.healthScore} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hydration</span>
                  <span className="text-muted-foreground text-sm">
                    {weeklyData.water}%
                  </span>
                </div>
                <Progress value={weeklyData.water} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nutrition</span>
                  <span className="text-muted-foreground text-sm">
                    {weeklyData.food}%
                  </span>
                </div>
                <Progress value={weeklyData.food} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Exercise</span>
                  <span className="text-muted-foreground text-sm">
                    {weeklyData.exercise}%
                  </span>
                </div>
                <Progress value={weeklyData.exercise} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </SlideIn>
        <SlideIn direction="right" delay={860}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-500" />
                <span>Recommendations</span>
              </CardTitle>
              <CardDescription>
                Personalized tips to improve your health score
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {breakdown?.water && breakdown.water < 80 && (
                  <div className="flex items-start space-x-3 rounded-lg bg-blue-50 p-3">
                    <Droplets className="mt-0.5 h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">
                        Increase Water Intake
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Try to drink more water throughout the day to reach your
                        hydration goals.
                      </p>
                    </div>
                  </div>
                )}
                {breakdown?.food && breakdown.food < 80 && (
                  <div className="flex items-start space-x-3 rounded-lg bg-orange-50 p-3">
                    <Utensils className="mt-0.5 h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">
                        Balance Your Nutrition
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Focus on balanced meals with proper calorie
                        distribution.
                      </p>
                    </div>
                  </div>
                )}
                {breakdown?.exercise && breakdown.exercise < 80 && (
                  <div className="flex items-start space-x-3 rounded-lg bg-green-50 p-3">
                    <Dumbbell className="mt-0.5 h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">
                        Increase Physical Activity
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Add more exercise sessions to meet your daily activity
                        goals.
                      </p>
                    </div>
                  </div>
                )}
                {(!breakdown ||
                  (breakdown.water >= 80 &&
                    breakdown.food >= 80 &&
                    breakdown.exercise >= 80)) && (
                  <div className="flex items-start space-x-3 rounded-lg bg-green-50 p-3">
                    <Award className="mt-0.5 h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Great Job!</p>
                      <p className="text-muted-foreground text-xs">
                        You&apos;re doing excellent across all health metrics.
                        Keep it up!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </PageTransition>
  );
}
