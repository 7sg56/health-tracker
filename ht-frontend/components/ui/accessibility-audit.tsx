/**
 * Accessibility Audit Component
 * Provides runtime accessibility testing and reporting
 */

import * as React from "react";
import { AccessibilityTester, ScreenReaderUtils } from "@/lib/utils/accessibility";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Keyboard, 
  MousePointer,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibilityAuditProps {
  targetSelector?: string;
  autoRun?: boolean;
  showDetails?: boolean;
  className?: string;
}

interface AuditResult {
  passed: boolean;
  elementResults: Array<{
    element: HTMLElement;
    errors: string[];
    warnings: string[];
  }>;
  summary: {
    totalElements: number;
    elementsWithErrors: number;
    elementsWithWarnings: number;
  };
}

export function AccessibilityAudit({ 
  targetSelector,
  autoRun = false,
  showDetails = true,
  className 
}: AccessibilityAuditProps) {
  const [auditResult, setAuditResult] = React.useState<AuditResult | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [selectedElement, setSelectedElement] = React.useState<HTMLElement | null>(null);

  const runAudit = React.useCallback(async () => {
    setIsRunning(true);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      let result: AuditResult;
      
      if (targetSelector) {
        const targetElement = document.querySelector(targetSelector) as HTMLElement;
        if (targetElement) {
          const elementResult = AccessibilityTester.auditElement(targetElement);
          result = {
            passed: elementResult.passed,
            elementResults: [{
              element: targetElement,
              errors: elementResult.errors,
              warnings: elementResult.warnings
            }],
            summary: {
              totalElements: 1,
              elementsWithErrors: elementResult.errors.length > 0 ? 1 : 0,
              elementsWithWarnings: elementResult.warnings.length > 0 ? 1 : 0
            }
          };
        } else {
          throw new Error(`Element not found: ${targetSelector}`);
        }
      } else {
        result = AccessibilityTester.auditPage();
      }
      
      setAuditResult(result);
    } catch (error) {
      console.error('Accessibility audit failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [targetSelector]);

  React.useEffect(() => {
    if (autoRun) {
      runAudit();
    }
  }, [autoRun, runAudit]);

  const highlightElement = (element: HTMLElement) => {
    // Remove previous highlights
    document.querySelectorAll('[data-a11y-highlight]').forEach(el => {
      el.removeAttribute('data-a11y-highlight');
      (el as HTMLElement).style.outline = '';
    });

    // Highlight selected element
    element.setAttribute('data-a11y-highlight', 'true');
    element.style.outline = '2px solid #ef4444';
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setSelectedElement(element);
  };

  const clearHighlight = () => {
    document.querySelectorAll('[data-a11y-highlight]').forEach(el => {
      el.removeAttribute('data-a11y-highlight');
      (el as HTMLElement).style.outline = '';
    });
    setSelectedElement(null);
  };

  const getElementDescription = (element: HTMLElement): string => {
    const tagName = element.tagName.toLowerCase();
    const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const id = element.id ? `#${element.id}` : '';
    const accessibleName = ScreenReaderUtils.getAccessibleName(element);
    
    return `${tagName}${id}${className}${accessibleName ? ` ("${accessibleName}")` : ''}`;
  };

  if (!auditResult && !isRunning) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility Audit
          </CardTitle>
          <CardDescription>
            Run an accessibility audit to identify potential issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runAudit} className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Run Accessibility Audit
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isRunning) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 animate-pulse" />
            Running Accessibility Audit...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!auditResult) return null;

  const { passed, elementResults, summary } = auditResult;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Accessibility Audit Results
          </CardTitle>
          <CardDescription>
            {passed 
              ? "No accessibility issues found!" 
              : `Found issues in ${summary.elementsWithErrors} of ${summary.totalElements} elements`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-muted-foreground">
                {summary.totalElements}
              </div>
              <div className="text-sm text-muted-foreground">Total Elements</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {summary.elementsWithErrors}
              </div>
              <div className="text-sm text-muted-foreground">With Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {summary.elementsWithWarnings}
              </div>
              <div className="text-sm text-muted-foreground">With Warnings</div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={runAudit} variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Re-run Audit
            </Button>
            <Button onClick={clearHighlight} variant="outline" size="sm">
              Clear Highlights
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {showDetails && elementResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
            <CardDescription>
              Click on any element to highlight it on the page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {elementResults.map((result, index) => {
                  const hasIssues = result.errors.length > 0 || result.warnings.length > 0;
                  
                  if (!hasIssues) return null;
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => highlightElement(result.element)}
                            className="h-auto p-0 font-mono text-left justify-start"
                          >
                            <MousePointer className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {getElementDescription(result.element)}
                            </span>
                          </Button>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {result.errors.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {result.errors.length} errors
                            </Badge>
                          )}
                          {result.warnings.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {result.warnings.length} warnings
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {result.errors.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {result.errors.map((error, errorIndex) => (
                            <Alert key={errorIndex} variant="destructive" className="py-2">
                              <XCircle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                {error}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}
                      
                      {result.warnings.length > 0 && (
                        <div className="space-y-1">
                          {result.warnings.map((warning, warningIndex) => (
                            <Alert key={warningIndex} className="py-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                {warning}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Keyboard Navigation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Navigation Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Sidebar Navigation</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd> - Navigate between elements</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">↑↓</kbd> - Navigate menu items</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> - Activate item</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+F2</kbd> - Toggle sidebar</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">General Navigation</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> - Close dialogs/menus</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> - Activate buttons</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Home/End</kbd> - First/last item</li>
                <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Shift+Tab</kbd> - Navigate backwards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Quick Accessibility Check Component
 * Lightweight component for basic accessibility validation
 */
interface QuickA11yCheckProps {
  children: React.ReactNode;
  showIssues?: boolean;
}

export function QuickA11yCheck({ children, showIssues = false }: QuickA11yCheckProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [issues, setIssues] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!containerRef.current || !showIssues) return;

    const checkAccessibility = () => {
      const foundIssues: string[] = [];
      const container = containerRef.current!;
      
      // Check for missing alt text on images
      const images = container.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        foundIssues.push(`${images.length} images missing alt text`);
      }

      // Check for buttons without accessible names
      const buttons = container.querySelectorAll('button:not([aria-label]):not([title])');
      const buttonsWithoutText = Array.from(buttons).filter(btn => !btn.textContent?.trim());
      if (buttonsWithoutText.length > 0) {
        foundIssues.push(`${buttonsWithoutText.length} buttons without accessible names`);
      }

      // Check for form inputs without labels
      const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      const inputsWithoutLabels = Array.from(inputs).filter(input => {
        const id = input.getAttribute('id');
        return !id || !container.querySelector(`label[for="${id}"]`);
      });
      if (inputsWithoutLabels.length > 0) {
        foundIssues.push(`${inputsWithoutLabels.length} form inputs without labels`);
      }

      setIssues(foundIssues);
    };

    // Check on mount and when content changes
    checkAccessibility();
    
    const observer = new MutationObserver(checkAccessibility);
    observer.observe(containerRef.current, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, [showIssues]);

  return (
    <div ref={containerRef} className="relative">
      {children}
      {showIssues && issues.length > 0 && (
        <div className="absolute top-2 right-2 z-50">
          <Badge variant="destructive" className="text-xs">
            {issues.length} A11y issues
          </Badge>
        </div>
      )}
    </div>
  );
}