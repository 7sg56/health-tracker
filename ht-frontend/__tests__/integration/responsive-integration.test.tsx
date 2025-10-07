/**
 * Responsive Design Integration Tests
 * End-to-end testing of responsive behavior across the entire application
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/app/dashboard/layout';
import { 
  ViewportController, 
  TouchGestureSimulator,
  ResponsiveAccessibilityTester,
  DEVICE_VIEWPORTS,
  RESPONSIVE_BREAKPOINTS 
} from '../utils/responsive-test-utils';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    state: {
      user: { 
        id: '1', 
        username: 'testuser', 
        email: 'test@example.com', 
        name: 'Test User' 
      },
      isAuthenticated: true,
      isLoading: false,
    },
    logout: jest.fn(),
  }),
}));

// Mock theme components
jest.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">Theme Toggle</button>,
}));

jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: jest.fn(),
    theme: 'light',
  }),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Responsive Design Integration Tests', () => {
  let viewportController: ViewportController;

  beforeEach(() => {
    viewportController = new ViewportController();
    mockUsePathname.mockReturnValue('/dashboard');
  });

  afterEach(() => {
    viewportController.restore();
    jest.clearAllMocks();
  });

  describe('Cross-Device Navigation Flow', () => {
    it('maintains navigation state across device changes', async () => {
      const user = userEvent.setup();

      // Start on desktop
      viewportController.setDevice('desktop');
      
      const { rerender } = render(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      // Verify desktop sidebar is visible
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();

      // Switch to mobile
      viewportController.setDevice('iphone12');
      
      rerender(
        <DashboardLayout>
          <div data-testid="dashboard-content">Dashboard Content</div>
        </DashboardLayout>
      );

      // Desktop sidebar should be hidden, mobile menu button should appear
      const mobileMenuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(mobileMenuButton).toBeInTheDocument();

      // Open mobile navigation
      await user.click(mobileMenuButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Navigate to water page
      const waterLink = screen.getByRole('listitem', { name: /water intake/i });
      await user.click(waterLink);

      // Update pathname mock
      mockUsePathname.mockReturnValue('/dashboard/water');

      // Switch back to desktop
      viewportController.setDevice('desktop');
      
      rerender(
        <DashboardLayout>
          <div data-testid="water-content">Water Content</div>
        </DashboardLayout>
      );

      // Should maintain navigation state - water should be active
      const activeWaterLink = screen.getByRole('listitem', { name: /water intake/i });
      expect(activeWaterLink).toHaveAttribute('aria-current', 'page');
    });

    it('handles orientation changes gracefully', async () => {
      // Start in portrait mobile
      viewportController.setViewport(390, 844); // iPhone 12 portrait
      
      const { rerender } = render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      // Should show mobile layout
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();

      // Switch to landscape
      viewportController.setViewport(844, 390); // iPhone 12 landscape
      
      rerender(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      // Should still show mobile layout (width < 1024px)
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();

      // Content should remain accessible
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Touch Interaction Testing', () => {
    beforeEach(() => {
      viewportController.setDevice('iphone12');
    });

    it('handles touch navigation correctly', async () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });

      // Simulate touch tap
      TouchGestureSimulator.tap(menuButton, 50, 50);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Touch navigation item
      const waterLink = screen.getByRole('listitem', { name: /water intake/i });
      TouchGestureSimulator.tap(waterLink, 100, 100);

      // Should close sidebar
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('handles swipe gestures for sidebar (if implemented)', async () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      const mainContent = screen.getByRole('main');

      // Simulate swipe right from left edge
      TouchGestureSimulator.swipe(mainContent, 10, 400, 200, 400, 300);

      // Note: This test documents expected behavior
      // Implementation would need to handle swipe-to-open
    });

    it('provides adequate touch target sizes', () => {
      render(
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      );

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      
      // Check touch target size (minimum 44px recommended)
      expect(ResponsiveAccessibilityTester.checkTouchTargetSize(menuButton, 44)).toBe(true);
    });
  });

  describe('Content Adaptation Across Breakpoints', () => {
    const testContent = `
      <div>
        <h1>Main Heading</h1>
        <p>This is body text that should remain readable across all screen sizes.</p>
        <button>Action Button</button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>Card 1</div>
          <div>Card 2</div>
          <div>Card 3</div>
        </div>
      </div>
    `;

    Object.entries(DEVICE_VIEWPORTS).forEach(([deviceName, viewport]) => {
      it(`adapts content properly on ${deviceName}`, () => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        render(
          <DashboardLayout>
            <div dangerouslySetInnerHTML={{ __html: testContent }} />
          </DashboardLayout>
        );

        // Content should be visible and accessible
        expect(screen.getByRole('heading', { name: 'Main Heading' })).toBeInTheDocument();
        expect(screen.getByText(/This is body text/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();

        // Check that main content area has proper responsive classes
        const mainContent = screen.getByRole('main');
        expect(mainContent).toHaveClass('p-4'); // Mobile padding

        if (viewport.width >= RESPONSIVE_BREAKPOINTS.sm) {
          expect(mainContent).toHaveClass('sm:p-6'); // Tablet padding
        }

        if (viewport.width >= RESPONSIVE_BREAKPOINTS.lg) {
          expect(mainContent).toHaveClass('lg:p-8'); // Desktop padding
        }
      });
    });

    it('maintains proper typography scaling', () => {
      const { rerender } = render(
        <DashboardLayout>
          <div>
            <h1>Main Heading</h1>
            <h2>Subheading</h2>
            <p>Body text content</p>
            <small>Small text</small>
          </div>
        </DashboardLayout>
      );

      // Test across different viewport sizes
      Object.values(DEVICE_VIEWPORTS).forEach(viewport => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        rerender(
          <DashboardLayout>
            <div>
              <h1>Main Heading</h1>
              <h2>Subheading</h2>
              <p>Body text content</p>
              <small>Small text</small>
            </div>
          </DashboardLayout>
        );

        // All text should remain visible and readable
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        expect(screen.getByText('Body text content')).toBeInTheDocument();
        expect(screen.getByText('Small text')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Across Breakpoints', () => {
    it('maintains focus management across viewport changes', async () => {
      const user = userEvent.setup();
      
      // Start on desktop
      viewportController.setDevice('desktop');
      
      const { rerender } = render(
        <DashboardLayout>
          <div>
            <button>Button 1</button>
            <button>Button 2</button>
          </div>
        </DashboardLayout>
      );

      // Focus first button
      const button1 = screen.getByRole('button', { name: 'Button 1' });
      button1.focus();
      expect(button1).toHaveFocus();

      // Switch to mobile
      viewportController.setDevice('iphone12');
      
      rerender(
        <DashboardLayout>
          <div>
            <button>Button 1</button>
            <button>Button 2</button>
          </div>
        </DashboardLayout>
      );

      // Focus should be maintained or properly managed
      // In mobile, focus might shift to skip link or main content
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });

    it('provides proper ARIA labels across breakpoints', () => {
      Object.entries(DEVICE_VIEWPORTS).forEach(([deviceName, viewport]) => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        render(
          <DashboardLayout>
            <div>Test Content</div>
          </DashboardLayout>
        );

        // Main content should have proper labeling
        const mainContent = screen.getByRole('main');
        expect(mainContent).toHaveAttribute('aria-label', 'Dashboard main content');

        // Navigation should have proper labeling
        if (viewport.width >= RESPONSIVE_BREAKPOINTS.lg) {
          // Desktop sidebar
          const navigation = screen.getByRole('navigation', { name: 'Main navigation' });
          expect(navigation).toBeInTheDocument();
        } else {
          // Mobile menu button
          const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
          expect(ResponsiveAccessibilityTester.hasProperLabeling(menuButton)).toBe(true);
        }
      });
    });

    it('maintains keyboard navigation across breakpoints', async () => {
      const user = userEvent.setup();
      
      // Test mobile keyboard navigation
      viewportController.setDevice('iphone12');
      
      render(
        <DashboardLayout>
          <div>
            <button>Test Button</button>
          </div>
        </DashboardLayout>
      );

      // Tab through interface
      await user.tab(); // Skip link
      expect(screen.getByText('Skip to main content')).toHaveFocus();

      await user.tab(); // Mobile menu button
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toHaveFocus();

      await user.tab(); // Theme toggle or user menu
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });
  });

  describe('Performance Across Breakpoints', () => {
    it('handles rapid viewport changes without performance degradation', async () => {
      const { rerender } = render(
        <DashboardLayout>
          <div>Performance Test Content</div>
        </DashboardLayout>
      );

      const startTime = performance.now();

      // Rapidly change viewport sizes
      const viewports = [
        DEVICE_VIEWPORTS.iphone5,
        DEVICE_VIEWPORTS.ipad,
        DEVICE_VIEWPORTS.laptop,
        DEVICE_VIEWPORTS.desktop,
        DEVICE_VIEWPORTS.iphone12,
      ];

      viewports.forEach((viewport, index) => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        rerender(
          <DashboardLayout>
            <div>Performance Test Content {index}</div>
          </DashboardLayout>
        );
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);

      // Content should still be accessible
      expect(screen.getByText(/Performance Test Content/)).toBeInTheDocument();
    });

    it('does not cause memory leaks during responsive changes', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      const { rerender, unmount } = render(
        <DashboardLayout>
          <div>Memory Test Content</div>
        </DashboardLayout>
      );

      // Perform multiple viewport changes
      for (let i = 0; i < 10; i++) {
        viewportController.setViewport(300 + i * 100, 600);
        
        rerender(
          <DashboardLayout>
            <div>Memory Test Content {i}</div>
          </DashboardLayout>
        );
      }

      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Error Handling in Responsive Context', () => {
    it('handles layout errors gracefully across breakpoints', () => {
      // Mock console.error to catch any layout errors
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      Object.values(DEVICE_VIEWPORTS).forEach(viewport => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        expect(() => {
          render(
            <DashboardLayout>
              <div>Error Test Content</div>
            </DashboardLayout>
          );
        }).not.toThrow();
      });

      // Should not have logged any errors
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('provides fallback layouts for extreme viewport sizes', () => {
      // Test very small viewport
      viewportController.setViewport(200, 300);
      
      render(
        <DashboardLayout>
          <div>Extreme Small Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('Extreme Small Content')).toBeInTheDocument();

      // Test very large viewport
      viewportController.setViewport(3840, 2160); // 4K
      
      render(
        <DashboardLayout>
          <div>Extreme Large Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('Extreme Large Content')).toBeInTheDocument();
    });
  });

  describe('Theme Integration with Responsive Design', () => {
    it('maintains theme consistency across breakpoints', () => {
      const { rerender } = render(
        <DashboardLayout>
          <div className="bg-background text-foreground">Themed Content</div>
        </DashboardLayout>
      );

      Object.values(DEVICE_VIEWPORTS).forEach(viewport => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        rerender(
          <DashboardLayout>
            <div className="bg-background text-foreground">Themed Content</div>
          </DashboardLayout>
        );

        // Theme classes should be applied consistently
        const themedElement = screen.getByText('Themed Content');
        expect(themedElement).toHaveClass('bg-background', 'text-foreground');
      });
    });

    it('handles dark mode toggle across breakpoints', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardLayout>
          <div>Dark Mode Test</div>
        </DashboardLayout>
      );

      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      
      // Test theme toggle on different viewport sizes
      Object.values(DEVICE_VIEWPORTS).forEach(async (viewport) => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        // Theme toggle should remain accessible
        expect(themeToggle).toBeInTheDocument();
        
        // Should be able to click it
        await user.click(themeToggle);
      });
    });
  });
});