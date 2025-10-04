'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { state } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      router.push('/home');
    }
  }, [state.isAuthenticated, state.isLoading, router]);

  const handleRegisterSuccess = () => {
    toast.success('Account created successfully! Welcome to HealthTracker!');
    router.push('/home');
  };

  const handleRegisterError = (error: string) => {
    toast.error(error || 'Registration failed. Please try again.');
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
              Join HealthTracker
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create your account and start your health journey today
            </p>
          </div>

          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onError={handleRegisterError}
            className="w-full"
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              What you'll get:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Track water intake, food, and workouts</li>
              <li>• Get daily health scores and insights</li>
              <li>• Monitor your progress over time</li>
              <li>• Secure and private data storage</li>
            </ul>
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