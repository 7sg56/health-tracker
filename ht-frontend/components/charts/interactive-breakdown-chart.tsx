"use client";

import * as React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Brush,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DailyHealthIndex, HealthScoreBreakdown } from "@/lib/types/health";
import { format, parseISO } from "date-fns";
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Target, 
  TrendingUp,
  Info,
  Calendar
} from "lucide-react";

interface InteractiveBreakdownChartProps {
  healthScores: DailyHealthIndex[];
  breakdowns: HealthScoreBreakdown[];
  isLoading?: boolean;
  className?: string;
  height?: number;
  title?: string;
  description?: string;
}

const COLORS = {
  water: '#3b82f6',
  food: '#f59e0b', 
  exercise: '#10b981',
  overall: '#dc2626'
};

export function InteractiveBreakdownChart({
  healthScores,
  breakdowns,
  isLoading = false,
  className,
  height = 400,
  title = "Health Score Breakdown Analysis",
  description = "Interactive breakdown of your health score components"
}: InteractiveBreakdownChartProps) {
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);
  const [activeView, setActiveView] = React.useState<'composed' | 'pie' | 'radial'>('composed');

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
        waterTarget: 100,
        foodTarget: 100,
        exerciseTarget: 100,
        // Calculate component contributions to overall score
        waterContribution: ((breakdown?.water || 0) / 3),
        foodContribution: ((breakdown?.food || 0) / 3),
        exerciseContribution: ((breakdown?.exercise || 0) / 3),
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [healthScores, breakdowns]);

  const selectedDayData = React.useMemo(() => {
    if (selectedDay === null || !chartData[selectedDay]) return null;
    
    const data = chartData[selectedDay];
    return [
      { name: 'Water', value: data.water, color: COLORS.water, target: 100 },
      { name: 'Food', value: data.food, color: COLORS.food, target: 100 },
      { name: 'Exercise', value: data.exercise, color: COLORS.exercise, target: 100 },
    ];
  }, [selectedDay, chartData]);

  const averageBreakdown = React.useMemo(() => {
    if (chartData.length === 0) return null;
    
    const totals = chartData.reduce((acc, day) => ({
      water: acc.water + day.water,
      food: acc.food + day.food,
      exercise: acc.exercise + day.exercise,
      overall: acc.overall + day.healthScore
    }), { water: 0, food: 0, exercise: 0, overall: 0 });

    return {
      water: Math.round(totals.water / chartData.length),
      food: Math.round(totals.food / chartData.length),
      exercise: Math.round(totals.exercise / chartData.length),
      overall: Math.round(totals.overall / chartData.length)
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-4 shadow-lg min-w-[250px]">
          <p className="font-medium text-sm mb-3">{data.fullDate}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Water Score</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{data.water}%</span>
                <div className="text-xs text-muted-foreground">
                  Contributes {data.waterContribution.toFixed(1)} pts
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm">Food Score</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{data.food}%</span>
                <div className="text-xs text-muted-foreground">
                  Contributes {data.foodContribution.toFixed(1)} pts
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Exercise Score</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{data.exercise}%</span>
                <div className="text-xs text-muted-foreground">
                  Contributes {data.exerciseContribution.toFixed(1)} pts
                </div>
              </div>
            </div>
            
            <div className="border-t pt-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Score</span>
                <span className="text-lg font-bold text-primary">{data.healthScore}/100</span>
              </div>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            Click to view detailed breakdown
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any, index: number) => {
    setSelectedDay(selectedDay === index ? null : index);
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={activeView === 'composed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('composed')}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant={activeView === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('pie')}
            >
              <PieChartIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={activeView === 'radial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('radial')}
            >
              <Target className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Average Breakdown Summary */}
          {averageBreakdown && (
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{averageBreakdown.water}%</div>
                <div className="text-xs text-muted-foreground">Avg Water</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{averageBreakdown.food}%</div>
                <div className="text-xs text-muted-foreground">Avg Food</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{averageBreakdown.exercise}%</div>
                <div className="text-xs text-muted-foreground">Avg Exercise</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{averageBreakdown.overall}</div>
                <div className="text-xs text-muted-foreground">Avg Overall</div>
              </div>
            </div>
          )}

          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
            <TabsContent value="composed" className="space-y-4">
              <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                    <Legend />
                    
                    {/* Reference lines */}
                    <ReferenceLine y={80} stroke="#10b981" strokeDasharray="2 2" strokeOpacity={0.3} />
                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="2 2" strokeOpacity={0.3} />
                    
                    {/* Component bars */}
                    <Bar 
                      dataKey="water" 
                      fill={COLORS.water}
                      name="Water"
                      radius={[2, 2, 0, 0]}
                      onClick={handleBarClick}
                    />
                    <Bar 
                      dataKey="food" 
                      fill={COLORS.food}
                      name="Food"
                      radius={[2, 2, 0, 0]}
                      onClick={handleBarClick}
                    />
                    <Bar 
                      dataKey="exercise" 
                      fill={COLORS.exercise}
                      name="Exercise"
                      radius={[2, 2, 0, 0]}
                      onClick={handleBarClick}
                    />
                    
                    {/* Overall score line */}
                    <Line
                      type="monotone"
                      dataKey="healthScore"
                      stroke={COLORS.overall}
                      strokeWidth={3}
                      dot={{ fill: COLORS.overall, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: COLORS.overall, strokeWidth: 2 }}
                      name="Overall Score"
                    />
                    
                    <Brush 
                      dataKey="displayDate" 
                      height={30} 
                      stroke="hsl(var(--primary))"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="pie" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Average Breakdown Pie */}
                <div>
                  <h4 className="text-sm font-medium mb-4 text-center">Average Component Distribution</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Water', value: averageBreakdown?.water || 0, color: COLORS.water },
                            { name: 'Food', value: averageBreakdown?.food || 0, color: COLORS.food },
                            { name: 'Exercise', value: averageBreakdown?.exercise || 0, color: COLORS.exercise },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {[COLORS.water, COLORS.food, COLORS.exercise].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Selected Day Breakdown */}
                {selectedDayData && (
                  <div>
                    <h4 className="text-sm font-medium mb-4 text-center">
                      Selected Day: {chartData[selectedDay!]?.displayDate}
                    </h4>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={selectedDayData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {selectedDayData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
              
              {!selectedDay && (
                <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                  <Info className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click on a bar in the composed chart to see detailed breakdown
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="radial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Average Radial Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-4 text-center">Average Performance</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="20%"
                        outerRadius="80%"
                        data={[
                          { name: 'Water', value: averageBreakdown?.water || 0, fill: COLORS.water },
                          { name: 'Food', value: averageBreakdown?.food || 0, fill: COLORS.food },
                          { name: 'Exercise', value: averageBreakdown?.exercise || 0, fill: COLORS.exercise },
                        ]}
                      >
                        <RadialBar dataKey="value" cornerRadius={10} />
                        <Legend />
                        <Tooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Selected Day Radial Chart */}
                {selectedDayData && (
                  <div>
                    <h4 className="text-sm font-medium mb-4 text-center">
                      {chartData[selectedDay!]?.fullDate}
                    </h4>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="20%"
                          outerRadius="80%"
                          data={selectedDayData}
                        >
                          <RadialBar dataKey="value" cornerRadius={10} />
                          <Legend />
                          <Tooltip />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Selected Day Details */}
          {selectedDay !== null && chartData[selectedDay] && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Day Details: {chartData[selectedDay].fullDate}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedDay(null)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{chartData[selectedDay].water}%</div>
                  <div className="text-xs text-muted-foreground">Water Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{chartData[selectedDay].food}%</div>
                  <div className="text-xs text-muted-foreground">Food Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{chartData[selectedDay].exercise}%</div>
                  <div className="text-xs text-muted-foreground">Exercise Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{chartData[selectedDay].healthScore}</div>
                  <div className="text-xs text-muted-foreground">Overall Score</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}