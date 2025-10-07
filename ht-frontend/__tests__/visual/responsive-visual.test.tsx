/**
 * Visual Regression Tests for Responsive Design
 * Tests visual consistency across different breakpoints and devices
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/app/dashboard/layout';
import { ViewportController, DEVICE_VIEWPORTS } from '../utils/responsive-test-utils';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
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

// Visual testing utilities
class VisualTestHelper {
  /**
   * Capture element dimensions and positioning
   */
  static captureLayout(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    
    return {
      dimensions: {
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
      },
      styles: {
        display: styles.display,
        position: styles.position,
        margin: styles.margin,
        padding: styles.padding,
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
      },
      visibility: {
        visible: rect.width > 0 && rect.height > 0,
        opacity: parseFloat(styles.opacity),
        overflow: styles.overflow,
      },
    };
  }

  /**
   * Compare layouts between different viewport sizes
   */
  static compareLayouts(layout1: any, layout2: any, tolerance: number = 1) {
    const dimensionsDiff = {
      width: Math.abs(layout1.dimensions.width - layout2.dimensions.width),
      height: Math.abs(layout1.dimensions.height - layout2.dimensions.height),
    };

    return {
      dimensionsChanged: dimensionsDiff.width > tolerance || dimensionsDiff.height > tolerance,
      visibilityChanged: layout1.visibility.visible !== layout2.visibility.visible,
      styleChanges: {
        display: layout1.styles.display !== layout2.styles.display,
        position: layout1.styles.position !== layout2.styles.position,
        fontSize: layout1.styles.fontSize !== layout2.styles.fontSize,
      },
    };
  }

  /**
   * Check if text is readable (not truncated or overlapping)
   */
  static isTextReadable(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    
    // Check if text is clipped
    const isClipped = styles.overflow === 'hidden' && 
                     (element.scrollWidth > element.clientWidth || 
                      element.scrollHeight > element.clientHeight);
    
    // Check if element has reasonable size
    const hasReasonableSize = rect.width > 10 && rect.height > 10;
    
    // Check if font size is readable (minimum 12px)
    const fontSize = parseFloat(styles.fontSize);
    const isReadableSize = fontSize >= 12;
    
    return !isClipped && hasReasonableSize && isReadableSize;
  }

  /**
   * Check for overlapping elements
   */
  static checkForOverlaps(elements: HTMLElement[]): Array<{element1: HTMLElement, element2: HTMLElement}> {
    const overlaps: Array<{element1: HTMLElement, element2: HTMLElement}> = [];
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const rect1 = elements[i].getBoundingClientRect();
        const rect2 = elements[j].getBoundingClientRect();
        
        // Check if rectangles overlap
        const overlap = !(rect1.right < rect2.left || 
                         rect2.right < rect1.left || 
                         rect1.bottom < rect2.top || 
                         rect2.bottom < rect1.top);
        
        if (overlap) {
          overlaps.push({ element1: elements[i], element2: elements[j] });
        }
      }
    }
    
    return overlaps;
  }
}

