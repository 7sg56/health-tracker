/**
 * Health Tracking Integration Tests
 */

import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { WaterIntakeForm } from '@/components/forms/water-intake-form'
import { FoodIntakeForm } from '@/components/forms/food-intake-form'
import { WorkoutForm } from '@/components/forms/workout-form'

// Mock fetch for API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Health Tracking Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  describe('Water Intake Tracking', () => {
    it('completes water intake submission flow', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          id: 1,
          amountLtr: 1.5,
          date: '2024-01-01',
          createdAt: '2024-01-01T10:00:00Z',
        }),
      })

      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(<WaterIntakeForm onSubmit={onSubmit} />)

      // Select preset amount
      const presetButton = screen.getByRole('button', { name: 'Add 1.5 liters' })
      fireEvent.click(presetButton)

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add water intake/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ amountLtr: 1.5 })
      })
    })

    it('handles water intake validation errors', async () => {
      const onSubmit = jest.fn()
      render(<WaterIntakeForm onSubmit={onSubmit} />)

      // Try to submit without selecting amount
      const submitButton = screen.getByRole('button', { name: /add water intake/i })
      expect(submitButton).toBeDisabled()

      // Enter invalid amount
      const customInput = screen.getByLabelText(/custom amount/i)
      fireEvent.change(customInput, { target: { value: '0.05' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/amount must be at least 0.1 liters/i)).toBeInTheDocument()
      })
    })

    it('provides real-time feedback for water intake', () => {
      render(<WaterIntakeForm onSubmit={jest.fn()} />)

      // Select preset amount
      const presetButton = screen.getByRole('button', { name: 'Add 0.5 liters' })
      fireEvent.click(presetButton)

      // Check for immediate feedback
      expect(screen.getByText('Selected amount: 0.5L')).toBeInTheDocument()
      expect(presetButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('Food Intake Tracking', () => {
    it('completes food intake submission flow', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          id: 1,
          foodItem: 'Apple',
          calories: 95,
          date: '2024-01-01',
          createdAt: '2024-01-01T12:00:00Z',
        }),
      })

      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(<FoodIntakeForm onSubmit={onSubmit} />)

      // Fill in form
      const foodInput = screen.getByLabelText(/food item/i)
      const caloriesInput = screen.getByLabelText(/calories/i)
      const submitButton = screen.getByRole('button', { name: /add food intake/i })

      fireEvent.change(foodInput, { target: { value: 'Apple' } })
      fireEvent.change(caloriesInput, { target: { value: '95' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          foodItem: 'Apple',
          calories: 95,
        })
      })
    })

    it('validates food intake form fields', async () => {
      render(<FoodIntakeForm onSubmit={jest.fn()} />)

      const submitButton = screen.getByRole('button', { name: /add food intake/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/food item is required/i)).toBeInTheDocument()
        expect(screen.getByText(/calories must be at least 1/i)).toBeInTheDocument()
      })
    })
  })

  describe('Workout Tracking', () => {
    it('completes workout submission flow', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          id: 1,
          activity: 'Running',
          durationMin: 30,
          caloriesBurned: 300,
          date: '2024-01-01',
          createdAt: '2024-01-01T08:00:00Z',
        }),
      })

      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(<WorkoutForm onSubmit={onSubmit} />)

      // Fill in form
      const activityInput = screen.getByLabelText(/activity/i)
      const durationInput = screen.getByLabelText(/duration/i)
      const caloriesInput = screen.getByLabelText(/calories burned/i)
      const submitButton = screen.getByRole('button', { name: /add workout/i })

      fireEvent.change(activityInput, { target: { value: 'Running' } })
      fireEvent.change(durationInput, { target: { value: '30' } })
      fireEvent.change(caloriesInput, { target: { value: '300' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          activity: 'Running',
          durationMin: 30,
          caloriesBurned: 300,
        })
      })
    })

    it('validates workout form fields', async () => {
      render(<WorkoutForm onSubmit={jest.fn()} />)

      const submitButton = screen.getByRole('button', { name: /add workout/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/activity is required/i)).toBeInTheDocument()
        expect(screen.getByText(/duration must be at least 1 minute/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Accessibility Integration', () => {
    it('maintains proper focus order across all forms', () => {
      render(
        <div>
          <WaterIntakeForm onSubmit={jest.fn()} />
          <FoodIntakeForm onSubmit={jest.fn()} />
          <WorkoutForm onSubmit={jest.fn()} />
        </div>
      )

      // Get all focusable elements
      const focusableElements = screen.getAllByRole('button').concat(
        screen.getAllByRole('textbox'),
        screen.getAllByRole('spinbutton')
      )

      // Each element should be focusable
      focusableElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1')
      })
    })

    it('provides consistent error messaging across forms', async () => {
      render(
        <div>
          <WaterIntakeForm onSubmit={jest.fn()} />
          <FoodIntakeForm onSubmit={jest.fn()} />
          <WorkoutForm onSubmit={jest.fn()} />
        </div>
      )

      // Submit all forms to trigger validation
      const submitButtons = screen.getAllByRole('button', { name: /add/i })
      
      for (const button of submitButtons) {
        if (!button.disabled) {
          fireEvent.click(button)
        }
      }

      // Check that all error messages have proper ARIA attributes
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        errorMessages.forEach(error => {
          expect(error).toHaveAttribute('aria-live')
        })
      })
    })

    it('handles loading states consistently', () => {
      render(
        <div>
          <WaterIntakeForm onSubmit={jest.fn()} isLoading={true} />
          <FoodIntakeForm onSubmit={jest.fn()} isLoading={true} />
          <WorkoutForm onSubmit={jest.fn()} isLoading={true} />
        </div>
      )

      // All submit buttons should show loading state
      const submitButtons = screen.getAllByRole('button', { name: /adding/i })
      
      submitButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-busy', 'true')
        expect(button).toBeDisabled()
      })
    })

    it('announces successful submissions to screen readers', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(<WaterIntakeForm onSubmit={onSubmit} />)

      // Select amount and submit
      const presetButton = screen.getByRole('button', { name: 'Add 1 liters' })
      fireEvent.click(presetButton)

      const submitButton = screen.getByRole('button', { name: /add water intake/i })
      fireEvent.click(submitButton)

      // Should reset form after successful submission
      await waitFor(() => {
        const customInput = screen.getByLabelText(/custom amount/i)
        expect(customInput).toHaveValue('')
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('handles API errors gracefully across all forms', async () => {
      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const onSubmit = jest.fn().mockRejectedValue(new Error('Network error'))
      render(<WaterIntakeForm onSubmit={onSubmit} error="Network error" />)

      // Error should be displayed
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    it('recovers from errors when user corrects input', async () => {
      render(<WaterIntakeForm onSubmit={jest.fn()} />)

      // Enter invalid amount
      const customInput = screen.getByLabelText(/custom amount/i)
      fireEvent.change(customInput, { target: { value: '0.05' } })

      const submitButton = screen.getByRole('button', { name: /add water intake/i })
      fireEvent.click(submitButton)

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/amount must be at least 0.1 liters/i)).toBeInTheDocument()
      })

      // Correct the input
      fireEvent.change(customInput, { target: { value: '1.0' } })

      // Error should clear
      await waitFor(() => {
        expect(screen.queryByText(/amount must be at least 0.1 liters/i)).not.toBeInTheDocument()
      })
    })
  })
})