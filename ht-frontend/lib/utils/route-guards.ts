/**
 * Route Guard Utilities
 * Enhanced route protection and navigation logic
 */

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Route mappings for legacy /home routes to /dashboard routes
export const ROUTE_REDIRECTS: Record<string, string> = {
  '/home': '/dashboard',
  '/home/': '/dashboard',
  '/home/waterIntake': '/dashboard/water',
  '/home/foodIntake': '/dashboard/food',
  '/home/workout': '/dashboard/workout',
  '/home/profile': '/dashboard/profile',
  '/home/health-score': '/dashboard/health-score',
  '/home/demo-search': '/dashboard',
};

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/home', // Legacy routes are still protected
];

// Public routes that should redirect authenticated users
export const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
];

/**
 * Check if a path is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if a path is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if a path needs to be redirected
 */
export function shouldRedirectRoute(pathname: string): string | null {
  return ROUTE_REDIRECTS[pathname] || null;
}

/**
 * Get the canonical dashboard path for a given path
 */
export function getCanonicalPath(pathname: string): string {
  // Check for direct redirects first
  const redirect = shouldRedirectRoute(pathname);
  if (redirect) {
    return redirect;
  }

  // Convert /home paths to /dashboard paths
  if (pathname.startsWith('/home')) {
    return pathname.replace('/home', '/dashboard');
  }

  return pathname;
}

/**
 * Hook to handle route redirects on the client side
 */
export function useRouteRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const redirectPath = shouldRedirectRoute(pathname);
    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [pathname, router]);
}

/**
 * Hook to get navigation items with proper route handling
 */
export function useNavigationRoutes() {
  const pathname = usePathname();
  
  const routes = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { id: 'water', label: 'Water Intake', href: '/dashboard/water', icon: 'Droplets' },
    { id: 'food', label: 'Food Intake', href: '/dashboard/food', icon: 'Utensils' },
    { id: 'workout', label: 'Workouts', href: '/dashboard/workout', icon: 'Dumbbell' },
    { id: 'health-score', label: 'Health Score', href: '/dashboard/health-score', icon: 'Heart' },
    { id: 'profile', label: 'Profile', href: '/dashboard/profile', icon: 'User' },
  ];

  return routes.map(route => ({
    ...route,
    isActive: pathname === route.href || (route.href === '/dashboard' && pathname === '/dashboard'),
  }));
}

/**
 * Utility to build return URLs for authentication redirects
 */
export function buildReturnUrl(currentPath: string): string {
  // Convert legacy paths to canonical paths for return URLs
  const canonicalPath = getCanonicalPath(currentPath);
  return encodeURIComponent(canonicalPath);
}

/**
 * Utility to parse return URLs from query parameters
 */
export function parseReturnUrl(searchParams: URLSearchParams): string {
  const returnUrl = searchParams.get('returnUrl');
  
  if (!returnUrl) {
    return '/dashboard'; // Default return path
  }

  try {
    const decodedUrl = decodeURIComponent(returnUrl);
    
    // Validate that the return URL is safe (starts with /)
    if (!decodedUrl.startsWith('/')) {
      return '/dashboard';
    }

    // Convert to canonical path if needed
    return getCanonicalPath(decodedUrl);
  } catch {
    return '/dashboard';
  }
}

/**
 * Enhanced route validation for security
 */
export function isValidReturnUrl(url: string): boolean {
  try {
    // Must start with / (relative URL)
    if (!url.startsWith('/')) {
      return false;
    }

    // Must not contain protocol or domain
    if (url.includes('://') || url.includes('..')) {
      return false;
    }

    // Must be a valid path
    new URL(url, 'http://localhost');
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Get breadcrumb items for a given path
 */
export function getBreadcrumbItems(pathname: string): Array<{ label: string; href?: string }> {
  const canonicalPath = getCanonicalPath(pathname);
  const segments = canonicalPath.split('/').filter(Boolean);
  const breadcrumbs: Array<{ label: string; href?: string }> = [];

  // Always start with Dashboard
  breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });

  // Map segments to labels
  const segmentLabels: Record<string, string> = {
    water: 'Water Intake',
    food: 'Food Intake',
    workout: 'Workouts',
    profile: 'Profile',
    'health-score': 'Health Score',
    settings: 'Settings',
  };

  // Build breadcrumb path
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip dashboard since we already added it
    if (segment === 'dashboard' && index === 0) return;
    
    const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Last segment is current page (no link)
    if (index === segments.length - 1) {
      breadcrumbs.push({ label });
    } else {
      breadcrumbs.push({ label, href: currentPath });
    }
  });

  return breadcrumbs;
}