/**
 * Animation utilities for consistent micro-interactions and transitions
 */

import * as React from "react";
import { cn } from "@/lib/utils";

// Animation variants for different interaction types
export const animationVariants = {
  // Hover effects
  hover: {
    scale: "hover:scale-105 active:scale-95",
    scaleSmall: "hover:scale-[1.02] active:scale-[0.98]",
    lift: "hover:-translate-y-1 hover:shadow-lg",
    glow: "hover:shadow-lg hover:shadow-primary/25",
    rotate: "hover:rotate-6",
    rotateSmall: "hover:rotate-3",
  },
  
  // Focus states
  focus: {
    ring: "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    ringPrimary: "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    ringDestructive: "focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2",
  },
  
  // Transition durations
  transition: {
    fast: "transition-all duration-150 ease-out",
    normal: "transition-all duration-200 ease-out",
    slow: "transition-all duration-300 ease-out",
    slower: "transition-all duration-500 ease-out",
  },
  
  // Loading states
  loading: {
    pulse: "animate-pulse",
    spin: "animate-spin",
    bounce: "animate-bounce",
    shimmer: "animate-skeleton-wave",
  },
  
  // Page transitions
  pageTransition: {
    fadeIn: "animate-fade-in",
    slideUp: "animate-slide-in-from-bottom",
    slideDown: "animate-slide-in-from-top",
    slideLeft: "animate-slide-in-from-right",
    slideRight: "animate-slide-in-from-left",
  }
} as const;

// Utility functions for creating animated components
export function createHoverEffect(
  baseClasses: string,
  hoverType: keyof typeof animationVariants.hover = "scale",
  transition: keyof typeof animationVariants.transition = "normal"
) {
  return cn(
    baseClasses,
    animationVariants.transition[transition],
    animationVariants.hover[hoverType],
    "will-change-transform"
  );
}

export function createFocusEffect(
  baseClasses: string,
  focusType: keyof typeof animationVariants.focus = "ring"
) {
  return cn(
    baseClasses,
    animationVariants.focus[focusType]
  );
}

export function createInteractiveElement(
  baseClasses: string,
  options: {
    hover?: keyof typeof animationVariants.hover;
    focus?: keyof typeof animationVariants.focus;
    transition?: keyof typeof animationVariants.transition;
  } = {}
) {
  const {
    hover = "scale",
    focus = "ring",
    transition = "normal"
  } = options;

  return cn(
    baseClasses,
    animationVariants.transition[transition],
    animationVariants.hover[hover],
    animationVariants.focus[focus],
    "will-change-transform"
  );
}

// Stagger animation delays for lists
export function getStaggerDelay(index: number, baseDelay = 50): React.CSSProperties {
  return {
    animationDelay: `${index * baseDelay}ms`
  };
}

// Micro-interaction presets for common UI elements
export const microInteractions = {
  button: createInteractiveElement(
    "cursor-pointer",
    { hover: "scale", focus: "ring", transition: "normal" }
  ),
  
  card: createInteractiveElement(
    "cursor-pointer",
    { hover: "lift", focus: "ring", transition: "normal" }
  ),
  
  icon: createInteractiveElement(
    "",
    { hover: "rotateSmall", transition: "fast" }
  ),
  
  avatar: createInteractiveElement(
    "",
    { hover: "scale", transition: "normal" }
  ),
  
  link: createInteractiveElement(
    "cursor-pointer",
    { hover: "scaleSmall", focus: "ring", transition: "fast" }
  ),
  
  menuItem: createInteractiveElement(
    "cursor-pointer",
    { hover: "scaleSmall", focus: "ring", transition: "fast" }
  )
};

// Animation state management
export function useAnimationState() {
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  const startAnimation = React.useCallback((duration = 300) => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), duration);
  }, []);
  
  return { isAnimating, startAnimation };
}

// Performance optimization for animations
export function optimizeForAnimation(element: HTMLElement) {
  element.style.willChange = 'transform, opacity';
  
  // Clean up after animation
  const cleanup = () => {
    element.style.willChange = 'auto';
  };
  
  return cleanup;
}

// Reduced motion support
export function respectsReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function createAccessibleAnimation(
  animatedClasses: string,
  staticClasses: string = ""
) {
  return cn(
    staticClasses,
    "motion-safe:" + animatedClasses.split(' ').join(' motion-safe:')
  );
}