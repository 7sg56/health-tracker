'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Droplets, Utensils, Dumbbell, Target, Info } from 'lucide-react';
import { 
  HEALTH_GOAL_DESCRIPTIONS, 
  getHealthGoalLimits,
  type HealthGoal 
} from '@/lib/config/health-goal-limits';

export default function ProfilePage() {
  const [name, setName] = useState('Test User');
  const [goal, setGoal] = useState('Stay Healthy');
  const [saved, setSaved] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    const storedName = localStorage.getItem('ht_name');
    const storedGoal = localStorage.getItem('ht_goal');
    if (storedName) setName(storedName);
    if (storedGoal) setGoal(storedGoal);
  }, []);

  const save = () => {
    localStorage.setItem('ht_name', name);
    localStorage.setItem('ht_goal', goal);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('profileUpdated'));
    setSaved('success');
    setTimeout(() => setSaved('idle'), 2500);
  };
  
  // Get limits for the selected goal
  const goalLimits = getHealthGoalLimits(goal);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Update your display name and health goal.
        </p>
      </div>

      {saved === 'success' && (
        <Alert className="w-auto border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Changes saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Health goal</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Select your health goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stay Healthy">Stay Healthy</SelectItem>
                <SelectItem value="Lose Weight">Lose Weight</SelectItem>
                <SelectItem value="Gain Muscle">Gain Muscle</SelectItem>
                <SelectItem value="Improve Performance">
                  Improve Performance
                </SelectItem>
              </SelectContent>
            </Select>
            {goal && HEALTH_GOAL_DESCRIPTIONS[goal as HealthGoal] && (
              <p className="text-sm text-muted-foreground">
                {HEALTH_GOAL_DESCRIPTIONS[goal as HealthGoal]}
              </p>
            )}
          </div>

          <div>
            <Button onClick={save} className="w-full sm:w-auto">
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Goal Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Your Health Goal Details
          </CardTitle>
          <CardDescription>
            Personalized limits based on your selected goal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Goal Info Banner */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  {goal}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {HEALTH_GOAL_DESCRIPTIONS[goal as HealthGoal]}
                </p>
              </div>
            </div>
          </div>

          {/* Water Intake Limits */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <h4 className="font-semibold">Water Intake</h4>
            </div>
            <div className="ml-7 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Daily Recommended:</span>
                <Badge variant="secondary">
                  {goalLimits.water.recommended}L
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Per Entry Range:</span>
                <span className="font-medium">
                  {goalLimits.water.min}L - {goalLimits.water.max}L
                </span>
              </div>
            </div>
          </div>

          {/* Food Intake Limits */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-orange-500" />
              <h4 className="font-semibold">Food Intake</h4>
            </div>
            <div className="ml-7 space-y-2 text-sm">
              {goalLimits.food.dailyTarget && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Daily Target:</span>
                  <Badge variant="secondary">
                    {goalLimits.food.dailyTarget} cal
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Per Meal Range:</span>
                <span className="font-medium">
                  {goalLimits.food.calories.min} - {goalLimits.food.calories.max} cal
                </span>
              </div>
            </div>
          </div>

          {/* Workout Limits */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-purple-500" />
              <h4 className="font-semibold">Workout</h4>
            </div>
            <div className="ml-7 space-y-2 text-sm">
              {goalLimits.workout.weeklyMinutes && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Weekly Target:</span>
                  <Badge variant="secondary">
                    {goalLimits.workout.weeklyMinutes} min
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration Range:</span>
                <span className="font-medium">
                  {goalLimits.workout.duration.min} - {goalLimits.workout.duration.max} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Calories Range:</span>
                <span className="font-medium">
                  {goalLimits.workout.calories.min} - {goalLimits.workout.calories.max} cal
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
