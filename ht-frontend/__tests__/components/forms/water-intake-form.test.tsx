/**
 * WaterIntakeForm Component Tests
 */

import { render, screen, fireEvent, waitFor } from '../../utils/test-utils'
import { WaterIntakeForm } from '@/components/forms/water-intake-form'

describe('WaterIntakeForm Component', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form with all elements', () => {
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText('Add Water Intake')).toBeInTheDocument()
    expect(screen.getByText('Quick Add')).toBeInTheDocument()
    expect(screen.getByLabelText(/custom amount/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add water intake/i })).toBeInTheDocument()
  })

  it('renders preset amount buttons', () => {
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    const presetAmounts = [0.25, 0.5, 1.0, 1.5, 2.0]
    
    presetAmounts.forEach(amount => {
      expect(screen.getByRole('button', { name: `Add ${amount} liters` })).toBeInTheDocument()
    })
  })

  it('selects preset amount when clicked', () => {
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    const presetButton = screen.getByRole('button', { name: 'Add 0.5 liters' })
    fireEvent.click(presetButton)
    
    expect(presetButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Selected amount: 0.5L')).toBeInTheDocument()
  })

  it('updates custom amount input', () => {
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    const customInput = screen.getByLabelText(/custom amount/i)
    fireEvent.change(customInput, { target: { value: '1.5' } })
    
    expect(customInput).toHaveValue('1.5')
    expect(screen.getByText('Selected amount: 1.5L')).toBeInTheDocument()
  })

  it('validates input range', async () => {
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    const customInput = screen.getByLabelText(/custom amount/i)
    const submitButton = screen.getByRole('button', { name: /add water intake/i })
    
    // Test minimum value
    fireEvent.change(customInput, { target: { value: '0.05' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/amount must be at least 0.1 liters/i)).toBeInTheDocument()
    })
    
    // Test maximum value
    fireEvent.change(customInput, { target: { value: '15' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/amount must be less than 10.0 liters/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    mockOnSubmit.mockResolvedValue(undefined)
    
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    const customInput = screen.getByLabelText(/custom amount/i)
    const submitButton = screen.getByRole('button', { name: /add water intake/i })
    
    fireEvent.change(customInput, { target: { value: '2.0' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({ amountLtr: 2.0 })
    })
  })

  it('resets form after successful submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined)
    
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    const customInput = screen.getByLabelText(/custom amount/i)
    const submitButton = screen.getByRole('button', { name: /add water intake/i })
    
    fireEvent.change(customInput, { target: { value: '1.0' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(customInput).toHaveValue('')
    })
  })

  it('shows loading state during submission', () => {
    render(<WaterIntakeForm onSubmit={mockOnSubmit} isLoading={true} />)
    
    const submitButton = screen.getByRole('button')
    expect(submitButton).toHaveAttribute('aria-busy', 'true')
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Adding water intake...')).toBeInTheDocument()
  })

  it('displays error message', () => {
    const errorMessage = 'Failed to add water intake'
    render(<WaterIntakeForm onSubmit={mockOnSubmit} error={errorMessage} />)
    
    const errorAlert = screen.getByRole('alert')
    expect(errorAlert).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('disables submit when no amount selected', () => {
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /add water intake/i })
    expect(submitButton).toBeDisabled()
  })

  it('has proper accessibility attributes', () => {
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    const form = screen.getByLabelText(/water intake form/i)
    expect(form).toBeInTheDocument()
    
    const fieldset = screen.getByRole('group', { name: /preset water amounts/i })
    expect(fieldset).toBeInTheDocument()
    
    const customInput = screen.getByLabelText(/custom amount/i)
    expect(customInput).toHaveAttribute('aria-describedby')
    expect(customInput).toHaveAttribute('required')
    expect(customInput).toHaveAttribute('min', '0.1')
    expect(customInput).toHaveAttribute('max', '10.0')
  })

  it('announces selection changes to screen readers', () => {
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    const presetButton = screen.getByRole('button', { name: 'Add 1 liters' })
    fireEvent.click(presetButton)
    
    const statusRegion = screen.getByRole('status')
    expect(statusRegion).toBeInTheDocument()
    expect(statusRegion).toHaveAttribute('aria-live', 'polite')
  })

  it('handles keyboard navigation for preset buttons', () => {
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    const presetButtons = screen.getAllByRole('button', { name: /add .* liters/i })
    
    presetButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-pressed')
    })
  })

  it('provides helpful error messages', async () => {
    render(<WaterIntakeForm onSubmit={mockOnSubmit} />)
    
    const customInput = screen.getByLabelText(/custom amount/i)
    
    // Test with invalid input
    fireEvent.change(customInput, { target: { value: 'invalid' } })
    
    // Should show helper text when no error
    expect(screen.getByText(/enter a value between 0.1 and 10.0 liters/i)).toBeInTheDocument()
  })
})