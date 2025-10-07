'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FormSkeleton, ListSkeleton } from '@/components/ui/skeleton-loaders';
import { WaterIntakeForm, WaterIntakeList } from '@/components/forms';
import { useWaterIntake } from '@/hooks/use-water-intake';
import { WaterIntakeRequest } from '@/lib/types/health';
import { 
  Droplets, 
  Target, 
  TrendingUp, 
  Calendar,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function WaterPage() {
  const {
    waterIntakes,
    isLoading,
    error,
    addWaterIntake,
    deleteWaterIntake,
    refreshData,
    clearError
  } = useWaterIntake({
    pageSize: 50,
    autoRefresh: true
  });

  // Calculate today's water intake
  const today = new Date().toISOString().split('T')[0];
  const todayWaterIntakes = waterIntakes.filter(intake => 
    intake.date === today
  );
  const totalWaterToday = todayWaterIntakes.reduce((sum, intake) => sum + intake.amountLtr, 0);
  const dailyGoal = 2.5;
  const progress = Math.min((totalWaterToday / dailyGoal) * 100, 100);

  const handleSubmit = async (data: WaterIntakeRequest) => {
    await addWaterIntake(data);
  };

  const handleDelete = async (id: number) => {
    await deleteWaterIntake(id);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Water Intake</h1>
              <p className="text-muted-foreground">
                Track your daily hydration. Goal: {dailyGoal}L per day
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Today
            </Badge>
            <Badge variant={progress >= 100 ? "default" : "secondary"} className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              {progress.toFixed(0)}% Complete
            </Badge>
          </div>
        </div>

        {/* Error Display with enhanced styling */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
                <button 
                  onClick={clearError}
                  className="text-destructive hover:text-destructive/80 font-medium text-sm"
                >
                  Dismiss
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl text-blue-900 dark:text-blue-100">
                Today&apos;s Progress
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-300">
                {totalWaterToday >= dailyGoal 
                  ? '🎉 Congratulations! You&apos;ve reached your daily goal!' 
                  : `${(dailyGoal - totalWaterToday).toFixed(1)}L remaining to reach your goal`
                }
              </CardDescription>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-3xl font-bold text-blue-600">
                {totalWaterToday.toFixed(1)}L
              </div>
              <div className="text-sm text-blue-600/80">
                of {dailyGoal}L goal
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Enhanced Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily Goal Progress</span>
                <span className="font-medium">{progress.toFixed(0)}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-4 bg-blue-100 dark:bg-blue-900/20" 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0L</span>
                <span>{dailyGoal}L</span>
              </div>
            </div>

            {/* Stats Grid - Responsive */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-background/50 rounded-lg border hover:bg-background/80 transition-colors">
                <div className="text-lg sm:text-xl font-bold text-blue-600">{todayWaterIntakes.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Entries Today</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-background/50 rounded-lg border hover:bg-background/80 transition-colors">
                <div className="text-lg sm:text-xl font-bold text-green-600">{totalWaterToday.toFixed(1)}L</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Today</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-background/50 rounded-lg border hover:bg-background/80 transition-colors">
                <div className="text-lg sm:text-xl font-bold text-purple-600">{waterIntakes.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-background/50 rounded-lg border hover:bg-background/80 transition-colors">
                <div className="text-lg sm:text-xl font-bold text-orange-600">{progress.toFixed(0)}%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Daily Progress</div>
              </div>
            </div>

            {/* Hydration Status Indicator */}
            <div className="flex items-center justify-center p-4 rounded-lg bg-background/30 border-2 border-dashed border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <div className="text-2xl mb-2">
                  {progress >= 100 ? '🏆' : progress >= 75 ? '💪' : progress >= 50 ? '👍' : progress >= 25 ? '🚰' : '💧'}
                </div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {progress >= 100 ? 'Goal Achieved!' : 
                   progress >= 75 ? 'Almost There!' : 
                   progress >= 50 ? 'Good Progress!' : 
                   progress >= 25 ? 'Keep Going!' : 'Just Started!'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content with Loading States */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add Water Form - Takes 1 column on xl screens */}
        <div className="xl:col-span-1">
          {isLoading ? (
            <FormSkeleton fields={3} />
          ) : (
            <WaterIntakeForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>

        {/* Water Intake List - Takes 2 columns on xl screens */}
        <div className="xl:col-span-2">
          {isLoading ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>Recent Entries</span>
                </CardTitle>
                <CardDescription>
                  Your water intake history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ListSkeleton items={5} />
              </CardContent>
            </Card>
          ) : (
            <WaterIntakeList
              waterIntakes={waterIntakes}
              isLoading={isLoading}
              onDelete={handleDelete}
              error={error}
              showDate={true}
              paginationType="none"
            />
          )}
        </div>
      </div>
    </div>
  );
}