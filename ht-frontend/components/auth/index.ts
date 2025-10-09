/**
 * Authentication Components
 * Export all authentication-related components
 */

export { LoginForm, QuickLoginForm } from './LoginForm';
export { RegisterForm, QuickRegisterForm } from './RegisterForm';
export {
  AuthGuard,
  ProtectedRoute,
  PublicRoute,
  useAuthGuard,
} from './AuthGuard';

// Re-export auth context hooks for convenience
export {
  useAuth,
  useAuthStatus,
  useAuthActions,
  AuthProvider,
} from '../../contexts/AuthContext';
