'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormSkeleton, ListSkeleton } from '@/components/ui/skeleton-loaders';
import { FoodIntakeForm, FoodIntakeList } from '@/components/forms';
import { useFoodIntake } from '@/hooks/use-food-intake';
import { FoodIntake } from '@/lib/types/health';
import {
  Utensils,
  Target,
  TrendingUp,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function FoodPage() {
  const { foodIntakes, isLoading, error, addFoodIntake, deleteFoodIntake } =
    useFoodIntake({ pageSize: 50 });

  // Calculate daily stats
  const today = new Date().toISOString().split('T')[0];
  const todayIntakes = foodIntakes.filter((intake: FoodIntake) =>
    intake.date.startsWith(today)
  );
  const totalCalories = todayIntakes.reduce(
    (sum: number, intake: FoodIntake) => sum + intake.calories,
    0
  );
  const dailyGoal = 2000;
  const progress = Math.min((totalCalories / dailyGoal) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/20">
              <Utensils className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Food Intake</h1>
              <p className="text-muted-foreground">
                Track your daily nutrition and calories. Goal: {dailyGoal} cal
                per day
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Calendar className="mr-1 h-3 w-3" />
              Today
            </Badge>
            <Badge
              variant={
                progress >= 80 && progress <= 120 ? 'default' : 'secondary'
              }
              className="text-xs"
            >
              <Target className="mr-1 h-3 w-3" />
              {progress.toFixed(0)}% of Goal
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

      {/* Enhanced Daily Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 dark:border-orange-800 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Calories
            </CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalCalories}
            </div>
            <p className="text-muted-foreground text-xs">
              Goal: {dailyGoal} calories
            </p>
            <div className="bg-secondary mt-2 h-2 w-full rounded-full">
              <div
                className="h-2 rounded-full bg-orange-600 transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {progress >= 100
                ? `${totalCalories - dailyGoal} cal over goal`
                : `${dailyGoal - totalCalories} cal remaining`}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meals Today</CardTitle>
            <Utensils className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayIntakes.length}</div>
            <p className="text-muted-foreground text-xs">Total entries</p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
            <Badge
              variant={
                progress >= 80 && progress <= 120 ? 'default' : 'secondary'
              }
            >
              {progress >= 80 && progress <= 120
                ? 'On Target!'
                : progress > 120
                  ? 'Over Goal'
                  : 'Under Goal'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Enhanced Layout */}
      <div className="space-y-6">
        {/* Add New Food Intake - Full Width on Mobile */}
        <div className="w-full">
          {isLoading ? (
            <FormSkeleton fields={4} />
          ) : (
            <FoodIntakeForm
              onSubmit={async data => {
                await addFoodIntake(data);
              }}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>

        {/* Food Intake List - Enhanced with Better Mobile Support */}
        <div className="w-full">
          {isLoading ? (
            <ListSkeleton items={5} />
          ) : (
            <FoodIntakeList
              foodIntakes={foodIntakes}
              onEdit={() => {}}
              onDelete={deleteFoodIntake}
              isLoading={isLoading}
              dailyCalorieGoal={dailyGoal}
              showDate={true}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
