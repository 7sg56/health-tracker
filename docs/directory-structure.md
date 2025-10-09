# HealthTracker Frontend - File Structure Documentation

## Project Overview

The **HealthTracker Frontend** is a modern health tracking application built with the following technology stack:

- **Framework**: Next.js 15 (App Router) with React 19 and TypeScript
- **Styling**: Tailwind CSS v4, PostCSS, shadcn/ui components (Radix primitives), Lucide icons
- **Testing & Linting**: Jest + Testing Library, ESLint (flat config), Prettier
- **Build & Deploy**: Docker, Nginx, production build scripts, middleware redirects
- **Path Aliases**: Configured in `tsconfig.json` for clean imports (`@/*`, `@/components/*`, `@/lib/*`, etc.)

---

## Directory Structure

```
ht-frontend/
├── app/                           # Next.js App Router pages
├── components/                    # React components organized by feature
├── contexts/                      # React Context providers
├── hooks/                         # Custom React hooks
├── lib/                          # Shared utilities, types, API clients
├── public/                       # Static assets
├── scripts/                      # Build and deployment scripts
├── styles/                       # Additional CSS files
└── docs/                         # Documentation (this file)
```

---

## File Descriptions

### Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project metadata, dependencies, and npm scripts including dev/build/test commands |
| `package-lock.json` | Dependency lockfile for npm |
| `next.config.ts` | Next.js configuration with performance optimizations, security headers, redirects |
| `tsconfig.json` | TypeScript configuration with path aliases and strict mode settings |
| `tailwind.config.ts` | Tailwind CSS configuration with custom theme, animations, and health-specific colors |
| `postcss.config.mjs` | PostCSS configuration loading Tailwind's plugin |
| `eslint.config.mjs` | ESLint flat configuration extending Next.js rules |
| `jest.config.js` | Jest testing framework configuration |
| `jest.setup.js` | Test setup with mocks for Next.js components and browser APIs |
| `components.json` | shadcn/ui configuration for component generation |
| `middleware.ts` | Next.js middleware handling legacy route redirects |
| `.prettierrc` / `.prettierignore` | Code formatting rules and ignore patterns |
| `.gitignore` | Git version control ignore patterns |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `ACCESSIBILITY.md` | Accessibility guidelines and practices |
| `DEPLOYMENT.md` | Deployment instructions and environment setup |

### Build & Deployment

| File | Purpose |
|------|---------|
| `Dockerfile` | Container image definition for app deployment |
| `docker-compose.yml` | Multi-service container orchestration |
| `nginx.conf` | Nginx configuration for production deployment |
| `scripts/build-production.sh` | Production build script with optimizations |

### Testing & Development

| File | Purpose |
|------|---------|
| `test-routing.js` | Utility script for testing routing functionality |
| `test-accessibility.js` | Accessibility testing helpers |
| `tsconfig.tsbuildinfo` | TypeScript incremental build cache (auto-generated) |

---

## App Router Structure (`app/`)

The `app/` directory uses Next.js 13+ App Router with file-based routing:

| File/Directory | Route | Purpose |
|----------------|-------|---------|
| `layout.tsx` | - | Root layout with global providers and HTML structure |
| `page.tsx` | `/` | Landing/home page |
| `globals.css` | - | Global CSS with Tailwind layers and CSS variables |
| `favicon.ico` | - | Site favicon |
| `auth/login/page.tsx` | `/auth/login` | User login page |
| `auth/register/page.tsx` | `/auth/register` | User registration page |
| `dashboard/layout.tsx` | - | Dashboard layout with sidebar and header |
| `dashboard/page.tsx` | `/dashboard` | Main dashboard overview |
| `dashboard/water/page.tsx` | `/dashboard/water` | Water intake tracking page |
| `dashboard/food/page.tsx` | `/dashboard/food` | Food intake tracking page |
| `dashboard/workout/page.tsx` | `/dashboard/workout` | Workout tracking page |
| `dashboard/profile/page.tsx` | `/dashboard/profile` | User profile management |

---

## Components Structure (`components/`)

### UI Components (`components/ui/`)

**Core UI Primitives** (based on shadcn/ui and Radix):
- `button.tsx`, `input.tsx`, `textarea.tsx` - Form controls
- `dialog.tsx`, `dropdown-menu.tsx`, `popover.tsx` - Overlay components
- `card.tsx`, `avatar.tsx`, `badge.tsx` - Display components
- `table.tsx`, `pagination.tsx` - Data presentation
- `tabs.tsx`, `navigation-menu.tsx` - Navigation components

