'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Dumbbell,
  Edit3,
  Trash2,
  Clock,
  Flame,
  Calendar,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog';

import { Workout } from '@/lib/types/health';
import { Pagination, SimplePagination } from '@/components/ui/pagination';
import {
  InfiniteScroll,
  LoadMoreButton,
} from '@/components/ui/infinite-scroll';

interface WorkoutListProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  hasMore?: boolean;
  onPageChange?: (page: number) => void;
  onLoadMore?: () => void;
  // Display options
  paginationType?: 'pagination' | 'infinite' | 'loadMore' | 'none';
  isMobile?: boolean;
}

interface WorkoutItemProps {
  workout: Workout;
  onEdit: (workout: Workout) => void;
  onDelete: (id: number) => Promise<void>;
  isDeleting?: boolean;
}

function WorkoutItem({
  workout,
  onEdit,
  onDelete,
  isDeleting = false,
}: WorkoutItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setIsDeleteLoading(true);
    try {
      await onDelete(workout.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete workout:', error);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return '';
    }
  };

  // Check if workout is from today
  const isToday = workout.date === new Date().toISOString().split('T')[0];

  return (
    <>
      <Card
        className={`transition-all hover:scale-[1.01] hover:shadow-md ${isToday ? 'bg-green-50/50 ring-2 ring-green-200 dark:bg-green-950/10 dark:ring-green-800' : ''}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              {/* Header with Activity Icon */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/20">
                  <Dumbbell className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-foreground text-lg font-semibold">
                      {workout.activity}
                    </span>
                    {isToday && (
                      <Badge variant="default" className="text-xs">
                        Today
                      </Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">
                        {workout.durationMin} min
                      </span>
                    </div>
                    {workout.caloriesBurned && (
                      <div className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        <span className="font-medium">
                          {workout.caloriesBurned} cal
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="text-muted-foreground flex items-center gap-2 pl-13 text-xs">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(workout.date)}</span>
                <span>•</span>
                <span>{formatTime(workout.createdAt)}</span>
              </div>

              {/* Enhanced Progress Indicators */}
              <div className="flex items-center gap-2 pl-13">
                <Badge variant="secondary" className="text-xs font-medium">
                  <Clock className="mr-1 h-3 w-3" />
                  {workout.durationMin}min
                </Badge>
                {workout.caloriesBurned && (
                  <Badge variant="outline" className="text-xs font-medium">
                    <Flame className="mr-1 h-3 w-3" />
                    {workout.caloriesBurned}cal
                  </Badge>
                )}
                {workout.durationMin >= 30 && (
                  <Badge variant="default" className="text-xs">
                    🎯 Goal Met
                  </Badge>
                )}
              </div>
            </div>

            {/* Enhanced Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-muted/80 h-8 w-8 p-0 transition-colors"
                  disabled={isDeleting || isDeleteLoading}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => onEdit(workout)}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive flex cursor-pointer items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive h-5 w-5" />
              Delete Workout
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workout entry?
              <div className="bg-muted mt-2 rounded p-2 text-sm">
                <strong>{workout.activity}</strong> - {workout.durationMin}{' '}
                minutes
                {workout.caloriesBurned &&
                  ` - ${workout.caloriesBurned} calories`}
              </div>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleteLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function WorkoutList({
  workouts,
  onEdit,
  onDelete,
  isLoading = false,
  error,
  emptyMessage = 'No workouts recorded yet. Add your first workout to get started!',
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  hasMore = false,
  onPageChange,
  onLoadMore,
  paginationType = 'none',
  isMobile = false,
}: WorkoutListProps) {
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-purple-500" />
            Workout History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Loading Skeletons */}
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-start justify-between rounded-lg border p-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-4 w-4 rounded" />
                    <div className="bg-muted h-4 w-24 rounded" />
                    <div className="bg-muted h-3 w-16 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-3 w-3 rounded" />
                    <div className="bg-muted h-3 w-20 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-muted h-5 w-16 rounded" />
                    <div className="bg-muted h-5 w-20 rounded" />
                  </div>
                </div>
                <div className="bg-muted h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-purple-500" />
            Workout History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="py-8 text-center">
            <Dumbbell className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce(
    (sum, workout) => sum + workout.durationMin,
    0
  );
  const totalCalories = workouts.reduce(
    (sum, workout) => sum + (workout.caloriesBurned || 0),
    0
  );

  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
            <Dumbbell className="h-4 w-4 text-purple-600" />
          </div>
          Recent Workouts
        </CardTitle>

        {/* Enhanced Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-foreground text-lg font-bold">
              {totalWorkouts}
            </div>
            <div className="text-muted-foreground text-xs">Total Workouts</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-foreground text-lg font-bold">
              {totalMinutes}
            </div>
            <div className="text-muted-foreground text-xs">Minutes</div>
          </div>
          {totalCalories > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-foreground text-lg font-bold">
                {totalCalories}
              </div>
              <div className="text-muted-foreground text-xs">Calories</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {paginationType === 'infinite' ? (
          <InfiniteScroll
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={onLoadMore || (() => {})}
            errorMessage={error}
            onRetry={onLoadMore}
          >
            {workouts.map(workout => (
              <WorkoutItem
                key={workout.id}
                workout={workout}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={isLoading}
              />
            ))}
          </InfiniteScroll>
        ) : (
          <>
            {workouts.map(workout => (
              <WorkoutItem
                key={workout.id}
                workout={workout}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={isLoading}
              />
            ))}
          </>
        )}

        {/* Pagination Controls */}
        {paginationType === 'pagination' && onPageChange && totalPages > 1 && (
          <div className="mt-6">
            {isMobile ? (
              <SimplePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                isLoading={isLoading}
              />
            ) : (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={onPageChange}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

        {/* Load More Button */}
        {paginationType === 'loadMore' && onLoadMore && (
          <LoadMoreButton
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={onLoadMore}
          />
        )}
      </CardContent>
    </Card>
  );
}
