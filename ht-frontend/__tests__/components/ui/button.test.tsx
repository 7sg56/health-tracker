/**
 * Button Component Tests
 */

import { render, screen, fireEvent } from '../../utils/test-utils'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles keyboard navigation', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    button.focus()
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ', code: 'Space' })
    expect(handleClick).toHaveBeenCalledTimes(2)
  })

  it('shows loading state correctly', () => {
    render(
      <Button loading={true} loadingText="Loading...">
        Submit
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles disabled state', async () => {
    const handleClick = jest.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )
    
    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>
    
    render(
      <Button icon={<TestIcon />} iconPosition="left">
        With Icon
      </Button>
    )
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })

  it('applies correct ARIA attributes', () => {
    render(
      <Button
        aria-label="Custom label"
        aria-describedby="description"
        aria-expanded={true}
        aria-controls="menu"
      >
        ARIA Button
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
    expect(button).toHaveAttribute('aria-describedby', 'description')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('aria-controls', 'menu')
  })

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
    
    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
    
    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border')
  })

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Button size="default">Default</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-9')
    
    rerender(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')
    
    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10')
  })
})