**Form Components**:
- `form.tsx`, `form-field.tsx`, `enhanced-form-field.tsx` - Form wrappers
- `checkbox.tsx`, `radio-group.tsx`, `select.tsx`, `switch.tsx` - Form inputs
- `form-error-display.tsx` - Error handling UI

**Loading & Error States**:
- `loading-spinner.tsx`, `skeleton.tsx`, `loading-button.tsx` - Loading indicators
- `error-boundary.tsx`, `error-messages.tsx` - Error handling
- `network-error-handler.tsx` - Network-specific error handling

**Accessibility Components**:
- `focus-trap.tsx`, `skip-link.tsx`, `announcer.tsx` - A11y utilities
- `accessibility-test.tsx`, `accessibility-audit.tsx` - A11y testing tools

**Theme & Responsive**:
- `theme-toggle.tsx`, `theme-settings.tsx` - Theme customization
- `responsive-button.tsx`, `responsive-card.tsx` - Responsive variants

**Health-Specific**:
- `health-card.tsx` - Health metrics display card
- `progress.tsx`, `progress-indicator.tsx` - Progress tracking

### Feature Components

**Forms (`components/forms/`)**:
- `water-intake-form.tsx` / `water-intake-list.tsx` - Water tracking
- `food-intake-form.tsx` / `food-intake-list.tsx` - Food tracking  
- `workout-form.tsx` / `workout-list.tsx` - Workout tracking

**Authentication (`components/auth/`)**:
- `LoginForm.tsx`, `EnhancedLoginForm.tsx` - Login forms
- `RegisterForm.tsx` - Registration form
- `AuthGuard.tsx` - Route protection component

**Layout (`components/layout/`)**:
- `app-layout.tsx`, `EnhancedAppLayout.tsx` - Main app scaffolding
- `app-sidebar.tsx`, `sidebar.tsx` - Navigation sidebars
- `header.tsx`, `page-header.tsx` - Header variants
- `LazyPageWrapper.tsx` - Lazy loading wrapper

**Charts (`components/charts/`)**:
- `health-score-line-chart.tsx`, `health-score-bar-chart.tsx` - Score visualization
- `monthly-summary-chart.tsx`, `weekly-summary-chart.tsx` - Time-based charts
- `progress-comparison-chart.tsx` - Comparative analytics

**Dashboard (`components/dashboard/`)**:
- `health-score-card.tsx` - Score summary display
- `health-summary-cards.tsx` - Multiple metric cards
- `recent-activity-feed.tsx` - Activity timeline

---

## Contexts (`contexts/`)

| File | Purpose |
|------|---------|
| `AuthContext.tsx` | User authentication state and methods |
| `HealthContext.tsx` | Global health data and preferences |

---

## Custom Hooks (`hooks/`)

**Data Management**:
- `use-water-intake.ts`, `use-food-intake.ts`, `use-workout.ts` - Feature-specific data hooks
- `use-dashboard-data.ts` - Aggregated dashboard data
- `use-health-score-trends.ts` - Analytics and trend data
- `use-paginated-data.ts` - Generic pagination helper

**UI & UX**:
- `use-responsive.ts`, `use-responsive-layout.ts` - Responsive design helpers
- `use-theme-aware-styles.ts` - Dynamic theme-based styling
- `use-search-filter.ts` - Search and filtering functionality

**Navigation**:
- `use-navigation.ts` - Next.js router helpers
- `use-navigation-routes.ts` - Route configuration lookup
- `use-keyboard-navigation.ts` - Keyboard accessibility
- `use-sidebar-keyboard-navigation.ts` - Sidebar-specific navigation

**Forms**:
- `use-enhanced-form.ts` - Form validation and error handling

---

## Lib Directory (`lib/`)

### Core Utilities (`lib/`)
- `index.ts` - Main library exports
- `constants.ts` - Application constants
- `utils.ts` - General utility functions

### Types (`lib/types/`)
- `index.ts`, `api.ts`, `auth.ts`, `forms.ts`, `health.ts`, `navigation.ts` - TypeScript definitions

### Validation (`lib/validations/`)
- `auth.ts`, `health.ts`, `profile.ts` - Zod validation schemas
- `form-validators.ts`, `utils.ts` - Form validation helpers

### API Client (`lib/api/`)
- `client.ts` - Base API client configuration
- `auth.ts` - Authentication endpoints
- `health.ts` - Health data endpoints
- `health-score.ts` - Analytics endpoints
- `test.ts` - Test/example endpoints

### Theme System (`lib/theme/`)
- `theme-provider.tsx` - Theme context provider
- `theme-config.ts`, `theme-utils.ts` - Theme configuration
- `README.md` - Theme documentation

### Error Handling (`lib/errors/`)
- `api-error.ts` - API error types
- `error-handler.ts` - Error processing utilities
- `form-error-hooks.ts` - Form error integration

