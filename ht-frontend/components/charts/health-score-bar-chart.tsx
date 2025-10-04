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
  ReferenceLine,
  Cell,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DailyHealthIndex, HealthScoreBreakdown } from "@/lib/types/health";
import { format, parseISO } from "date-fns";
import { BarChart3, Calendar } from "lucide-react";

interface HealthScoreBarChartProps {
  healthScores: DailyHealthIndex[];
  breakdowns?: HealthScoreBreakdown[];
  isLoading?: boolean;
  className?: string;
  height?: number;
  title?: string;
  description?: string;
  showBreakdown?: boolean;
  colorByScore?: boolean;
}

export function HealthScoreBarChart({
  healthScores,
  breakdowns = [],
  isLoading = false,
  className,
  height = 300,
  title = "Daily Health Scores",
  description = "Your daily health score breakdown",
  showBreakdown = false,
  colorByScore = true
}: HealthScoreBarChartProps) {
  const [selectedBar, setSelectedBar] = React.useState<number | null>(null);

  const chartData = React.useMemo(() => {
    return healthScores.map((score, index) => {
      const breakdown = breakdowns[index];
      return {
        ...score,
        displayDate: format(parseISO(score.date), 'MMM dd'),
        fullDate: format(parseISO(score.date), 'EEEE, MMMM dd, yyyy'),
        water: breakdown?.water || 0,
        food: breakdown?.food || 0,
        exercise: breakdown?.exercise || 0,
        scoreColor: score.healthScore >= 80 ? '#10b981' : 
                   score.healthScore >= 60 ? '#f59e0b' : '#ef4444',
        scoreCategory: score.healthScore >= 80 ? 'excellent' : 
                      score.healthScore >= 60 ? 'good' : 'needs-improvement'
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [healthScores, breakdowns]);

  const stats = React.useMemo(() => {
    if (chartData.length === 0) return null;

    const scores = chartData.map(d => d.healthScore);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const excellentDays = chartData.filter(d => d.scoreCategory === 'excellent').length;
    const goodDays = chartData.filter(d => d.scoreCategory === 'good').length;
    const improvementDays = chartData.filter(d => d.scoreCategory === 'needs-improvement').length;

    return { 
      average, 
      excellentDays, 
      goodDays, 
      improvementDays,
      totalDays: chartData.length
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-4 shadow-lg min-w-[200px]">
          <p className="font-medium text-sm mb-2">{data.fullDate}</p>
          
          {showBreakdown ? (
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
                  <span className="text-sm font-medium">Overall Score:</span>
                  <span className="text-sm font-bold">{data.healthScore}/100</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: data.scoreColor }}
              />
              <span className="text-sm">Health Score: {data.healthScore}/100</span>
            </div>
          )}
          
          <div className="mt-2 text-xs text-muted-foreground">
            {data.scoreCategory === 'excellent' ? "Excellent performance!" : 
             data.scoreCategory === 'good' ? "Good progress" : 
             "Room for improvement"}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any, index: number) => {
    setSelectedBar(selectedBar === index ? null : index);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`bg-muted animate-pulse rounded-md`} style={{ height }} />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-sm text-muted-foreground">
              No health score data available
            </div>
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
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{Math.round(stats.average)}</div>
                <div className="text-xs text-muted-foreground">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{stats.excellentDays}</div>
                <div className="text-xs text-muted-foreground">Excellent Days</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-600">{stats.goodDays}</div>
                <div className="text-xs text-muted-foreground">Good Days</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{stats.improvementDays}</div>
                <div className="text-xs text-muted-foreground">Need Improvement</div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
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
                
                {/* Reference lines for score thresholds */}
                <ReferenceLine y={80} stroke="#10b981" strokeDasharray="2 2" strokeOpacity={0.5} />
                <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="2 2" strokeOpacity={0.5} />
                
                {showBreakdown ? (
                  <>
                    <Legend />
                    <Bar 
                      dataKey="water" 
                      stackId="breakdown"
                      fill="#3b82f6" 
                      name="Water"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="food" 
                      stackId="breakdown"
                      fill="#f59e0b" 
                      name="Food"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="exercise" 
                      stackId="breakdown"
                      fill="#10b981" 
                      name="Exercise"
                      radius={[4, 4, 0, 0]}
                    />
                  </>
                ) : (
                  <Bar 
                    dataKey="healthScore" 
                    name="Health Score"
                    radius={[4, 4, 0, 0]}
                    onClick={handleBarClick}
                  >
                    {colorByScore && chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={selectedBar === index ? entry.scoreColor : entry.scoreColor + '80'}
                        stroke={selectedBar === index ? entry.scoreColor : 'none'}
                        strokeWidth={selectedBar === index ? 2 : 0}
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Distribution */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((stats?.excellentDays || 0) / (stats?.totalDays || 1) * 100)}%
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">Excellent Days</div>
              <div className="text-xs text-muted-foreground">(80+ score)</div>
            </div>
            <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {Math.round((stats?.goodDays || 0) / (stats?.totalDays || 1) * 100)}%
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300">Good Days</div>
              <div className="text-xs text-muted-foreground">(60-79 score)</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Math.round((stats?.improvementDays || 0) / (stats?.totalDays || 1) * 100)}%
              </div>
              <div className="text-xs text-red-700 dark:text-red-300">Need Improvement</div>
              <div className="text-xs text-muted-foreground">(&lt;60 score)</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}