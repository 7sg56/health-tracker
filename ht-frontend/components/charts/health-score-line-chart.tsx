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
  ReferenceLine,
  Brush,
  ReferenceArea,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DailyHealthIndex } from '@/lib/types/health';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, ZoomIn, ZoomOut } from 'lucide-react';

interface HealthScoreLineChartProps {
  data: DailyHealthIndex[];
  isLoading?: boolean;
  className?: string;
  showBrush?: boolean;
  showZoom?: boolean;
  height?: number;
  title?: string;
  description?: string;
}

export function HealthScoreLineChart({
  data,
  isLoading = false,
  className,
  showBrush = false,
  showZoom = false,
  height = 300,
  title = 'Health Score Trend',
  description = 'Your health score over time',
}: HealthScoreLineChartProps) {
  const [zoomDomain, setZoomDomain] = React.useState<{
    left?: number;
    right?: number;
  }>({});
  const [isZooming, setIsZooming] = React.useState(false);

  const chartData = React.useMemo(() => {
    return data
      .map(item => ({
        ...item,
        displayDate: format(parseISO(item.date), 'MMM dd'),
        fullDate: format(parseISO(item.date), 'EEEE, MMMM dd, yyyy'),
        scoreColor:
          item.healthScore >= 80
            ? '#10b981'
            : item.healthScore >= 60
              ? '#f59e0b'
              : '#ef4444',
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const stats = React.useMemo(() => {
    if (chartData.length === 0) return null;

    const scores = chartData.map(d => d.healthScore);
    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (scores.length >= 2) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const firstAvg =
        firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 3) trend = 'up';
      else if (secondAvg < firstAvg - 3) trend = 'down';
    }

    return { average, max, min, trend };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background rounded-lg border p-4 shadow-lg">
          <p className="mb-2 text-sm font-medium">{data.fullDate}</p>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: data.scoreColor }}
            />
            <span className="text-sm">
              Health Score: {data.healthScore}/100
            </span>
          </div>
          <div className="text-muted-foreground mt-2 text-xs">
            {data.healthScore >= 80
              ? 'Excellent performance!'
              : data.healthScore >= 60
                ? 'Good progress'
                : 'Room for improvement'}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleZoomIn = () => {
    if (chartData.length > 0) {
      const midPoint = Math.floor(chartData.length / 2);
      const quarterLength = Math.floor(chartData.length / 4);
      setZoomDomain({
        left: Math.max(0, midPoint - quarterLength),
        right: Math.min(chartData.length - 1, midPoint + quarterLength),
      });
    }
  };

  const handleZoomOut = () => {
    setZoomDomain({});
  };

  const handleMouseDown = (e: any) => {
    if (showZoom && e) {
      setIsZooming(true);
      setZoomDomain({ left: e.activeLabel });
    }
  };

  const handleMouseMove = (e: any) => {
    if (isZooming && e) {
      setZoomDomain(prev => ({ ...prev, right: e.activeLabel }));
    }
  };

  const handleMouseUp = () => {
    setIsZooming(false);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`bg-muted animate-pulse rounded-md`}
            style={{ height }}
          />
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
          <div className="py-8 text-center">
            <div className="mb-2 text-4xl">📈</div>
            <div className="text-muted-foreground text-sm">
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
              {title}
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
            <CardDescription>{description}</CardDescription>
          </div>

          {showZoom && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistics */}
          {stats && (
            <div className="bg-muted/50 grid grid-cols-3 gap-4 rounded-lg p-3">
              <div className="text-center">
                <div className="text-primary text-lg font-bold">
                  {Math.round(stats.average)}
                </div>
                <div className="text-muted-foreground text-xs">Average</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {stats.max}
                </div>
                <div className="text-muted-foreground text-xs">Best</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {stats.min}
                </div>
                <div className="text-muted-foreground text-xs">Lowest</div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="displayDate"
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  domain={
                    zoomDomain.left !== undefined
                      ? [zoomDomain.left, zoomDomain.right || 'dataMax']
                      : ['dataMin', 'dataMax']
                  }
                />
                <YAxis
                  domain={[0, 100]}
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Reference lines for score thresholds */}
                <ReferenceLine
                  y={80}
                  stroke="#10b981"
                  strokeDasharray="2 2"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={60}
                  stroke="#f59e0b"
                  strokeDasharray="2 2"
                  strokeOpacity={0.5}
                />

                {/* Zoom area */}
                {isZooming &&
                  zoomDomain.left !== undefined &&
                  zoomDomain.right !== undefined && (
                    <ReferenceArea
                      x1={zoomDomain.left}
                      x2={zoomDomain.right}
                      strokeOpacity={0.3}
                      fillOpacity={0.1}
                    />
                  )}

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
                />

                {showBrush && (
                  <Brush
                    dataKey="displayDate"
                    height={30}
                    stroke="hsl(var(--primary))"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
