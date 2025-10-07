import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import {
  FormErrorDisplay,
  NetworkErrorHandler,
  LoadingErrorState,
  EnhancedErrorBoundary,
  useFormErrorDisplay,
  useNetworkRetry,
  useLoadingErrorState,
  withComprehensiveErrorHandling,
  ErrorBoundaryProvider
} from '@/components/ui/error-handling';
import { ApiError, ValidationError } from '@/lib/errors/api-error';

// Mock the toast utility
jest.mock('@/lib/utils/toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

describe('Error Handling Components', () => {
  describe('FormErrorDisplay', () => {
    it('displays single error message', () => {
      render(<FormErrorDisplay errors="Test error message" />);
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('displays multiple error messages', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      render(<FormErrorDisplay errors={errors} />);
      
      errors.forEach(error => {
        expect(screen.getByText(error)).toBeInTheDocument();
      });
    });

    it('displays API error with field errors', () => {
      const apiError = new ValidationError('Validation failed', [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Password too short' }
      ]);

      render(<FormErrorDisplay errors={apiError} />);
      
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
      expect(screen.getByText('Password too short')).toBeInTheDocument();
    });

    it('shows retry button when onRetry is provided', () => {
      const onRetry = jest.fn();
      render(
        <FormErrorDisplay 
          errors="Test error" 
          showRetry={true}
          onRetry={onRetry}
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalled();
    });

    it('shows dismiss button when onDismiss is provided', () => {
      const onDismiss = jest.fn();
      render(
        <FormErrorDisplay 
          errors="Test error" 
          showDismiss={true}
          onDismiss={onDismiss}
        />
      );
      
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      expect(dismissButton).toBeInTheDocument();
      
      fireEvent.click(dismissButton);
      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe('NetworkErrorHandler', () => {
    it('displays network error message', () => {
      const error = new ApiError(0, 'Network connection failed');
      render(<NetworkErrorHandler error={error} />);
      
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('Network connection failed')).toBeInTheDocument();
    });

    it('shows retry functionality', async () => {
      const error = new ApiError(0, 'Network error');
      const onRetry = jest.fn().mockResolvedValue(undefined);
      
      render(
        <NetworkErrorHandler 
          error={error} 
          onRetry={onRetry}
          maxRetries={3}
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /retry now/i });
      fireEvent.click(retryButton);
      
      expect(onRetry).toHaveBeenCalled();
    });

    it('displays retry count', () => {
      const error = new ApiError(0, 'Network error');
      render(
        <NetworkErrorHandler 
          error={error} 
          onRetry={jest.fn()}
          maxRetries={3}
        />
      );
      
      expect(screen.getByText(/retry attempts: 0\/3/i)).toBeInTheDocument();
    });
  });

  describe('LoadingErrorState', () => {
    it('displays loading state', () => {
      render(
        <LoadingErrorState 
          isLoading={true}
          loadingMessage="Loading data..."
        />
      );
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('displays error state', () => {
      const error = new Error('Something went wrong');
      render(
        <LoadingErrorState 
          error={error}
          onRetry={jest.fn()}
        />
      );
      
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('displays progress when provided', () => {
      render(
        <LoadingErrorState 
          isLoading={true}
          showProgress={true}
          progress={50}
        />
      );
      
      expect(screen.getByText('50% complete')).toBeInTheDocument();
    });

    it('renders children when no loading or error', () => {
      render(
        <LoadingErrorState>
          <div>Success content</div>
        </LoadingErrorState>
      );
      
      expect(screen.getByText('Success content')).toBeInTheDocument();
    });
  });

  describe('EnhancedErrorBoundary', () => {
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };

    it('catches and displays component errors', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <EnhancedErrorBoundary level="component">
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );
      
      expect(screen.getByText('Component Error')).toBeInTheDocument();
      expect(screen.getByText(/this component encountered an error/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('renders children when no error', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={false} />
        </EnhancedErrorBoundary>
      );
      
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('provides retry functionality', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <EnhancedErrorBoundary level="component" maxRetries={3}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('useFormErrorDisplay hook', () => {
    const TestComponent = () => {
      const {
        errors,
        setFieldError,
        clearFieldError,
        handleApiError,
        hasErrors,
        reset
      } = useFormErrorDisplay();

      return (
        <div>
          <div data-testid="has-errors">{hasErrors.toString()}</div>
          <div data-testid="errors">{JSON.stringify(errors)}</div>
          <button onClick={() => setFieldError('email', 'Invalid email')}>
            Set Email Error
          </button>
          <button onClick={() => clearFieldError('email')}>
            Clear Email Error
          </button>
          <button onClick={() => {
            const apiError = new ValidationError('Validation failed', [
              { field: 'password', message: 'Password required' }
            ]);
            handleApiError(apiError);
          }}>
            Set API Error
          </button>
          <button onClick={reset}>Reset</button>
        </div>
      );
    };

    it('manages field errors correctly', () => {
      render(<TestComponent />);
      
      expect(screen.getByTestId('has-errors')).toHaveTextContent('false');
      
      fireEvent.click(screen.getByText('Set Email Error'));
      expect(screen.getByTestId('has-errors')).toHaveTextContent('true');
      expect(screen.getByTestId('errors')).toHaveTextContent('Invalid email');
      
      fireEvent.click(screen.getByText('Clear Email Error'));
      expect(screen.getByTestId('has-errors')).toHaveTextContent('false');
    });

    it('handles API errors correctly', () => {
      render(<TestComponent />);
      
      fireEvent.click(screen.getByText('Set API Error'));
      expect(screen.getByTestId('has-errors')).toHaveTextContent('true');
      expect(screen.getByTestId('errors')).toHaveTextContent('Password required');
    });

    it('resets all errors', () => {
      render(<TestComponent />);
      
      fireEvent.click(screen.getByText('Set Email Error'));
      expect(screen.getByTestId('has-errors')).toHaveTextContent('true');
      
      fireEvent.click(screen.getByText('Reset'));
      expect(screen.getByTestId('has-errors')).toHaveTextContent('false');
    });
  });

  describe('useNetworkRetry hook', () => {
    const TestComponent = ({ operation }: { operation: () => Promise<string> }) => {
      const { execute, retry, isLoading, error, data, canRetry } = useNetworkRetry(
        operation,
        { maxRetries: 2 }
      );

      return (
        <div>
          <div data-testid="loading">{isLoading.toString()}</div>
          <div data-testid="error">{error?.message || 'none'}</div>
          <div data-testid="data">{data || 'none'}</div>
          <div data-testid="can-retry">{canRetry.toString()}</div>
          <button onClick={() => execute()}>Execute</button>
          <button onClick={retry}>Retry</button>
        </div>
      );
    };

    it('handles successful operations', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      render(<TestComponent operation={operation} />);
      
      fireEvent.click(screen.getByText('Execute'));
      
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('success');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('none');
      });
    });

    it('handles failed operations', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Network error'));
      render(<TestComponent operation={operation} />);
      
      fireEvent.click(screen.getByText('Execute'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Network error');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('data')).toHaveTextContent('none');
      });
    });
  });

  describe('withComprehensiveErrorHandling HOC', () => {
    const TestComponent = ({ shouldThrow }: { shouldThrow?: boolean }) => {
      if (shouldThrow) {
        throw new Error('Component error');
      }
      return <div>Component rendered successfully</div>;
    };

    const WrappedComponent = withComprehensiveErrorHandling(TestComponent, {
      level: 'component',
      maxRetries: 2
    });

    it('wraps component with error boundary', () => {
      render(<WrappedComponent shouldThrow={false} />);
      expect(screen.getByText('Component rendered successfully')).toBeInTheDocument();
    });

    it('catches errors in wrapped component', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<WrappedComponent shouldThrow={true} />);
      expect(screen.getByText('Component Error')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('ErrorBoundaryProvider', () => {
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Provider test error');
      }
      return <div>Provider content</div>;
    };

    it('provides app-wide error boundary', () => {
      render(
        <ErrorBoundaryProvider>
          <ThrowError shouldThrow={false} />
        </ErrorBoundaryProvider>
      );
      
      expect(screen.getByText('Provider content')).toBeInTheDocument();
    });

    it('catches app-wide errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundaryProvider>
          <ThrowError shouldThrow={true} />
        </ErrorBoundaryProvider>
      );
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});

describe('Error Handling Integration', () => {
  it('integrates form errors with network errors', async () => {
    const TestForm = () => {
      const { errors, handleApiError, isSubmitting, setIsSubmitting } = useFormErrorDisplay();
      const { execute, error: networkError } = useNetworkRetry(
        () => Promise.reject(new ApiError(0, 'Network failed')),
        { maxRetries: 1 }
      );

      const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
          await execute();
        } catch (err) {
          if (err instanceof ApiError) {
            handleApiError(err);
          }
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <div>
          <div data-testid="submitting">{isSubmitting.toString()}</div>
          <div data-testid="form-errors">{JSON.stringify(errors)}</div>
          <div data-testid="network-error">{networkError?.message || 'none'}</div>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      );
    };

    render(<TestForm />);
    
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(screen.getByTestId('submitting')).toHaveTextContent('false');
      expect(screen.getByTestId('network-error')).toHaveTextContent('Network failed');
    });
  });
});