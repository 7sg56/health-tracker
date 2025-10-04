// User and Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Authentication action types for reducer
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_RESET_ERROR' }
  | { type: 'AUTH_SET_LOADING'; payload: boolean };

// Session management types
export interface SessionInfo {
  isValid: boolean;
  expiresAt?: string;
  csrfToken?: string;
}