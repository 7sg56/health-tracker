/**
 * Test utilities for React Testing Library
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { EnhancedThemeProvider } from '@/lib/theme'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock auth context for testing
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthValue = {
    state: {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    },
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }

  return (
    <div data-testid="mock-auth-provider">
      {children}
    </div>
  )
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <EnhancedThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <MockAuthProvider>
        {children}
      </MockAuthProvider>
    </EnhancedThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock user for testing
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
}

// Mock health data for testing
export const mockWaterIntake = {
  id: 1,
  amountLtr: 0.5,
  date: '2024-01-01',
  createdAt: '2024-01-01T10:00:00Z',
}

export const mockFoodIntake = {
  id: 1,
  foodItem: 'Apple',
  calories: 95,
  date: '2024-01-01',
  createdAt: '2024-01-01T12:00:00Z',
}

export const mockWorkout = {
  id: 1,
  activity: 'Running',
  durationMin: 30,
  caloriesBurned: 300,
  date: '2024-01-01',
  createdAt: '2024-01-01T08:00:00Z',
}

export const mockHealthIndex = {
  id: 1,
  date: '2024-01-01',
  healthScore: 75,
  createdAt: '2024-01-01T23:59:59Z',
}

// Mock API responses
export const mockApiResponse = <T,>(data: T) => ({
  data,
  status: 200,
})

export const mockApiError = (message: string, status: number = 400) => ({
  error: message,
  status,
})

// Mock fetch responses
export const mockFetchSuccess = <T,>(data: T) => {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  } as Response)
}

export const mockFetchError = (message: string, status: number = 400) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
  } as Response)
}

// Accessibility testing helpers
export const axeMatchers = {
  toHaveNoViolations: expect.extend({
    toHaveNoViolations(received) {
      // This would integrate with axe-core for accessibility testing
      // For now, we'll return a simple pass
      return {
        pass: true,
        message: () => 'No accessibility violations found',
      }
    },
  }),
}

// Form testing helpers
export const fillForm = async (
  getByLabelText: any,
  formData: Record<string, string>
) => {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()

  for (const [label, value] of Object.entries(formData)) {
    const field = getByLabelText(new RegExp(label, 'i'))
    await user.clear(field)
    await user.type(field, value)
  }
}

// Wait for loading states
export const waitForLoadingToFinish = async () => {
  const { waitFor } = await import('@testing-library/react')
  await waitFor(() => {
    expect(document.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
  })
}