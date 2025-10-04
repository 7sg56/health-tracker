"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DailyHealthIndex, HealthScoreBreakdown } from "@/lib/types/health";
import { Skeleton } from "@/components/ui/skeleton";

interface HealthScoreCardProps {
  healthScore: DailyHealthIndex | null;
  breakdown?: HealthScoreBreakdown;
  isLoading?: boolean;
  className?: string;
}

export function HealthScoreCard({
  healthScore,
  breakdown,
  isLoading = false,
  className,
}: HealthScoreCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Today&apos;s Health Score</CardTitle>
          <CardDescription>Your overall health performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Main Score Display Skeleton */}
            <div className="text-center space-y-2">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
              <Skeleton className="h-6 w-24 mx-auto" />
            </div>

            {/* Score Breakdown Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-2 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const score = healthScore?.healthScore ?? 0;
  const scoreVariant = score >= 80 ? "success" : score >= 60 ? "warning" : "danger";
  
  const scoreColors = {
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
  };



  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Today's Health Score</CardTitle>
        <CardDescription>Your overall health performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Score Display */}
          <div className="text-center">
            <div className={cn("text-6xl font-bold", scoreColors[scoreVariant])}>
              {Math.round(score)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              out of 100
            </div>
            <Badge 
              variant={scoreVariant === "success" ? "default" : "secondary"}
              className={cn(
                "mt-2",
                scoreVariant === "success" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                scoreVariant === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
                scoreVariant === "danger" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              )}
            >
              {scoreVariant === "success" && "Excellent"}
              {scoreVariant === "warning" && "Good"}
              {scoreVariant === "danger" && "Needs Improvement"}
            </Badge>
          </div>

          {/* Score Breakdown */}
          {breakdown && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Score Breakdown</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">💧 Water</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{breakdown.water}%</span>
                    <Progress 
                      value={breakdown.water} 
                      className="w-20 h-2"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">🍎 Food</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{breakdown.food}%</span>
                    <Progress 
                      value={breakdown.food} 
                      className="w-20 h-2"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">🏃 Exercise</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{breakdown.exercise}%</span>
                    <Progress 
                      value={breakdown.exercise} 
                      className="w-20 h-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!healthScore && !isLoading && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-sm text-muted-foreground">
                Start tracking your health activities to see your score!
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}