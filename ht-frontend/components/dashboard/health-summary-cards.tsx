"use client";

import * as React from "react";
import { HealthCard } from "@/components/ui/health-card";
import { WaterIntake, FoodIntake, Workout } from "@/lib/types/health";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface HealthSummaryCardsProps {
  waterIntakes: WaterIntake[];
  foodIntakes: FoodIntake[];
  workouts: Workout[];
  isLoading?: boolean;
}

export function HealthSummaryCards({
  waterIntakes,
  foodIntakes,
  workouts,
  isLoading = false,
}: HealthSummaryCardsProps) {
  // Calculate today's totals
  const today = new Date().toDateString();
  
  const todayWater = waterIntakes
    .filter(w => new Date(w.date).toDateString() === today)
    .reduce((sum, w) => sum + w.amountLtr, 0);
    
  const todayCalories = foodIntakes
    .filter(f => new Date(f.date).toDateString() === today)
    .reduce((sum, f) => sum + f.calories, 0);
    
  const todayWorkoutMinutes = workouts
    .filter(w => new Date(w.date).toDateString() === today)
    .reduce((sum, w) => sum + w.durationMin, 0);

  // Calculate progress toward daily targets
  const waterTarget = 2.5; // 2.5L daily target
  const calorieTarget = 2000; // 2000 calories daily target
  const workoutTarget = 30; // 30 minutes daily target

  const waterProgress = Math.min(100, (todayWater / waterTarget) * 100);

  const workoutProgress = Math.min(100, (todayWorkoutMinutes / workoutTarget) * 100);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <HealthCard
        title="Water Intake"
        value={`${todayWater.toFixed(1)}L`}
        description={`Target: ${waterTarget}L`}
        icon={<span className="text-blue-500">💧</span>}
        progress={{
          value: todayWater,
          max: waterTarget,
          label: "Daily Goal"
        }}
        variant={waterProgress >= 100 ? "success" : waterProgress >= 50 ? "warning" : "default"}
      />
      
      <HealthCard
        title="Calories"
        value={todayCalories.toLocaleString()}
        description={`Target: ${calorieTarget.toLocaleString()}`}
        icon={<span className="text-orange-500">🍎</span>}
        progress={{
          value: todayCalories,
          max: calorieTarget,
          label: "Daily Goal"
        }}
        variant={
          Math.abs(todayCalories - calorieTarget) <= 200 ? "success" : 
          Math.abs(todayCalories - calorieTarget) <= 500 ? "warning" : 
          "default"
        }
      />
      
      <HealthCard
        title="Exercise"
        value={`${todayWorkoutMinutes} min`}
        description={`Target: ${workoutTarget} min`}
        icon={<span className="text-green-500">🏃</span>}
        progress={{
          value: todayWorkoutMinutes,
          max: workoutTarget,
          label: "Daily Goal"
        }}
        variant={workoutProgress >= 100 ? "success" : workoutProgress >= 50 ? "warning" : "default"}
      />
    </div>
  );
}