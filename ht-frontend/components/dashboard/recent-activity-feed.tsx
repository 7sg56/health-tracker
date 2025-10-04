"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WaterIntake, FoodIntake, Workout } from "@/lib/types/health";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'water' | 'food' | 'workout';
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface RecentActivityFeedProps {
  waterIntakes: WaterIntake[];
  foodIntakes: FoodIntake[];
  workouts: Workout[];
  isLoading?: boolean;
  maxItems?: number;
}

export function RecentActivityFeed({
  waterIntakes,
  foodIntakes,
  workouts,
  isLoading = false,
  maxItems = 10,
}: RecentActivityFeedProps) {
  const activities = React.useMemo(() => {
    const allActivities: ActivityItem[] = [];

    // Add water intake activities
    waterIntakes.forEach(water => {
      allActivities.push({
        id: `water-${water.id}`,
        type: 'water',
        description: `Drank ${water.amountLtr}L of water`,
        timestamp: water.createdAt,
        icon: '💧',
        color: 'text-blue-600'
      });
    });

    // Add food intake activities
    foodIntakes.forEach(food => {
      allActivities.push({
        id: `food-${food.id}`,
        type: 'food',
        description: `Ate ${food.foodItem} (${food.calories} cal)`,
        timestamp: food.createdAt,
        icon: '🍎',
        color: 'text-orange-600'
      });
    });

    // Add workout activities
    workouts.forEach(workout => {
      allActivities.push({
        id: `workout-${workout.id}`,
        type: 'workout',
        description: `${workout.activity} for ${workout.durationMin} min${workout.caloriesBurned ? ` (${workout.caloriesBurned} cal burned)` : ''}`,
        timestamp: workout.createdAt,
        icon: '🏃',
        color: 'text-green-600'
      });
    });

    // Sort by timestamp (most recent first) and limit
    return allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxItems);
  }, [waterIntakes, foodIntakes, workouts, maxItems]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest health tracking entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded-md w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest health tracking entries</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-sm text-muted-foreground">
              No recent activities. Start tracking your health!
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm">{activity.icon}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}