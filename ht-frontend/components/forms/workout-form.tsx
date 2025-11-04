'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dumbbell, Plus, Edit3, Clock, Flame } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { workoutSchema, type WorkoutFormData } from '@/lib/validations/health';
import { WorkoutRequest, Workout } from '@/lib/types/health';

interface WorkoutFormProps {
  onSubmit: (data: WorkoutRequest) => Promise<void>;
  initialData?: Workout;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
  error?: string | null;
  onCancel?: () => void;
}

// Common workout activities with estimated calories per minute
const WORKOUT_SUGGESTIONS = [
  { name: 'Running', caloriesPerMin: 10 },
  { name: 'Walking', caloriesPerMin: 4 },
  { name: 'Cycling', caloriesPerMin: 8 },
  { name: 'Swimming', caloriesPerMin: 11 },
  { name: 'Weight Training', caloriesPerMin: 6 },
  { name: 'Yoga', caloriesPerMin: 3 },
  { name: 'Pilates', caloriesPerMin: 4 },
  { name: 'Dancing', caloriesPerMin: 5 },
  { name: 'Basketball', caloriesPerMin: 8 },
  { name: 'Soccer', caloriesPerMin: 9 },
  { name: 'Tennis', caloriesPerMin: 7 },
  { name: 'Hiking', caloriesPerMin: 6 },
  { name: 'Rowing', caloriesPerMin: 9 },
  { name: 'Boxing', caloriesPerMin: 12 },
  { name: 'Jump Rope', caloriesPerMin: 13 },
];

// Quick duration presets in minutes
const DURATION_PRESETS = [15, 30, 45, 60, 90];

