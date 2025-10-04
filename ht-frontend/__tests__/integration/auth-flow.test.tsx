/**
 * Authentication Flow Integration Tests
 */

import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

// Mock fetch for API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  describe('Login Flow', () => {
    it('completes successful login flow', async () => {
      // Mock successful login response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        }),
      })

      const onSuccess = jest.fn()
      render(<LoginForm onSuccess={onSuccess} />)

      // Fill in login form
      const usernameInput = screen.getByLabelText(/username/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      // Wait for success callback
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('handles login validation errors', async () => {
      // Mock validation error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Invalid credentials',
          details: [
            { field: 'username', message: 'Username not found' }
          ]
        }),
      })

      const onError = jest.fn()
      render(<LoginForm onError={onError} />)

      // Fill in form with invalid data
      const usernameInput = screen.getByLabelText(/username/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(usernameInput, { target: { value: 'invaliduser' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)

      // Wait for error handling
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Invalid credentials')
      })
    })

    it('handles network errors gracefully', async () => {
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const onError = jest.fn()
      render(<LoginForm onError={onError} />)

      // Fill in form
      const usernameInput = screen.getByLabelText(/username/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      // Wait for error handling
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Network error')
      })
    })
  })

  describe('Registration Flow', () => {
    it('completes successful registration flow', async () => {
      // Mock successful registration response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          id: 1,
          username: 'newuser',
          email: 'newuser@example.com',
        }),
      })

      const onSuccess = jest.fn()
      render(<RegisterForm onSuccess={onSuccess} />)

      // Fill in registration form
      const usernameInput = screen.getByLabelText(/username/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(usernameInput, { target: { value: 'newuser' } })
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })
      fireEvent.click(submitButton)

      // Wait for success callback
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('validates registration form fields', async () => {
      render(<RegisterForm />)

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      fireEvent.click(submitButton)

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('validates password strength', async () => {
      render(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/password/i)
      
      // Test weak password
      fireEvent.change(passwordInput, { target: { value: 'weak' } })
      fireEvent.blur(passwordInput)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      render(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      
      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.blur(emailInput)

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Accessibility', () => {
    it('maintains focus management during form submission', async () => {
      render(<LoginForm />)

      const usernameInput = screen.getByLabelText(/username/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Focus username input
      usernameInput.focus()
      expect(document.activeElement).toBe(usernameInput)

      // Submit form (will fail validation)
      fireEvent.click(submitButton)

      // Focus should remain manageable
      await waitFor(() => {
        expect(document.activeElement).toBeTruthy()
      })
    })

    it('announces form errors to screen readers', async () => {
      render(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(submitButton)

      // Check for ARIA live regions
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('provides proper form labeling', () => {
      render(<LoginForm />)

      // Check that all form controls have proper labels
      const usernameInput = screen.getByLabelText(/username/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(usernameInput).toHaveAttribute('id')
      expect(passwordInput).toHaveAttribute('id')

      // Check for proper form structure
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })
  })
})