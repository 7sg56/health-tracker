'use client';

import React, { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Filter, RefreshCw, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';


import { WaterIntakeForm, WaterIntakeList } from '@/components/forms';
import { SearchFilter } from '@/components/ui/search-filter';
import { useWaterIntake } from '@/hooks/use-water-intake';
import { useResponsive } from '@/hooks/use-responsive';
import { useHealthDataFilter, useSortOptions } from '@/hooks/use-search-filter';
import { WaterIntakeRequest } from '@/lib/types/health';

interface DateFilter {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

const DATE_FILTERS: DateFilter[] = [
  {
    label: 'Today',
    value: 'today',
    startDate: startOfDay(new Date()),
    endDate: endOfDay(new Date())
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    startDate: startOfDay(subDays(new Date(), 1)),
    endDate: endOfDay(subDays(new Date(), 1))
  },
  {
    label: 'Last 7 days',
    value: 'week',
    startDate: startOfDay(subDays(new Date(), 7)),
    endDate: endOfDay(new Date())
  },
  {
    label: 'Last 30 days',
    value: 'month',
    startDate: startOfDay(subDays(new Date(), 30)),
    endDate: endOfDay(new Date())
  },
  {
    label: 'All time',
    value: 'all',
    startDate: new Date(0),
    endDate: new Date()
  }
];

export default function WaterIntakePage() {
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('today');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(10);
  const [paginationType, setPaginationType] = useState<'pagination' | 'infinite' | 'loadMore'>('pagination');

  const { isMobile } = useResponsive();

  // Get water intake data first
  const {
    waterIntakes,
    isLoading,
    error,
    hasMore,
    totalElements,
    totalPages,
    currentPage,
    addWaterIntake,
    deleteWaterIntake,
    refreshData,
    loadMore,
    loadPage,
    clearError
  } = useWaterIntake({
    pageSize,
    infiniteScroll: paginationType === 'infinite',
    autoRefresh: true
  });

  // Search and filter functionality (depends on waterIntakes)
  const sortOptions = useSortOptions('water');
  const {
    filteredData: filteredWaterIntakes,
    searchState,
    updateSearchState,
    clearFilters,
    activeFilterCount,
    filterGroups
  } = useHealthDataFilter(waterIntakes, 'water', {
    enableAmountFilter: true
  });

  // Legacy filter logic (keeping for backward compatibility)
  const legacyFilteredWaterIntakes = React.useMemo(() => {
    if (selectedDateFilter === 'all') {
      return filteredWaterIntakes;
    }

    let startDate: Date;
    let endDate: Date;

    if (selectedDateFilter === 'custom') {
      if (!customStartDate || !customEndDate) {
        return filteredWaterIntakes;
      }
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    } else {
      const filter = DATE_FILTERS.find(f => f.value === selectedDateFilter);
      if (!filter) return filteredWaterIntakes;
      startDate = filter.startDate;
      endDate = filter.endDate;
    }

    return filteredWaterIntakes.filter(intake => {
      const intakeDate = new Date(intake.createdAt);
      return intakeDate >= startDate && intakeDate <= endDate;
    });
  }, [filteredWaterIntakes, selectedDateFilter, customStartDate, customEndDate]);

  // Final sorted water intakes
  const sortedWaterIntakes = React.useMemo(() => {
    return [...legacyFilteredWaterIntakes].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [legacyFilteredWaterIntakes, sortOrder]);

  const handleAddWaterIntake = async (data: WaterIntakeRequest) => {
    try {
      await addWaterIntake(data);
    } catch {
      // Error is handled by the hook and displayed in the form
    }
  };

  const handleDeleteWaterIntake = async (id: number) => {
    try {
      await deleteWaterIntake(id);
    } catch {
      // Error is handled by the hook and displayed in the list
    }
  };

  const handleDateFilterChange = (value: string) => {
    setSelectedDateFilter(value);
    if (value !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const handleRefresh = () => {
    clearError();
    refreshData();
  };

  // Calculate statistics for filtered data
  const totalWaterToday = React.useMemo(() => {
    const today = new Date().toDateString();
    return waterIntakes
      .filter(intake => new Date(intake.createdAt).toDateString() === today)
      .reduce((sum, intake) => sum + intake.amountLtr, 0);
  }, [waterIntakes]);

  const totalWaterFiltered = React.useMemo(() => {
    return sortedWaterIntakes.reduce((sum, intake) => sum + intake.amountLtr, 0);
  }, [sortedWaterIntakes]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Water Intake Tracking</h1>
          <p className="text-muted-foreground">
            Track your daily water consumption and stay hydrated
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Total</p>
                <p className="text-2xl font-bold">{totalWaterToday.toFixed(1)}L</p>
              </div>
              <Badge variant={totalWaterToday >= 2.0 ? "default" : "secondary"}>
                {totalWaterToday >= 2.0 ? "Goal Met!" : "Keep Going"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filtered Total</p>
                <p className="text-2xl font-bold">{totalWaterFiltered.toFixed(1)}L</p>
              </div>
              <Badge variant="outline">
                {sortedWaterIntakes.length} entries
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">All Time Total</p>
                <p className="text-2xl font-bold">{totalElements}</p>
              </div>
              <Badge variant="outline">entries</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Water Intake Form */}
        <div className="lg:col-span-1">
          <WaterIntakeForm
            onSubmit={handleAddWaterIntake}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Water Intake History */}
        <div className="lg:col-span-2 space-y-4">
          {/* Modern Search and Filter */}
          <SearchFilter
            searchPlaceholder="Search water intake entries..."
            sortOptions={sortOptions}
            filterGroups={filterGroups}
            dateRangeEnabled={true}
            onStateChange={updateSearchState}
            compact={isMobile}
          />

          {/* Legacy Filters and Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date Filter */}
                <div className="space-y-2">
                  <Label htmlFor="date-filter">Date Range</Label>
                  <Select value={selectedDateFilter} onValueChange={handleDateFilterChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_FILTERS.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <Label htmlFor="sort-order">Sort Order</Label>
                  <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page Size */}
                <div className="space-y-2">
                  <Label htmlFor="page-size">Items per Page</Label>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pagination Type Selection */}
              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="pagination-type">Display Mode</Label>
                  <Select value={paginationType} onValueChange={(value: 'pagination' | 'infinite' | 'loadMore') => setPaginationType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pagination">Pagination</SelectItem>
                      <SelectItem value="infinite">Infinite Scroll</SelectItem>
                      <SelectItem value="loadMore">Load More Button</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Date Range */}
              {selectedDateFilter === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate}
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Water Intake List */}
          <WaterIntakeList
            waterIntakes={sortedWaterIntakes}
            onDelete={handleDeleteWaterIntake}
            isLoading={isLoading}
            error={error}
            showDate={selectedDateFilter !== 'today'}
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            hasMore={hasMore}
            onPageChange={loadPage}
            onLoadMore={loadMore}
            paginationType={paginationType}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
}