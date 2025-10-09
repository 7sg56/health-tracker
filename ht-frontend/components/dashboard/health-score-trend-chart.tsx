'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DailyHealthIndex, HealthScoreBreakdown } from '@/lib/types/health';
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react';

interface HealthScoreTrendChartProps {
  healthScores: DailyHealthIndex[];
  breakdowns?: HealthScoreBreakdown[];
  isLoading?: boolean;
  className?: string;
  showPeriodSelector?: boolean;
  defaultPeriod?: '7d' | '30d' | '90d';
}

export function HealthScoreTrendChart({
  healthScores,
  breakdowns = [],
  isLoading = false,
  className,
  showPeriodSelector = true,
  defaultPeriod = '7d',
}: HealthScoreTrendChartProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState<
    '7d' | '30d' | '90d'
  >(defaultPeriod);
  const [chartType, setChartType] = React.useState<'line' | 'area' | 'bar'>(
    'line'
  );
  const [activeDataPoint, setActiveDataPoint] = React.useState<any>(null);

  const chartData = React.useMemo(() => {
    const days =
      selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;

    const periodData = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dateString = format(date, 'yyyy-MM-dd');
      const displayDate = format(
        date,
        selectedPeriod === '7d' ? 'MMM dd' : 'MM/dd'
      );

      const healthScore = healthScores.find(
        score => format(new Date(score.date), 'yyyy-MM-dd') === dateString
      );

      // Find corresponding breakdown data
      const breakdown = breakdowns.find((b, index) => {
        // Assuming breakdowns are in the same order as health scores
        const scoreIndex = healthScores.findIndex(
          score => format(new Date(score.date), 'yyyy-MM-dd') === dateString
        );
        return index === scoreIndex;
      });

      return {
        date: dateString,
        displayDate,
        healthScore: healthScore?.healthScore || 0,
        water: breakdown?.water || 0,
        food: breakdown?.food || 0,
        exercise: breakdown?.exercise || 0,
        hasData: !!healthScore,
      };
    });

    return periodData;
  }, [healthScores, breakdowns, selectedPeriod]);

  // Calculate trend and statistics
  const stats = React.useMemo(() => {
    const validScores = chartData
      .filter(d => d.hasData)
      .map(d => d.healthScore);
    if (validScores.length === 0) return null;

    const average =
      validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    const max = Math.max(...validScores);
    const min = Math.min(...validScores);

    // Calculate trend (simple linear regression slope)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (validScores.length >= 2) {
      const firstHalf = validScores.slice(
        0,
        Math.floor(validScores.length / 2)
      );
      const secondHalf = validScores.slice(Math.floor(validScores.length / 2));
      const firstAvg =
        firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 2) trend = 'up';
      else if (secondAvg < firstAvg - 2) trend = 'down';
    }

    return { average, max, min, trend, dataPoints: validScores.length };
  }, [chartData]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
      payload?: any;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-background min-w-[200px] rounded-lg border p-4 shadow-lg">
          <p className="mb-2 text-sm font-medium">
            {format(new Date(data?.date || label), 'EEEE, MMM dd, yyyy')}
          </p>
          {payload.map((entry, index: number) => (
            <div key={index} className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.name}</span>
              </div>
              <span className="text-sm font-medium">
                {entry.value}
                {entry.name === 'Health Score' ? '/100' : '%'}
              </span>
            </div>
          ))}
          {data && !data.hasData && (
            <p className="text-muted-foreground mt-2 text-xs">
              No data recorded for this day
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleDataPointClick = (data: any) => {
    setActiveDataPoint(data);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Health Score Trends</CardTitle>
          <CardDescription>Your health score over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="bg-muted h-8 w-16 animate-pulse rounded-md"
                />
              ))}
            </div>
            <div className="bg-muted h-[400px] animate-pulse rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient
                id="healthScoreGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayDate"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={70}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="2 2"
            />
            <Area
              type="monotone"
              dataKey="healthScore"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#healthScoreGradient)"
              name="Health Score"
              onClick={handleDataPointClick}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayDate"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={70}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="2 2"
            />
            <Bar
              dataKey="healthScore"
              fill="hsl(var(--primary))"
              name="Health Score"
              radius={[4, 4, 0, 0]}
              onClick={handleDataPointClick}
            />
          </BarChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayDate"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={70}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="2 2"
            />
            <Line
              type="monotone"
              dataKey="healthScore"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: 'hsl(var(--primary))',
                strokeWidth: 2,
              }}
              name="Health Score"
              onClick={handleDataPointClick}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Health Score Trends
              {stats && (
                <Badge
                  variant={
                    stats.trend === 'up'
                      ? 'default'
                      : stats.trend === 'down'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {stats.trend === 'up' && (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  )}
                  {stats.trend === 'down' && (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {stats.trend === 'stable' && (
                    <Minus className="mr-1 h-3 w-3" />
                  )}
                  {stats.trend === 'up'
                    ? 'Improving'
                    : stats.trend === 'down'
                      ? 'Declining'
                      : 'Stable'}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Your health score over the last{' '}
              {selectedPeriod === '7d'
                ? '7 days'
                : selectedPeriod === '30d'
                  ? '30 days'
                  : '90 days'}
            </CardDescription>
          </div>

          {showPeriodSelector && (
            <div className="flex gap-2">
              <div className="flex rounded-md border">
                <Button
                  variant={chartType === 'line' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className="rounded-r-none"
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'area' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('area')}
                  className="rounded-none"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className="rounded-l-none"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Period Selector */}
          {showPeriodSelector && (
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <div className="flex rounded-md border">
                {(['7d', '30d', '90d'] as const).map(period => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className={
                      period === '7d'
                        ? 'rounded-r-none'
                        : period === '90d'
                          ? 'rounded-l-none'
                          : 'rounded-none'
                    }
                  >
                    {period === '7d'
                      ? '7 Days'
                      : period === '30d'
                        ? '30 Days'
                        : '90 Days'}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Summary */}
          {stats && (
            <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-primary text-2xl font-bold">
                  {Math.round(stats.average)}
                </div>
                <div className="text-muted-foreground text-xs">Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.max}
                </div>
                <div className="text-muted-foreground text-xs">Best</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.min}
                </div>
                <div className="text-muted-foreground text-xs">Lowest</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.dataPoints}
                </div>
                <div className="text-muted-foreground text-xs">
                  Days Tracked
                </div>
              </div>
            </div>
          )}

          {/* Main Chart */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Breakdown Chart */}
          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="breakdown">Component Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="displayDate"
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="water"
                      fill="#3b82f6"
                      name="Water"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="food"
                      fill="#f59e0b"
                      name="Food"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="exercise"
                      fill="#10b981"
                      name="Exercise"
                      radius={[2, 2, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="healthScore"
                      stroke="#dc2626"
                      strokeWidth={2}
                      dot={{ fill: '#dc2626', strokeWidth: 2, r: 3 }}
                      name="Overall Score"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Component Averages */}
              <div className="grid grid-cols-3 gap-4 border-t pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      chartData.reduce((sum, day) => sum + day.water, 0) /
                        chartData.length
                    )}
                    %
                  </div>
                  <div className="text-muted-foreground text-xs">Avg Water</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {Math.round(
                      chartData.reduce((sum, day) => sum + day.food, 0) /
                        chartData.length
                    )}
                    %
                  </div>
                  <div className="text-muted-foreground text-xs">Avg Food</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      chartData.reduce((sum, day) => sum + day.exercise, 0) /
                        chartData.length
                    )}
                    %
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Avg Exercise
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
