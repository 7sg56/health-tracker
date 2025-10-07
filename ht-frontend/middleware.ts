import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for handling route redirects and authentication
 * This runs on the Edge Runtime for optimal performance
 */

// Define route mappings for /home to /dashboard redirects
const HOME_TO_DASHBOARD_REDIRECTS: Record<string, string> = {
  '/home': '/dashboard',
  '/home/': '/dashboard',
  '/home/waterIntake': '/dashboard/water',
  '/home/foodIntake': '/dashboard/food',
  '/home/workout': '/dashboard/workout',
  '/home/profile': '/dashboard/profile',
  '/home/health-score': '/dashboard/health-score',
  '/home/demo-search': '/dashboard',
};

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/home', // Still protected even though it redirects
];

// Define public routes that should redirect authenticated users
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
];

/**
 * Check if a path matches any of the protected route patterns
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if a path matches any of the public route patterns
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if user is authenticated by looking for auth token
 * In a real app, you might want to verify the token validity
 */
function isAuthenticated(request: NextRequest): boolean {
  // Check for authentication token in cookies
  const authToken = request.cookies.get('auth-token')?.value;
  const sessionId = request.cookies.get('session-id')?.value;
  
  // Return true if either token exists (basic check)
  return !!(authToken || sessionId);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Handle /home to /dashboard redirects first (before auth checks)
  if (HOME_TO_DASHBOARD_REDIRECTS[pathname]) {
    const redirectUrl = new URL(HOME_TO_DASHBOARD_REDIRECTS[pathname], request.url);
    
    // Preserve query parameters
    if (request.nextUrl.search) {
      redirectUrl.search = request.nextUrl.search;
    }
    
    return NextResponse.redirect(redirectUrl, 301); // Permanent redirect
  }

  // Check authentication status
  const authenticated = isAuthenticated(request);

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!authenticated) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle public routes (redirect authenticated users)
  if (isPublicRoute(pathname) && authenticated) {
    // Check for return URL in query params
    const returnUrl = request.nextUrl.searchParams.get('returnUrl');
    
    if (returnUrl && returnUrl.startsWith('/')) {
      // Validate return URL is safe (starts with /)
      return NextResponse.redirect(new URL(returnUrl, request.url));
    }
    
    // Default redirect for authenticated users on public pages
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};