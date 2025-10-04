'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Droplets, Trash2, AlertCircle } from 'lucide-react';

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

import { WaterIntake } from '@/lib/types/health';
import { Pagination, SimplePagination } from '@/components/ui/pagination';
import { InfiniteScroll, LoadMoreButton } from '@/components/ui/infinite-scroll';

interface WaterIntakeListProps {
  waterIntakes: WaterIntake[];
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  showDate?: boolean;
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
  waterIntake: WaterIntake | null;
  isDeleting: boolean;
}

function DeleteConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  waterIntake, 
  isDeleting 
}: DeleteConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Water Intake</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this water intake entry?
            {waterIntake && (
              <div className="mt-2 p-2 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Amount:</strong> {waterIntake.amountLtr}L
                </p>
                <p className="text-sm">
                  <strong>Time:</strong> {format(new Date(waterIntake.createdAt), 'MMM d, yyyy h:mm a')}
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

function WaterIntakeItem({ 
  waterIntake, 
  onDelete, 
  showDate = true 
}: { 
  waterIntake: WaterIntake; 
  onDelete: (id: number) => Promise<void>; 
  showDate?: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(waterIntake.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete water intake:', error);
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

  const getAmountColor = (amount: number) => {
    if (amount >= 2.0) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (amount >= 1.0) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Droplets className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={getAmountColor(waterIntake.amountLtr)}>
                {waterIntake.amountLtr}L
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatTime(waterIntake.createdAt)}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${waterIntake.amountLtr}L water intake`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        waterIntake={waterIntake}
        isDeleting={isDeleting}
      />
    </>
  );
}

function WaterIntakeListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function WaterIntakeList({ 
  waterIntakes, 
  onDelete, 
  isLoading = false, 
  error,
  showDate = true,
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  hasMore = false,
  onPageChange,
  onLoadMore,
  paginationType = 'none',
  isMobile = false
}: WaterIntakeListProps) {
  // Calculate total water intake for the day
  const totalWater = waterIntakes.reduce((sum, intake) => sum + intake.amountLtr, 0);
  const dailyGoal = 2.0; // 2 liters daily goal
  const progressPercentage = Math.min((totalWater / dailyGoal) * 100, 100);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Water Intake History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WaterIntakeListSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          Water Intake History
        </CardTitle>
        {waterIntakes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Daily Progress</span>
              <span className="font-medium">
                {totalWater.toFixed(1)}L / {dailyGoal}L
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
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

        {waterIntakes.length === 0 ? (
          <EmptyState
            icon={Droplets}
            title="No water intake recorded"
            description="Start tracking your daily water consumption by adding your first entry above."
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
                  {waterIntakes.map((waterIntake) => (
                    <WaterIntakeItem
                      key={waterIntake.id}
                      waterIntake={waterIntake}
                      onDelete={onDelete}
                      showDate={showDate}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            ) : (
              <div className="space-y-3">
                {waterIntakes.map((waterIntake) => (
                  <WaterIntakeItem
                    key={waterIntake.id}
                    waterIntake={waterIntake}
                    onDelete={onDelete}
                    showDate={showDate}
                  />
                ))}
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