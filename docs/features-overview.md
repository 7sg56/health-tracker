# HealthTracker – Features Overview

This document summarizes the key capabilities of the HealthTracker application as currently implemented across the frontend (Next.js) and backend (Spring Boot).

## Highlights

- Unified Dashboard
  - Consolidated Health Score experience directly on the main dashboard.
  - Cards, trend charts, badges, and personalized recommendations for quick insights.
  - Legacy route `/dashboard/health-score` now redirects to `/dashboard` to avoid duplication.

- Profile Management (Simplified)
  - Minimal, focused profile card (Name and Health Goal fields).
  - Client-side persistence via localStorage.
  - Clear success notification on save.

- Modern UI/UX
  - Component primitives powered by Radix UI and shadcn-style utilities.
  - Icons via lucide-react.
  - Light/dark theme switching using next-themes.
  - Animations with tailwindcss-animate.

- Charts & Data Visualization
  - Trend charts built with Recharts for clear, responsive visualizations.

- Forms & Validation
  - React Hook Form for ergonomic forms.
  - Zod validation with @hookform/resolvers integration for type-safe schemas.

- Performance & DX
  - Next.js 15 with React 19 and Turbopack for fast dev/build.
  - CSS inlining/optimization via Critters.
  - TypeScript-first codebase with ESLint and Prettier.
  - Jest + Testing Library setup for unit/integration tests.

- Routing & Navigation
  - Navigation and sidebars updated to reflect the Health Score merge.
  - Redirects in place to route old paths to the dashboard.

- Backend Overview
  - Spring Boot 3 (Java 25) service with REST endpoints (Web + Validation).
  - Data access via Spring Data JPA with HikariCP connection pooling.
  - MySQL in production; H2 for local/test runtime.
  - Actuator endpoints for health/metrics.
  - OpenAPI/Swagger UI provided via springdoc-openapi.

## Current Status Notes

- Authentication-related components are currently stubbed/minimal.
- TypeScript build is permitted to proceed with `ignoreBuildErrors` temporarily while unrelated TS issues are being addressed.

## Next Steps (Optional)

- Tighten TypeScript types and remove the temporary `ignoreBuildErrors` override.
- Expand profile settings as needed (e.g., notifications, preferences) once auth is fully wired.
- Document API endpoints and data contracts in a separate API reference.
