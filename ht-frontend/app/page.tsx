import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Droplets, Utensils, Dumbbell, TrendingUp, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">HealthTracker</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button size="sm">
                Open Dashboard
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Your Health,
            <span className="text-blue-600 block">Transform Your Life</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Monitor your daily water intake, food consumption, and workouts with our comprehensive health tracking platform. 
            Get personalized insights and achieve your wellness goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Open Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Water Intake Tracking</CardTitle>
              <CardDescription>
                Monitor your daily hydration levels and stay on top of your water consumption goals.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Utensils className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Food & Nutrition</CardTitle>
              <CardDescription>
                Log your meals and track calories to maintain a balanced and healthy diet.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Dumbbell className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Workout Logging</CardTitle>
              <CardDescription>
                Record your exercise activities and track your fitness progress over time.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose HealthTracker?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Daily Health Score
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Get a comprehensive daily health score based on your water intake, nutrition, and exercise activities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Secure & Private
                    </h3>
                    <p className="text-gray-600">
                      Your health data is encrypted and secure. We prioritize your privacy and data protection.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Easy to Use
                    </h3>
                    <p className="text-gray-600">
                      Simple, intuitive interface that makes tracking your health habits effortless and enjoyable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-600 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Start?</h3>
              <p className="mb-6 opacity-90">
                Join thousands of users who are already improving their health with our comprehensive tracking platform.
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Start Your Health Journey Today
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Take control of your wellness with comprehensive health tracking and personalized insights.
          </p>
          <Link href="/dashboard">
            <Button size="lg">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">HealthTracker</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 HealthTracker. Built with Next.js and TypeScript.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
