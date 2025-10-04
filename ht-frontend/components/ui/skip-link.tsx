/**
 * Skip Link Component
 * Provides keyboard users a way to skip to main content
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default
        "sr-only",
        // Visible when focused
        "focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999]",
        // Styling
        "focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground",
        "focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring",
        // Smooth transition
        "transition-all duration-200",
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Skip Links Container
 * Groups multiple skip links together
 */
interface SkipLinksProps {
  children: React.ReactNode;
  className?: string;
}

export function SkipLinks({ children, className }: SkipLinksProps) {
  return (
    <div
      className={cn("sr-only focus-within:not-sr-only", className)}
      role="navigation"
      aria-label="Skip links"
    >
      {children}
    </div>
  );
}

/**
 * Main Content Skip Link
 * Pre-configured skip link for main content
 */
interface MainContentSkipLinkProps {
  className?: string;
}

export function MainContentSkipLink({ className }: MainContentSkipLinkProps) {
  return (
    <SkipLink href="#main-content" className={className}>
      Skip to main content
    </SkipLink>
  );
}

/**
 * Navigation Skip Link
 * Pre-configured skip link for navigation
 */
interface NavigationSkipLinkProps {
  className?: string;
}

export function NavigationSkipLink({ className }: NavigationSkipLinkProps) {
  return (
    <SkipLink href="#navigation" className={className}>
      Skip to navigation
    </SkipLink>
  );
}