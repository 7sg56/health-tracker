'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Utensils, Plus, Edit3, Search } from 'lucide-react';

import { LoadingButton } from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { foodIntakeSchema, type FoodIntakeFormData } from '@/lib/validations/health';
import { FoodIntakeRequest, FoodIntake } from '@/lib/types/health';

interface FoodIntakeFormProps {
  onSubmit: (data: FoodIntakeRequest) => Promise<void>;
  initialData?: FoodIntake;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
  error?: string | null;
  onCancel?: () => void;
}

// Common food suggestions with estimated calories
const FOOD_SUGGESTIONS = [
  { name: 'Apple', calories: 95 },
  { name: 'Banana', calories: 105 },
  { name: 'Chicken Breast (100g)', calories: 165 },
  { name: 'Rice (1 cup)', calories: 205 },
  { name: 'Bread Slice', calories: 80 },
  { name: 'Egg', calories: 70 },
  { name: 'Yogurt (1 cup)', calories: 150 },
  { name: 'Oatmeal (1 cup)', calories: 150 },
  { name: 'Salmon (100g)', calories: 208 },
  { name: 'Broccoli (1 cup)', calories: 25 },
  { name: 'Pasta (1 cup)', calories: 220 },
  { name: 'Almonds (28g)', calories: 164 },
];

export function FoodIntakeForm({ 
  onSubmit, 
  initialData, 
  mode = 'create', 
  isLoading = false, 
  error,
  onCancel 
}: FoodIntakeFormProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(FOOD_SUGGESTIONS);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FoodIntakeFormData>({
    resolver: zodResolver(foodIntakeSchema),
    defaultValues: {
      foodItem: initialData?.foodItem || '',
      calories: initialData?.calories || 0
    }
  });

  const watchedFoodItem = watch('foodItem');
  const watchedCalories = watch('calories');

  // Filter suggestions based on food item input
  useEffect(() => {
    if (watchedFoodItem) {
      const filtered = FOOD_SUGGESTIONS.filter(suggestion =>
        suggestion.name.toLowerCase().includes(watchedFoodItem.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(FOOD_SUGGESTIONS);
    }
  }, [watchedFoodItem]);

  const handleSuggestionClick = (suggestion: typeof FOOD_SUGGESTIONS[0]) => {
    setValue('foodItem', suggestion.name);
    setValue('calories', suggestion.calories);
    setShowSuggestions(false);
  };

  const onFormSubmit = async (data: FoodIntakeFormData) => {
    try {
      await onSubmit(data);
      if (mode === 'create') {
        reset();
      }
    } catch (err) {
      // Error handling is managed by parent component
      console.error('Failed to submit food intake:', err);
    }
  };

  const handleCancel = () => {
    if (mode === 'create') {
      reset();
    }
    onCancel?.();
  };

  const isFormLoading = isLoading || isSubmitting;
  const isEditMode = mode === 'edit';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-orange-500" />
          {isEditMode ? 'Edit Food Intake' : 'Add Food Intake'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Food Item Input with Suggestions */}
          <div className="space-y-2">
            <Label htmlFor="foodItem" className="text-sm font-medium">
              Food Item
            </Label>
            <div className="relative">
              <div className="relative">
                <Input
                  id="foodItem"
                  type="text"
                  placeholder="Enter food item (e.g., Apple, Chicken Breast)"
                  {...register('foodItem')}
                  disabled={isFormLoading}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicks
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="pr-10 h-11 sm:h-10 text-base sm:text-sm"
                  aria-describedby={errors.foodItem ? "food-item-error" : undefined}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-3 py-3 sm:py-2 text-left hover:bg-muted transition-colors flex items-center justify-between min-h-[48px] sm:min-h-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="text-sm truncate flex-1 mr-2">{suggestion.name}</span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {suggestion.calories} cal
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.foodItem && (
              <p id="food-item-error" className="text-sm text-destructive">
                {errors.foodItem.message}
              </p>
            )}
          </div>

          {/* Calories Input */}
          <div className="space-y-2">
            <Label htmlFor="calories" className="text-sm font-medium">
              Calories
            </Label>
            <div className="relative">
              <Input
                id="calories"
                type="number"
                min="1"
                max="5000"
                placeholder="Enter calories (1-5000)"
                {...register('calories', { valueAsNumber: true })}
                disabled={isFormLoading}
                className="pr-16 h-11 sm:h-10 text-base sm:text-sm"
                aria-describedby={errors.calories ? "calories-error" : undefined}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-sm text-muted-foreground">cal</span>
              </div>
            </div>
            {errors.calories && (
              <p id="calories-error" className="text-sm text-destructive">
                {errors.calories.message}
              </p>
            )}
          </div>

          {/* Current Selection Display */}
          {watchedFoodItem && watchedCalories > 0 && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{watchedFoodItem}</span>
                {' - '}
                <span className="font-medium text-foreground">{watchedCalories} calories</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <LoadingButton
              type="submit"
              loading={isFormLoading}
              loadingText={isEditMode ? 'Updating...' : 'Adding...'}
              disabled={!watchedFoodItem || !watchedCalories || watchedCalories <= 0}
              className="flex-1"
              icon={isEditMode ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              touchFriendly
            >
              <span className="hidden sm:inline">{isEditMode ? 'Update Food Intake' : 'Add Food Intake'}</span>
              <span className="sm:hidden">{isEditMode ? 'Update' : 'Add Food'}</span>
            </LoadingButton>
            
            {(isEditMode || onCancel) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isFormLoading}
                className="sm:w-auto"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}