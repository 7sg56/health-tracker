import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Minimal Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">HealthTracker</span>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
        </nav>
      </header>

      {/* Minimal Hero Section */}
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-2xl space-y-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Track Your Health
            <span className="block text-blue-600">Simply</span>
          </h1>
          
          <p className="mx-auto max-w-xl text-lg text-gray-600">
            Monitor water, food, and workouts in one place. Stay healthy with effortless tracking.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Minimal Feature List */}
          <div className="pt-8">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                Water Tracking
              </span>
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                Food Logging
              </span>
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600" />
                Workout Records
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-600 sm:flex-row">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="font-medium">HealthTracker</span>
            </div>
            <p>© 2025 Built with Next.js</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
