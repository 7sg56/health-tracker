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
  Area,
  AreaChart,
  ComposedChart,
  Legend,
  ReferenceLine,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DailyHealthIndex, HealthScoreBreakdown } from "@/lib/types/health";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  parseISO,
  addMonths,
  subMonths,
  isSameDay,
  getWeeksInMonth,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval
} from "date-fns";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  Target,
  Award,
  BarChart3,
  Activity
} from "lucide-react";

interface MonthlySummaryChartProps {
  healthScores: DailyHealthIndex[];
  breakdowns?: HealthScoreBreakdown[];
  isLoading?: boolean;
  className?: string;
  height?: number;
  initialMonth?: Date;
  viewType?: 'daily' | 'weekly';
}

export function MonthlySummaryChart({
  healthScores,
  breakdowns = [],
  isLoading = false,
  className,
  height = 400,
  initialMonth = new Date(),
  viewType: initialViewType = 'daily'
}: MonthlySummaryChartProps) {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(initialMonth));
  const [viewType, setViewType] = React.useState<'daily' | 'weekly'>(initialViewType);
  const [chartType, setChartType] = React.useState<'bar' | 'line' | 'area'>('bar');

  const monthData = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    if (viewType === 'weekly') {
      // Group by weeks
      const weeks = eachWeekOfInterval(
        { start: monthStart, end: monthEnd },
        { weekStartsOn: 1 }
      );

      return weeks.map((weekStart, index) => {
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

        return {
          date: format(weekStart, 'yyyy-MM-dd'),
          displayDate: `Week ${index + 1}`,
          fullDate: `Week of ${format(weekStart, 'MMM dd')}`,
          healthScore: Math.round(avgScore),
          water: Math.round(avgWater),
          food: Math.round(avgFood),
          exercise: Math.round(avgExercise),
          hasData: weekScores.length > 0,
          daysTracked: weekScores.length,
          totalDays: weekDays.filter(day => 
            day >= monthStart && day <= monthEnd
          ).length
        };
      });
    } else {
      // Daily view
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

      return daysInMonth.map(day => {
        const dayString = format(day, 'yyyy-MM-dd');
        const healthScore = healthScores.find(score => 
          format(parseISO(score.date), 'yyyy-MM-dd') === dayString
        );
        
        const breakdown = breakdowns.find((b, index) => {
          const scoreIndex = healthScores.findIndex(score => 
            format(parseISO(score.date), 'yyyy-MM-dd') === dayString
          );
          return index === scoreIndex;
        });

        return {
          date: dayString,
          displayDate: format(day, 'dd'),
          fullDate: format(day, 'EEEE, MMMM dd'),
          healthScore: healthScore?.healthScore || 0,
          water: breakdown?.water || 0,
          food: breakdown?.food || 0,
          exercise: breakdown?.exercise || 0,
          hasData: !!healthScore,
          isToday: isSameDay(day, new Date()),
          dayOfWeek: format(day, 'EEEE')
        };
      });
    }
  }, [currentMonth, healthScores, breakdowns, viewType]);

  const monthStats = React.useMemo(() => {
    const validEntries = monthData.filter(d => d.hasData);
    if (validEntries.length === 0) return null;

    const totalScore = validEntries.reduce((sum, entry) => sum + entry.healthScore, 0);
    const averageScore = totalScore / validEntries.length;
    const bestEntry = validEntries.reduce((best, entry) => entry.healthScore > best.healthScore ? entry : best);
    const worstEntry = validEntries.reduce((worst, entry) => entry.healthScore < worst.healthScore ? entry : worst);
    
    const waterAvg = validEntries.reduce((sum, entry) => sum + entry.water, 0) / validEntries.length;
    const foodAvg = validEntries.reduce((sum, entry) => sum + entry.food, 0) / validEntries.length;
    const exerciseAvg = validEntries.reduce((sum, entry) => sum + entry.exercise, 0) / validEntries.length;

    // Calculate trend
    const firstHalf = validEntries.slice(0, Math.ceil(validEntries.length / 2));
    const secondHalf = validEntries.slice(Math.ceil(validEntries.length / 2));
    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.healthScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.healthScore, 0) / secondHalf.length;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondAvg > firstAvg + 3) trend = 'improving';
    else if (secondAvg < firstAvg - 3) trend = 'declining';

    // Calculate consistency
    const totalPossibleEntries = viewType === 'weekly' 
      ? Math.ceil(monthData.length) 
      : monthData.length;
    const consistency = (validEntries.length / totalPossibleEntries) * 100;

    // Score distribution
    const excellentDays = validEntries.filter(d => d.healthScore >= 80).length;
    const goodDays = validEntries.filter(d => d.healthScore >= 60 && d.healthScore < 80).length;
    const improvementDays = validEntries.filter(d => d.healthScore < 60).length;

    return {
      averageScore: Math.round(averageScore),
      bestEntry,
      worstEntry,
      entriesTracked: validEntries.length,
      totalEntries: totalPossibleEntries,
      waterAvg: Math.round(waterAvg),
      foodAvg: Math.round(foodAvg),
      exerciseAvg: Math.round(exerciseAvg),
      trend,
      consistency: Math.round(consistency),
      excellentDays,
      goodDays,
      improvementDays
    };
  }, [monthData, viewType]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-4 shadow-lg min-w-[200px]">
          <p className="font-medium text-sm mb-2">{data.fullDate}</p>
          
          {data.hasData ? (
            <div className="space-y-2">
              {viewType === 'weekly' && (
                <div className="text-xs text-muted-foreground mb-2">
                  {data.daysTracked}/{data.totalDays} days tracked
                </div>
              )}
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
                  <span className="text-sm font-medium">
                    {viewType === 'weekly' ? 'Avg Score:' : 'Health Score:'}
                  </span>
                  <span className="text-lg font-bold text-primary">{data.healthScore}/100</span>
                </div>
              </div>
              {data.isToday && (
                <div className="text-xs text-blue-600 font-medium">Today</div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No data recorded</div>
          )}
        </div>
      );
    }
    return null;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const renderChart = () => {
    const commonProps = {
      data: monthData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="displayDate" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
            <Line
              type="monotone"
              dataKey="healthScore"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="monthlyHealthScoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="displayDate" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
            <Area
              type="monotone"
              dataKey="healthScore"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#monthlyHealthScoreGradient)"
              connectNulls={false}
            />
          </AreaChart>
        );
      
      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="displayDate" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
            <Bar dataKey="healthScore" name="Health Score" radius={[2, 2, 0, 0]}>
              {monthData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.healthScore >= 80 ? '#10b981' : 
                    entry.healthScore >= 60 ? '#f59e0b' : 
                    entry.healthScore > 0 ? '#ef4444' : '#e5e7eb'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>Your health performance this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 w-16 bg-muted animate-pulse rounded-md" />
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
              <Activity className="w-5 h-5" />
              Monthly Summary
              {monthStats && (
                <Badge variant={monthStats.trend === 'improving' ? 'default' : monthStats.trend === 'declining' ? 'destructive' : 'secondary'}>
                  {monthStats.trend === 'improving' && <TrendingUp className="w-3 h-3 mr-1" />}
                  {monthStats.trend === 'declining' && <TrendingDown className="w-3 h-3 mr-1" />}
                  {monthStats.trend === 'stable' && <Target className="w-3 h-3 mr-1" />}
                  {monthStats.trend === 'improving' ? 'Improving' : monthStats.trend === 'declining' ? 'Declining' : 'Stable'}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {format(currentMonth, 'MMMM yyyy')} - {viewType === 'weekly' ? 'Weekly' : 'Daily'} View
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={viewType === 'daily' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('daily')}
                className="rounded-r-none"
              >
                Daily
              </Button>
              <Button
                variant={viewType === 'weekly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('weekly')}
                className="rounded-l-none"
              >
                Weekly
              </Button>
            </div>
            <div className="flex border rounded-md">
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="rounded-r-none"
              >
                Bar
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="rounded-none"
              >
                Line
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('area')}
                className="rounded-l-none"
              >
                Area
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
              Previous Month
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentMonth(startOfMonth(new Date()))}
            >
              This Month
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              Next Month
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Month Statistics */}
          {monthStats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{monthStats.averageScore}</div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{monthStats.bestEntry.healthScore}</div>
                <div className="text-xs text-muted-foreground">Best {viewType === 'weekly' ? 'Week' : 'Day'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{monthStats.worstEntry.healthScore}</div>
                <div className="text-xs text-muted-foreground">Lowest {viewType === 'weekly' ? 'Week' : 'Day'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{monthStats.entriesTracked}/{monthStats.totalEntries}</div>
                <div className="text-xs text-muted-foreground">{viewType === 'weekly' ? 'Weeks' : 'Days'} Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{monthStats.consistency}%</div>
                <div className="text-xs text-muted-foreground">Consistency</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {monthStats.consistency >= 80 ? (
                    <Award className="w-5 h-5 text-yellow-500" />
                  ) : monthStats.consistency >= 60 ? (
                    <Target className="w-5 h-5 text-blue-500" />
                  ) : (
                    <BarChart3 className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Performance</div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Score Distribution & Component Averages */}
          {monthStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Score Distribution</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm">Excellent (80+)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{monthStats.excellentDays}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((monthStats.excellentDays / monthStats.entriesTracked) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-sm">Good (60-79)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-600">{monthStats.goodDays}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((monthStats.goodDays / monthStats.entriesTracked) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm">Needs Work (&lt;60)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">{monthStats.improvementDays}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((monthStats.improvementDays / monthStats.entriesTracked) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Component Averages */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Component Averages</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm">💧 Water</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">{monthStats.waterAvg}%</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-sm">🍎 Food</span>
                    </div>
                    <div className="text-lg font-bold text-amber-600">{monthStats.foodAvg}%</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm">🏃 Exercise</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">{monthStats.exerciseAvg}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}