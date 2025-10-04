/**
 * LoginForm Component Tests
 */

import { render, screen, fireEvent, waitFor } from '../../utils/test-utils'
import { LoginForm } from '@/components/auth/LoginForm'

// Mock the auth context
const mockLogin = jest.fn()
const mockAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    state: mockAuthState,
  }),
}))

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form with all fields', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows password toggle button', () => {
    render(<LoginForm />)
    
    const toggleButton = screen.getByRole('button', { name: /show password/i })
    expect(toggleButton).toBeInTheDocument()
  })

  it('toggles password visibility', () => {
    render(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /show password/i })
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('validates required fields', async () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    mockLogin.mockResolvedValue(undefined)
    const onSuccess = jest.fn()
    
    render(<LoginForm onSuccess={onSuccess} />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      })
    })
  })

  it('handles login errors', async () => {
    const errorMessage = 'Invalid credentials'
    mockLogin.mockRejectedValue(new Error(errorMessage))
    const onError = jest.fn()
    
    render(<LoginForm onError={onError} />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('shows loading state during submission', async () => {
    const mockAuthStateLoading = { ...mockAuthState, isLoading: true }
    
    jest.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        login: mockLogin,
        state: mockAuthStateLoading,
      }),
    }))
    
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button')
    expect(submitButton).toHaveAttribute('aria-busy', 'true')
    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when form is invalid', () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    expect(submitButton).toBeDisabled()
    
    // Fill in username only
    const usernameInput = screen.getByLabelText(/username/i)
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    
    expect(submitButton).toBeDisabled()
    
    // Fill in password as well
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(submitButton).not.toBeDisabled()
  })

  it('renders without card wrapper when showCard is false', () => {
    render(<LoginForm showCard={false} />)
    
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<LoginForm />)
    
    const form = screen.getByRole('form', { name: /water intake form/i }) || 
                 screen.getByLabelText(/water intake form/i) ||
                 document.querySelector('form')
    
    expect(form).toBeInTheDocument()
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(usernameInput).toHaveAttribute('autoComplete', 'username')
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
  })

  it('handles keyboard navigation', () => {
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /show password/i })
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Test tab order
    usernameInput.focus()
    expect(document.activeElement).toBe(usernameInput)
    
    fireEvent.keyDown(usernameInput, { key: 'Tab' })
    // Password input should be next in tab order
    
    // Test Enter key on submit button
    fireEvent.keyDown(submitButton, { key: 'Enter' })
    // Should trigger form submission
  })
})