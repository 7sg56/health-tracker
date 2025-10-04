"use client";

import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { HealthSummaryCards } from "@/components/dashboard/health-summary-cards";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { RefreshCw, Plus } from "lucide-react";
import Link from "next/link";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";

export default function HomePage() {
  const {
    waterIntakes,
    foodIntakes,
    workouts,
    healthScore,
    breakdown,
    isLoading,
    error,
    refresh
  } = useDashboardData();

  const handleRefresh = () => {
    refresh();
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Error Loading Dashboard</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track your daily health metrics and progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading} className="h-9 sm:h-8">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Left Column - Health Score */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="space-y-4">
            <HealthScoreCard
              healthScore={healthScore}
              breakdown={breakdown}
              isLoading={isLoading}
            />
            {healthScore && (
              <Button asChild variant="outline" className="w-full h-10 sm:h-9 text-sm">
                <Link href="/home/health-score">
                  📊 <span className="hidden sm:inline">View Detailed Analysis</span>
                  <span className="sm:hidden">Analysis</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Right Column - Summary and Activity */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Health Summary Cards */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Today&apos;s Summary</h2>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="h-9 text-xs sm:text-sm">
                  <Link href="/home/waterIntake">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Water
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="h-9 text-xs sm:text-sm">
                  <Link href="/home/foodIntake">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Food
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="h-9 text-xs sm:text-sm">
                  <Link href="/home/workout">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Workout
                  </Link>
                </Button>
              </div>
            </div>
            <HealthSummaryCards
              waterIntakes={waterIntakes}
              foodIntakes={foodIntakes}
              workouts={workouts}
              isLoading={isLoading}
            />
          </div>

          {/* Recent Activity Feed */}
          <RecentActivityFeed
            waterIntakes={waterIntakes}
            foodIntakes={foodIntakes}
            workouts={workouts}
            isLoading={isLoading}
            maxItems={8}
          />
        </div>
      </div>

      {/* Quick Actions */}
      {!isLoading && waterIntakes.length === 0 && foodIntakes.length === 0 && workouts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-4">🎯</div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">Start Your Health Journey</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md text-sm sm:text-base px-4">
              Begin tracking your water intake, food consumption, and workouts to see your health score and progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button asChild className="h-11 sm:h-10">
                <Link href="/home/waterIntake">
                  💧 Log Water
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 sm:h-10">
                <Link href="/home/foodIntake">
                  🍎 Log Food
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 sm:h-10">
                <Link href="/home/workout">
                  🏃 Log Workout
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}