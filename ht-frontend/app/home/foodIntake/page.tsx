'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Search, Filter, TrendingUp, Target, Utensils } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import { FoodIntakeForm, FoodIntakeList } from '@/components/forms';
import { SearchFilter } from '@/components/ui/search-filter';
import { useFoodIntake } from '@/hooks/use-food-intake';
import { useResponsive } from '@/hooks/use-responsive';
import { useHealthDataFilter, useSortOptions } from '@/hooks/use-search-filter';
import { FoodIntake, FoodIntakeRequest } from '@/lib/types/health';

// Daily calorie goals by activity level
const CALORIE_GOALS = {
  sedentary: { male: 2000, female: 1600 },
  lightly_active: { male: 2200, female: 1800 },
  moderately_active: { male: 2400, female: 2000 },
  very_active: { male: 2600, female: 2200 },
  extremely_active: { male: 2800, female: 2400 },
};

interface FoodTrackingStatsProps {
  totalCalories: number;
  averageCaloriesPerMeal: number;
  totalEntries: number;
  dailyGoal: number;
}

function FoodTrackingStats({ 
  totalCalories, 
  averageCaloriesPerMeal, 
  totalEntries, 
  dailyGoal 
}: FoodTrackingStatsProps) {
  const progressPercentage = Math.min((totalCalories / dailyGoal) * 100, 100);
  const remainingCalories = Math.max(dailyGoal - totalCalories, 0);
  const isOverGoal = totalCalories > dailyGoal;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Calories</p>
              <p className={`text-2xl font-bold ${isOverGoal ? 'text-red-600' : 'text-foreground'}`}>
                {totalCalories}
              </p>
            </div>
            <Target className="h-8 w-8 text-orange-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isOverGoal ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Goal: {dailyGoal} cal
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${isOverGoal ? 'text-red-600' : 'text-green-600'}`}>
                {isOverGoal ? `+${totalCalories - dailyGoal}` : remainingCalories}
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${isOverGoal ? 'text-red-500' : 'text-green-500'}`} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isOverGoal ? 'Over goal' : 'Calories left'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg per Meal</p>
              <p className="text-2xl font-bold">{averageCaloriesPerMeal}</p>
            </div>
            <Utensils className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Calories per entry
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{totalEntries}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Food items logged
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
}

