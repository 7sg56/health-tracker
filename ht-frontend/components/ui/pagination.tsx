'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  showInfo?: boolean;
  className?: string;
}

interface PaginationButtonProps {
  page: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
}

function PaginationButton({
  page,
  currentPage,
  onPageChange,
  isLoading = false,
  children,
  variant = 'outline',
  disabled = false,
}: PaginationButtonProps) {
  const isActive = page === currentPage;

  return (
    <Button
      variant={isActive ? 'default' : variant}
      size="sm"
      onClick={() => onPageChange(page)}
      disabled={disabled || isLoading || isActive}
      className={cn('h-8 w-8 p-0', isActive && 'pointer-events-none')}
    >
      {children}
    </Button>
  );
}

function PaginationEllipsis() {
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <MoreHorizontal className="text-muted-foreground h-4 w-4" />
    </div>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isLoading = false,
  showInfo = true,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);

      if (currentPage <= 3) {
        // Show pages 0, 1, 2, 3, 4, ..., last
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        if (totalPages > 6) {
          pages.push('ellipsis');
        }
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 4) {
        // Show pages 0, ..., last-4, last-3, last-2, last-1, last
        if (totalPages > 6) {
          pages.push('ellipsis');
        }
        for (let i = totalPages - 5; i < totalPages; i++) {
          if (i > 0) {
            pages.push(i);
          }
        }
      } else {
        // Show pages 0, ..., current-1, current, current+1, ..., last
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {showInfo && (
        <div className="text-muted-foreground text-center text-sm">
          Showing {startItem} to {endItem} of {totalElements} entries
        </div>
      )}

      <div className="flex items-center justify-center gap-1">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          className="h-8 px-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) =>
            page === 'ellipsis' ? (
              <PaginationEllipsis key={`ellipsis-${index}`} />
            ) : (
              <PaginationButton
                key={page}
                page={page}
                currentPage={currentPage}
                onPageChange={onPageChange}
                isLoading={isLoading}
              >
                {page + 1}
              </PaginationButton>
            )
          )}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || isLoading}
          className="h-8 px-2"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
}

// Simple pagination for mobile
interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className,
}: SimplePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || isLoading}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <span className="text-muted-foreground text-sm">
        Page {currentPage + 1} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1 || isLoading}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
