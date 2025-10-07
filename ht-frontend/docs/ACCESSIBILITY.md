# Accessibility Implementation Guide

This document outlines the accessibility features implemented in the HealthTracker frontend application and provides guidelines for maintaining and extending accessibility support.

## Overview

The application follows WCAG 2.1 AA guidelines and implements comprehensive accessibility features including:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management and tab order
- High contrast support
- Reduced motion preferences

## Key Features Implemented

### 1. Keyboard Navigation

#### Sidebar Navigation
- **Arrow Keys**: Navigate between menu items
- **Home/End**: Jump to first/last menu item
- **Enter/Space**: Activate selected item
- **Escape**: Exit navigation mode
- **Ctrl+F2**: Toggle sidebar collapse (desktop only)

#### General Navigation
- **Tab/Shift+Tab**: Navigate between focusable elements
- **Enter**: Activate buttons and links
- **Space**: Activate buttons
- **Escape**: Close dialogs and menus

### 2. ARIA Implementation

#### Landmarks
- `role="banner"` - Header areas
- `role="main"` - Main content area
- `role="navigation"` - Navigation menus
- `role="complementary"` - Sidebar content
- `role="contentinfo"` - Footer areas

#### Labels and Descriptions
- `aria-label` - Accessible names for elements
- `aria-labelledby` - References to labeling elements
- `aria-describedby` - References to describing elements
- `aria-current="page"` - Current page indicators

#### States and Properties
- `aria-expanded` - Collapsible element states
- `aria-hidden` - Hidden decorative elements
- `aria-live` - Live region announcements
- `aria-controls` - Element relationships

### 3. Focus Management

#### Skip Links
- Skip to main content
- Skip to navigation
- Visible on focus with proper styling

#### Focus Trapping
- Modal dialogs trap focus within
- Sidebar navigation maintains focus
- Proper focus restoration after interactions

#### Focus Indicators
- High contrast focus rings
- Consistent focus styling across components
- Keyboard and mouse focus differentiation

### 4. Screen Reader Support

#### Announcements
- Route changes announced
- State changes announced
- Error messages announced
- Loading states announced

#### Live Regions
- Polite announcements for non-critical updates
- Assertive announcements for errors
- Atomic updates for complete messages

#### Hidden Content
- Decorative icons hidden with `aria-hidden="true"`
- Screen reader only content with `.sr-only` class
- Proper heading structure for navigation

## Component-Specific Accessibility

### Enhanced Sidebar (`enhanced-sidebar.tsx`)

#### Features
- Full keyboard navigation with arrow keys
- Proper ARIA roles and labels
- Focus management and restoration
- Tooltip support for collapsed state
- Screen reader announcements

#### ARIA Structure
```jsx
<aside role="navigation" aria-label="Main navigation">
  <div role="complementary" aria-label="Sidebar navigation and user information">
    <header role="banner">
      <button aria-label="Collapse sidebar (Ctrl+F2)" aria-expanded="true">
    </header>
    <section aria-label="User profile information">
    <section aria-label="Today's health progress summary">
    <nav role="navigation" aria-label="Sidebar navigation menu">
      <a role="menuitem" aria-current="page">
    </nav>
  </div>
</aside>
```

### Top Header (`top-header.tsx`)

#### Features
- Mobile menu button with proper ARIA
- Breadcrumb navigation
- User dropdown menu with keyboard support
- Theme toggle accessibility

#### ARIA Structure
```jsx
<header role="banner">
  <button aria-label="Open navigation menu" aria-haspopup="dialog">
  <nav role="navigation" aria-label="Breadcrumb navigation">
    <a aria-current="page">
  </nav>
  <button aria-label="User menu" aria-haspopup="menu">
    <div role="menu" aria-label="User account menu">
      <a role="menuitem">
    </div>
  </button>
</header>
```

### Dashboard Layout (`layout.tsx`)

#### Features
- Skip links for keyboard users
- Main content focus management
- Route change announcements
- Proper landmark structure

