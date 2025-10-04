"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function PageTransition({ 
  children, 
  className,
  delay = 0 
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 300,
  className 
}: FadeInProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-opacity ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

interface SlideInProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  className?: string;
}

export function SlideIn({ 
  children, 
  direction = "up",
  delay = 0, 
  duration = 300,
  className 
}: SlideInProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const directionClasses = {
    up: isVisible ? "translate-y-0" : "translate-y-4",
    down: isVisible ? "translate-y-0" : "-translate-y-4",
    left: isVisible ? "translate-x-0" : "translate-x-4",
    right: isVisible ? "translate-x-0" : "-translate-x-4",
  };

  return (
    <div
      className={cn(
        "transition-all ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        directionClasses[direction],
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredChildrenProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function StaggeredChildren({ 
  children, 
  staggerDelay = 100,
  className 
}: StaggeredChildrenProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}