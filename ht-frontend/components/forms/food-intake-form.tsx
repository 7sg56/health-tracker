'use client';

import React, { useState, useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Utensils, Plus, Edit3, Search, Calculator, Clock } from 'lucide-react';

import { LoadingButton } from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import {
  foodIntakeSchema,
  type FoodIntakeFormData,
} from '@/lib/validations/health';
import { FoodIntakeRequest, FoodIntake } from '@/lib/types/health';
import { z } from 'zod';

interface FoodIntakeFormProps {
  onSubmit: (data: FoodIntakeRequest) => Promise<void>;
  initialData?: FoodIntake;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
  error?: string | null;
  onCancel?: () => void;
}

// Common food suggestions with estimated calories and categories
const FOOD_SUGGESTIONS = [
  // Fruits
  { name: 'Apple', calories: 95, category: 'Fruits' },
  { name: 'Banana', calories: 105, category: 'Fruits' },
  { name: 'Orange', calories: 62, category: 'Fruits' },
  { name: 'Grapes (1 cup)', calories: 104, category: 'Fruits' },

  // Proteins
  { name: 'Chicken Breast (100g)', calories: 165, category: 'Proteins' },
  { name: 'Salmon (100g)', calories: 208, category: 'Proteins' },
  { name: 'Egg', calories: 70, category: 'Proteins' },
  { name: 'Greek Yogurt (1 cup)', calories: 150, category: 'Proteins' },
  { name: 'Tuna (100g)', calories: 132, category: 'Proteins' },

  // Grains & Carbs
  { name: 'Rice (1 cup)', calories: 205, category: 'Grains' },
  { name: 'Bread Slice', calories: 80, category: 'Grains' },
  { name: 'Oatmeal (1 cup)', calories: 150, category: 'Grains' },
  { name: 'Pasta (1 cup)', calories: 220, category: 'Grains' },
  { name: 'Quinoa (1 cup)', calories: 222, category: 'Grains' },

  // Vegetables
  { name: 'Broccoli (1 cup)', calories: 25, category: 'Vegetables' },
  { name: 'Spinach (1 cup)', calories: 7, category: 'Vegetables' },
  { name: 'Carrots (1 cup)', calories: 52, category: 'Vegetables' },
  { name: 'Bell Pepper (1 cup)', calories: 30, category: 'Vegetables' },

  // Nuts & Seeds
  { name: 'Almonds (28g)', calories: 164, category: 'Nuts & Seeds' },
  { name: 'Walnuts (28g)', calories: 185, category: 'Nuts & Seeds' },
  { name: 'Peanut Butter (2 tbsp)', calories: 188, category: 'Nuts & Seeds' },

  // Dairy
  { name: 'Milk (1 cup)', calories: 149, category: 'Dairy' },
  { name: 'Cheese Slice', calories: 113, category: 'Dairy' },
  { name: 'Yogurt (1 cup)', calories: 150, category: 'Dairy' },
];

// Meal type options
const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'other', label: 'Other' },
];

