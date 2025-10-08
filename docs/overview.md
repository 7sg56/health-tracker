# System Overview

This document summarizes how the backend and frontend function in the HealthTracker project after the recent simplifications (auth dormant, light theme forced, health score merged into dashboard).

- Tech stack
  - Backend: Spring Boot (Java). REST controllers under /api. Spring Security configured to permit all (auth endpoints present but currently dormant).
  - Frontend: Next.js App Router (TypeScript, React), Tailwind CSS, shadcn/ui components. The app runs as a SPA-like dashboard with server/client components as needed.

- High-level architecture
  - Backend exposes resource-centric REST endpoints for water, food, workouts, plus a health index endpoint. It returns JSON models used by the frontend.
  - Frontend consumes the backend via a small HTTP client wrapper (lib/api/client.ts) with typed service modules:
    - lib/api/health.ts: CRUD for water/food/workout and simple aggregations
    - lib/api/health-score.ts: daily health index endpoints and client-side breakdown helpers
    - lib/api/auth.ts: dormant (register/login/logout/profile); not wired in UI
  - State/derivations
    - Most pages use hooks/read-models from useDashboardData and contexts/HealthContext (for listing and computing today’s totals).

- Frontend routing (key pages)
  - / (marketing/landing)
  - /dashboard (main dashboard: daily health score overview, progress cards, quick actions, goals)
  - /dashboard/water (log and view water intake)
  - /dashboard/food (log and view food intake)
  - /dashboard/workout (log and view workouts)
  - /dashboard/profile (now simplified to: Display name + Health goal)
  - /dashboard/health-score (removed; legacy route redirects to /dashboard)

- Frontend theming
  - Default and enforced light theme (system detection disabled). Dark classes removed where practical. Theme toggle remains but is effectively fixed to light.

- Auth status
  - Auth pages/routes remain but redirect to /dashboard. The frontend AuthProvider and UI flows are dormant; no credential/session headers are sent. Backend SecurityConfig should permit all to allow browsing without login.

- Data flow example
  - Dashboard loads today’s entries via HealthService.getWaterIntakes/getFoodIntakes/getWorkouts and computes totals client-side.
  - The daily health score (0–100) is fetched via HealthScoreService.getCurrentHealthScore. A simple client-side breakdown is derived for UI only.

- Error handling
  - HTTP client normalizes responses to ApiResponse<T> shape with status and optional error string. Call sites handle status and fallback UI.

- Build/runtime
  - NEXT_PUBLIC_API_BASE_URL controls the backend base URL (default http://localhost:8080).
  - Middleware and next.config.ts collapse legacy /home/* -> /dashboard/* and /login|/register -> /dashboard.
