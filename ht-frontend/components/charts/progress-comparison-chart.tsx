"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Legend,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DailyHealthIndex, HealthScoreBreakdown } from "@/lib/types/health";
import { 
  format, 
  subDays, 
  subWeeks, 
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  eachDayOfInterval
} from "date-fns";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  Activity,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface ProgressComparisonChartProps {
  healthScores: DailyHealthIndex[];
  breakdowns?: HealthScoreBreakdown[];
  isLoading?: boolean;
  className?: string;
  height?: number;
}

interface PeriodData {
  period: string;
  healthScore: number;
  water: number;
  food: number;
  exercise: number;
  daysTracked: number;
  totalDays: number;
  consistency: number;
}

export function ProgressComparisonChart({
  healthScores,
  breakdowns = [],
  isLoading = false,
  className,
  height = 400
}: ProgressComparisonChartProps) {
  const [comparisonType, setComparisonType] = React.useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [chartView, setChartView] = React.useState<'bar' | 'line' | 'radar'>('bar');

  const comparisonData = React.useMemo(() => {
    const now = new Date();
    let periods: PeriodData[] = [];

    if (comparisonType === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const weekScores = weekDays
          .map(day => {
            const dayString = format(day, 'yyyy-MM-dd');
            return healthScores.find(score => 
              format(parseISO(score.date), 'yyyy-MM-dd') === dayString
            );
          })
          .filter(Boolean) as DailyHealthIndex[];

        const weekBreakdowns = weekDays
          .map(day => {
            const dayString = format(day, 'yyyy-MM-dd');
            const scoreIndex = healthScores.findIndex(score => 
              format(parseISO(score.date), 'yyyy-MM-dd') === dayString
            );
            return scoreIndex >= 0 ? breakdowns[scoreIndex] : null;
          })
          .filter(Boolean) as HealthScoreBreakdown[];

        const avgScore = weekScores.length > 0 
          ? weekScores.reduce((sum, score) => sum + score.healthScore, 0) / weekScores.length 
          : 0;

        const avgWater = weekBreakdowns.length > 0
          ? weekBreakdowns.reduce((sum, b) => sum + b.water, 0) / weekBreakdowns.length
          : 0;

        const avgFood = weekBreakdowns.length > 0
          ? weekBreakdowns.reduce((sum, b) => sum + b.food, 0) / weekBreakdowns.length
          : 0;

        const avgExercise = weekBreakdowns.length > 0
          ? weekBreakdowns.reduce((sum, b) => sum + b.exercise, 0) / weekBreakdowns.length
          : 0;

        periods.push({
          period: i === 0 ? 'This Week' : `${i} Week${i > 1 ? 's' : ''} Ago`,
          healthScore: Math.round(avgScore),
          water: Math.round(avgWater),
          food: Math.round(avgFood),
          exercise: Math.round(avgExercise),
          daysTracked: weekScores.length,
          totalDays: 7,
          consistency: Math.round((weekScores.length / 7) * 100)
        });
      }
    } else if (comparisonType === 'monthly') {
      // Last 3 months
      for (let i = 2; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = endOfMonth(monthStart);
        const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

        const monthScores = monthDays
          .map(day => {
            const dayString = format(day, 'yyyy-MM-dd');
            return healthScores.find(score => 
              format(parseISO(score.date), 'yyyy-MM-dd') === dayString
            );
          })
          .filter(Boolean) as DailyHealthIndex[];

        const monthBreakdowns = monthDays
          .map(day => {
            const dayString = format(day, 'yyyy-MM-dd');
            const scoreIndex = healthScores.findIndex(score => 
              format(parseISO(score.date), 'yyyy-MM-dd') === dayString
            );
            return scoreIndex >= 0 ? breakdowns[scoreIndex] : null;
          })
          .filter(Boolean) as HealthScoreBreakdown[];

        const avgScore = monthScores.length > 0 
          ? monthScores.reduce((sum, score) => sum + score.healthScore, 0) / monthScores.length 
          : 0;

        const avgWater = monthBreakdowns.length > 0
          ? monthBreakdowns.reduce((sum, b) => sum + b.water, 0) / monthBreakdowns.length
          : 0;

        const avgFood = monthBreakdowns.length > 0
          ? monthBreakdowns.reduce((sum, b) => sum + b.food, 0) / monthBreakdowns.length
          : 0;

        const avgExercise = monthBreakdowns.length > 0
          ? monthBreakdowns.reduce((sum, b) => sum + b.exercise, 0) / monthBreakdowns.length
          : 0;

        periods.push({
          period: i === 0 ? 'This Month' : format(monthStart, 'MMM yyyy'),
          healthScore: Math.round(avgScore),
          water: Math.round(avgWater),
          food: Math.round(avgFood),
          exercise: Math.round(avgExercise),
          daysTracked: monthScores.length,
          totalDays: monthDays.length,
          consistency: Math.round((monthScores.length / monthDays.length) * 100)
        });
      }
    } else {
      // Last 4 quarters (3 months each)
      for (let i = 3; i >= 0; i--) {
        const quarterStart = startOfMonth(subMonths(now, i * 3 + 2));
        const quarterEnd = endOfMonth(subMonths(now, i * 3));
        const quarterDays = eachDayOfInterval({ start: quarterStart, end: quarterEnd });

        const quarterScores = quarterDays
          .map(day => {
            const dayString = format(day, 'yyyy-MM-dd');
            return healthScores.find(score => 
              format(parseISO(score.date), 'yyyy-MM-dd') === dayString
            );
          })
          .filter(Boolean) as DailyHealthIndex[];

        const quarterBreakdowns = quarterDays
          .map(day => {
            const dayString = format(day, 'yyyy-MM-dd');
            const scoreIndex = healthScores.findIndex(score => 
              format(parseISO(score.date), 'yyyy-MM-dd') === dayString
            );
            return scoreIndex >= 0 ? breakdowns[scoreIndex] : null;
          })
          .filter(Boolean) as HealthScoreBreakdown[];

        const avgScore = quarterScores.length > 0 
          ? quarterScores.reduce((sum, score) => sum + score.healthScore, 0) / quarterScores.length 
          : 0;

        const avgWater = quarterBreakdowns.length > 0
          ? quarterBreakdowns.reduce((sum, b) => sum + b.water, 0) / quarterBreakdowns.length
          : 0;

        const avgFood = quarterBreakdowns.length > 0
          ? quarterBreakdowns.reduce((sum, b) => sum + b.food, 0) / quarterBreakdowns.length
          : 0;

        const avgExercise = quarterBreakdowns.length > 0
          ? quarterBreakdowns.reduce((sum, b) => sum + b.exercise, 0) / quarterBreakdowns.length
          : 0;

        const quarterName = i === 0 ? 'This Quarter' : `Q${Math.ceil((12 - i * 3) / 3)} ${format(quarterStart, 'yyyy')}`;

        periods.push({
          period: quarterName,
          healthScore: Math.round(avgScore),
          water: Math.round(avgWater),
          food: Math.round(avgFood),
          exercise: Math.round(avgExercise),
          daysTracked: quarterScores.length,
          totalDays: quarterDays.length,
          consistency: Math.round((quarterScores.length / quarterDays.length) * 100)
        });
      }
    }

    return periods;
  }, [healthScores, breakdowns, comparisonType]);

  const trendAnalysis = React.useMemo(() => {
    if (comparisonData.length < 2) return null;

    const latest = comparisonData[comparisonData.length - 1];
    const previous = comparisonData[comparisonData.length - 2];

    const scoreTrend = latest.healthScore - previous.healthScore;
    const waterTrend = latest.water - previous.water;
    const foodTrend = latest.food - previous.food;
    const exerciseTrend = latest.exercise - previous.exercise;
    const consistencyTrend = latest.consistency - previous.consistency;

    return {
      score: { value: scoreTrend, direction: scoreTrend > 2 ? 'up' : scoreTrend < -2 ? 'down' : 'stable' },
      water: { value: waterTrend, direction: waterTrend > 2 ? 'up' : waterTrend < -2 ? 'down' : 'stable' },
      food: { value: foodTrend, direction: foodTrend > 2 ? 'up' : foodTrend < -2 ? 'down' : 'stable' },
      exercise: { value: exerciseTrend, direction: exerciseTrend > 2 ? 'up' : exerciseTrend < -2 ? 'down' : 'stable' },
      consistency: { value: consistencyTrend, direction: consistencyTrend > 2 ? 'up' : consistencyTrend < -2 ? 'down' : 'stable' }
    };
  }, [comparisonData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-4 shadow-lg min-w-[200px]">
          <p className="font-medium text-sm mb-2">{data.period}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">💧 Water:</span>
              <span className="text-sm font-medium">{data.water}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">🍎 Food:</span>
              <span className="text-sm font-medium">{data.food}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">🏃 Exercise:</span>
              <span className="text-sm font-medium">{data.exercise}%</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Health Score:</span>
                <span className="text-lg font-bold text-primary">{data.healthScore}/100</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Consistency: {data.consistency}% ({data.daysTracked}/{data.totalDays} days)
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: comparisonData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartView) {
      case 'line':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="period" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={70} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
            <Line
              type="monotone"
              dataKey="water"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              name="Water"
            />
            <Line
              type="monotone"
              dataKey="food"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: "#f59e0b", r: 4 }}
              name="Food"
            />
            <Line
              type="monotone"
              dataKey="exercise"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              name="Exercise"
            />
            <Line
              type="monotone"
              dataKey="healthScore"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ fill: "#dc2626", r: 5 }}
              name="Overall Score"
            />
          </ComposedChart>
        );
      
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={comparisonData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="period" className="text-xs" />
              <PolarRadiusAxis domain={[0, 100]} className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Water"
                dataKey="water"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Food"
                dataKey="food"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Exercise"
                dataKey="exercise"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="period" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={70} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
            <Bar dataKey="water" fill="#3b82f6" name="Water" radius={[2, 2, 0, 0]} />
            <Bar dataKey="food" fill="#f59e0b" name="Food" radius={[2, 2, 0, 0]} />
            <Bar dataKey="exercise" fill="#10b981" name="Exercise" radius={[2, 2, 0, 0]} />
            <Line
              type="monotone"
              dataKey="healthScore"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ fill: "#dc2626", r: 4 }}
              name="Overall Score"
            />
          </ComposedChart>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Progress Comparison</CardTitle>
          <CardDescription>Compare your progress across different time periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
            <div className={`bg-muted animate-pulse rounded-md`} style={{ height }} />
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
              <BarChart3 className="w-5 h-5" />
              Progress Comparison
            </CardTitle>
            <CardDescription>
              Compare your health metrics across different {comparisonType} periods
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={comparisonType === 'weekly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setComparisonType('weekly')}
                className="rounded-r-none"
              >
                Weekly
              </Button>
              <Button
                variant={comparisonType === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setComparisonType('monthly')}
                className="rounded-none"
              >
                Monthly
              </Button>
              <Button
                variant={comparisonType === 'quarterly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setComparisonType('quarterly')}
                className="rounded-l-none"
              >
                Quarterly
              </Button>
            </div>
            <div className="flex border rounded-md">
              <Button
                variant={chartView === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartView('bar')}
                className="rounded-r-none"
              >
                Bar
              </Button>
              <Button
                variant={chartView === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartView('line')}
                className="rounded-none"
              >
                Line
              </Button>
              <Button
                variant={chartView === 'radar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartView('radar')}
                className="rounded-l-none"
              >
                Radar
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Trend Analysis */}
          {trendAnalysis && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {trendAnalysis.score.direction === 'up' && <ArrowUpRight className="w-4 h-4 text-green-600" />}
                  {trendAnalysis.score.direction === 'down' && <ArrowDownRight className="w-4 h-4 text-red-600" />}
                  {trendAnalysis.score.direction === 'stable' && <Minus className="w-4 h-4 text-gray-600" />}
                  <span className="text-lg font-bold text-primary">
                    {trendAnalysis.score.value > 0 ? '+' : ''}{trendAnalysis.score.value}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {trendAnalysis.water.direction === 'up' && <ArrowUpRight className="w-4 h-4 text-green-600" />}
                  {trendAnalysis.water.direction === 'down' && <ArrowDownRight className="w-4 h-4 text-red-600" />}
                  {trendAnalysis.water.direction === 'stable' && <Minus className="w-4 h-4 text-gray-600" />}
                  <span className="text-lg font-bold text-blue-600">
                    {trendAnalysis.water.value > 0 ? '+' : ''}{trendAnalysis.water.value}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Water</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {trendAnalysis.food.direction === 'up' && <ArrowUpRight className="w-4 h-4 text-green-600" />}
                  {trendAnalysis.food.direction === 'down' && <ArrowDownRight className="w-4 h-4 text-red-600" />}
                  {trendAnalysis.food.direction === 'stable' && <Minus className="w-4 h-4 text-gray-600" />}
                  <span className="text-lg font-bold text-amber-600">
                    {trendAnalysis.food.value > 0 ? '+' : ''}{trendAnalysis.food.value}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Food</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {trendAnalysis.exercise.direction === 'up' && <ArrowUpRight className="w-4 h-4 text-green-600" />}
                  {trendAnalysis.exercise.direction === 'down' && <ArrowDownRight className="w-4 h-4 text-red-600" />}
                  {trendAnalysis.exercise.direction === 'stable' && <Minus className="w-4 h-4 text-gray-600" />}
                  <span className="text-lg font-bold text-green-600">
                    {trendAnalysis.exercise.value > 0 ? '+' : ''}{trendAnalysis.exercise.value}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Exercise</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {trendAnalysis.consistency.direction === 'up' && <ArrowUpRight className="w-4 h-4 text-green-600" />}
                  {trendAnalysis.consistency.direction === 'down' && <ArrowDownRight className="w-4 h-4 text-red-600" />}
                  {trendAnalysis.consistency.direction === 'stable' && <Minus className="w-4 h-4 text-gray-600" />}
                  <span className="text-lg font-bold text-purple-600">
                    {trendAnalysis.consistency.value > 0 ? '+' : ''}{trendAnalysis.consistency.value}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Consistency</div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Period Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonData.map((period, index) => (
              <div key={period.period} className="p-4 border rounded-lg">
                <div className="text-sm font-medium mb-2">{period.period}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Score:</span>
                    <span className="text-sm font-bold">{period.healthScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Consistency:</span>
                    <span className="text-sm">{period.consistency}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {period.daysTracked}/{period.totalDays} days tracked
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}