export function FoodIntakeForm({
  onSubmit,
  initialData,
  mode = 'create',
  isLoading = false,
  error,
  onCancel,
}: FoodIntakeFormProps) {
  const formSchema = foodIntakeSchema.extend({
    mealType: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] =
    useState(FOOD_SUGGESTIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const form = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      foodItem: initialData?.foodItem || '',
      calories:
        typeof initialData?.calories === 'number' ? initialData.calories : 0,
      mealType: 'other',
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = form;
  const watchedFoodItem = watch('foodItem');
  const watchedCalories = watch('calories');
  const watchedMealType = watch('mealType');

  // Filter suggestions based on food item input and category
  useEffect(() => {
    let filtered = FOOD_SUGGESTIONS;

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(
        suggestion => suggestion.category === selectedCategory
      );
    }

    if (watchedFoodItem) {
      filtered = filtered.filter(suggestion =>
        suggestion.name.toLowerCase().includes(watchedFoodItem.toLowerCase())
      );
    }

    setFilteredSuggestions(filtered);
  }, [watchedFoodItem, selectedCategory]);

  const handleSuggestionClick = (suggestion: (typeof FOOD_SUGGESTIONS)[0]) => {
    setValue('foodItem', suggestion.name);
    setValue('calories', suggestion.calories);
    setShowSuggestions(false);
  };

  const onFormSubmit = async (data: FormValues) => {
    try {
      // Extract only the required fields for the API
      const { foodItem, calories } = data;
      await onSubmit({ foodItem, calories });
      if (mode === 'create') {
        reset();
        setSelectedCategory('all');
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

  const categories = [...new Set(FOOD_SUGGESTIONS.map(s => s.category))];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-orange-500" />
          {isEditMode ? 'Edit Food Intake' : 'Log Food Intake'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Meal Type Selection */}
            <FormField
              control={control}
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? 'other'}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      position="popper"
                      align="start"
                      className="z-[60]"
                    >
                      {MEAL_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of meal for better tracking
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Food Category Filter */}
            <div className="space-y-2">
              <FormLabel>Food Category (Optional)</FormLabel>
              <Select
                value={selectedCategory || undefined}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  className="z-[60]"
                >
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Food Item Input with Enhanced Suggestions */}
            <FormField
              control={control}
              name="foodItem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Item *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter food item (e.g., Apple, Chicken Breast)"
                        {...field}
                        disabled={isFormLoading}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => {
                          // Delay hiding suggestions to allow clicks
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        className="pr-10"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <Search className="text-muted-foreground h-4 w-4" />
                      </div>

                      {/* Enhanced Suggestions Dropdown */}
                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="bg-popover absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-md border shadow-lg">
                          <div className="p-2">
                            <p className="text-muted-foreground mb-2 text-xs">
                              Suggestions ({filteredSuggestions.length})
                            </p>
                            {filteredSuggestions
                              .slice(0, 12)
                              .map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="hover:bg-muted group flex w-full items-center justify-between rounded-sm px-3 py-2 text-left transition-colors"
                                  onClick={() =>
                                    handleSuggestionClick(suggestion)
                                  }
                                >
                                  <div className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium">
                                      {suggestion.name}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      {suggestion.category}
                                    </span>
                                  </div>
                                  <div className="ml-2 flex items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {suggestion.calories} cal
                                    </Badge>
                                    <Calculator className="text-muted-foreground h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                  </div>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Start typing to see suggestions or enter your own food item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Calories Input with Enhanced Validation */}
            <FormField
              control={control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calories *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="5000"
                        step="1"
                        inputMode="numeric"
                        placeholder="Enter calories (1-5000)"
                        {...field}
                        onChange={e => {
                          // Always store a valid number, fallback to 0 if invalid
                          const value = e.target.value;
                          let n = Number(value);
                          if (typeof n !== 'number' || isNaN(n) || n < 0) n = 0;
                          field.onChange(n);
                        }}
                        disabled={isFormLoading}
                        className="pr-16"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-muted-foreground text-sm">
                          cal
                        </span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter the total calories for this food item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Selection Preview */}
            {watchedFoodItem && watchedCalories > 0 && (
              <div className="bg-muted/50 rounded-lg border border-dashed p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Preview</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{watchedFoodItem}</span>
                    {watchedMealType && watchedMealType !== 'other' && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {
                          MEAL_TYPES.find(t => t.value === watchedMealType)
                            ?.label
                        }
                      </Badge>
                    )}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <span className="font-medium text-orange-600">
                      {watchedCalories} calories
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <LoadingButton
                type="submit"
                loading={isFormLoading}
                loadingText={isEditMode ? 'Updating...' : 'Adding...'}
                disabled={
                  isFormLoading ||
                  !watchedFoodItem?.toString().trim() ||
                  Number.isNaN(Number(watchedCalories)) ||
                  Number(watchedCalories) === 0
                }
                className="flex-1"
                size="lg"
              >
                {isEditMode ? (
                  <>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Update Food Intake
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Food Intake
                  </>
                )}
              </LoadingButton>

              {(isEditMode || onCancel) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isFormLoading}
                  size="lg"
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