export function WorkoutForm({
  onSubmit,
  initialData,
  mode = 'create',
  isLoading = false,
  error,
  onCancel,
}: WorkoutFormProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] =
    useState(WORKOUT_SUGGESTIONS);
  const [estimatedCalories, setEstimatedCalories] = useState<number | null>(
    null
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      activity: initialData?.activity || '',
      durationMin: initialData?.durationMin || 0,
      caloriesBurned: initialData?.caloriesBurned || undefined,
    },
  });

  const watchedActivity = watch('activity');
  const watchedDuration = watch('durationMin');
  const watchedCalories = watch('caloriesBurned');

  // Filter suggestions based on activity input
  useEffect(() => {
    if (watchedActivity) {
      const filtered = WORKOUT_SUGGESTIONS.filter(suggestion =>
        suggestion.name.toLowerCase().includes(watchedActivity.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(WORKOUT_SUGGESTIONS);
    }
  }, [watchedActivity]);

  // Calculate estimated calories when activity or duration changes
  useEffect(() => {
    if (watchedActivity && watchedDuration > 0) {
      const suggestion = WORKOUT_SUGGESTIONS.find(
        s => s.name.toLowerCase() === watchedActivity.toLowerCase()
      );
      if (suggestion) {
        const estimated = Math.round(
          suggestion.caloriesPerMin * watchedDuration
        );
        setEstimatedCalories(estimated);

        // Auto-fill calories if not manually set
        if (!watchedCalories) {
          setValue('caloriesBurned', estimated);
        }
      } else {
        setEstimatedCalories(null);
      }
    } else {
      setEstimatedCalories(null);
    }
  }, [watchedActivity, watchedDuration, watchedCalories, setValue]);

  const handleSuggestionClick = (
    suggestion: (typeof WORKOUT_SUGGESTIONS)[0]
  ) => {
    setValue('activity', suggestion.name);
    setShowSuggestions(false);

    // Auto-calculate calories if duration is set
    if (watchedDuration > 0) {
      const estimated = Math.round(suggestion.caloriesPerMin * watchedDuration);
      setValue('caloriesBurned', estimated);
    }
  };

  const handleDurationPresetClick = (duration: number) => {
    setValue('durationMin', duration);
  };

  const onFormSubmit = async (data: WorkoutFormData) => {
    try {
      await onSubmit(data);
      if (mode === 'create') {
        reset();
        setEstimatedCalories(null);
      }
    } catch (err) {
      // Error handling is managed by parent component
      console.error('Failed to submit workout:', err);
    }
  };

  const handleCancel = () => {
    if (mode === 'create') {
      reset();
      setEstimatedCalories(null);
    }
    onCancel?.();
  };

  const isFormLoading = isLoading || isSubmitting;
  const isEditMode = mode === 'edit';

  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
            <Dumbbell className="h-4 w-4 text-purple-600" />
          </div>
          {isEditMode ? 'Edit Workout' : 'Log New Workout'}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? 'Update your workout details'
            : 'Track your exercise session and calories burned'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Activity Input with Suggestions */}
          <div className="space-y-2">
            <Label htmlFor="activity" className="text-sm font-medium">
              Activity
            </Label>
            <div className="relative">
              <Input
                id="activity"
                type="text"
                placeholder="Enter workout activity (e.g., Running, Weight Training)"
                {...register('activity')}
                disabled={isFormLoading}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicks
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                aria-describedby={
                  errors.activity ? 'activity-error' : undefined
                }
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="bg-popover absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border shadow-lg">
                  {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="hover:bg-muted flex w-full items-center justify-between px-3 py-2 text-left transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="text-sm">{suggestion.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        ~{suggestion.caloriesPerMin} cal/min
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.activity && (
              <p id="activity-error" className="text-destructive text-sm">
                {errors.activity.message}
              </p>
            )}
          </div>

          {/* Duration Input with Presets */}
          <div className="space-y-3">
            <Label htmlFor="durationMin" className="text-sm font-medium">
              Duration (Minutes)
            </Label>

            {/* Duration Preset Buttons */}
            <div className="mb-3 flex flex-wrap gap-2">
              {DURATION_PRESETS.map(duration => (
                <Button
                  key={duration}
                  type="button"
                  variant={watchedDuration === duration ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDurationPresetClick(duration)}
                  disabled={isFormLoading}
                  className="flex items-center gap-1 transition-all hover:scale-105"
                >
                  <Clock className="h-3 w-3" />
                  {duration}min
                </Button>
              ))}
            </div>

            <div className="relative">
              <Input
                id="durationMin"
                type="number"
                min="1"
                max="600"
                placeholder="Enter duration in minutes"
                {...register('durationMin', { valueAsNumber: true })}
                disabled={isFormLoading}
                className="pr-16"
                aria-describedby={
                  errors.durationMin ? 'duration-error' : undefined
                }
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-muted-foreground text-sm">min</span>
              </div>
            </div>
            {errors.durationMin && (
              <p id="duration-error" className="text-destructive text-sm">
                {errors.durationMin.message}
              </p>
            )}
          </div>

          {/* Calories Burned Input */}
          <div className="space-y-2">
            <Label htmlFor="caloriesBurned" className="text-sm font-medium">
              Calories Burned (Optional)
            </Label>
            {estimatedCalories && (
              <p className="text-muted-foreground text-xs">
                Estimated: {estimatedCalories} calories
              </p>
            )}
            <div className="relative">
              <Input
                id="caloriesBurned"
                type="number"
                min="0"
                max="2000"
                placeholder="Enter calories burned (optional)"
                {...register('caloriesBurned', { valueAsNumber: true })}
                disabled={isFormLoading}
                className="pr-16"
                aria-describedby={
                  errors.caloriesBurned ? 'calories-error' : undefined
                }
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-muted-foreground text-sm">cal</span>
              </div>
            </div>
            {errors.caloriesBurned && (
              <p id="calories-error" className="text-destructive text-sm">
                {errors.caloriesBurned.message}
              </p>
            )}
          </div>

          {/* Enhanced Current Selection Display */}
          {watchedActivity && watchedDuration > 0 && (
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                      <Dumbbell className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-foreground font-semibold">
                      {watchedActivity}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-foreground font-medium">
                        {watchedDuration} min
                      </span>
                    </div>
                    {watchedCalories && (
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-foreground font-medium">
                          {watchedCalories} cal
                        </span>
                      </div>
                    )}
                    {estimatedCalories &&
                      watchedCalories !== estimatedCalories && (
                        <Badge variant="outline" className="text-xs">
                          Est: {estimatedCalories} cal
                        </Badge>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              type="submit"
              disabled={
                isFormLoading ||
                !watchedActivity ||
                !watchedDuration ||
                watchedDuration <= 0
              }
              className="h-11 flex-1 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              size="lg"
            >
              {isFormLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {isEditMode ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <Edit3 className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {isEditMode ? 'Update Workout' : 'Add Workout'}
                </>
              )}
            </Button>

            {(isEditMode || onCancel) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isFormLoading}
                className="h-11 transition-all hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
