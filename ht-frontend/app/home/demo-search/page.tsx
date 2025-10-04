'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchFilter, SearchFilterState } from '@/components/ui/search-filter';
import { Pagination } from '@/components/ui/pagination';
import { InfiniteScroll } from '@/components/ui/infinite-scroll';
import { useResponsive } from '@/hooks/use-responsive';
import { useSearchFilter, useSortOptions } from '@/hooks/use-search-filter';

// Mock data for demonstration
const mockHealthData = [
  { id: 1, type: 'water', amountLtr: 0.5, createdAt: '2024-01-15T08:00:00Z', date: '2024-01-15' },
  { id: 2, type: 'food', foodItem: 'Apple', calories: 95, createdAt: '2024-01-15T09:00:00Z', date: '2024-01-15' },
  { id: 3, type: 'workout', activity: 'Running', durationMin: 30, caloriesBurned: 300, createdAt: '2024-01-15T10:00:00Z', date: '2024-01-15' },
  { id: 4, type: 'water', amountLtr: 1.0, createdAt: '2024-01-15T11:00:00Z', date: '2024-01-15' },
  { id: 5, type: 'food', foodItem: 'Banana', calories: 105, createdAt: '2024-01-15T12:00:00Z', date: '2024-01-15' },
  { id: 6, type: 'workout', activity: 'Cycling', durationMin: 45, caloriesBurned: 400, createdAt: '2024-01-15T13:00:00Z', date: '2024-01-15' },
  { id: 7, type: 'water', amountLtr: 0.75, createdAt: '2024-01-14T14:00:00Z', date: '2024-01-14' },
  { id: 8, type: 'food', foodItem: 'Chicken Breast', calories: 165, createdAt: '2024-01-14T15:00:00Z', date: '2024-01-14' },
  { id: 9, type: 'workout', activity: 'Swimming', durationMin: 60, caloriesBurned: 500, createdAt: '2024-01-14T16:00:00Z', date: '2024-01-14' },
  { id: 10, type: 'water', amountLtr: 2.0, createdAt: '2024-01-14T17:00:00Z', date: '2024-01-14' },
  { id: 11, type: 'food', foodItem: 'Salad', calories: 50, createdAt: '2024-01-13T18:00:00Z', date: '2024-01-13' },
  { id: 12, type: 'workout', activity: 'Yoga', durationMin: 90, caloriesBurned: 200, createdAt: '2024-01-13T19:00:00Z', date: '2024-01-13' },
  { id: 13, type: 'water', amountLtr: 1.5, createdAt: '2024-01-13T20:00:00Z', date: '2024-01-13' },
  { id: 14, type: 'food', foodItem: 'Pizza', calories: 450, createdAt: '2024-01-12T21:00:00Z', date: '2024-01-12' },
  { id: 15, type: 'workout', activity: 'Weight Training', durationMin: 75, caloriesBurned: 350, createdAt: '2024-01-12T22:00:00Z', date: '2024-01-12' },
];

interface HealthDataItemProps {
  item: typeof mockHealthData[0];
}

