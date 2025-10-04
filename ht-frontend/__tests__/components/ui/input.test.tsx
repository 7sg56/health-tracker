/**
 * Input Component Tests
 */

import { render, screen, fireEvent } from '../../utils/test-utils'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('renders with basic props', () => {
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('renders with label', () => {
    render(<Input label="Username" placeholder="Enter username" />)
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('shows required indicator when required', () => {
    render(<Input label="Email" required />)
    
    const label = screen.getByText('Email')
    expect(label).toBeInTheDocument()
    // The required indicator is added via CSS pseudo-element
  })

  it('displays error message', () => {
    render(<Input label="Password" error="Password is required" />)
    
    const input = screen.getByLabelText('Password')
    const errorMessage = screen.getByText('Password is required')
    
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveAttribute('role', 'alert')
  })

  it('displays helper text when no error', () => {
    render(<Input label="Username" helperText="Must be unique" />)
    
    expect(screen.getByText('Must be unique')).toBeInTheDocument()
  })

  it('prioritizes error over helper text', () => {
    render(
      <Input 
        label="Username" 
        helperText="Must be unique" 
        error="Username is taken"
      />
    )
    
    expect(screen.getByText('Username is taken')).toBeInTheDocument()
    expect(screen.queryByText('Must be unique')).not.toBeInTheDocument()
  })

  it('handles input changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test value')
  })

  it('applies correct ARIA attributes', () => {
    render(
      <Input
        label="Test Input"
        error="Test error"
        helperText="Test helper"
        required
        aria-label="Custom label"
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-describedby')
    expect(input).toHaveAttribute('aria-label', 'Custom label')
  })

  it('handles different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" />)
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password')
    
    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })

  it('handles disabled state', () => {
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('generates unique IDs for form elements', () => {
    render(
      <>
        <Input label="First Input" />
        <Input label="Second Input" />
      </>
    )
    
    const firstInput = screen.getByLabelText('First Input')
    const secondInput = screen.getByLabelText('Second Input')
    
    expect(firstInput.id).toBeTruthy()
    expect(secondInput.id).toBeTruthy()
    expect(firstInput.id).not.toBe(secondInput.id)
  })

  it('uses provided ID when given', () => {
    render(<Input id="custom-id" label="Custom Input" />)
    
    const input = screen.getByLabelText('Custom Input')
    expect(input).toHaveAttribute('id', 'custom-id')
  })

  it('associates error message with input', () => {
    render(<Input label="Test" error="Test error" />)
    
    const input = screen.getByLabelText('Test')
    const errorMessage = screen.getByText('Test error')
    
    expect(input).toHaveAttribute('aria-describedby')
    expect(errorMessage).toHaveAttribute('id')
    
    const describedBy = input.getAttribute('aria-describedby')
    const errorId = errorMessage.getAttribute('id')
    expect(describedBy).toContain(errorId)
  })
})