#### ARIA Structure
```jsx
<div role="navigation" aria-label="Skip links">
  <a href="#main-content">Skip to main content</a>
</div>
<main id="main-content" role="main" aria-label="Dashboard main content">
```

## Utility Functions

### Accessibility Utils (`lib/utils/accessibility.ts`)

#### Key Functions
- `announceToScreenReader()` - Send announcements to screen readers
- `getFocusableElements()` - Find all focusable elements in a container
- `trapFocus()` - Implement focus trapping
- `generateId()` - Generate unique IDs for ARIA relationships
- `prefersReducedMotion()` - Check for reduced motion preference

### Keyboard Navigation Hook (`hooks/use-sidebar-keyboard-navigation.ts`)

#### Features
- Arrow key navigation for lists
- Focus management
- Screen reader announcements
- Customizable navigation behavior

## Testing Accessibility

### Automated Testing
Use the `AccessibilityTest` component to run automated checks:

```jsx
import { AccessibilityTest } from '@/components/ui/accessibility-test';

// In your test page
<AccessibilityTest />
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] All interactive elements are reachable via keyboard
- [ ] Tab order is logical and intuitive
- [ ] Focus indicators are visible and high contrast
- [ ] Skip links work correctly
- [ ] No keyboard traps (except intentional ones)

#### Screen Reader Testing
- [ ] All content is announced correctly
- [ ] Headings provide proper structure
- [ ] Links and buttons have descriptive names
- [ ] Form labels are associated correctly
- [ ] Live regions announce changes

#### Visual Testing
- [ ] High contrast mode works correctly
- [ ] Text is readable at 200% zoom
- [ ] Focus indicators are visible
- [ ] Color is not the only way to convey information

### Testing Tools

#### Browser Extensions
- axe DevTools
- WAVE Web Accessibility Evaluator
- Lighthouse Accessibility Audit

#### Screen Readers
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS)
- Orca (Linux)

## Best Practices

### Development Guidelines

1. **Always provide text alternatives**
   - Alt text for images
   - Aria-label for icon buttons
   - Screen reader only text for context

2. **Use semantic HTML**
   - Proper heading hierarchy (h1, h2, h3...)
   - Button elements for actions
   - Link elements for navigation

3. **Implement proper focus management**
   - Visible focus indicators
   - Logical tab order
   - Focus restoration after interactions

4. **Provide multiple ways to access content**
   - Keyboard navigation
   - Mouse/touch interaction
   - Voice commands (where supported)

5. **Test with real users**
   - Include users with disabilities in testing
   - Use actual assistive technologies
   - Gather feedback and iterate

### Code Examples

#### Accessible Button
```jsx
<Button
  aria-label="Delete item"
  aria-describedby="delete-help"
  onClick={handleDelete}
>
  <TrashIcon aria-hidden="true" />
</Button>
<div id="delete-help" className="sr-only">
  This action cannot be undone
</div>
```

#### Accessible Form Field
```jsx
<div>
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-error"
    aria-invalid={hasError}
    required
  />
  {hasError && (
    <div id="email-error" role="alert">
      Please enter a valid email address
    </div>
  )}
</div>
```

#### Accessible Navigation
```jsx
<nav role="navigation" aria-label="Main navigation">
  <ul>
    <li>
      <Link href="/dashboard" aria-current={isActive ? "page" : undefined}>
        Dashboard
      </Link>
    </li>
  </ul>
</nav>
```

## Maintenance

### Regular Audits
- Run automated accessibility tests in CI/CD
- Perform manual testing with each release
- Update accessibility features as standards evolve

### Documentation Updates
- Keep this guide updated with new features
- Document any accessibility regressions
- Share learnings with the development team

### User Feedback
- Provide channels for accessibility feedback
- Respond promptly to accessibility issues
- Involve users with disabilities in the feedback process

## Resources

### Standards and Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)

### Testing Tools
- [axe-core](https://github.com/dequelabs/axe-core)
- [Pa11y](https://pa11y.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Learning Resources
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM Training](https://webaim.org/training/)
- [Deque University](https://dequeuniversity.com/)