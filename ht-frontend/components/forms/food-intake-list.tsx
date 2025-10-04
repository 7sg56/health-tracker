'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Utensils, Trash2, Edit3, AlertCircle, Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

import { FoodIntake } from '@/lib/types/health';
import { Pagination, SimplePagination } from '@/components/ui/pagination';
import { InfiniteScroll, LoadMoreButton } from '@/components/ui/infinite-scroll';

interface FoodIntakeListProps {
  foodIntakes: FoodIntake[];
  onEdit: (foodIntake: FoodIntake) => void;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  showDate?: boolean;
  dailyCalorieGoal?: number;
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

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  foodIntake: FoodIntake | null;
  isDeleting: boolean;
}

function DeleteConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  foodIntake, 
  isDeleting 
}: DeleteConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Food Intake</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this food intake entry?
            {foodIntake && (
              <div className="mt-2 p-2 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Food:</strong> {foodIntake.foodItem}
                </p>
                <p className="text-sm">
                  <strong>Calories:</strong> {foodIntake.calories}
                </p>
                <p className="text-sm">
                  <strong>Time:</strong> {format(new Date(foodIntake.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
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
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FoodIntakeItem({ 
  foodIntake, 
  onEdit,
  onDelete, 
  showDate = true 
}: { 
  foodIntake: FoodIntake; 
  onEdit: (foodIntake: FoodIntake) => void;
  onDelete: (id: number) => Promise<void>; 
  showDate?: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(foodIntake.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete food intake:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (showDate) {
      return format(date, 'MMM d, h:mm a');
    }
    return format(date, 'h:mm a');
  };

  const getCalorieColor = (calories: number) => {
    if (calories >= 500) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    if (calories >= 300) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    if (calories >= 100) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <Utensils className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm truncate">{foodIntake.foodItem}</h4>
              <Badge variant="secondary" className={getCalorieColor(foodIntake.calories)}>
                {foodIntake.calories} cal
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatTime(foodIntake.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(foodIntake)}
            className="text-muted-foreground hover:text-primary"
            aria-label={`Edit ${foodIntake.foodItem}`}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Delete ${foodIntake.foodItem}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        foodIntake={foodIntake}
        isDeleting={isDeleting}
      />
    </>
  );
}

function FoodIntakeListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FoodIntakeList({ 
  foodIntakes, 
  onEdit,
  onDelete, 
  isLoading = false, 
  error,
  showDate = true,
  dailyCalorieGoal = 2000,
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  hasMore = false,
  onPageChange,
  onLoadMore,
  paginationType = 'none',
  isMobile = false
}: FoodIntakeListProps) {
  // Calculate total calories for the day
  const totalCalories = foodIntakes.reduce((sum, intake) => sum + intake.calories, 0);
  const progressPercentage = Math.min((totalCalories / dailyCalorieGoal) * 100, 100);
  const isOverGoal = totalCalories > dailyCalorieGoal;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-500" />
            Food Intake History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FoodIntakeListSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-orange-500" />
          Food Intake History
        </CardTitle>
        {foodIntakes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                Daily Progress
              </span>
              <span className={`font-medium ${isOverGoal ? 'text-red-600' : 'text-foreground'}`}>
                {totalCalories} / {dailyCalorieGoal} cal
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isOverGoal ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            {isOverGoal && (
              <p className="text-xs text-red-600">
                You've exceeded your daily calorie goal by {totalCalories - dailyCalorieGoal} calories
              </p>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {foodIntakes.length === 0 ? (
          <EmptyState
            icon={Utensils}
            title="No food intake recorded"
            description="Start tracking your daily food consumption and calories by adding your first entry above."
          />
        ) : (
          <>
            {paginationType === 'infinite' ? (
              <InfiniteScroll
                hasMore={hasMore}
                isLoading={isLoading}
                onLoadMore={onLoadMore || (() => {})}
                errorMessage={error}
                onRetry={onLoadMore}
              >
                <div className="space-y-3">
                  {foodIntakes.map((foodIntake) => (
                    <FoodIntakeItem
                      key={foodIntake.id}
                      foodIntake={foodIntake}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      showDate={showDate}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            ) : (
              <div className="space-y-3">
                {foodIntakes.map((foodIntake) => (
                  <FoodIntakeItem
                    key={foodIntake.id}
                    foodIntake={foodIntake}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    showDate={showDate}
                  />
                ))}
              </div>
            )}

            {/* Daily Summary */}
            {foodIntakes.length > 1 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total entries: {foodIntakes.length}
                  </span>
                  <span className="font-medium">
                    Total calories: {totalCalories}
                  </span>
                </div>
              </div>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}