'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Droplets, Trash2, AlertCircle, MoreHorizontal } from 'lucide-react';

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

import { WaterIntake } from '@/lib/types/health';
import { Pagination, SimplePagination } from '@/components/ui/pagination';
import {
  InfiniteScroll,
  LoadMoreButton,
} from '@/components/ui/infinite-scroll';

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
  isDeleting,
}: DeleteConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Water Intake</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this water intake entry?
            {waterIntake && (
              <div className="bg-muted mt-2 rounded-md p-2">
                <p className="text-sm">
                  <strong>Amount:</strong> {waterIntake.amountLtr}L
                </p>
                <p className="text-sm">
                  <strong>Time:</strong>{' '}
                  {format(
                    new Date(waterIntake.createdAt),
                    'MMM d, yyyy h:mm a'
                  )}
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

function WaterIntakeTableRow({
  waterIntake,
  onDelete,
  showDate = true,
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

  const getAmountVariant = (
    amount: number
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (amount >= 2.0) return 'default'; // Green for large amounts
    if (amount >= 1.0) return 'secondary'; // Blue for medium amounts
    return 'outline'; // Gray for small amounts
  };

  const getAmountColor = (amount: number) => {
    if (amount >= 2.0) return 'text-green-600 dark:text-green-400';
    if (amount >= 1.0) return 'text-blue-600 dark:text-blue-400';
    return 'text-muted-foreground';
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <Badge variant={getAmountVariant(waterIntake.amountLtr)}>
              {waterIntake.amountLtr}L
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-muted-foreground text-sm">
            {formatTime(waterIntake.createdAt)}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-muted-foreground text-sm">
            {waterIntake.date}
          </span>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                className="h-8 w-8 p-0"
                aria-label={`Actions for ${waterIntake.amountLtr}L water intake`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

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

function WaterIntakeTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Amount</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-[50px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-8 rounded-md" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
  isMobile = false,
}: WaterIntakeListProps) {
  // Calculate total water intake for the day
  const totalWater = waterIntakes.reduce(
    (sum, intake) => sum + intake.amountLtr,
    0
  );
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
          <WaterIntakeTableSkeleton />
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
            <Progress value={progressPercentage} className="h-2" />
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waterIntakes.map(waterIntake => (
                      <WaterIntakeTableRow
                        key={waterIntake.id}
                        waterIntake={waterIntake}
                        onDelete={onDelete}
                        showDate={showDate}
                      />
                    ))}
                  </TableBody>
                </Table>
              </InfiniteScroll>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waterIntakes.map(waterIntake => (
                    <WaterIntakeTableRow
                      key={waterIntake.id}
                      waterIntake={waterIntake}
                      onDelete={onDelete}
                      showDate={showDate}
                    />
                  ))}
                </TableBody>
              </Table>
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
