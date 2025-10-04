'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthService } from '../lib/api/auth';
import { 
  User, 
  AuthState, 
  AuthAction, 
  LoginRequest, 
  RegisterRequest 
} from '../lib/types/auth';

// Initial authentication state
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Authentication reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case 'AUTH_ERROR':
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: action.payload };
    case 'AUTH_LOGOUT':
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null };
    case 'AUTH_RESET_ERROR':
      return { ...state, error: null };
    case 'AUTH_SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// Authentication context type
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Simple session check function
  const checkSession = async () => {
    try {
      dispatch({ type: 'AUTH_SET_LOADING', payload: true });
      const response = await AuthService.checkSession();
      
      if (response.data?.valid && response.data.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_LOGOUT' });
    } finally {
      dispatch({ type: 'AUTH_SET_LOADING', payload: false });
    }
  };

  // Login function
  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await AuthService.login(credentials);
      
      if (response.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await AuthService.register(data);
      
      if (response.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Refresh user profile
  const refreshUser = async () => {
    try {
      dispatch({ type: 'AUTH_SET_LOADING', payload: true });
      const response = await AuthService.getProfile();
      
      if (response.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    } finally {
      dispatch({ type: 'AUTH_SET_LOADING', payload: false });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'AUTH_RESET_ERROR' });
  };

  // Initialize authentication state on mount - ONLY ONCE
  useEffect(() => {
    checkSession();
  }, []); // Empty dependency array - runs only once

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    refreshUser,
    clearError,
    checkSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Helper hook for authentication status
export function useAuthStatus() {
  const { state } = useAuth();
  
  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    error: state.error,
  };
}

// Helper hook for authentication actions
export function useAuthActions() {
  const { login, register, logout, refreshUser, clearError, checkSession } = useAuth();
  
  return {
    login,
    register,
    logout,
    refreshUser,
    clearError,
    checkSession,
  };
}