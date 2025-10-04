'use client';

// User-friendly error message components

import React from 'react';
import { 
  AlertTriangle, 
  Wifi, 
  Shield, 
  Lock, 
  Search, 
  Server, 
  RefreshCw,
  Home,
  ArrowLeft
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Alert, AlertDescription } from './alert';
import { ApiError } from '@/lib/errors/api-error';

interface ErrorMessageProps {
  error?: ApiError | Error | string;
  title?: string;
  description?: string;
  showRetry?: boolean;
  showGoHome?: boolean;
  showGoBack?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  className?: string;
  variant?: 'card' | 'alert' | 'inline';
}

/**
 * Generic error message component with different variants
 */
export function ErrorMessage({
  error,
  title,
  description,
  showRetry = false,
  showGoHome = false,
  showGoBack = false,
  onRetry,
  onGoHome,
  onGoBack,
  className = '',
  variant = 'card'
}: ErrorMessageProps) {
  const errorMessage = React.useMemo(() => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof ApiError) {
      return error.getUserMessage();
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  }, [error]);

  const errorTitle = title || 'Error';
  const errorDescription = description || errorMessage;

  const actions = (
    <div className="flex flex-wrap gap-2 mt-4">
      {showRetry && onRetry && (
        <Button onClick={onRetry} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
      {showGoBack && onGoBack && (
        <Button onClick={onGoBack} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      )}
      {showGoHome && onGoHome && (
        <Button onClick={onGoHome} variant="outline" size="sm">
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </Button>
      )}
    </div>
  );

  if (variant === 'alert') {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium">{errorTitle}</div>
          <div className="text-sm text-muted-foreground mt-1">{errorDescription}</div>
          {(showRetry || showGoHome || showGoBack) && actions}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-start gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5 ${className}`}>
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{errorTitle}</p>
          <p className="text-sm text-muted-foreground mt-1">{errorDescription}</p>
          {(showRetry || showGoHome || showGoBack) && actions}
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <CardTitle className="text-lg">{errorTitle}</CardTitle>
        <CardDescription>{errorDescription}</CardDescription>
      </CardHeader>
      {(showRetry || showGoHome || showGoBack) && (
        <CardContent className="pt-0">
          <div className="flex justify-center">
            {actions}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Network error component
 */
export function NetworkError({
  onRetry,
  message = 'Unable to connect to the server. Please check your internet connection.',
  ...props
}: Omit<ErrorMessageProps, 'error'> & { message?: string }) {
  return (
    <Card className={props.className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <Wifi className="h-5 w-5 text-destructive" />
        </div>
        <CardTitle className="text-lg">Connection Error</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-center gap-2">
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {props.onGoHome && (
            <Button onClick={props.onGoHome} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Authentication error component
 */
export function AuthenticationError({
  onLogin,
  message = 'You need to be logged in to access this page.',
  ...props
}: Omit<ErrorMessageProps, 'error'> & { 
  message?: string;
  onLogin?: () => void;
}) {
  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      window.location.href = '/auth/login';
    }
  };

  return (
    <Card className={props.className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
          <Lock className="h-5 w-5 text-warning" />
        </div>
        <CardTitle className="text-lg">Authentication Required</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-center gap-2">
          <Button onClick={handleLogin}>
            <Lock className="mr-2 h-4 w-4" />
            Login
          </Button>
          {props.onGoHome && (
            <Button onClick={props.onGoHome} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Authorization error component
 */
export function AuthorizationError({
  message = 'You do not have permission to access this resource.',
  ...props
}: Omit<ErrorMessageProps, 'error'> & { message?: string }) {
  return (
    <Card className={props.className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
          <Shield className="h-5 w-5 text-warning" />
        </div>
        <CardTitle className="text-lg">Access Denied</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-center gap-2">
          {props.onGoBack && (
            <Button onClick={props.onGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          )}
          {props.onGoHome && (
            <Button onClick={props.onGoHome} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Not found error component
 */
export function NotFoundError({
  resource = 'page',
  message,
  ...props
}: Omit<ErrorMessageProps, 'error'> & { 
  resource?: string;
  message?: string;
}) {
  const defaultMessage = message || `The ${resource} you're looking for doesn't exist or has been moved.`;

  return (
    <Card className={props.className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">Not Found</CardTitle>
        <CardDescription>{defaultMessage}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-center gap-2">
          {props.onGoBack && (
            <Button onClick={props.onGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          )}
          {props.onGoHome && (
            <Button onClick={props.onGoHome} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Server error component
 */
export function ServerError({
  onRetry,
  message = 'The server encountered an error. Please try again later.',
  ...props
}: Omit<ErrorMessageProps, 'error'> & { message?: string }) {
  return (
    <Card className={props.className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <Server className="h-5 w-5 text-destructive" />
        </div>
        <CardTitle className="text-lg">Server Error</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-center gap-2">
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {props.onGoHome && (
            <Button onClick={props.onGoHome} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Validation error component for forms
 */
export function ValidationError({
  errors,
  title = 'Please correct the following errors:',
  className = ''
}: {
  errors: Record<string, string> | string[];
  title?: string;
  className?: string;
}) {
  const errorList = React.useMemo(() => {
    if (Array.isArray(errors)) {
      return errors;
    }
    return Object.values(errors);
  }, [errors]);

  if (errorList.length === 0) {
    return null;
  }

  return (
    <Alert className={`border-destructive/50 ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium text-sm mb-2">{title}</div>
        <ul className="text-sm space-y-1">
          {errorList.map((error, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-destructive">•</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Hook to get appropriate error component based on error type
 */
export function useErrorComponent() {
  return React.useCallback((error: ApiError | Error | unknown, props: Partial<ErrorMessageProps> = {}) => {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 0:
          return <NetworkError {...props} />;
        case 401:
          return <AuthenticationError {...props} />;
        case 403:
          return <AuthorizationError {...props} />;
        case 404:
          return <NotFoundError {...props} />;
        case 500:
        case 502:
        case 503:
        case 504:
          return <ServerError {...props} />;
        default:
          return <ErrorMessage error={error} {...props} />;
      }
    }

    return <ErrorMessage error={error} {...props} />;
  }, []);
}