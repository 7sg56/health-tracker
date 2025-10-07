import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/app/dashboard/layout';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock auth context with a simple implementation
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    state: {
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
    },
    logout: jest.fn(),
  }),
}));

// Mock theme toggle component
jest.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <button>Theme Toggle</button>,
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('DashboardLayout', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard layout with sidebar and main content', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Check for main content
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Check for key sidebar elements
    expect(screen.getAllByText('HealthTracker')).toHaveLength(2); // Sidebar + mobile header
    expect(screen.getByText('Stay Healthy')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText("Today's Progress")).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Check for skip link
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');

    // Check for main content area
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveAttribute('id', 'main-content');
    expect(mainContent).toHaveAttribute('aria-label', 'Dashboard main content');

    // Check for navigation
    const navigation = screen.getByRole('navigation', { name: 'Sidebar navigation menu' });
    expect(navigation).toBeInTheDocument();
  });

  it('shows active navigation item based on current path', () => {
    mockUsePathname.mockReturnValue('/dashboard/water');
    
    render(
      <DashboardLayout>
        <div>Water Content</div>
      </DashboardLayout>
    );

    const waterLink = screen.getByRole('listitem', { name: /Water Intake/ });
    expect(waterLink).toHaveAttribute('aria-current', 'page');
  });

  it('handles mobile sidebar toggle', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640, // Mobile width
    });

    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Find and click mobile menu button
    const menuButton = screen.getByRole('button', { name: /Open navigation menu/i });
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);

    // Check if mobile sidebar opens (Sheet component)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Test tab navigation to navigation items
    const dashboardLink = screen.getByRole('listitem', { name: /Dashboard/ });
    dashboardLink.focus();
    expect(dashboardLink).toHaveFocus();

    // Test Enter key navigation
    fireEvent.keyDown(dashboardLink, { key: 'Enter' });
    // Navigation would be handled by Next.js Link component
  });

  it('displays user profile information', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Check for user profile section
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Stay Fit & Healthy')).toBeInTheDocument();
  });

  it('displays health summary widget', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Check for health summary
    expect(screen.getByText("Today's Progress")).toBeInTheDocument();
    expect(screen.getByText('85/100')).toBeInTheDocument();
    
    // Check for progress metrics
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Exercise')).toBeInTheDocument();
  });

  it('handles responsive layout changes', () => {
    const { rerender } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Test desktop layout
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop width
    });

    // Trigger resize event
    fireEvent(window, new Event('resize'));

    rerender(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Desktop sidebar should be visible
    const sidebar = screen.getByRole('navigation', { name: 'Sidebar navigation menu' });
    expect(sidebar).toBeInTheDocument();
  });

  it('has proper focus management', async () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    const mainContent = screen.getByRole('main');
    
    // Simulate route change by triggering focus
    mainContent.focus();
    
    await waitFor(() => {
      expect(mainContent).toHaveFocus();
    });
  });

  it('handles escape key to close mobile sidebar', async () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Open mobile sidebar
    const menuButton = screen.getByRole('button', { name: /Open navigation menu/i });
    fireEvent.click(menuButton);

    // Press escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    // Sidebar should close (Sheet component handles this)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('prevents body scroll when mobile sidebar is open', async () => {
    const originalOverflow = document.body.style.overflow;
    
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Open mobile sidebar
    const menuButton = screen.getByRole('button', { name: /Open navigation menu/i });
    fireEvent.click(menuButton);

    // Body scroll should be prevented
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });

    // Close sidebar
    fireEvent.keyDown(document, { key: 'Escape' });

    // Body scroll should be restored
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('unset');
    });

    // Cleanup
    document.body.style.overflow = originalOverflow;
  });
});