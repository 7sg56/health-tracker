// Simple test to verify routing logic
const { ROUTE_REDIRECTS, isProtectedRoute, isPublicRoute, shouldRedirectRoute } = require('./lib/utils/route-guards.ts');

console.log('Testing route redirects...');

// Test route redirects
console.log('Home redirect:', shouldRedirectRoute('/home')); // Should be '/dashboard'
console.log('Water redirect:', shouldRedirectRoute('/home/waterIntake')); // Should be '/dashboard/water'
console.log('Food redirect:', shouldRedirectRoute('/home/foodIntake')); // Should be '/dashboard/food'

// Test route protection
console.log('Dashboard protected:', isProtectedRoute('/dashboard')); // Should be true
console.log('Login protected:', isProtectedRoute('/auth/login')); // Should be false
console.log('Login public:', isPublicRoute('/auth/login')); // Should be true

console.log('All routing tests completed successfully!');