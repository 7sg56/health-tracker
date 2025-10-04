"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Droplets,
  Apple,
  Dumbbell,
  Calendar
} from "lucide-react";

interface ProgressTarget {
  current: number;
  target: number;
  unit: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface ProgressIndicatorsProps {
  waterProgress: ProgressTarget;
  foodProgress: ProgressTarget;
  exerciseProgress: ProgressTarget;
  overallScore: number;
  previousScore?: number;
  isLoading?: boolean;
  className?: string;
  showTrend?: boolean;
}

export function ProgressIndicators({
  waterProgress,
  foodProgress,
  exerciseProgress,
  overallScore,
  previousScore,
  isLoading = false,
  className,
  showTrend = true
}: ProgressIndicatorsProps) {
  const calculatePercentage = (current: number, target: number) => {
    return Math.min(100, Math.max(0, (current / target) * 100));
  };

  const getTrendIcon = (current: number, previous?: number) => {
    if (!previous) return <Minus className="w-4 h-4" />;
    if (current > previous + 2) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous - 2) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const CircularProgress = ({ 
    percentage, 
    size = 120, 
    strokeWidth = 8, 
    color = "#3b82f6",
    label,
    value,
    unit
  }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label: string;
    value: number;
    unit: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted stroke-current opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold" style={{ color }}>
            {Math.round(percentage)}%
          </div>
          <div className="text-xs text-muted-foreground text-center">
            <div>{value} {unit}</div>
            <div className="text-xs">{label}</div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Daily Progress</CardTitle>
          <CardDescription>Your progress toward daily targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-32 w-32 bg-muted animate-pulse rounded-full mx-auto" />
                <div className="h-4 bg-muted animate-pulse rounded mx-auto w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Daily Progress Tracking
            </CardTitle>
            <CardDescription>Your progress toward daily health targets</CardDescription>
          </div>
          {showTrend && previousScore && (
            <Badge variant={overallScore > previousScore ? 'default' : overallScore < previousScore ? 'destructive' : 'secondary'}>
              {getTrendIcon(overallScore, previousScore)}
              {overallScore > previousScore ? 'Improving' : overallScore < previousScore ? 'Declining' : 'Stable'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Water Progress */}
          <div className="text-center space-y-4">
            <CircularProgress
              percentage={calculatePercentage(waterProgress.current, waterProgress.target)}
              color={waterProgress.color}
              label={waterProgress.label}
              value={waterProgress.current}
              unit={waterProgress.unit}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                {waterProgress.icon}
                <span className="text-sm font-medium">{waterProgress.label}</span>
              </div>
              <Progress 
                value={calculatePercentage(waterProgress.current, waterProgress.target)}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                {waterProgress.current} / {waterProgress.target} {waterProgress.unit}
              </div>
            </div>
          </div>

          {/* Food Progress */}
          <div className="text-center space-y-4">
            <CircularProgress
              percentage={calculatePercentage(foodProgress.current, foodProgress.target)}
              color={foodProgress.color}
              label={foodProgress.label}
              value={foodProgress.current}
              unit={foodProgress.unit}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                {foodProgress.icon}
                <span className="text-sm font-medium">{foodProgress.label}</span>
              </div>
              <Progress 
                value={calculatePercentage(foodProgress.current, foodProgress.target)}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                {foodProgress.current} / {foodProgress.target} {foodProgress.unit}
              </div>
            </div>
          </div>

          {/* Exercise Progress */}
          <div className="text-center space-y-4">
            <CircularProgress
              percentage={calculatePercentage(exerciseProgress.current, exerciseProgress.target)}
              color={exerciseProgress.color}
              label={exerciseProgress.label}
              value={exerciseProgress.current}
              unit={exerciseProgress.unit}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                {exerciseProgress.icon}
                <span className="text-sm font-medium">{exerciseProgress.label}</span>
              </div>
              <Progress 
                value={calculatePercentage(exerciseProgress.current, exerciseProgress.target)}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                {exerciseProgress.current} / {exerciseProgress.target} {exerciseProgress.unit}
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="text-center space-y-4">
            <CircularProgress
              percentage={overallScore}
              color={overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444'}
              label="Overall"
              value={overallScore}
              unit="pts"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Health Score</span>
              </div>
              <Progress 
                value={overallScore}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                {overallScore} / 100 points
              </div>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Today's Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full", getProgressColor(calculatePercentage(waterProgress.current, waterProgress.target)))} />
              <div className="flex-1">
                <div className="text-sm">Water: {Math.round(calculatePercentage(waterProgress.current, waterProgress.target))}% complete</div>
                <div className="text-xs text-muted-foreground">
                  {waterProgress.target - waterProgress.current > 0 
                    ? `${(waterProgress.target - waterProgress.current).toFixed(1)} ${waterProgress.unit} remaining`
                    : 'Target achieved! 🎉'
                  }
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full", getProgressColor(calculatePercentage(foodProgress.current, foodProgress.target)))} />
              <div className="flex-1">
                <div className="text-sm">Nutrition: {Math.round(calculatePercentage(foodProgress.current, foodProgress.target))}% complete</div>
                <div className="text-xs text-muted-foreground">
                  {Math.abs(foodProgress.target - foodProgress.current) > 0 
                    ? `${Math.abs(foodProgress.target - foodProgress.current)} ${foodProgress.unit} ${foodProgress.current > foodProgress.target ? 'over' : 'under'} target`
                    : 'Perfect balance! 🎯'
                  }
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full", getProgressColor(calculatePercentage(exerciseProgress.current, exerciseProgress.target)))} />
              <div className="flex-1">
                <div className="text-sm">Exercise: {Math.round(calculatePercentage(exerciseProgress.current, exerciseProgress.target))}% complete</div>
                <div className="text-xs text-muted-foreground">
                  {exerciseProgress.target - exerciseProgress.current > 0 
                    ? `${exerciseProgress.target - exerciseProgress.current} ${exerciseProgress.unit} remaining`
                    : 'Great workout! 💪'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for creating progress indicators with default targets
export function DailyProgressIndicators({
  waterIntake = 0,
  caloriesConsumed = 0,
  exerciseMinutes = 0,
  healthScore = 0,
  previousScore,
  isLoading = false,
  className
}: {
  waterIntake?: number;
  caloriesConsumed?: number;
  exerciseMinutes?: number;
  healthScore?: number;
  previousScore?: number;
  isLoading?: boolean;
  className?: string;
}) {
  const waterProgress: ProgressTarget = {
    current: waterIntake,
    target: 2.5, // 2.5 liters
    unit: 'L',
    label: 'Water',
    icon: <Droplets className="w-4 h-4 text-blue-500" />,
    color: '#3b82f6'
  };

  const foodProgress: ProgressTarget = {
    current: caloriesConsumed,
    target: 2000, // 2000 calories
    unit: 'cal',
    label: 'Calories',
    icon: <Apple className="w-4 h-4 text-amber-500" />,
    color: '#f59e0b'
  };

  const exerciseProgress: ProgressTarget = {
    current: exerciseMinutes,
    target: 30, // 30 minutes
    unit: 'min',
    label: 'Exercise',
    icon: <Dumbbell className="w-4 h-4 text-green-500" />,
    color: '#10b981'
  };

  return (
    <ProgressIndicators
      waterProgress={waterProgress}
      foodProgress={foodProgress}
      exerciseProgress={exerciseProgress}
      overallScore={healthScore}
      previousScore={previousScore}
      isLoading={isLoading}
      className={className}
    />
  );
}