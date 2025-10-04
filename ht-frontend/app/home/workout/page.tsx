'use client';

import React, { useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';
import { 
  Dumbbell, 
  Plus, 
  Calendar, 
  Clock, 
  Flame, 
  TrendingUp,
  Filter,
  RefreshCw,
  BarChart3
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { WorkoutForm, WorkoutList } from '@/components/forms';
import { useWorkout } from '@/hooks/use-workout';
import { Workout, WorkoutRequest } from '@/lib/types/health';

type TimeRange = 'today' | 'week' | 'month' | 'all';
type SortOption = 'newest' | 'oldest' | 'duration' | 'calories';

interface WorkoutSummary {
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  averageDuration: number;
  averageCalories: number;
  mostFrequentActivity: string;
}

export default function WorkoutPage() {
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const {
    workouts,
    isLoading,
    error,
    hasMore,
    totalElements,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    refreshData,
    loadMore,
    clearError
  } = useWorkout({
    pageSize: 20,
    autoRefresh: false
  });

  // Filter workouts based on time range
  const filteredWorkouts = useMemo(() => {
    const now = new Date();
    let filtered = [...workouts];

    switch (timeRange) {
      case 'today':
        const today = now.toDateString();
        filtered = workouts.filter(workout => 
          new Date(workout.date).toDateString() === today
        );
        break;
      case 'week':
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        filtered = workouts.filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= weekStart && workoutDate <= weekEnd;
        });
        break;
      case 'month':
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        filtered = workouts.filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= monthStart && workoutDate <= monthEnd;
        });
        break;
      case 'all':
      default:
        // No filtering
        break;
    }

    // Sort workouts
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'duration':
        filtered.sort((a, b) => b.durationMin - a.durationMin);
        break;
      case 'calories':
        filtered.sort((a, b) => (b.caloriesBurned || 0) - (a.caloriesBurned || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [workouts, timeRange, sortBy]);

  // Calculate summary statistics
  const summary: WorkoutSummary = useMemo(() => {
    const totalWorkouts = filteredWorkouts.length;
    const totalMinutes = filteredWorkouts.reduce((sum, workout) => sum + workout.durationMin, 0);
    const totalCalories = filteredWorkouts.reduce((sum, workout) => sum + (workout.caloriesBurned || 0), 0);
    
    const averageDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;
    const averageCalories = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;
    
    // Find most frequent activity
    const activityCounts = filteredWorkouts.reduce((acc, workout) => {
      acc[workout.activity] = (acc[workout.activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostFrequentActivity = Object.entries(activityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    return {
      totalWorkouts,
      totalMinutes,
      totalCalories,
      averageDuration,
      averageCalories,
      mostFrequentActivity
    };
  }, [filteredWorkouts]);

  // Handle form submission
  const handleSubmit = async (data: WorkoutRequest) => {
    try {
      if (editingWorkout) {
        await updateWorkout(editingWorkout.id, data);
        setEditingWorkout(null);
      } else {
        await addWorkout(data);
      }
      setShowForm(false);
    } catch (error) {
      // Error is handled by the hook and displayed in the form
      console.error('Failed to submit workout:', error);
    }
  };

  // Handle edit
  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await deleteWorkout(id);
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to delete workout:', error);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditingWorkout(null);
    setShowForm(false);
  };

  // Handle refresh
  const handleRefresh = () => {
    clearError();
    refreshData();
  };

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-purple-500" />
            Workout Tracking
          </h1>
          <p className="text-muted-foreground">
            Track your workouts and monitor your fitness progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            disabled={showForm}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Workout
          </Button>
        </div>
      </div>

      {/* Global Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Add/Edit Form */}
          {showForm && (
            <WorkoutForm
              onSubmit={handleSubmit}
              initialData={editingWorkout || undefined}
              mode={editingWorkout ? 'edit' : 'create'}
              isLoading={isLoading}
              error={error}
              onCancel={handleCancel}
            />
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Total Workouts</span>
                </div>
                <p className="text-2xl font-bold mt-1">{summary.totalWorkouts}</p>
                <p className="text-xs text-muted-foreground">
                  {getTimeRangeLabel(timeRange)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Time</span>
                </div>
                <p className="text-2xl font-bold mt-1">{summary.totalMinutes}m</p>
                <p className="text-xs text-muted-foreground">
                  Avg: {summary.averageDuration}m per workout
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Calories Burned</span>
                </div>
                <p className="text-2xl font-bold mt-1">{summary.totalCalories}</p>
                <p className="text-xs text-muted-foreground">
                  Avg: {summary.averageCalories} per workout
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Top Activity</span>
                </div>
                <p className="text-lg font-bold mt-1 truncate">{summary.mostFrequentActivity}</p>
                <p className="text-xs text-muted-foreground">Most frequent</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Workouts */}
          <WorkoutList
            workouts={filteredWorkouts.slice(0, 5)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            error={null}
            emptyMessage="No workouts found. Add your first workout to get started!"
          />

          {filteredWorkouts.length > 5 && (
            <div className="text-center">
              <Button variant="outline" onClick={() => {
                // Switch to history tab to see all workouts
                const historyTab = document.querySelector('[value="history"]') as HTMLElement;
                historyTab?.click();
              }}>
                View All Workouts ({totalElements})
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="duration">By Duration</SelectItem>
                      <SelectItem value="calories">By Calories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Badge variant="secondary">
                  {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* All Workouts */}
          <WorkoutList
            workouts={filteredWorkouts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            error={null}
            emptyMessage={`No workouts found for ${getTimeRangeLabel(timeRange).toLowerCase()}.`}
          />

          {/* Load More Button */}
          {hasMore && timeRange === 'all' && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  'Load More Workouts'
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* This Week */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Week</span>
                    <span className="font-medium">
                      {workouts.filter(w => {
                        const workoutDate = new Date(w.date);
                        const weekStart = startOfWeek(new Date());
                        const weekEnd = endOfWeek(new Date());
                        return workoutDate >= weekStart && workoutDate <= weekEnd;
                      }).length} workouts
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Time</span>
                    <span className="font-medium">
                      {workouts.filter(w => {
                        const workoutDate = new Date(w.date);
                        const weekStart = startOfWeek(new Date());
                        const weekEnd = endOfWeek(new Date());
                        return workoutDate >= weekStart && workoutDate <= weekEnd;
                      }).reduce((sum, w) => sum + w.durationMin, 0)} minutes
                    </span>
                  </div>
                </div>

                {/* Last Week */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Last Week</span>
                    <span className="font-medium">
                      {workouts.filter(w => {
                        const workoutDate = new Date(w.date);
                        const lastWeekStart = startOfWeek(subWeeks(new Date(), 1));
                        const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1));
                        return workoutDate >= lastWeekStart && workoutDate <= lastWeekEnd;
                      }).length} workouts
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Time</span>
                    <span className="font-medium">
                      {workouts.filter(w => {
                        const workoutDate = new Date(w.date);
                        const lastWeekStart = startOfWeek(subWeeks(new Date(), 1));
                        const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1));
                        return workoutDate >= lastWeekStart && workoutDate <= lastWeekEnd;
                      }).reduce((sum, w) => sum + w.durationMin, 0)} minutes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* This Month */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span className="font-medium">
                      {workouts.filter(w => {
                        const workoutDate = new Date(w.date);
                        const monthStart = startOfMonth(new Date());
                        const monthEnd = endOfMonth(new Date());
                        return workoutDate >= monthStart && workoutDate <= monthEnd;
                      }).length} workouts
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Calories</span>
                    <span className="font-medium">
                      {workouts.filter(w => {
                        const workoutDate = new Date(w.date);
                        const monthStart = startOfMonth(new Date());
                        const monthEnd = endOfMonth(new Date());
                        return workoutDate >= monthStart && workoutDate <= monthEnd;
                      }).reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)} cal
                    </span>
                  </div>
                </div>

                {/* Last Month */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Last Month</span>
                    <span className="font-medium">
                      {workouts.filter(w => {
                        const workoutDate = new Date(w.date);
                        const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
                        const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
                        return workoutDate >= lastMonthStart && workoutDate <= lastMonthEnd;
                      }).length} workouts
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Calories</span>
                    <span className="font-medium">
                      {workouts.filter(w => {
                        const workoutDate = new Date(w.date);
                        const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
                        const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
                        return workoutDate >= lastMonthStart && workoutDate <= lastMonthEnd;
                      }).reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)} cal
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  filteredWorkouts.reduce((acc, workout) => {
                    if (!acc[workout.activity]) {
                      acc[workout.activity] = {
                        count: 0,
                        totalMinutes: 0,
                        totalCalories: 0
                      };
                    }
                    acc[workout.activity].count++;
                    acc[workout.activity].totalMinutes += workout.durationMin;
                    acc[workout.activity].totalCalories += workout.caloriesBurned || 0;
                    return acc;
                  }, {} as Record<string, { count: number; totalMinutes: number; totalCalories: number }>)
                )
                .sort(([,a], [,b]) => b.count - a.count)
                .slice(0, 5)
                .map(([activity, stats]) => (
                  <div key={activity} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{activity}</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.count} session{stats.count !== 1 ? 's' : ''} • {stats.totalMinutes} min total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{stats.totalCalories} cal</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(stats.totalMinutes / stats.count)} min avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredWorkouts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No workout data available for analysis.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}