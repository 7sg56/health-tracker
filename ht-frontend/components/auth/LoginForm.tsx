'use client';

/**
 * Login Form Component
 * Provides user login functionality with React Hook Form and Zod validation
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { LoadingButton } from '../ui/loading-button';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';

import { loginSchema, type LoginFormData } from '../../lib/validations/auth';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showCard?: boolean;
  className?: string;
}

export function LoginForm({ 
  onSuccess, 
  onError, 
  showCard = true, 
  className 
}: LoginFormProps) {
  const { login, state } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onChange', // Enable real-time validation
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      onError?.(errorMessage);
      
      // Set form error if it's a validation error
      if (errorMessage.includes('username') || errorMessage.includes('password')) {
        form.setError('root', { message: errorMessage });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your username"
                  autoComplete="username"
                  disabled={state.isLoading}
                  className="h-11 sm:h-10 text-base sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={state.isLoading}
                    className="pr-10 h-11 sm:h-10 text-base sm:text-sm"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={togglePasswordVisibility}
                    disabled={state.isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display general form errors */}
        {form.formState.errors.root && (
          <div className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Display auth context errors */}
        {state.error && (
          <div className="text-sm text-destructive">
            {state.error}
          </div>
        )}

        <LoadingButton
          type="submit"
          className="w-full"
          loading={state.isLoading}
          loadingText="Signing in..."
          disabled={!form.formState.isValid}
          touchFriendly
        >
          Sign In
        </LoadingButton>
      </form>
    </Form>
  );

  if (!showCard) {
    return <div className={className}>{formContent}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your health tracker
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}

// Export a simplified version for quick usage
export function QuickLoginForm(props: Omit<LoginFormProps, 'showCard'>) {
  return <LoginForm {...props} showCard={false} />;
}