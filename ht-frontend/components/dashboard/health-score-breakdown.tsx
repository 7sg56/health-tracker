'use client';

import * as React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HealthScoreBreakdown } from '@/lib/types/health';

interface HealthScoreBreakdownProps {
  breakdown: HealthScoreBreakdown | null;
  isLoading?: boolean;
  showChart?: boolean;
  className?: string;
}

const COLORS = {
  water: '#3b82f6',
  food: '#f59e0b',
  exercise: '#10b981',
};

export function HealthScoreBreakdownComponent({
  breakdown,
  isLoading = false,
  showChart = true,
  className,
}: HealthScoreBreakdownProps) {
  const chartData = React.useMemo(() => {
    if (!breakdown) return [];

    return [
      { name: 'Water', value: breakdown.water, color: COLORS.water },
      { name: 'Food', value: breakdown.food, color: COLORS.food },
      { name: 'Exercise', value: breakdown.exercise, color: COLORS.exercise },
    ];
  }, [breakdown]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      payload: { color: string };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background rounded-lg border p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.payload.color }} className="text-sm">
            Score: {data.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>Individual component scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {showChart && (
              <div className="bg-muted h-[200px] animate-pulse rounded-md" />
            )}
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="bg-muted h-12 animate-pulse rounded-md"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>Individual component scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="mb-2 text-4xl">📈</div>
            <div className="text-muted-foreground text-sm">
              No breakdown data available
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
        <CardDescription>
          Individual component scores contributing to your health score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          {showChart && (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Component Details</h4>

            <div className="space-y-4">
              {/* Water */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS.water }}
                    />
                    <span className="text-sm font-medium">💧 Water Intake</span>
                  </div>
                  <span className="text-sm font-bold">{breakdown.water}%</span>
                </div>
                <Progress value={breakdown.water} className="h-2" />
                <div className="text-muted-foreground text-xs">
                  {breakdown.water >= 80
                    ? 'Excellent hydration!'
                    : breakdown.water >= 60
                      ? 'Good hydration level'
                      : 'Need more water intake'}
                </div>
              </div>

              {/* Food */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS.food }}
                    />
                    <span className="text-sm font-medium">🍎 Nutrition</span>
                  </div>
                  <span className="text-sm font-bold">{breakdown.food}%</span>
                </div>
                <Progress value={breakdown.food} className="h-2" />
                <div className="text-muted-foreground text-xs">
                  {breakdown.food >= 80
                    ? 'Great calorie balance!'
                    : breakdown.food >= 60
                      ? 'Good nutritional intake'
                      : 'Consider adjusting calorie intake'}
                </div>
              </div>

              {/* Exercise */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS.exercise }}
                    />
                    <span className="text-sm font-medium">🏃 Exercise</span>
                  </div>
                  <span className="text-sm font-bold">
                    {breakdown.exercise}%
                  </span>
                </div>
                <Progress value={breakdown.exercise} className="h-2" />
                <div className="text-muted-foreground text-xs">
                  {breakdown.exercise >= 80
                    ? 'Excellent activity level!'
                    : breakdown.exercise >= 60
                      ? 'Good exercise routine'
                      : 'More physical activity recommended'}
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health Score</span>
              <span className="text-primary text-lg font-bold">
                {breakdown.total}%
              </span>
            </div>
            <Progress value={breakdown.total} className="mt-2 h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
