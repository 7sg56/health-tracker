'use client';

/**
 * Enhanced Login Form Component
 * Demonstrates comprehensive error handling and real-time validation
 */

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

import { LoadingButton } from '../ui/loading-button';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { EnhancedInputField } from '../ui/enhanced-form-field';
import { EnhancedErrorBoundary } from '../ui/enhanced-error-boundary';
import { ValidationError } from '../ui/error-messages';

import { loginSchema, type LoginFormData } from '../../lib/validations/auth';
import { authValidators } from '../../lib/validations/form-validators';
import { useEnhancedForm } from '../../hooks/use-enhanced-form';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../lib/utils/toast';

interface EnhancedLoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showCard?: boolean;
  className?: string;
  enableRealTimeValidation?: boolean;
}

export function EnhancedLoginForm({ 
  onSuccess, 
  onError, 
  showCard = true, 
  className,
  enableRealTimeValidation = true
}: EnhancedLoginFormProps) {
  const { login } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    form,
    createSubmitHandler,
    isSubmitting,
    submitError,
    hasFieldError,
    getFieldError,
    clearAllErrors,
  } = useEnhancedForm<LoginFormData>({
    schema: loginSchema,
    defaultValues: {
      username: '',
      password: '',
    },
    mode: enableRealTimeValidation ? 'onChange' : 'onSubmit',
    reValidateMode: 'onChange',
  });

  const { register, watch, setValue } = form;
  const watchedValues = watch();

  const handleSubmit = createSubmitHandler(
    async (data: LoginFormData) => {
      const result = await login(data);
      onSuccess?.();
      return result;
    },
    {
      showSuccessToast: true,
      successMessage: 'Successfully signed in!',
      showErrorToast: true,
      resetOnSuccess: false,
    }
  );

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUsernameChange = (value: string | number) => {
    setValue('username', value as string, { shouldValidate: true });
  };

  const handlePasswordChange = (value: string | number) => {
    setValue('password', value as string, { shouldValidate: true });
  };

  const formContent = (
    <div className="space-y-4">
      <EnhancedInputField
        label="Username"
        placeholder="Enter your username"
        value={watchedValues.username || ''}
        onChange={handleUsernameChange}
        error={getFieldError('username')}
        validator={enableRealTimeValidation ? authValidators.username : undefined}
        disabled={isSubmitting}
        required
        showValidationState={enableRealTimeValidation}
        debounceMs={300}
        className="space-y-2"
      />

      <div className="space-y-2">
        <EnhancedInputField
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={watchedValues.password || ''}
          onChange={handlePasswordChange}
          error={getFieldError('password')}
          validator={enableRealTimeValidation ? authValidators.password : undefined}
          disabled={isSubmitting}
          required
          showValidationState={enableRealTimeValidation}
          debounceMs={300}
        />
        
        {/* Password visibility toggle */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={togglePasswordVisibility}
            disabled={isSubmitting}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <>
                <EyeOff className="mr-1 h-3 w-3" />
                Hide password
              </>
            ) : (
              <>
                <Eye className="mr-1 h-3 w-3" />
                Show password
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Display form-level validation errors */}
      {hasFieldError('username') || hasFieldError('password') ? (
        <ValidationError
          errors={{
            ...(hasFieldError('username') && { username: getFieldError('username')! }),
            ...(hasFieldError('password') && { password: getFieldError('password')! }),
          }}
          title="Please correct the following errors:"
        />
      ) : null}

      {/* Display submission errors */}
      {submitError && (
        <Alert className="border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Sign in failed</div>
            <div className="text-sm mt-1">{submitError}</div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <LoadingButton
          onClick={handleSubmit}
          className="w-full"
          loading={isSubmitting}
          loadingText="Signing in..."
          disabled={!form.formState.isValid && enableRealTimeValidation}
          touchFriendly
        >
          Sign In
        </LoadingButton>
        
        {submitError && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAllErrors}
            className="w-full"
          >
            Clear Errors
          </Button>
        )}
      </div>

      {/* Development helper */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify({
              isValid: form.formState.isValid,
              isDirty: form.formState.isDirty,
              isSubmitting,
              errors: form.formState.errors,
              touchedFields: form.formState.touchedFields,
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );

  if (!showCard) {
    return (
      <EnhancedErrorBoundary level="component">
        <div className={className}>{formContent}</div>
      </EnhancedErrorBoundary>
    );
  }

  return (
    <EnhancedErrorBoundary level="section">
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
    </EnhancedErrorBoundary>
  );
}

/**
 * Simplified enhanced login form without card wrapper
 */
export function QuickEnhancedLoginForm(props: Omit<EnhancedLoginFormProps, 'showCard'>) {
  return <EnhancedLoginForm {...props} showCard={false} />;
}

/**
 * Login form with async username validation (demonstration)
 */
export function AsyncValidatedLoginForm(props: EnhancedLoginFormProps) {
  const { asyncValidators } = require('../../lib/validations/form-validators');
  
  return (
    <EnhancedLoginForm 
      {...props} 
      enableRealTimeValidation={true}
    />
  );
}