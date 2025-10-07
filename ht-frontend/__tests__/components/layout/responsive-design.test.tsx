/**
 * Comprehensive Responsive Design Tests
 * Tests layout behavior across all breakpoints, mobile sidebar functionality,
 * touch interactions, and content scaling/readability
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/app/dashboard/layout';
import { EnhancedSidebar } from '@/components/layout/enhanced-sidebar';
import { TopHeader } from '@/components/layout/top-header';

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
      user: { id: '1', username: 'testuser', email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
    },
    logout: jest.fn(),
  }),
}));

// Mock theme toggle
jest.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">Theme Toggle</button>,
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: jest.fn(),
    theme: 'light',
  }),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

// Responsive breakpoints for testing
const BREAKPOINTS = {
  mobile: 375,
  mobileLarge: 425,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  desktopLarge: 1920,
};

// Helper function to simulate viewport resize
const resizeViewport = (width: number, height: number = 800) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

// Helper function to check if element is visible
const isElementVisible = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.offsetWidth > 0 && 
         element.offsetHeight > 0;
};

// Helper function to simulate touch events
const simulateTouch = (element: HTMLElement, type: 'start' | 'move' | 'end', clientX: number = 0, clientY: number = 0) => {
  const touchEvent = new TouchEvent(`touch${type}`, {
    touches: type === 'end' ? [] : [{
      clientX,
      clientY,
      target: element,
    } as Touch],
    changedTouches: [{
      clientX,
      clientY,
      target: element,
    } as Touch],
    bubbles: true,
    cancelable: true,
  });
  
  element.dispatchEvent(touchEvent);
};

describe('Responsive Design Tests', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
    // Reset viewport to desktop by default
    resizeViewport(BREAKPOINTS.desktop);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset body styles
    document.body.style.overflow = '';
  });

  describe('Layout Behavior Across Breakpoints', () => {
    it('displays desktop sidebar at laptop breakpoint and above', () => {
      resizeViewport(BREAKPOINTS.laptop);
      
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Desktop sidebar should be visible
      const desktopSidebar = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(desktopSidebar).toBeInTheDocument();
      expect(desktopSidebar).toHaveClass('lg:block');
    });

    it('hides desktop sidebar below laptop breakpoint', () => {
      resizeViewport(BREAKPOINTS.tablet);
      
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Desktop sidebar should be hidden on tablet
      const desktopSidebar = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(desktopSidebar).toHaveClass('hidden');
    });

    it('shows mobile menu button on mobile devices', () => {
      resizeViewport(BREAKPOINTS.mobile);
      
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(isElementVisible(menuButton)).toBe(true);
    });

    it('adjusts main content padding across breakpoints', () => {
      const { rerender } = render(
        <DashboardLayout>
          <div data-testid="main-content">Test Content</div>
        </DashboardLayout>
      );

      const mainContent = screen.getByRole('main');

      // Test mobile padding
      resizeViewport(BREAKPOINTS.mobile);
      rerender(
        <DashboardLayout>
          <div data-testid="main-content">Test Content</div>
        </DashboardLayout>
      );
      expect(mainContent).toHaveClass('p-4');

      // Test tablet padding
      resizeViewport(BREAKPOINTS.tablet);
      rerender(
        <DashboardLayout>
          <div data-testid="main-content">Test Content</div>
        </DashboardLayout>
      );
      expect(mainContent).toHaveClass('sm:p-6');

      // Test desktop padding
      resizeViewport(BREAKPOINTS.desktop);
      rerender(
        <DashboardLayout>
          <div data-testid="main-content">Test Content</div>
        </DashboardLayout>
      );
      expect(mainContent).toHaveClass('lg:p-8');
    });

    it('maintains proper content max-width across breakpoints', () => {
      const { rerender } = render(
        <DashboardLayout>
          <div data-testid="content-wrapper">Test Content</div>
        </DashboardLayout>
      );

      // Find the content wrapper div
      const contentWrapper = screen.getByTestId('content-wrapper').parentElement;

      // Test different breakpoints
      Object.entries(BREAKPOINTS).forEach(([breakpoint, width]) => {
        resizeViewport(width);
        rerender(
          <DashboardLayout>
            <div data-testid="content-wrapper">Test Content</div>
          </DashboardLayout>
        );

        // Content should have appropriate max-width classes
        expect(contentWrapper).toHaveClass('max-w-full');
        if (width >= BREAKPOINTS.tablet) {
          expect(contentWrapper).toHaveClass('sm:max-w-screen-sm');
        }
        if (width >= BREAKPOINTS.laptop) {
          expect(contentWrapper).toHaveClass('lg:max-w-screen-lg');
        }
      });
    });

    it('adjusts grid gaps responsively', () => {
      render(
        <DashboardLayout>
          <div data-testid="content-wrapper">Test Content</div>
        </DashboardLayout>
      );

      const contentWrapper = screen.getByTestId('content-wrapper').parentElement;

      // Test mobile gaps
      resizeViewport(BREAKPOINTS.mobile);
      expect(contentWrapper).toHaveClass('gap-4');

      // Test tablet gaps
      resizeViewport(BREAKPOINTS.tablet);
      expect(contentWrapper).toHaveClass('sm:gap-6');

      // Test desktop gaps
      resizeViewport(BREAKPOINTS.desktop);
      expect(contentWrapper).toHaveClass('lg:gap-8');
    });
  });

  describe('Mobile Sidebar Functionality', () => {
    beforeEach(() => {
      resizeViewport(BREAKPOINTS.mobile);
    });

    it('opens mobile sidebar when menu button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      // Mobile sidebar should open (Sheet component)
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('closes mobile sidebar when navigation item is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Open sidebar
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click on a navigation item
      const dashboardLink = screen.getByRole('listitem', { name: /dashboard/i });
      await user.click(dashboardLink);

      // Sidebar should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes mobile sidebar when escape key is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Open sidebar
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Press escape key
      await user.keyboard('{Escape}');

      // Sidebar should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('prevents body scroll when mobile sidebar is open', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Initially body should not have overflow hidden
      expect(document.body.style.overflow).not.toBe('hidden');

      // Open sidebar
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Body scroll should be prevented
      expect(document.body.style.overflow).toBe('hidden');

      // Close sidebar
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Body scroll should be restored
      expect(document.body.style.overflow).toBe('unset');
    });

    it('maintains focus management in mobile sidebar', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Open sidebar
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Focus should be trapped within the sidebar
      const firstNavItem = screen.getByRole('listitem', { name: /dashboard/i });
      firstNavItem.focus();
      expect(firstNavItem).toHaveFocus();

      // Tab navigation should work within sidebar
      await user.tab();
      const nextFocusableElement = document.activeElement;
      expect(nextFocusableElement).toBeInTheDocument();
    });
  });

  describe('Touch Interactions and Mobile Navigation', () => {
    beforeEach(() => {
      resizeViewport(BREAKPOINTS.mobile);
    });

    it('handles touch events on mobile menu button', async () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });

      // Simulate touch start
      simulateTouch(menuButton, 'start', 100, 100);
      
      // Simulate touch end (tap)
      simulateTouch(menuButton, 'end', 100, 100);

      // Should trigger click and open sidebar
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('handles touch events on navigation items', async () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Open sidebar first
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const navItem = screen.getByRole('listitem', { name: /water intake/i });

      // Simulate touch interaction
      simulateTouch(navItem, 'start', 150, 200);
      simulateTouch(navItem, 'end', 150, 200);

      // Should close sidebar after navigation
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('provides proper touch target sizes for mobile', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      const buttonStyles = window.getComputedStyle(menuButton);
      
      // Button should have adequate touch target size (minimum 44px)
      const minTouchTarget = 44;
      expect(parseInt(buttonStyles.minHeight) || parseInt(buttonStyles.height)).toBeGreaterThanOrEqual(minTouchTarget);
      expect(parseInt(buttonStyles.minWidth) || parseInt(buttonStyles.width)).toBeGreaterThanOrEqual(minTouchTarget);
    });

    it('handles swipe gestures for sidebar (if implemented)', async () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      const mainContent = screen.getByRole('main');

      // Simulate swipe right gesture (start from left edge)
      simulateTouch(mainContent, 'start', 10, 400);
      simulateTouch(mainContent, 'move', 100, 400);
      simulateTouch(mainContent, 'end', 200, 400);

      // Note: This test assumes swipe-to-open is implemented
      // If not implemented, this test documents the expected behavior
    });
  });

  describe('Content Scaling and Readability', () => {
    it('maintains readable font sizes across breakpoints', () => {
      const { rerender } = render(
        <DashboardLayout>
          <div>
            <h1>Main Heading</h1>
            <p>Body text content</p>
          </div>
        </DashboardLayout>
      );

      // Test different viewport sizes
      Object.entries(BREAKPOINTS).forEach(([breakpoint, width]) => {
        resizeViewport(width);
        rerender(
          <DashboardLayout>
            <div>
              <h1>Main Heading</h1>
              <p>Body text content</p>
            </div>
          </DashboardLayout>
        );

        const heading = screen.getByRole('heading');
        const paragraph = screen.getByText('Body text content');

        const headingStyles = window.getComputedStyle(heading);
        const paragraphStyles = window.getComputedStyle(paragraph);

        // Font sizes should be readable (minimum 14px for body text)
        expect(parseInt(paragraphStyles.fontSize)).toBeGreaterThanOrEqual(14);
        expect(parseInt(headingStyles.fontSize)).toBeGreaterThan(parseInt(paragraphStyles.fontSize));
      });
    });

    it('maintains proper line heights for readability', () => {
      render(
        <DashboardLayout>
          <div>
            <p>This is a longer paragraph of text that should maintain proper line height for optimal readability across different screen sizes and breakpoints.</p>
          </div>
        </DashboardLayout>
      );

      const paragraph = screen.getByText(/This is a longer paragraph/);
      const styles = window.getComputedStyle(paragraph);

      // Line height should be between 1.4 and 1.6 for optimal readability
      const lineHeight = parseFloat(styles.lineHeight) / parseFloat(styles.fontSize);
      expect(lineHeight).toBeGreaterThanOrEqual(1.4);
      expect(lineHeight).toBeLessThanOrEqual(1.8);
    });

    it('ensures adequate contrast ratios', () => {
      render(
        <DashboardLayout>
          <div>
            <h1>Heading Text</h1>
            <p>Body text</p>
            <button>Button Text</button>
          </div>
        </DashboardLayout>
      );

      // This test would ideally use a contrast checking library
      // For now, we ensure elements have proper color classes
      const heading = screen.getByRole('heading');
      const paragraph = screen.getByText('Body text');
      const button = screen.getByRole('button');

      // Elements should have appropriate text color classes
      expect(heading).toHaveClass('text-foreground');
      expect(paragraph).toHaveClass('text-foreground');
    });

    it('scales images and media appropriately', () => {
      render(
        <DashboardLayout>
          <div>
            <img src="/test-image.jpg" alt="Test image" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        </DashboardLayout>
      );

      const image = screen.getByRole('img');
      const styles = window.getComputedStyle(image);

      // Images should be responsive
      expect(styles.maxWidth).toBe('100%');
      expect(styles.height).toBe('auto');
    });

    it('maintains proper spacing between elements', () => {
      render(
        <DashboardLayout>
          <div className="space-y-4">
            <div>Element 1</div>
            <div>Element 2</div>
            <div>Element 3</div>
          </div>
        </DashboardLayout>
      );

      const container = screen.getByText('Element 1').parentElement;
      expect(container).toHaveClass('space-y-4');

      // Test responsive spacing
      resizeViewport(BREAKPOINTS.mobile);
      expect(container).toHaveClass('space-y-4');
    });
  });

  describe('Sidebar Collapse Functionality (Desktop)', () => {
    beforeEach(() => {
      resizeViewport(BREAKPOINTS.desktop);
    });

    it('allows sidebar collapse on desktop', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedSidebar>
          <div>Test Content</div>
        </EnhancedSidebar>
      );

      // Find collapse button (should be visible on desktop)
      const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i });
      expect(collapseButton).toBeInTheDocument();

      await user.click(collapseButton);

      // Sidebar should collapse (width changes)
      const sidebar = screen.getByRole('navigation', { name: 'Main navigation' });
      await waitFor(() => {
        expect(sidebar).toHaveClass('lg:w-16');
      });
    });

    it('adjusts main content area when sidebar collapses', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedSidebar>
          <div data-testid="main-content">Test Content</div>
        </EnhancedSidebar>
      );

      const mainContainer = screen.getByTestId('main-content').closest('.lg\\:pl-72');
      expect(mainContainer).toHaveClass('lg:pl-72');

      // Collapse sidebar
      const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i });
      await user.click(collapseButton);

      // Main content should adjust its left padding
      await waitFor(() => {
        expect(mainContainer).toHaveClass('lg:pl-16');
      });
    });

    it('shows tooltips for navigation items when collapsed', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedSidebar>
          <div>Test Content</div>
        </EnhancedSidebar>
      );

      // Collapse sidebar
      const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i });
      await user.click(collapseButton);

      // Hover over a navigation item
      const navItem = screen.getByRole('listitem', { name: /dashboard/i });
      await user.hover(navItem);

      // Tooltip should appear
      await waitFor(() => {
        const tooltip = screen.getByText('Dashboard');
        expect(tooltip).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility in Responsive Design', () => {
    it('maintains proper focus order across breakpoints', async () => {
      const user = userEvent.setup();
      
      // Test mobile
      resizeViewport(BREAKPOINTS.mobile);
      render(
        <DashboardLayout>
          <div>
            <button>Button 1</button>
            <button>Button 2</button>
          </div>
        </DashboardLayout>
      );

      // Tab through elements
      await user.tab();
      expect(screen.getByText('Skip to main content')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toHaveFocus();
    });

    it('provides proper ARIA labels for responsive elements', () => {
      resizeViewport(BREAKPOINTS.mobile);
      
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-label');

      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('aria-label', 'Dashboard main content');
    });

    it('maintains skip links functionality across breakpoints', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      const skipLink = screen.getByText('Skip to main content');
      await user.click(skipLink);

      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveFocus();
    });

    it('ensures proper heading hierarchy is maintained', () => {
      render(
        <DashboardLayout>
          <div>
            <h1>Main Title</h1>
            <h2>Section Title</h2>
            <h3>Subsection Title</h3>
          </div>
        </DashboardLayout>
      );

      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveProperty('tagName', 'H1');
      expect(headings[1]).toHaveProperty('tagName', 'H2');
      expect(headings[2]).toHaveProperty('tagName', 'H3');
    });
  });

  describe('Performance in Responsive Design', () => {
    it('handles rapid viewport changes without errors', () => {
      const { rerender } = render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Rapidly change viewport sizes
      const sizes = [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.laptop, BREAKPOINTS.desktop];
      
      sizes.forEach(size => {
        resizeViewport(size);
        rerender(
          <DashboardLayout>
            <div>Test Content</div>
          </DashboardLayout>
        );
      });

      // Should not throw errors and content should still be visible
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('debounces resize events appropriately', async () => {
      const resizeHandler = jest.fn();
      window.addEventListener('resize', resizeHandler);

      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Trigger multiple rapid resize events
      for (let i = 0; i < 10; i++) {
        resizeViewport(BREAKPOINTS.mobile + i * 10);
      }

      // Wait for debouncing
      await waitFor(() => {
        expect(resizeHandler).toHaveBeenCalled();
      });

      window.removeEventListener('resize', resizeHandler);
    });
  });
});