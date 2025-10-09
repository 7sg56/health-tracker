import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for handling legacy route redirects only (auth removed)
 */

// Define route mappings for /home to /dashboard redirects
const HOME_TO_DASHBOARD_REDIRECTS: Record<string, string> = {
  '/home': '/dashboard',
  '/home/': '/dashboard',
  '/home/waterIntake': '/dashboard/water',
  '/home/foodIntake': '/dashboard/food',
  '/home/workout': '/dashboard/workout',
  '/home/profile': '/dashboard/profile',
  ' /home/health-score': '/dashboard',
  '/home/demo-search': '/dashboard',
};

// Define public routes that should redirect authenticated users
const LEGACY_AUTH_ROUTES = ['/auth/login', '/auth/register'];

/**
 * Check if a path matches any of the public route patterns
 */
function isLegacyAuthRoute(pathname: string): boolean {
  return LEGACY_AUTH_ROUTES.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );
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
    const redirectUrl = new URL(
      HOME_TO_DASHBOARD_REDIRECTS[pathname],
      request.url
    );

    // Preserve query parameters
    if (request.nextUrl.search) {
      redirectUrl.search = request.nextUrl.search;
    }

    return NextResponse.redirect(redirectUrl, 301); // Permanent redirect
  }

  // Legacy auth routes: redirect to dashboard
  if (isLegacyAuthRoute(pathname)) {
    const dest = new URL('/dashboard', request.url);
    return NextResponse.redirect(dest, 301);
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
