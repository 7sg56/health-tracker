'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { state } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      router.push('/home');
    }
  }, [state.isAuthenticated, state.isLoading, router]);

  const handleLoginSuccess = () => {
    toast.success('Welcome back! Redirecting to your dashboard...');
    router.push('/home');
  };

  const handleLoginError = (error: string) => {
    toast.error(error || 'Login failed. Please try again.');
  };

  // Show loading state while checking authentication
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (state.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">HealthTracker</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to continue tracking your health journey
            </p>
          </div>

          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            className="w-full"
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link 
                href="/auth/register" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2025 HealthTracker. Built with Next.js and TypeScript.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}