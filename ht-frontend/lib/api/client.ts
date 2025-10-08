/**
 * HTTP Client for Health Tracker API
 * Handles authentication, CSRF tokens, session management, and error responses
 */

import { 
  ApiResponse, 
  ErrorResponse, 
  RequestConfig, 
  HttpMethod
} from '../types/api';
import { ApiError } from '../errors';

// Request interceptor type
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

// Response interceptor type
type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // Auth removed: CSRF/session features disabled
  private getCSRFToken(): string | null {
    // Try to get from cookie first (Spring Security default)
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }
    
    // Fallback to meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    return metaTag?.content || null;
  }

  /**
   * Check if session is valid
   */

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let finalConfig = config;
    
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    
    return finalConfig;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let finalResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }
    
    return finalResponse;
  }

  /**
   * Handle request timeout
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<Response>,
    retries: number,
    delay: number = 1000
  ): Promise<Response> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  /**
   * Make HTTP request with proper error handling, retries, and timeouts
   */
  async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Apply request interceptors
    const config = await this.applyRequestInterceptors(options);
    
    // Prepare headers
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(config.headers as Record<string, string>),
    };

    // Add CSRF token for non-GET requests
    const method = (config.method || 'GET').toUpperCase() as HttpMethod;

    // Create request function for potential retries
    const makeRequest = async (): Promise<Response> => {
      const fetchPromise = fetch(url, {
        ...config,
        method,
        headers,
        credentials: 'omit',
      });

      // Apply timeout if specified
      if (config.timeout) {
        return Promise.race([
          fetchPromise,
          this.createTimeoutPromise(config.timeout)
        ]);
      }

      return fetchPromise;
    };

    try {
      // Execute request with optional retries
      const response = config.retries 
        ? await this.retryRequest(makeRequest, config.retries)
        : await makeRequest();

      const contentType = response.headers.get('content-type');
      let responseData: unknown = null;

      // Parse response based on content type
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType?.includes('text/')) {
        responseData = await response.text();
      }

      if (!response.ok) {
        // Handle API error responses
        const errorResponse = responseData as ErrorResponse;
        const apiError = ApiError.fromResponse(errorResponse || {
          timestamp: new Date().toISOString(),
          status: response.status,
          error: response.statusText,
          message: `HTTP ${response.status}: ${response.statusText}`,
          path: endpoint,
        });

        const errorResult: ApiResponse<T> = {
          error: apiError.message,
          status: response.status,
        };

        return this.applyResponseInterceptors(errorResult);
      }

      const successResult: ApiResponse<T> = {
        data: responseData as T,
        status: response.status,
      };

      return this.applyResponseInterceptors(successResult);
    } catch (error) {
      console.error('API request failed:', error);
      
      const errorResult: ApiResponse<T> = {
        error: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
      };

      return this.applyResponseInterceptors(errorResult);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

}

// Create and export the default API client instance
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
export const apiClient = new ApiClient(API_BASE_URL);


export { ApiClient };
export type { RequestInterceptor, ResponseInterceptor };