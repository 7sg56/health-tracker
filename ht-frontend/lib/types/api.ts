// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: PageInfo;
}

export interface PageInfo {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details?: FieldError[];
  path: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

// HTTP Method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request configuration interface
export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

// Session management types
export interface SessionInfo {
  isValid: boolean;
  expiresAt?: string;
  csrfToken?: string;
}

// Note: ApiError class is available in lib/errors/api-error.ts