function SearchAndFilter({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  dateFilter,
  onDateFilterChange
}: SearchAndFilterProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Food Items</Label>
            <div className="relative">
              <Input
                id="search"
                type="text"
                placeholder="Search by food name..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="calories-desc">Highest Calories</SelectItem>
                <SelectItem value="calories-asc">Lowest Calories</SelectItem>
                <SelectItem value="name-asc">Food Name A-Z</SelectItem>
                <SelectItem value="name-desc">Food Name Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="date-filter">Filter by Date</Label>
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FoodIntakePage() {
  const {
    foodIntakes,
    isLoading,
    error,
    totalCalories,
    averageCaloriesPerMeal,
    hasMore,
    totalPages,
    currentPage,
    addFoodIntake,
    updateFoodIntake,
    deleteFoodIntake,
    loadPage,
    loadMore,
    refresh,
    clearError
  } = useFoodIntake({
    pageSize: 20,
    infiniteScroll: false
  });

  const { isMobile } = useResponsive();

  // Search and filter functionality
  const sortOptions = useSortOptions('food');
  const {
    filteredData: filteredFoodIntakes,
    searchState,
    updateSearchState,
    clearFilters,
    activeFilterCount,
    filterGroups
  } = useHealthDataFilter(foodIntakes, 'food', {
    enableCalorieFilter: true
  });

  // Local state for form and filtering
  const [editingFood, setEditingFood] = useState<FoodIntake | null>(null);
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);
  const [legacyFilteredFoodIntakes, setLegacyFilteredFoodIntakes] = useState<FoodIntake[]>([]);

  // Legacy date filter (keeping for backward compatibility)
  useEffect(() => {
    let filtered = [...filteredFoodIntakes];

    // Apply legacy date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const startDate = startOfDay(filterDate);
      const endDate = endOfDay(filterDate);
      
      filtered = filtered.filter(food => {
        const foodDate = new Date(food.date);
        return foodDate >= startDate && foodDate <= endDate;
      });
    }

    setLegacyFilteredFoodIntakes(filtered);
  }, [filteredFoodIntakes, dateFilter]);

  // Handle form submissions
  const handleAddFood = async (data: FoodIntakeRequest) => {
    try {
      await addFoodIntake(data);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleUpdateFood = async (data: FoodIntakeRequest) => {
    if (!editingFood) return;
    
    try {
      await updateFoodIntake(editingFood.id, data);
      setEditingFood(null);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleEditFood = (food: FoodIntake) => {
    setEditingFood(food);
  };

  const handleCancelEdit = () => {
    setEditingFood(null);
  };

  const handleDeleteFood = async (id: number) => {
    try {
      await deleteFoodIntake(id);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Calculate stats for filtered data
  const filteredTotalCalories = legacyFilteredFoodIntakes.reduce((sum, food) => sum + food.calories, 0);
  const filteredAverageCalories = legacyFilteredFoodIntakes.length > 0 
    ? Math.round(filteredTotalCalories / legacyFilteredFoodIntakes.length) 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Food Intake Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your daily food consumption and calorie intake
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {format(new Date(dateFilter), 'MMM d, yyyy')}
        </Badge>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Daily Stats */}
      <FoodTrackingStats
        totalCalories={filteredTotalCalories}
        averageCaloriesPerMeal={filteredAverageCalories}
        totalEntries={legacyFilteredFoodIntakes.length}
        dailyGoal={dailyCalorieGoal}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="track" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="track">Track Food</TabsTrigger>
          <TabsTrigger value="history">History & Analysis</TabsTrigger>
        </TabsList>

        {/* Track Food Tab */}
        <TabsContent value="track" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Food Form */}
            <div>
              <FoodIntakeForm
                onSubmit={editingFood ? handleUpdateFood : handleAddFood}
                initialData={editingFood || undefined}
                mode={editingFood ? 'edit' : 'create'}
                isLoading={isLoading}
                error={error}
                onCancel={editingFood ? handleCancelEdit : undefined}
              />
            </div>

            {/* Recent Entries */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border rounded">
                          <Skeleton className="h-5 w-5" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-5 w-12" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {legacyFilteredFoodIntakes.slice(0, 5).map((food) => (
                        <div key={food.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Utensils className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="font-medium text-sm">{food.foodItem}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(food.createdAt), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {food.calories} cal
                          </Badge>
                        </div>
                      ))}
                      {legacyFilteredFoodIntakes.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No food entries for selected date
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* History & Analysis Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Modern Search and Filter */}
          <SearchFilter
            searchPlaceholder="Search food items by name..."
            sortOptions={sortOptions}
            filterGroups={filterGroups}
            dateRangeEnabled={true}
            onStateChange={updateSearchState}
            compact={isMobile}
          />

          {/* Legacy Search and Filter */}
          <SearchAndFilter
            searchQuery=""
            onSearchChange={() => {}}
            sortBy=""
            onSortChange={() => {}}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
          />

          {/* Food Intake List */}
          <FoodIntakeList
            foodIntakes={legacyFilteredFoodIntakes}
            onEdit={handleEditFood}
            onDelete={handleDeleteFood}
            isLoading={isLoading}
            error={error}
            showDate={!dateFilter || dateFilter !== format(new Date(), 'yyyy-MM-dd')}
            dailyCalorieGoal={dailyCalorieGoal}
            currentPage={currentPage}
            totalPages={totalPages}
            hasMore={hasMore}
            onPageChange={loadPage}
            onLoadMore={loadMore}
            paginationType="pagination"
            isMobile={isMobile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}