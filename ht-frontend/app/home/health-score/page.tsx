"use client";

import { EnhancedHealthScoreCard } from "@/components/dashboard/enhanced-health-score-card";
import { HealthScoreTrendChart } from "@/components/dashboard/health-score-trend-chart";
import { HealthScoreBreakdownComponent } from "@/components/dashboard/health-score-breakdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useHealthScoreTrends } from "@/hooks/use-health-score-trends";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HealthScorePage() {
  const {
    healthScore,
    breakdown,
    isLoading: dashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard
  } = useDashboardData();

  const {
    healthScores,
    breakdowns,
    isLoading: trendsLoading,
    error: trendsError,
    refresh: refreshTrends
  } = useHealthScoreTrends(7);

  const handleRefresh = () => {
    refreshDashboard();
    refreshTrends();
  };

  if (dashboardError || trendsError) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Error Loading Health Score Data</CardTitle>
            <CardDescription>{dashboardError || trendsError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Score Analysis</h1>
            <p className="text-muted-foreground">
              Detailed view of your health score and trends
            </p>
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          disabled={dashboardLoading || trendsLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${(dashboardLoading || trendsLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enhanced Health Score Card */}
        <EnhancedHealthScoreCard
          healthScore={healthScore}
          breakdown={breakdown}
          isLoading={dashboardLoading}
          showTrend={true}
          previousScore={healthScores.length > 1 ? healthScores[healthScores.length - 2]?.healthScore : undefined}
        />

        {/* Score Breakdown */}
        <HealthScoreBreakdownComponent
          breakdown={breakdown}
          isLoading={dashboardLoading}
          showChart={true}
        />
      </div>

      {/* Trends Chart */}
      <HealthScoreTrendChart
        healthScores={healthScores}
        breakdowns={breakdowns}
        isLoading={trendsLoading}
      />

      {/* Insights and Recommendations */}
      {!dashboardLoading && healthScore && breakdown && (
        <Card>
          <CardHeader>
            <CardTitle>💡 Insights & Recommendations</CardTitle>
            <CardDescription>Personalized suggestions based on your health score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Water Insights */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  💧 Hydration
                </h4>
                <div className="text-sm text-muted-foreground">
                  {breakdown.water >= 80 ? (
                    "Excellent hydration! Keep up the great work."
                  ) : breakdown.water >= 60 ? (
                    "Good hydration level. Try to drink a bit more water throughout the day."
                  ) : (
                    "Your hydration needs improvement. Aim for 2.5L of water daily."
                  )}
                </div>
              </div>

              {/* Food Insights */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  🍎 Nutrition
                </h4>
                <div className="text-sm text-muted-foreground">
                  {breakdown.food >= 80 ? (
                    "Great calorie balance! Your nutrition is on track."
                  ) : breakdown.food >= 60 ? (
                    "Good nutritional intake. Consider tracking more meals for better accuracy."
                  ) : (
                    "Focus on balanced nutrition. Aim for around 2000 calories daily."
                  )}
                </div>
              </div>

              {/* Exercise Insights */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  🏃 Activity
                </h4>
                <div className="text-sm text-muted-foreground">
                  {breakdown.exercise >= 80 ? (
                    "Fantastic activity level! You're crushing your fitness goals."
                  ) : breakdown.exercise >= 60 ? (
                    "Good exercise routine. Try to add a few more minutes of activity."
                  ) : (
                    "Increase your physical activity. Aim for at least 30 minutes daily."
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!dashboardLoading && !healthScore && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">No Health Score Data</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Start tracking your health activities to see detailed score analysis and trends.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/home/waterIntake">
                  💧 Log Water
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/home/foodIntake">
                  🍎 Log Food
                </Link>
              </Button>
              <Button asChild variant="outline">
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