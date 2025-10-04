'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Droplets, Plus } from 'lucide-react';

import { LoadingButton } from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { waterIntakeSchema, type WaterIntakeFormData } from '@/lib/validations/health';
import { WaterIntakeRequest } from '@/lib/types/health';

interface WaterIntakeFormProps {
  onSubmit: (data: WaterIntakeRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

// Quick preset amounts in liters
const PRESET_AMOUNTS = [0.25, 0.5, 1.0, 1.5, 2.0];

export function WaterIntakeForm({ onSubmit, isLoading = false, error }: WaterIntakeFormProps) {
  const [customAmount, setCustomAmount] = useState<string>('');
  
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<WaterIntakeFormData>({
    resolver: zodResolver(waterIntakeSchema),
    defaultValues: {
      amountLtr: 0.5
    }
  });

  const currentAmount = watch('amountLtr');

  const handlePresetClick = (amount: number) => {
    setValue('amountLtr', amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setValue('amountLtr', numValue);
    }
  };

  const onFormSubmit = async (data: WaterIntakeFormData) => {
    try {
      await onSubmit(data);
      reset();
      setCustomAmount('');
    } catch (err) {
      // Error handling is managed by parent component
      console.error('Failed to submit water intake:', err);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" aria-hidden="true" />
          Add Water Intake
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form 
          onSubmit={handleSubmit(onFormSubmit)} 
          className="space-y-4"
          aria-label="Water intake form"
        >
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quick Preset Buttons */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Quick Add</legend>
            <div 
              className="grid grid-cols-3 sm:grid-cols-5 gap-2"
              role="group"
              aria-label="Preset water amounts"
            >
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={currentAmount === amount ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(amount)}
                  disabled={isFormLoading}
                  className="flex items-center gap-1 h-10 sm:h-9 text-xs sm:text-sm"
                  aria-label={`Add ${amount} liters`}
                  aria-pressed={currentAmount === amount}
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  {amount}L
                </Button>
              ))}
            </div>
          </fieldset>

          {/* Custom Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amountLtr" className="text-sm font-medium">
              Custom Amount (Liters)
            </Label>
            <div className="relative">
              <Input
                id="amountLtr"
                type="number"
                step="0.01"
                min="0.1"
                max="10.0"
                placeholder="Enter amount in liters"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                disabled={isFormLoading}
                className="pr-12 h-11 sm:h-10 text-base sm:text-sm"
                aria-describedby={errors.amountLtr ? "amount-error" : "amount-helper"}
                aria-invalid={!!errors.amountLtr}
                required
              />
              <div 
                className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                aria-hidden="true"
              >
                <span className="text-sm text-muted-foreground">L</span>
              </div>
            </div>
            {errors.amountLtr ? (
              <p id="amount-error" className="text-sm text-destructive" role="alert">
                {errors.amountLtr.message}
              </p>
            ) : (
              <p id="amount-helper" className="text-sm text-muted-foreground">
                Enter a value between 0.1 and 10.0 liters
              </p>
            )}
          </div>

          {/* Current Selection Display */}
          {currentAmount > 0 && (
            <div 
              className="p-3 bg-muted/50 rounded-md"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm text-muted-foreground">
                Selected amount: <span className="font-medium text-foreground">{currentAmount}L</span>
              </p>
            </div>
          )}

          {/* Submit Button */}
          <LoadingButton
            type="submit"
            loading={isFormLoading}
            loadingText="Adding water intake..."
            disabled={!currentAmount || currentAmount <= 0}
            className="w-full"
            icon={<Plus className="h-4 w-4" />}
            aria-describedby={currentAmount <= 0 ? "submit-disabled-reason" : undefined}
          >
            Add Water Intake
          </LoadingButton>
          
          {currentAmount <= 0 && (
            <p id="submit-disabled-reason" className="sr-only">
              Please select or enter a valid water amount to continue
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}