### Navigation (`lib/navigation/`)
- `index.ts` - Navigation exports
- `examples/usage-example.tsx` - Integration examples
- `__tests__/` - Navigation tests
- `README.md` - Navigation documentation

### Utilities (`lib/utils/`)
- `responsive.ts` - Breakpoint utilities
- `performance.ts` - Performance optimization helpers
- `accessibility.ts` - Accessibility utilities
- `navigation.ts` - Route and path helpers
- `toast.ts` - Notification helpers
- `route-guards.ts` - Route protection logic
- `global-error-handler.ts` - Global error management
- `animations.ts` - Animation utilities

### Configuration (`lib/config/`)
- `navigation.ts` - Navigation structure and metadata

---

## Static Assets & Styles

### Public (`public/`)
- `site.webmanifest` - PWA manifest configuration

### Styles (`styles/`)
- `accessibility.css` - Additional accessibility CSS rules

---

## Development Workflow

### Available Scripts (from `package.json`)

**Development**:
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build with Turbopack
- `npm run start` - Start production server

**Quality Assurance**:
- `npm run lint` - Run ESLint with auto-fix
- `npm run type-check` - TypeScript compilation check
- `npm run format` - Format code with Prettier
- `npm run test` - Run Jest tests
- `npm run test:coverage` - Generate test coverage report

**Production**:
- `npm run build:production` - Production build with optimizations
- `npm run deploy:production` - Deploy to production environment

### Path Aliases

The project uses TypeScript path mapping for clean imports:

```typescript
// Instead of: import { Button } from '../../../components/ui/button'
import { Button } from '@/components/ui/button'

// Available aliases:
// @/* - Root directory
// @/components/* - Components directory  
// @/lib/* - Lib directory
// @/hooks/* - Hooks directory
// @/contexts/* - Contexts directory
// @/utils/* - Utils directory (maps to lib/utils)
// @/api/* - API directory (maps to lib/api)
// @/validations/* - Validations directory (maps to lib/validations)
```

---

## Key Integrations

### Styling System
- **Tailwind CSS v4** with custom health-themed color palette
- **shadcn/ui** components with Radix UI primitives
- **next-themes** for dark/light mode support
- **CSS Variables** for dynamic theming

### Data Flow
1. **Pages** (`app/`) render feature components
2. **Components** use **hooks** for data fetching
3. **Hooks** call **API clients** (`lib/api/`)
4. **Context providers** manage global state
5. **Validation** handled by Zod schemas (`lib/validations/`)

### Testing Strategy
- **Jest** + **Testing Library** for component testing
- **Mocked** Next.js components and browser APIs
- **Coverage thresholds** set at 70% for all metrics
- **Accessibility testing** utilities included

### Deployment
- **Docker** containerization with multi-stage builds
- **Nginx** for production static file serving
- **Middleware** handles legacy route redirects
- **Security headers** configured in Next.js config

---

## Architecture Patterns

### Component Organization
- **UI primitives** in `components/ui/` (reusable, generic)
- **Feature components** in feature-specific directories
- **Barrel exports** (`index.ts`) for clean imports
- **Compound components** for complex UI patterns

### State Management
- **React Context** for global state (auth, theme, health data)
- **Custom hooks** for feature-specific state
- **React Hook Form** + **Zod** for form state and validation
- **SWR/React Query patterns** in data hooks

### Accessibility First
- **WCAG 2.1 AA** compliance target
- **Keyboard navigation** throughout the app
- **Screen reader support** with ARIA labels
- **Focus management** and skip links
- **High contrast** and reduced motion support

---

## Contributing Guidelines

When adding new files:

1. **Follow naming conventions**: kebab-case for files, PascalCase for components
2. **Use barrel exports**: Add to relevant `index.ts` files
3. **Include TypeScript types**: Define in appropriate `lib/types/` files
4. **Add validation schemas**: Use Zod in `lib/validations/`
5. **Write tests**: Include unit tests for new functionality
6. **Document accessibility**: Include ARIA labels and keyboard support
7. **Follow responsive patterns**: Use mobile-first design principles

---

## Support & Documentation

- **Main README**: `/README.md` - Project overview and setup
- **Accessibility Guide**: `/ACCESSIBILITY.md` - A11y standards and practices  
- **Deployment Guide**: `/DEPLOYMENT.md` - Production deployment instructions
- **Theme Documentation**: `/lib/theme/README.md` - Theme customization guide
- **Navigation Guide**: `/lib/navigation/README.md` - Navigation system usage

For questions or contributions, refer to the main project documentation and follow the established patterns demonstrated in existing code.