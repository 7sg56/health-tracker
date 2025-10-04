'use client';

/**
 * Register Form Component
 * Provides user registration functionality with React Hook Form and Zod validation
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../ui/form';

import {
  registerSchema,
  type RegisterFormData,
} from '../../lib/validations/auth';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showCard?: boolean;
  className?: string;
}

// Password strength indicator component
function PasswordStrengthIndicator({ password }: { password: string }) {
  const requirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'One number', test: (pwd: string) => /\d/.test(pwd) },
  ];

  if (!password) return null;

  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">Password requirements:</p>
      {requirements.map((req, index) => {
        const isValid = req.test(password);
        return (
          <div key={index} className="flex items-center gap-2 text-xs">
            {isValid ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="text-muted-foreground h-3 w-3" />
            )}
            <span
              className={isValid ? 'text-green-600' : 'text-muted-foreground'}
            >
              {req.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function RegisterForm({
  onSuccess,
  onError,
  showCard = true,
  className,
}: RegisterFormProps) {
  const { register, state } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    mode: 'onChange', // Enable real-time validation
  });

  const watchedPassword = form.watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      onError?.(errorMessage);

      // Set form error if it's a validation error
      if (errorMessage.includes('username') || errorMessage.includes('email')) {
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
                  placeholder="Choose a username"
                  autoComplete="username"
                  disabled={state.isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                3-50 characters, letters, numbers, and underscores only
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  disabled={state.isLoading}
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
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    disabled={state.isLoading}
                    className="pr-10"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2"
                    onClick={togglePasswordVisibility}
                    disabled={state.isLoading}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
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
              {watchedPassword && (
                <PasswordStrengthIndicator password={watchedPassword} />
              )}
            </FormItem>
          )}
        />

        {/* Display general form errors */}
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Display auth context errors */}
        {state.error && (
          <div className="text-destructive text-sm">{state.error}</div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={state.isLoading || !form.formState.isValid}
        >
          {state.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {state.isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );

  if (!showCard) {
    return <div className={className}>{formContent}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Sign up for a new health tracker account
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}

// Export a simplified version for quick usage
export function QuickRegisterForm(props: Omit<RegisterFormProps, 'showCard'>) {
  return <RegisterForm {...props} showCard={false} />;
}
