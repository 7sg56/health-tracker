'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
    icon?: React.ReactNode;
  };
  breadcrumb?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {breadcrumb && (
        <div className="text-muted-foreground text-sm">{breadcrumb}</div>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            className="flex items-center gap-2"
          >
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>

      <Separator />
    </div>
  );
}
