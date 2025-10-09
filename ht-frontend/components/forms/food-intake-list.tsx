'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Utensils,
  Trash2,
  Edit3,
  AlertCircle,
  Target,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

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
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { FoodIntake } from '@/lib/types/health';
import { Pagination, SimplePagination } from '@/components/ui/pagination';
import {
  InfiniteScroll,
  LoadMoreButton,
} from '@/components/ui/infinite-scroll';

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
  isDeleting,
}: DeleteConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Food Intake</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this food intake entry?
            {foodIntake && (
              <div className="bg-muted mt-2 rounded-md p-2">
                <p className="text-sm">
                  <strong>Food:</strong> {foodIntake.foodItem}
                </p>
                <p className="text-sm">
                  <strong>Calories:</strong> {foodIntake.calories}
                </p>
                <p className="text-sm">
                  <strong>Time:</strong>{' '}
                  {format(new Date(foodIntake.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
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
  showDate = true,
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
    if (calories >= 500) return 'destructive';
    if (calories >= 300) return 'default';
    if (calories >= 100) return 'secondary';
    return 'outline';
  };

  const getCalorieIntensity = (calories: number) => {
    if (calories >= 500) return 'High';
    if (calories >= 300) return 'Medium';
    if (calories >= 100) return 'Low';
    return 'Very Low';
  };

  return (
    <>
      <Card className="border-l-4 border-l-orange-500 transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <Utensils className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-base leading-tight font-semibold">
                      {foodIntake.foodItem}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={getCalorieColor(foodIntake.calories)}
                        className="text-xs"
                      >
                        {foodIntake.calories} cal
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getCalorieIntensity(foodIntake.calories)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3" />
                  <span>{formatTime(foodIntake.createdAt)}</span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isDeleting}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(foodIntake)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

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

function FoodIntakeTableView({
  foodIntakes,
  onEdit,
  onDelete,
  showDate = true,
}: {
  foodIntakes: FoodIntake[];
  onEdit: (foodIntake: FoodIntake) => void;
  onDelete: (id: number) => Promise<void>;
  showDate?: boolean;
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodIntake | null>(null);

  const handleDelete = async () => {
    if (!selectedItem) return;

    setDeletingId(selectedItem.id);
    try {
      await onDelete(selectedItem.id);
      setShowDeleteDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to delete food intake:', error);
    } finally {
      setDeletingId(null);
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
    if (calories >= 500) return 'text-red-600 dark:text-red-400';
    if (calories >= 300) return 'text-orange-600 dark:text-orange-400';
    if (calories >= 100) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Food Item</TableHead>
              <TableHead className="text-right">Calories</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {foodIntakes.map(foodIntake => (
              <TableRow key={foodIntake.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{foodIntake.foodItem}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`font-semibold ${getCalorieColor(foodIntake.calories)}`}
                  >
                    {foodIntake.calories}
                  </span>
                  <span className="text-muted-foreground ml-1">cal</span>
                </TableCell>
                <TableCell>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {formatTime(foodIntake.createdAt)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={deletingId === foodIntake.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(foodIntake)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedItem(foodIntake);
                          setShowDeleteDialog(true);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDelete}
        foodIntake={selectedItem}
        isDeleting={deletingId !== null}
      />
    </>
  );
}

function FoodIntakeListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </CardContent>
        </Card>
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
  isMobile = false,
}: FoodIntakeListProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Calculate total calories and statistics
  const totalCalories = foodIntakes.reduce(
    (sum, intake) => sum + intake.calories,
    0
  );
  const progressPercentage = Math.min(
    (totalCalories / dailyCalorieGoal) * 100,
    100
  );
  const isOverGoal = totalCalories > dailyCalorieGoal;
  const averageCalories =
    foodIntakes.length > 0 ? Math.round(totalCalories / foodIntakes.length) : 0;

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
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-500" />
            Food Intake History
          </CardTitle>

          {foodIntakes.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Statistics */}
        {foodIntakes.length > 0 && (
          <div className="space-y-4">
            {/* Daily Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Daily Progress
                </span>
                <span
                  className={`font-medium ${isOverGoal ? 'text-red-600' : 'text-foreground'}`}
                >
                  {totalCalories} / {dailyCalorieGoal} cal
                </span>
              </div>
              <Progress
                value={progressPercentage}
                className={`h-2 ${isOverGoal ? '[&>div]:bg-red-500' : '[&>div]:bg-orange-500'}`}
              />
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{progressPercentage.toFixed(1)}% of goal</span>
                {isOverGoal ? (
                  <span className="text-red-600">
                    +{totalCalories - dailyCalorieGoal} cal over
                  </span>
                ) : (
                  <span>{dailyCalorieGoal - totalCalories} cal remaining</span>
                )}
              </div>
            </div>

            <Separator />

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-orange-600">
                  {foodIntakes.length}
                </p>
                <p className="text-muted-foreground text-xs">Entries</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{averageCalories}</p>
                <p className="text-muted-foreground text-xs">Avg/Entry</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <p className="text-2xl font-bold">
                    {progressPercentage.toFixed(0)}%
                  </p>
                </div>
                <p className="text-muted-foreground text-xs">Goal</p>
              </div>
            </div>
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
            {/* View Mode Content */}
            {viewMode === 'table' ? (
              <FoodIntakeTableView
                foodIntakes={foodIntakes}
                onEdit={onEdit}
                onDelete={onDelete}
                showDate={showDate}
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
                      {foodIntakes.map(foodIntake => (
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
                    {foodIntakes.map(foodIntake => (
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
              </>
            )}

            {/* Enhanced Summary */}
            {foodIntakes.length > 1 && (
              <div className="mt-6 space-y-3 border-t pt-4">
                <div className="mb-2 flex items-center gap-2">
                  <BarChart3 className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Session Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div className="bg-muted/50 rounded-md p-2 text-center">
                    <p className="font-semibold">{foodIntakes.length}</p>
                    <p className="text-muted-foreground text-xs">
                      Total Entries
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-2 text-center">
                    <p className="font-semibold text-orange-600">
                      {totalCalories}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Total Calories
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-2 text-center">
                    <p className="font-semibold">{averageCalories}</p>
                    <p className="text-muted-foreground text-xs">
                      Avg per Entry
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-2 text-center">
                    <p
                      className={`font-semibold ${isOverGoal ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {progressPercentage.toFixed(0)}%
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Goal Progress
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {paginationType === 'pagination' &&
              onPageChange &&
              totalPages > 1 && (
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
