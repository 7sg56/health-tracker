import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import { Card, CardContent, CardHeader } from "./card";

// Dashboard skeleton components with staggered animations
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 sm:w-40" variant="shimmer" />
          <Skeleton className="h-4 w-48 sm:w-64" variant="shimmer" style={{ animationDelay: '0.1s' }} />
        </div>
        <Skeleton className="h-9 w-20 sm:w-24" variant="shimmer" style={{ animationDelay: '0.2s' }} />
      </div>

      {/* Main content grid skeleton */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Health score card skeleton */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card className="transition-all duration-300 hover:shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-40" variant="shimmer" style={{ animationDelay: '0.3s' }} />
              <Skeleton className="h-4 w-32" variant="shimmer" style={{ animationDelay: '0.4s' }} />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" variant="wave" style={{ animationDelay: '0.5s' }} />
                <Skeleton className="h-4 w-20 mx-auto" variant="shimmer" style={{ animationDelay: '0.6s' }} />
                <Skeleton className="h-6 w-24 mx-auto" variant="shimmer" style={{ animationDelay: '0.7s' }} />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" variant="shimmer" style={{ animationDelay: `${0.7 + i * 0.1}s` }} />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-8" variant="shimmer" style={{ animationDelay: `${0.8 + i * 0.1}s` }} />
                      <Skeleton className="h-2 w-20" variant="wave" style={{ animationDelay: `${0.9 + i * 0.1}s` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary and activity skeleton */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Summary cards skeleton */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Skeleton className="h-6 w-36" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="transition-all duration-300 hover:shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-20" variant="shimmer" style={{ animationDelay: `${1.2 + i * 0.1}s` }} />
                        <Skeleton className="h-6 w-6 rounded" variant="wave" style={{ animationDelay: `${1.3 + i * 0.1}s` }} />
                      </div>
                      <Skeleton className="h-8 w-16" variant="shimmer" style={{ animationDelay: `${1.4 + i * 0.1}s` }} />
                      <Skeleton className="h-4 w-24" variant="shimmer" style={{ animationDelay: `${1.5 + i * 0.1}s` }} />
                      <Skeleton className="h-2 w-full" variant="wave" style={{ animationDelay: `${1.6 + i * 0.1}s` }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Activity feed skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Form skeleton components
export function FormSkeleton({ 
  fields = 3, 
  hasSubmitButton = true,
  className 
}: { 
  fields?: number; 
  hasSubmitButton?: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 sm:h-10 w-full" />
          </div>
        ))}
        {hasSubmitButton && (
          <Skeleton className="h-11 sm:h-10 w-full" />
        )}
      </CardContent>
    </Card>
  );
}

// List skeleton components
export function ListSkeleton({ 
  items = 5,
  showHeader = true,
  className 
}: { 
  items?: number;
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-20" />
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Page skeleton components
export function PageSkeleton({ 
  showHeader = true,
  showSidebar = false,
  className 
}: { 
  showHeader?: boolean;
  showSidebar?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      )}
      
      <div className={cn(
        "grid gap-4 sm:gap-6",
        showSidebar ? "lg:grid-cols-4" : "lg:grid-cols-3"
      )}>
        {showSidebar && (
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className={cn(
          "space-y-4 sm:space-y-6",
          showSidebar ? "lg:col-span-3" : "lg:col-span-3"
        )}>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <FormSkeleton />
            <ListSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

// Chart skeleton component
export function ChartSkeleton({ 
  height = "h-64",
  showLegend = true,
  className 
}: { 
  height?: string;
  showLegend?: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className={cn("w-full", height)} />
        {showLegend && (
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Button loading states
export function ButtonSkeleton({ 
  size = "default",
  className 
}: { 
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-9 w-20",
    default: "h-10 w-24", 
    lg: "h-11 w-28"
  };

  return <Skeleton className={cn(sizeClasses[size], className)} />;
}

// Input loading states  
export function InputSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-11 sm:h-10 w-full", className)} />;
}

// Avatar loading states
export function AvatarSkeleton({ 
  size = "default",
  className 
}: { 
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12"
  };

  return <Skeleton className={cn(sizeClasses[size], "rounded-full", className)} />;
}