function HealthDataItem({ item }: HealthDataItemProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'water': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'food': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'workout': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getTypeColor(item.type)}>
                {item.type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                #{item.id}
              </span>
            </div>
            
            <div className="space-y-1">
              {item.type === 'water' && (
                <p className="font-medium">{item.amountLtr}L Water</p>
              )}
              {item.type === 'food' && (
                <div>
                  <p className="font-medium">{item.foodItem}</p>
                  <p className="text-sm text-muted-foreground">{item.calories} calories</p>
                </div>
              )}
              {item.type === 'workout' && (
                <div>
                  <p className="font-medium">{item.activity}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.durationMin} min • {item.caloriesBurned} cal burned
                  </p>
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              {formatDate(item.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DemoSearchPage() {
  const { isMobile } = useResponsive();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [paginationType, setPaginationType] = useState<'pagination' | 'infinite'>('pagination');

  // Sort options for mixed health data
  const sortOptions = [
    { value: 'createdAt:desc', label: 'Newest First', field: 'createdAt', direction: 'desc' as const },
    { value: 'createdAt:asc', label: 'Oldest First', field: 'createdAt', direction: 'asc' as const },
    { value: 'type:asc', label: 'Type (A-Z)', field: 'type', direction: 'asc' as const },
    { value: 'type:desc', label: 'Type (Z-A)', field: 'type', direction: 'desc' as const },
    { value: 'id:asc', label: 'ID (Low to High)', field: 'id', direction: 'asc' as const },
    { value: 'id:desc', label: 'ID (High to Low)', field: 'id', direction: 'desc' as const }
  ];

  // Filter groups for mixed health data
  const filterGroups = [
    {
      key: 'type',
      label: 'Data Type',
      options: [
        { value: 'water', label: 'Water Intake', count: mockHealthData.filter(item => item.type === 'water').length },
        { value: 'food', label: 'Food Intake', count: mockHealthData.filter(item => item.type === 'food').length },
        { value: 'workout', label: 'Workouts', count: mockHealthData.filter(item => item.type === 'workout').length }
      ],
      multiple: true
    }
  ];

  // Use search filter hook
  const {
    filteredData,
    searchState,
    updateSearchState,
    clearFilters,
    activeFilterCount
  } = useSearchFilter(mockHealthData, {
    searchFields: ['foodItem', 'activity', 'type'],
    dateField: 'createdAt'
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = paginationType === 'pagination' 
    ? filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : filteredData.slice(0, (currentPage + 1) * pageSize);

  const hasMore = (currentPage + 1) * pageSize < filteredData.length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLoadMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Search & Filter Demo</h1>
          <p className="text-muted-foreground">
            Demonstration of advanced search and filtering capabilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredData.length} of {mockHealthData.length} items
          </Badge>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">
              {activeFilterCount} filters active
            </Badge>
          )}
        </div>
      </div>

      {/* Search and Filter Component */}
      <SearchFilter
        searchPlaceholder="Search health data..."
        sortOptions={sortOptions}
        filterGroups={filterGroups}
        dateRangeEnabled={true}
        onStateChange={updateSearchState}
        compact={isMobile}
      />

      {/* Display Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Display Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paginationType"
                value="pagination"
                checked={paginationType === 'pagination'}
                onChange={(e) => {
                  setPaginationType(e.target.value as 'pagination');
                  setCurrentPage(0);
                }}
              />
              Pagination
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paginationType"
                value="infinite"
                checked={paginationType === 'infinite'}
                onChange={(e) => {
                  setPaginationType(e.target.value as 'infinite');
                  setCurrentPage(0);
                }}
              />
              Infinite Scroll
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Results</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all filters
            </button>
          )}
        </div>

        {paginationType === 'infinite' ? (
          <InfiniteScroll
            hasMore={hasMore}
            isLoading={false}
            onLoadMore={handleLoadMore}
          >
            <div className="grid gap-4">
              {paginatedData.map((item) => (
                <HealthDataItem key={item.id} item={item} />
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          <>
            <div className="grid gap-4">
              {paginatedData.map((item) => (
                <HealthDataItem key={item.id} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={filteredData.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                isLoading={false}
              />
            )}
          </>
        )}

        {filteredData.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No items match your current filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Search Query:</strong> {searchState.searchQuery || 'None'}</p>
            <p><strong>Date Range:</strong> {
              searchState.dateRange 
                ? `${searchState.dateRange.from.toLocaleDateString()} - ${searchState.dateRange.to.toLocaleDateString()}`
                : 'None'
            }</p>
            <p><strong>Sort By:</strong> {searchState.sortBy || 'None'}</p>
            <p><strong>Filters:</strong> {JSON.stringify(searchState.filters)}</p>
            <p><strong>Total Items:</strong> {mockHealthData.length}</p>
            <p><strong>Filtered Items:</strong> {filteredData.length}</p>
            <p><strong>Current Page:</strong> {currentPage + 1} of {totalPages}</p>
            <p><strong>Display Mode:</strong> {paginationType}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}