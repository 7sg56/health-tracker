"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale";
}

export function PageTransition({ 
  children, 
  className,
  delay = 0,
  variant = "slide-up"
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    // Reset animation on route change
    setIsVisible(false);
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay + 50); // Small delay to ensure reset

    return () => clearTimeout(timer);
  }, [delay, pathname]);

  const variantClasses = {
    fade: isVisible 
      ? "opacity-100" 
      : "opacity-0",
    "slide-up": isVisible 
      ? "opacity-100 translate-y-0" 
      : "opacity-0 translate-y-4",
    "slide-down": isVisible 
      ? "opacity-100 translate-y-0" 
      : "opacity-0 -translate-y-4",
    "slide-left": isVisible 
      ? "opacity-100 translate-x-0" 
      : "opacity-0 translate-x-4",
    "slide-right": isVisible 
      ? "opacity-100 translate-x-0" 
      : "opacity-0 -translate-x-4",
    scale: isVisible 
      ? "opacity-100 scale-100" 
      : "opacity-0 scale-95"
  };

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out will-change-transform",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

// Enhanced page transition with route-specific animations
export function RoutePageTransition({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  const pathname = usePathname();
  
  // Different animations for different routes
  const getVariantForRoute = (path: string): PageTransitionProps["variant"] => {
    if (path.includes("/dashboard") && path !== "/dashboard") {
      return "slide-left"; // Sub-pages slide from right
    }
    if (path === "/dashboard") {
      return "fade"; // Main dashboard fades in
    }
    return "slide-up"; // Default animation
  };

  return (
    <PageTransition 
      variant={getVariantForRoute(pathname)}
      className={className}
    >
      {children}
    </PageTransition>
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