describe('Visual Regression Tests for Responsive Design', () => {
  let viewportController: ViewportController;

  beforeEach(() => {
    viewportController = new ViewportController();
    mockUsePathname.mockReturnValue('/dashboard');
  });

  afterEach(() => {
    viewportController.restore();
    jest.clearAllMocks();
  });

  describe('Layout Consistency Across Breakpoints', () => {
    it('maintains consistent sidebar behavior across desktop sizes', () => {
      const desktopSizes = [
        DEVICE_VIEWPORTS.laptopSmall,
        DEVICE_VIEWPORTS.laptop,
        DEVICE_VIEWPORTS.desktop,
        DEVICE_VIEWPORTS.desktopLarge,
      ];

      const layouts: any[] = [];

      desktopSizes.forEach((viewport, index) => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        render(
          <DashboardLayout>
            <div data-testid="test-content">Desktop Content {index}</div>
          </DashboardLayout>
        );

        const sidebar = screen.getByRole('navigation', { name: 'Main navigation' });
        const layout = VisualTestHelper.captureLayout(sidebar);
        layouts.push(layout);

        // Sidebar should be visible on all desktop sizes
        expect(layout.visibility.visible).toBe(true);
        expect(layout.styles.display).not.toBe('none');
      });

      // Compare layouts - sidebar width should be consistent
      for (let i = 1; i < layouts.length; i++) {
        const comparison = VisualTestHelper.compareLayouts(layouts[0], layouts[i]);
        
        // Sidebar dimensions should be consistent across desktop sizes
        expect(comparison.dimensionsChanged).toBe(false);
        expect(comparison.visibilityChanged).toBe(false);
      }
    });

    it('ensures proper mobile layout adaptation', () => {
      const mobileDevices = [
        DEVICE_VIEWPORTS.iphone5,
        DEVICE_VIEWPORTS.iphoneSE,
        DEVICE_VIEWPORTS.iphone12,
        DEVICE_VIEWPORTS.iphone12Pro,
      ];

      mobileDevices.forEach(viewport => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        render(
          <DashboardLayout>
            <div data-testid="mobile-content">Mobile Content</div>
          </DashboardLayout>
        );

        // Desktop sidebar should be hidden
        const desktopSidebar = screen.getByRole('navigation', { name: 'Main navigation' });
        const sidebarLayout = VisualTestHelper.captureLayout(desktopSidebar);
        expect(sidebarLayout.visibility.visible).toBe(false);

        // Mobile menu button should be visible
        const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
        const buttonLayout = VisualTestHelper.captureLayout(menuButton);
        expect(buttonLayout.visibility.visible).toBe(true);

        // Main content should use full width
        const mainContent = screen.getByRole('main');
        const mainLayout = VisualTestHelper.captureLayout(mainContent);
        expect(mainLayout.dimensions.width).toBeGreaterThan(viewport.width * 0.8); // At least 80% of viewport
      });
    });

    it('handles tablet layout appropriately', () => {
      const tabletDevices = [
        DEVICE_VIEWPORTS.ipadMini,
        DEVICE_VIEWPORTS.ipad,
        DEVICE_VIEWPORTS.ipadPro,
      ];

      tabletDevices.forEach(viewport => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        render(
          <DashboardLayout>
            <div data-testid="tablet-content">Tablet Content</div>
          </DashboardLayout>
        );

        // Should use mobile layout for tablets (width < 1024px)
        const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
        const buttonLayout = VisualTestHelper.captureLayout(menuButton);
        expect(buttonLayout.visibility.visible).toBe(true);

        // Content should be properly spaced
        const mainContent = screen.getByRole('main');
        const mainLayout = VisualTestHelper.captureLayout(mainContent);
        expect(mainLayout.dimensions.width).toBeGreaterThan(0);
        expect(mainLayout.visibility.visible).toBe(true);
      });
    });
  });

  describe('Content Readability and Scaling', () => {
    it('ensures text remains readable across all breakpoints', () => {
      const testContent = (
        <DashboardLayout>
          <div>
            <h1 data-testid="main-heading">Main Dashboard Heading</h1>
            <h2 data-testid="sub-heading">Section Heading</h2>
            <p data-testid="body-text">
              This is body text that should remain readable and properly sized 
              across all device breakpoints and screen sizes.
            </p>
            <small data-testid="small-text">Small supplementary text</small>
            <button data-testid="action-button">Action Button</button>
          </div>
        </DashboardLayout>
      );

      Object.entries(DEVICE_VIEWPORTS).forEach(([deviceName, viewport]) => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        render(testContent);

        // Check readability of different text elements
        const elements = [
          screen.getByTestId('main-heading'),
          screen.getByTestId('sub-heading'),
          screen.getByTestId('body-text'),
          screen.getByTestId('small-text'),
          screen.getByTestId('action-button'),
        ];

        elements.forEach(element => {
          expect(VisualTestHelper.isTextReadable(element)).toBe(true);
        });

        // Check for text overlaps
        const overlaps = VisualTestHelper.checkForOverlaps(elements);
        expect(overlaps).toHaveLength(0);
      });
    });

    it('maintains proper spacing and margins', () => {
      render(
        <DashboardLayout>
          <div className="space-y-4">
            <div data-testid="card-1" className="p-4 bg-card rounded-lg">Card 1</div>
            <div data-testid="card-2" className="p-4 bg-card rounded-lg">Card 2</div>
            <div data-testid="card-3" className="p-4 bg-card rounded-lg">Card 3</div>
          </div>
        </DashboardLayout>
      );

      Object.values(DEVICE_VIEWPORTS).forEach(viewport => {
        viewportController.setViewport(viewport.width, viewport.height);

        const cards = [
          screen.getByTestId('card-1'),
          screen.getByTestId('card-2'),
          screen.getByTestId('card-3'),
        ];

        // Check that cards don't overlap
        const overlaps = VisualTestHelper.checkForOverlaps(cards);
        expect(overlaps).toHaveLength(0);

        // Check that cards have reasonable spacing
        const card1Rect = cards[0].getBoundingClientRect();
        const card2Rect = cards[1].getBoundingClientRect();
        
        const verticalGap = card2Rect.top - card1Rect.bottom;
        expect(verticalGap).toBeGreaterThan(0); // Should have some gap
      });
    });
  });

  describe('Interactive Element Sizing', () => {
    it('ensures buttons meet minimum touch target requirements', () => {
      render(
        <DashboardLayout>
          <div>
            <button data-testid="primary-button" className="btn-primary">
              Primary Action
            </button>
            <button data-testid="secondary-button" className="btn-secondary">
              Secondary
            </button>
            <button data-testid="icon-button" className="btn-icon">
              ⚙️
            </button>
          </div>
        </DashboardLayout>
      );

      // Test on mobile devices where touch targets are critical
      const mobileDevices = [
        DEVICE_VIEWPORTS.iphone5,
        DEVICE_VIEWPORTS.iphone12,
        DEVICE_VIEWPORTS.ipadMini,
      ];

      mobileDevices.forEach(viewport => {
        viewportController.setViewport(viewport.width, viewport.height);

        const buttons = [
          screen.getByTestId('primary-button'),
          screen.getByTestId('secondary-button'),
          screen.getByTestId('icon-button'),
        ];

        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          
          // Minimum touch target size should be 44x44px
          expect(rect.width).toBeGreaterThanOrEqual(44);
          expect(rect.height).toBeGreaterThanOrEqual(44);
        });
      });
    });

    it('maintains proper form element sizing', () => {
      render(
        <DashboardLayout>
          <form>
            <input 
              data-testid="text-input" 
              type="text" 
              placeholder="Text input"
              className="form-input"
            />
            <select data-testid="select-input" className="form-select">
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
            <textarea 
              data-testid="textarea-input" 
              placeholder="Textarea"
              className="form-textarea"
            />
          </form>
        </DashboardLayout>
      );

      Object.values(DEVICE_VIEWPORTS).forEach(viewport => {
        viewportController.setViewport(viewport.width, viewport.height);

        const formElements = [
          screen.getByTestId('text-input'),
          screen.getByTestId('select-input'),
          screen.getByTestId('textarea-input'),
        ];

        formElements.forEach(element => {
          const rect = element.getBoundingClientRect();
          
          // Form elements should have reasonable minimum height
          expect(rect.height).toBeGreaterThanOrEqual(40);
          
          // Should be visible and not clipped
          expect(rect.width).toBeGreaterThan(0);
          expect(VisualTestHelper.isTextReadable(element)).toBe(true);
        });
      });
    });
  });

  describe('Grid and Layout Systems', () => {
    it('adapts grid layouts properly across breakpoints', () => {
      render(
        <DashboardLayout>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div data-testid="grid-item-1" className="bg-card p-4">Item 1</div>
            <div data-testid="grid-item-2" className="bg-card p-4">Item 2</div>
            <div data-testid="grid-item-3" className="bg-card p-4">Item 3</div>
            <div data-testid="grid-item-4" className="bg-card p-4">Item 4</div>
          </div>
        </DashboardLayout>
      );

      // Test mobile (1 column)
      viewportController.setDevice('iphone12');
      const mobileItems = screen.getAllByTestId(/grid-item-/);
      
      // On mobile, items should stack vertically
      const item1Mobile = mobileItems[0].getBoundingClientRect();
      const item2Mobile = mobileItems[1].getBoundingClientRect();
      expect(item2Mobile.top).toBeGreaterThan(item1Mobile.bottom);

      // Test tablet (2 columns)
      viewportController.setDevice('ipad');
      const tabletItems = screen.getAllByTestId(/grid-item-/);
      
      // On tablet, first two items should be side by side
      const item1Tablet = tabletItems[0].getBoundingClientRect();
      const item2Tablet = tabletItems[1].getBoundingClientRect();
      expect(item2Tablet.left).toBeGreaterThan(item1Tablet.right);

      // Test desktop (3+ columns)
      viewportController.setDevice('desktop');
      const desktopItems = screen.getAllByTestId(/grid-item-/);
      
      // On desktop, multiple items should be side by side
      const item1Desktop = desktopItems[0].getBoundingClientRect();
      const item2Desktop = desktopItems[1].getBoundingClientRect();
      const item3Desktop = desktopItems[2].getBoundingClientRect();
      
      expect(item2Desktop.left).toBeGreaterThan(item1Desktop.right);
      expect(item3Desktop.left).toBeGreaterThan(item2Desktop.right);
    });

    it('handles flexbox layouts responsively', () => {
      render(
        <DashboardLayout>
          <div className="flex flex-col sm:flex-row gap-4">
            <div data-testid="flex-item-1" className="flex-1 bg-card p-4">
              Flexible Item 1
            </div>
            <div data-testid="flex-item-2" className="flex-1 bg-card p-4">
              Flexible Item 2
            </div>
          </div>
        </DashboardLayout>
      );

      // Test mobile (column layout)
      viewportController.setDevice('iphone12');
      const item1Mobile = screen.getByTestId('flex-item-1').getBoundingClientRect();
      const item2Mobile = screen.getByTestId('flex-item-2').getBoundingClientRect();
      
      // Items should stack vertically on mobile
      expect(item2Mobile.top).toBeGreaterThan(item1Mobile.bottom);

      // Test desktop (row layout)
      viewportController.setDevice('desktop');
      const item1Desktop = screen.getByTestId('flex-item-1').getBoundingClientRect();
      const item2Desktop = screen.getByTestId('flex-item-2').getBoundingClientRect();
      
      // Items should be side by side on desktop
      expect(item2Desktop.left).toBeGreaterThan(item1Desktop.right);
      
      // Items should have similar heights in row layout
      const heightDifference = Math.abs(item1Desktop.height - item2Desktop.height);
      expect(heightDifference).toBeLessThan(10); // Allow small differences
    });
  });

  describe('Animation and Transition Consistency', () => {
    it('maintains smooth transitions across viewport changes', async () => {
      const { rerender } = render(
        <DashboardLayout>
          <div data-testid="animated-content" className="transition-all duration-300">
            Animated Content
          </div>
        </DashboardLayout>
      );

      // Capture initial state
      const initialElement = screen.getByTestId('animated-content');
      const initialLayout = VisualTestHelper.captureLayout(initialElement);

      // Change viewport
      viewportController.setDevice('iphone12');
      
      rerender(
        <DashboardLayout>
          <div data-testid="animated-content" className="transition-all duration-300">
            Animated Content
          </div>
        </DashboardLayout>
      );

      // Element should still be present and visible
      const updatedElement = screen.getByTestId('animated-content');
      const updatedLayout = VisualTestHelper.captureLayout(updatedElement);
      
      expect(updatedLayout.visibility.visible).toBe(true);
      
      // Transition classes should be preserved
      expect(updatedElement).toHaveClass('transition-all', 'duration-300');
    });
  });

  describe('Error State Visualization', () => {
    it('displays error states properly across breakpoints', () => {
      const ErrorComponent = () => (
        <DashboardLayout>
          <div>
            <div data-testid="error-alert" className="alert alert-error">
              Error: Something went wrong
            </div>
            <div data-testid="warning-alert" className="alert alert-warning">
              Warning: Please check your input
            </div>
          </div>
        </DashboardLayout>
      );

      Object.values(DEVICE_VIEWPORTS).forEach(viewport => {
        viewportController.setViewport(viewport.width, viewport.height);
        
        render(<ErrorComponent />);

        const errorAlert = screen.getByTestId('error-alert');
        const warningAlert = screen.getByTestId('warning-alert');

        // Error states should be visible and readable
        expect(VisualTestHelper.isTextReadable(errorAlert)).toBe(true);
        expect(VisualTestHelper.isTextReadable(warningAlert)).toBe(true);

        // Alerts should not overlap
        const overlaps = VisualTestHelper.checkForOverlaps([errorAlert, warningAlert]);
        expect(overlaps).toHaveLength(0);
      });
    });
  });
});