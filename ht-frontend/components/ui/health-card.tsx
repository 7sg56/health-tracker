'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HealthCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  progress?: {
    value: number;
    max: number;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function HealthCard({
  title,
  value,
  description,
  icon,
  trend,
  progress,
  variant = 'default',
  className,
}: HealthCardProps) {
  const variantStyles = {
    default: 'border-border',
    success:
      'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20',
    warning:
      'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20',
    danger:
      'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20',
  };

  const iconStyles = {
    default: 'text-primary',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className={cn('h-4 w-4', iconStyles[variant])}>{icon}</div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="text-muted-foreground text-xs">
            {description}
          </CardDescription>
        )}

        {trend && (
          <div className="flex items-center pt-1">
            <Badge
              variant={trend.isPositive ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                trend.isPositive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </Badge>
            <span className="text-muted-foreground ml-2 text-xs">
              {trend.label}
            </span>
          </div>
        )}

        {progress && (
          <div className="space-y-2 pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {progress.label || 'Progress'}
              </span>
              <span className="font-medium">
                {progress.value}/{progress.max}
              </span>
            </div>
            <Progress
              value={(progress.value / progress.max) * 100}
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
