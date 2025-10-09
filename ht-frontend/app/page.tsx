import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  Droplets,
  Utensils,
  Dumbbell,
  TrendingUp,
  Shield,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              HealthTracker
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button size="sm">Open Dashboard</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
            Track Your Health,
            <span className="block text-blue-600">Transform Your Life</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Monitor your daily water intake, food consumption, and workouts with
            our comprehensive health tracking platform. Get personalized
            insights and achieve your wellness goals.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Open Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 w-fit rounded-full bg-blue-100 p-3">
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Water Intake Tracking</CardTitle>
              <CardDescription>
                Monitor your daily hydration levels and stay on top of your
                water consumption goals.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 w-fit rounded-full bg-green-100 p-3">
                <Utensils className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Food & Nutrition</CardTitle>
              <CardDescription>
                Log your meals and track calories to maintain a balanced and
                healthy diet.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 w-fit rounded-full bg-purple-100 p-3">
                <Dumbbell className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Workout Logging</CardTitle>
              <CardDescription>
                Record your exercise activities and track your fitness progress
                over time.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mb-16 rounded-2xl bg-white p-8 shadow-lg md:p-12">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                Why Choose HealthTracker?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                      Daily Health Score
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Get a comprehensive daily health score based on your water
                      intake, nutrition, and exercise activities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      Secure & Private
                    </h3>
                    <p className="text-gray-600">
                      Your health data is encrypted and secure. We prioritize
                      your privacy and data protection.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      Easy to Use
                    </h3>
                    <p className="text-gray-600">
                      Simple, intuitive interface that makes tracking your
                      health habits effortless and enjoyable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-blue-600 p-8 text-white">
              <h3 className="mb-4 text-2xl font-bold">Ready to Start?</h3>
              <p className="mb-6 opacity-90">
                Join thousands of users who are already improving their health
                with our comprehensive tracking platform.
              </p>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="w-full">
                  Open Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Start Your Health Journey Today
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
            Take control of your wellness with comprehensive health tracking and
            personalized insights.
          </p>
          <Link href="/dashboard">
            <Button size="lg">Open Dashboard</Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center space-x-2 md:mb-0">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                HealthTracker
              </span>
            </div>
            <p className="text-sm text-gray-600">
              © 2025 HealthTracker. Built with Next.js and TypeScript.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
