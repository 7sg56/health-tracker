'use client';

/**
 * AuthGuard Component
 * Protects routes by checking authentication status and redirecting if necessary
 */

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { 
  isProtectedRoute, 
  isPublicRoute, 
  shouldRedirectRoute,
  buildReturnUrl,
  parseReturnUrl,
  isValidReturnUrl 
} from '../../lib/utils/route-guards';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

// Default loading component
function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    </div>
  );
}

// Default unauthorized component
function DefaultUnauthorizedFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You need to be logged in to access this page.</p>
      </div>
    </div>
  );
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = '/auth/login',
  requireAuth = true,
  allowedRoles = [],
}: AuthGuardProps) {
  const { state } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect while loading
    if (state.isLoading) return;

    // Check if current route needs to be redirected (e.g., /home -> /dashboard)
    const routeRedirect = shouldRedirectRoute(pathname);
    if (routeRedirect) {
      router.replace(routeRedirect);
      return;
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !state.isAuthenticated) {
      // Use enhanced route utilities for return URL
      const returnUrl = buildReturnUrl(pathname);
      router.push(`${redirectTo}?returnUrl=${returnUrl}`);
      return;
    }

    // If authentication is not required but user is authenticated
    // (e.g., login/register pages when already logged in)
    if (!requireAuth && state.isAuthenticated) {
      // Check if there's a return URL in the query params
      const urlParams = new URLSearchParams(window.location.search);
      const returnPath = parseReturnUrl(urlParams);
      
      // Validate and use the return URL
      if (returnPath && isValidReturnUrl(returnPath)) {
        router.push(returnPath);
      } else {
        router.push('/dashboard'); // Default authenticated redirect
      }
      return;
    }

    // TODO: Role-based access control (when roles are implemented)
    if (allowedRoles.length > 0 && state.user) {
      // This would check user roles when implemented
      // For now, we'll skip this check
    }
  }, [state.isLoading, state.isAuthenticated, state.user, requireAuth, redirectTo, router, pathname, allowedRoles]);

  // Show loading state
  if (state.isLoading) {
    return fallback || <DefaultLoadingFallback />;
  }

  // Show unauthorized state
  if (requireAuth && !state.isAuthenticated) {
    return fallback || <DefaultUnauthorizedFallback />;
  }

  // Show children if all checks pass
  return <>{children}</>;
}

// Convenience wrapper for protecting authenticated routes
export function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <AuthGuard 
      requireAuth={true} 
      fallback={fallback}
      redirectTo={redirectTo}
    >
      {children}
    </AuthGuard>
  );
}

// Convenience wrapper for public routes (redirect if authenticated)
export function PublicRoute({ 
  children, 
  fallback,
  redirectTo = '/dashboard',
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <AuthGuard 
      requireAuth={false} 
      fallback={fallback}
      redirectTo={redirectTo}
    >
      {children}
    </AuthGuard>
  );
}

// Hook for checking authentication status in components
export function useAuthGuard() {
  const { state } = useAuth();
  
  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    error: state.error,
  };
}