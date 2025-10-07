/**
 * Accessibility Testing Component
 * Provides tools and utilities for testing accessibility features
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { announceToScreenReader, getFocusableElements, trapFocus } from "@/lib/utils/accessibility";
import { cn } from "@/lib/utils";

interface AccessibilityTestProps {
  className?: string;
}

export function AccessibilityTest({ className }: AccessibilityTestProps) {
  const [testResults, setTestResults] = React.useState<string[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runFocusTest = () => {
    addResult("Testing focus management...");
    
    // Test focusable elements
    const focusableElements = getFocusableElements(document.body);
    addResult(`Found ${focusableElements.length} focusable elements`);
    
    // Test tab order
    let tabIndex = 0;
    focusableElements.forEach((element, index) => {
      const computedTabIndex = element.tabIndex;
      if (computedTabIndex >= 0) {
        tabIndex++;
      }
    });
    
    addResult(`Elements with positive tab index: ${tabIndex}`);
  };

  const runAriaTest = () => {
    addResult("Testing ARIA attributes...");
    
    // Check for missing alt text on images
    const images = document.querySelectorAll('img');
    let missingAlt = 0;
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        missingAlt++;
      }
    });
    addResult(`Images missing alt text: ${missingAlt}`);
    
    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    addResult(`Found ${headings.length} headings`);
    
    // Check for ARIA landmarks
    const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]');
    addResult(`Found ${landmarks.length} ARIA landmarks`);
    
    // Check for ARIA labels
    const elementsWithAriaLabel = document.querySelectorAll('[aria-label]');
    addResult(`Elements with aria-label: ${elementsWithAriaLabel.length}`);
    
    // Check for ARIA described by
    const elementsWithAriaDescribedBy = document.querySelectorAll('[aria-describedby]');
    addResult(`Elements with aria-describedby: ${elementsWithAriaDescribedBy.length}`);
  };

  const runKeyboardTest = () => {
    addResult("Testing keyboard navigation...");
    
    // Test skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    addResult(`Found ${skipLinks.length} skip links`);
    
    // Test for keyboard traps
    const elementsWithTabIndex = document.querySelectorAll('[tabindex]');
    let negativeTabIndex = 0;
    elementsWithTabIndex.forEach(element => {
      if (element.getAttribute('tabindex') === '-1') {
        negativeTabIndex++;
      }
    });
    addResult(`Elements with tabindex="-1": ${negativeTabIndex}`);
  };

  const runScreenReaderTest = () => {
    addResult("Testing screen reader compatibility...");
    
    // Test announcer
    announceToScreenReader("Testing screen reader announcement", "polite");
    addResult("Screen reader announcement sent");
    
    // Check for live regions
    const liveRegions = document.querySelectorAll('[aria-live]');
    addResult(`Found ${liveRegions.length} live regions`);
    
    // Check for hidden content
    const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
    addResult(`Elements hidden from screen readers: ${hiddenElements.length}`);
    
    // Check for screen reader only content
    const srOnlyElements = document.querySelectorAll('.sr-only');
    addResult(`Screen reader only elements: ${srOnlyElements.length}`);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    addResult("Starting accessibility tests...");
    
    await new Promise(resolve => setTimeout(resolve, 500));
    runFocusTest();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    runAriaTest();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    runKeyboardTest();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    runScreenReaderTest();
    
    addResult("All tests completed!");
    setIsRunning(false);
  };

  const testAnnouncement = () => {
    announceToScreenReader("This is a test announcement for screen readers", "assertive");
    addResult("Test announcement sent to screen readers");
  };

  const testFocusTrap = () => {
    const container = document.getElementById('focus-trap-test');
    if (container) {
      const cleanup = trapFocus(container);
      addResult("Focus trap activated on test container");
      
      // Clean up after 5 seconds
      setTimeout(() => {
        cleanup();
        addResult("Focus trap deactivated");
      }, 5000);
    }
  };

  return (
    <Card className={cn("w-full max-w-4xl", className)}>
      <CardHeader>
        <CardTitle>Accessibility Testing Tools</CardTitle>
        <CardDescription>
          Test and verify accessibility features in the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            aria-describedby="run-all-description"
          >
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </Button>
          <div id="run-all-description" className="sr-only">
            Runs comprehensive accessibility tests including focus management, ARIA attributes, keyboard navigation, and screen reader compatibility
          </div>
          
          <Button variant="outline" onClick={runFocusTest}>
            Test Focus
          </Button>
          <Button variant="outline" onClick={runAriaTest}>
            Test ARIA
          </Button>
          <Button variant="outline" onClick={runKeyboardTest}>
            Test Keyboard
          </Button>
          <Button variant="outline" onClick={runScreenReaderTest}>
            Test Screen Reader
          </Button>
          <Button variant="outline" onClick={testAnnouncement}>
            Test Announcement
          </Button>
          <Button variant="outline" onClick={testFocusTrap}>
            Test Focus Trap
          </Button>
          <Button variant="destructive" onClick={clearResults}>
            Clear Results
          </Button>
        </div>

        <Separator />

        {/* Test Results */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Test Results</h3>
          <div 
            className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto"
            role="log"
            aria-live="polite"
            aria-label="Test results"
          >
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">No tests run yet</p>
            ) : (
              <ul className="space-y-1">
                {testResults.map((result, index) => (
                  <li key={index} className="text-sm">
                    <Badge variant="outline" className="mr-2">
                      {index + 1}
                    </Badge>
                    {result}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Focus Trap Test Container */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Focus Trap Test Area</h3>
          <div 
            id="focus-trap-test"
            className="border-2 border-dashed border-muted-foreground p-4 rounded-lg space-y-2"
            role="region"
            aria-label="Focus trap test area"
          >
            <p className="text-sm text-muted-foreground">
              This area can be used to test focus trapping. Click "Test Focus Trap" to activate.
            </p>
            <div className="flex gap-2">
              <Button size="sm">Button 1</Button>
              <Button size="sm" variant="outline">Button 2</Button>
              <Button size="sm" variant="secondary">Button 3</Button>
            </div>
          </div>
        </div>

        {/* Keyboard Navigation Help */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Keyboard Navigation Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">General Navigation</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><kbd className="px-1 py-0.5 bg-muted rounded">Tab</kbd> - Next element</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded">Shift+Tab</kbd> - Previous element</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> - Activate button/link</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded">Space</kbd> - Activate button</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded">Escape</kbd> - Close dialog/menu</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sidebar Navigation</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><kbd className="px-1 py-0.5 bg-muted rounded">↑↓</kbd> - Navigate menu items</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded">Home</kbd> - First item</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded">End</kbd> - Last item</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+F2</kbd> - Toggle sidebar</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Accessibility Status Indicator
 * Shows the current accessibility status of the page
 */
interface AccessibilityStatusProps {
  className?: string;
}

export function AccessibilityStatus({ className }: AccessibilityStatusProps) {
  const [status, setStatus] = React.useState<{
    focusable: number;
    landmarks: number;
    headings: number;
    images: number;
  }>({ focusable: 0, landmarks: 0, headings: 0, images: 0 });

  React.useEffect(() => {
    const updateStatus = () => {
      const focusableElements = getFocusableElements(document.body);
      const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]');
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const images = document.querySelectorAll('img');

      setStatus({
        focusable: focusableElements.length,
        landmarks: landmarks.length,
        headings: headings.length,
        images: images.length,
      });
    };

    updateStatus();
    
    // Update status when DOM changes
    const observer = new MutationObserver(updateStatus);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)} role="status" aria-label="Accessibility status">
      <Badge variant="outline">{status.focusable} focusable</Badge>
      <Badge variant="outline">{status.landmarks} landmarks</Badge>
      <Badge variant="outline">{status.headings} headings</Badge>
      <Badge variant="outline">{status.images} images</Badge>
    </div>
  );
}