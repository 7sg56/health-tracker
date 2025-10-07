import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { TopHeader } from '@/components/layout/top-header'
import { useAuth } from '@/contexts/AuthContext'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: jest.fn(),
  }),
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('TopHeader', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null,
  }

  const mockAuthState = {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  }

  const mockLogout = jest.fn()

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard')
    mockUseAuth.mockReturnValue({
      state: mockAuthState,
      logout: mockLogout,
      login: jest.fn(),
      register: jest.fn(),
      refreshUser: jest.fn(),
      clearError: jest.fn(),
      checkSession: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header with user information', () => {
    render(<TopHeader />)
    
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByLabelText(`User menu for ${mockUser.name}`)).toBeInTheDocument()
  })

  it('shows mobile menu button when showMenuButton is true', () => {
    const mockOnMenuClick = jest.fn()
    render(<TopHeader onMenuClick={mockOnMenuClick} showMenuButton={true} />)
    
    const menuButton = screen.getByLabelText('Open navigation menu')
    expect(menuButton).toBeInTheDocument()
    
    fireEvent.click(menuButton)
    expect(mockOnMenuClick).toHaveBeenCalledTimes(1)
  })

  it('hides mobile menu button when showMenuButton is false', () => {
    render(<TopHeader showMenuButton={false} />)
    
    expect(screen.queryByLabelText('Open navigation menu')).not.toBeInTheDocument()
  })

  it('displays breadcrumb navigation for dashboard path', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<TopHeader />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('displays breadcrumb navigation for nested paths', () => {
    mockUsePathname.mockReturnValue('/dashboard/water')
    render(<TopHeader />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Water Intake')).toBeInTheDocument()
  })

  it('shows sign in button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      state: { ...mockAuthState, user: null, isAuthenticated: false },
      logout: mockLogout,
      login: jest.fn(),
      register: jest.fn(),
      refreshUser: jest.fn(),
      clearError: jest.fn(),
      checkSession: jest.fn(),
    })

    render(<TopHeader />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('calls logout when logout menu item is clicked', async () => {
    render(<TopHeader />)
    
    // Open user menu
    const userMenuButton = screen.getByLabelText(`User menu for ${mockUser.name}`)
    fireEvent.click(userMenuButton)
    
    // Click logout
    const logoutButton = screen.getByText('Log out')
    fireEvent.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('displays theme toggle button', () => {
    render(<TopHeader />)
    
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
  })
})