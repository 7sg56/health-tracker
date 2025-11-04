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
import { Button } from '@/components/ui/button';
import {
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getCurrentHealthGoal,
  getCurrentHealthGoalGuidance,
  type HealthGoalGuidance as HealthGoalGuidanceType,
} from '@/lib/config/health-goal-limits';

export function HealthGoalGuidance() {
  const [healthGoal, setHealthGoal] = useState<string>('Stay Healthy');
  const [guidance, setGuidance] = useState<HealthGoalGuidanceType>(
    getCurrentHealthGoalGuidance()
  );
  const [isExpanded, setIsExpanded] = useState(false);

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
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base">
              Your Goal: <span className="text-blue-600">{healthGoal}</span>
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Lightbulb className="mr-1 h-3 w-3" />
            {isExpanded ? 'Hide' : 'View'} Tips
            {isExpanded ? (
              <ChevronUp className="ml-1 h-3 w-3" />
            ) : (
              <ChevronDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        </div>
        <CardDescription className="text-xs">
          {guidance.priority}
        </CardDescription>
      </CardHeader>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <CardContent className="pt-0">
          {/* Focus Areas */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {guidance.focusAreas.map((area, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>

          {/* Daily Action Items - Compact */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Today&apos;s Actions
            </h4>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {guidance.dailyTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-1.5 text-xs">
                  <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
