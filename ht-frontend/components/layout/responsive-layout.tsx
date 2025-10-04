"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile, useIsTablet, getResponsiveContainer } from "@/lib/utils/responsive";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

export function ResponsiveLayout({ 
  children, 
  className,
  maxWidth = "2xl",
  padding = "md"
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full"
  };

  const paddingClasses = {
    none: "",
    sm: "px-2 py-2 sm:px-4 sm:py-4",
    md: "px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
    lg: "px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12"
  };

  return (
    <div className={cn(
      "w-full mx-auto",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "md",
  className 
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-2 sm:gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8"
  };

  const gridCols = `grid-cols-${cols.mobile || 1} md:grid-cols-${cols.tablet || 2} lg:grid-cols-${cols.desktop || 3}`;

  return (
    <div className={cn(
      "grid",
      gridCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: "vertical" | "horizontal" | "responsive";
  spacing?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  className?: string;
}

export function ResponsiveStack({
  children,
  direction = "responsive",
  spacing = "md",
  align = "start",
  justify = "start",
  className
}: ResponsiveStackProps) {
  const directionClasses = {
    vertical: "flex flex-col",
    horizontal: "flex flex-row",
    responsive: "flex flex-col sm:flex-row"
  };

  const spacingClasses = {
    sm: direction === "responsive" ? "gap-2 sm:gap-3" : "gap-2",
    md: direction === "responsive" ? "gap-4 sm:gap-6" : "gap-4", 
    lg: direction === "responsive" ? "gap-6 sm:gap-8" : "gap-6"
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center", 
    end: "items-end",
    stretch: "items-stretch"
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end", 
    between: "justify-between",
    around: "justify-around"
  };

  return (
    <div className={cn(
      directionClasses[direction],
      spacingClasses[spacing],
      alignClasses[align],
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export function ResponsiveContainer({ 
  children, 
  size = "xl",
  className 
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg", 
    xl: "max-w-screen-xl",
    full: "max-w-full"
  };

  return (
    <div className={cn(
      "container mx-auto px-4 sm:px-6 lg:px-8",
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
}