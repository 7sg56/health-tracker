'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  CheckCircle2,
  Droplets,
  Utensils,
  Dumbbell,
  Lightbulb,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import {
  getCurrentHealthGoal,
  getCurrentHealthGoalGuidance,
  type HealthGoalGuidance,
} from '@/lib/config/health-goal-limits';

export function HealthGoalGuidance() {
  const [healthGoal, setHealthGoal] = useState<string>('Stay Healthy');
  const [guidance, setGuidance] = useState<HealthGoalGuidance>(
    getCurrentHealthGoalGuidance()
  );

  useEffect(() => {
    const updateGuidance = () => {
      const goal = getCurrentHealthGoal();
      const newGuidance = getCurrentHealthGoalGuidance();
      setHealthGoal(goal);
      setGuidance(newGuidance);
    };

    updateGuidance();

    // Listen for profile updates
    window.addEventListener('profileUpdated', updateGuidance);
    return () => window.removeEventListener('profileUpdated', updateGuidance);
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <CardTitle>Your Health Goal Plan</CardTitle>
        </div>
        <CardDescription>
          Personalized guidance for <strong>{healthGoal}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="exercise">Exercise</TabsTrigger>
          </TabsList>

          {/* Daily Tips Tab */}
          <TabsContent value="daily" className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                <TrendingUp className="h-4 w-4" />
                Priority: {guidance.priority}
              </div>
            </div>

            <div>
              <h4 className="mb-3 flex items-center gap-2 font-semibold">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                Daily Action Items
              </h4>
              <ul className="space-y-2">
                {guidance.dailyTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Focus Areas
              </h4>
              <div className="flex flex-wrap gap-2">
                {guidance.focusAreas.map((area, index) => (
                  <Badge key={index} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Weekly Goals Tab */}
          <TabsContent value="weekly" className="space-y-4">
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-semibold">
                <Calendar className="h-4 w-4 text-purple-600" />
                This Week's Targets
              </h4>
              <ul className="space-y-3">
                {guidance.weeklyGoals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                      <span className="text-xs font-semibold text-purple-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {goal}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-4">
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/20">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  {guidance.nutrition.focus}
                </span>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Nutrition Guidelines</h4>
              <ul className="space-y-2">
                {guidance.nutrition.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {rec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Exercise Tab */}
          <TabsContent value="exercise" className="space-y-4">
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/20">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  {guidance.exercise.focus}
                </span>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Exercise Plan</h4>
              <ul className="space-y-2">
                {guidance.exercise.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {rec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hydration tip in exercise tab */}
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
              <div className="mb-2 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {guidance.hydration.focus}
                </span>
              </div>
              <ul className="ml-6 space-y-1">
                {guidance.hydration.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="text-xs text-blue-700 dark:text-blue-300"
                  >
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

