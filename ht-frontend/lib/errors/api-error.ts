// API Error class for consistent error handling

export interface ApiErrorDetails {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details?: ApiErrorDetails[];
  path: string;
}

/**
 * Custom error class for API-related errors
 * Provides structured error information for consistent error handling
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: ApiErrorDetails[];
  public readonly timestamp: string;
  public readonly path?: string;
  public readonly originalError?: Error;

  constructor(
    status: number,
    message: string,
    details?: ApiErrorDetails[],
    options?: {
      timestamp?: string;
      path?: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.timestamp = options?.timestamp || new Date().toISOString();
    this.path = options?.path;
    this.originalError = options?.originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Creates an ApiError from a backend error response
   */
  static fromResponse(response: ApiErrorResponse): ApiError {
    return new ApiError(
      response.status,
      response.message,
      response.details,
      {
        timestamp: response.timestamp,
        path: response.path,
      }
    );
  }

  /**
   * Creates an ApiError from a fetch Response object
   */
  static async fromFetchResponse(response: Response): Promise<ApiError> {
    try {
      const errorData: ApiErrorResponse = await response.json();
      return ApiError.fromResponse(errorData);
    } catch (parseError) {
      // If we can't parse the response, create a generic error
      return new ApiError(
        response.status,
        response.statusText || 'An error occurred',
        undefined,
        {
          originalError: parseError instanceof Error ? parseError : new Error('Parse error'),
        }
      );
    }
  }

  /**
   * Creates an ApiError from a network or other error
   */
  static fromError(error: Error, status: number = 500): ApiError {
    return new ApiError(
      status,
      error.message,
      undefined,
      {
        originalError: error,
      }
    );
  }

  /**
   * Checks if an error is an ApiError
   */
  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  /**
   * Gets field-specific errors as a flat object
   */
  getFieldErrors(): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    
    if (this.details) {
      this.details.forEach((detail) => {
        fieldErrors[detail.field] = detail.message;
      });
    }
    
    return fieldErrors;
  }

  /**
   * Checks if this error has field-specific validation errors
   */
  hasFieldErrors(): boolean {
    return Boolean(this.details && this.details.length > 0);
  }

  /**
   * Gets a user-friendly error message
   */
  getUserMessage(): string {
    // For validation errors, show the general message
    if (this.status === 400 && this.hasFieldErrors()) {
      return 'Please check the form for errors and try again.';
    }

    // For authentication errors
    if (this.status === 401) {
      return 'Please log in to continue.';
    }

    // For authorization errors
    if (this.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    // For not found errors
    if (this.status === 404) {
      return 'The requested resource was not found.';
    }

    // For server errors
    if (this.status >= 500) {
      return 'A server error occurred. Please try again later.';
    }

    // Default to the original message
    return this.message;
  }

  /**
   * Converts the error to a plain object for logging or serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
      path: this.path,
      stack: this.stack,
    };
  }
}

// Common API error types
export class ValidationError extends ApiError {
  constructor(message: string, details?: ApiErrorDetails[]) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: ApiErrorDetails[]) {
    super(409, message, details);
    this.name = 'ConflictError';
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(500, message);
    this.name = 'ServerError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error occurred') {
    super(0, message);
    this.name = 'NetworkError';
  }
}