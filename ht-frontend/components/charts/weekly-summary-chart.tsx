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
  ReferenceLine
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DailyHealthIndex, HealthScoreBreakdown } from "@/lib/types/health";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  parseISO,
  addWeeks,
  subWeeks,
  isSameDay
} from "date-fns";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  Target,
  Award,
  AlertCircle
} from "lucide-react";

interface WeeklySummaryChartProps {
  healthScores: DailyHealthIndex[];
  breakdowns?: HealthScoreBreakdown[];
  isLoading?: boolean;
  className?: string;
  height?: number;
  initialWeek?: Date;
}

export function WeeklySummaryChart({
  healthScores,
  breakdowns = [],
  isLoading = false,
  className,
  height = 350,
  initialWeek = new Date()
}: WeeklySummaryChartProps) {
  const [currentWeek, setCurrentWeek] = React.useState(startOfWeek(initialWeek, { weekStartsOn: 1 })); // Monday start
  const [chartType, setChartType] = React.useState<'bar' | 'line' | 'area'>('bar');

  const weekData = React.useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysInWeek.map(day => {
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
        dayName: format(day, 'EEE'),
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
  }, [currentWeek, healthScores, breakdowns]);

  const weekStats = React.useMemo(() => {
    const validDays = weekData.filter(d => d.hasData);
    if (validDays.length === 0) return null;

    const totalScore = validDays.reduce((sum, day) => sum + day.healthScore, 0);
    const averageScore = totalScore / validDays.length;
    const bestDay = validDays.reduce((best, day) => day.healthScore > best.healthScore ? day : best);
    const worstDay = validDays.reduce((worst, day) => day.healthScore < worst.healthScore ? day : worst);
    
    const waterAvg = validDays.reduce((sum, day) => sum + day.water, 0) / validDays.length;
    const foodAvg = validDays.reduce((sum, day) => sum + day.food, 0) / validDays.length;
    const exerciseAvg = validDays.reduce((sum, day) => sum + day.exercise, 0) / validDays.length;

    // Calculate trend
    const firstHalf = validDays.slice(0, Math.ceil(validDays.length / 2));
    const secondHalf = validDays.slice(Math.ceil(validDays.length / 2));
    const firstAvg = firstHalf.reduce((sum, day) => sum + day.healthScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day.healthScore, 0) / secondHalf.length;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondAvg > firstAvg + 3) trend = 'improving';
    else if (secondAvg < firstAvg - 3) trend = 'declining';

    return {
      averageScore: Math.round(averageScore),
      bestDay,
      worstDay,
      daysTracked: validDays.length,
      waterAvg: Math.round(waterAvg),
      foodAvg: Math.round(foodAvg),
      exerciseAvg: Math.round(exerciseAvg),
      trend,
      consistency: (validDays.length / 7) * 100
    };
  }, [weekData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-4 shadow-lg min-w-[200px]">
          <p className="font-medium text-sm mb-2">{data.fullDate}</p>
          
          {data.hasData ? (
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

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
  };

  const renderChart = () => {
    const commonProps = {
      data: weekData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="dayName" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
            <Line
              type="monotone"
              dataKey="healthScore"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="healthScoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="dayName" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
            <Area
              type="monotone"
              dataKey="healthScore"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#healthScoreGradient)"
              connectNulls={false}
            />
          </AreaChart>
        );
      
      default:
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="dayName" className="text-xs" />
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
              strokeWidth={2}
              dot={{ fill: "#dc2626", r: 3 }}
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
          <CardTitle>Weekly Summary</CardTitle>
          <CardDescription>Your health performance this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
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
              <Calendar className="w-5 h-5" />
              Weekly Summary
              {weekStats && (
                <Badge variant={weekStats.trend === 'improving' ? 'default' : weekStats.trend === 'declining' ? 'destructive' : 'secondary'}>
                  {weekStats.trend === 'improving' && <TrendingUp className="w-3 h-3 mr-1" />}
                  {weekStats.trend === 'declining' && <TrendingDown className="w-3 h-3 mr-1" />}
                  {weekStats.trend === 'stable' && <Target className="w-3 h-3 mr-1" />}
                  {weekStats.trend === 'improving' ? 'Improving' : weekStats.trend === 'declining' ? 'Declining' : 'Stable'}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Week of {format(currentWeek, 'MMM dd')} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM dd, yyyy')}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
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
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="w-4 h-4" />
              Previous Week
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            >
              This Week
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              Next Week
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Week Statistics */}
          {weekStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{weekStats.averageScore}</div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{weekStats.bestDay.healthScore}</div>
                <div className="text-xs text-muted-foreground">Best Day</div>
                <div className="text-xs text-green-600">{weekStats.bestDay.dayOfWeek}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{weekStats.worstDay.healthScore}</div>
                <div className="text-xs text-muted-foreground">Lowest Day</div>
                <div className="text-xs text-red-600">{weekStats.worstDay.dayOfWeek}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{weekStats.daysTracked}/7</div>
                <div className="text-xs text-muted-foreground">Days Tracked</div>
                <div className="text-xs text-blue-600">{Math.round(weekStats.consistency)}%</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {weekStats.consistency >= 80 ? (
                    <Award className="w-5 h-5 text-yellow-500" />
                  ) : weekStats.consistency >= 60 ? (
                    <Target className="w-5 h-5 text-blue-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
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

          {/* Component Averages */}
          {weekStats && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{weekStats.waterAvg}%</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Water Average</div>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{weekStats.foodAvg}%</div>
                <div className="text-xs text-amber-700 dark:text-amber-300">Food Average</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{weekStats.exerciseAvg}%</div>
                <div className="text-xs text-green-700 dark:text-green-300">Exercise Average</div>
              </div>
            </div>
          )}

          {/* Week Goals */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-medium mb-2">Week Goals & Insights</h4>
            <div className="space-y-2 text-sm">
              {weekStats ? (
                <>
                  {weekStats.consistency >= 80 && (
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Award className="w-4 h-4" />
                      Excellent consistency! You tracked {weekStats.daysTracked} out of 7 days.
                    </div>
                  )}
                  {weekStats.averageScore >= 80 && (
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <TrendingUp className="w-4 h-4" />
                      Outstanding performance with an average score of {weekStats.averageScore}!
                    </div>
                  )}
                  {weekStats.trend === 'improving' && (
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <TrendingUp className="w-4 h-4" />
                      Great progress! Your scores are improving throughout the week.
                    </div>
                  )}
                  {weekStats.consistency < 60 && (
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4" />
                      Try to track your health data more consistently for better insights.
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground">
                  Start tracking your daily health activities to see weekly insights!
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}