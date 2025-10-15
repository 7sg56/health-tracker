# HealthTracker

A modern full‑stack health tracking application.

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI primitives, Recharts
- Backend: Spring Boot 3 (Java 25), Spring Data JPA, MySQL/H2, Actuator

See docs/features-overview.md for a high‑level feature summary and docs/dependencies.md for a complete package/rationale listing.

## Monorepo structure

- ht-frontend/ — Next.js app (UI, routing, charts, forms)
- ht-backend/ — Spring Boot service (REST, persistence)
- docs/ — Project documentation

## Quickstart

Prerequisites
- Node.js 20+ and npm
- Java 25 (JDK) — Maven wrapper included
- MySQL (optional for local dev; H2 is available at runtime for dev/test)

Install all dependencies and build backend:
```bash path=null start=null
npm run install:all
```

Start both backend and frontend for development:
```bash path=null start=null
npm run dev
```

Run only the frontend:
```bash path=null start=null
cd ht-frontend && npm run dev
```

Run only the backend (dev profile):
```bash path=null start=null
cd ht-backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```


## Root scripts

- dev: Runs backend and frontend concurrently.
- dev:backend: Starts Spring Boot with dev profile.
- dev:frontend: Starts Next.js dev server.
- install:all: Builds backend, installs frontend deps.
- build:all: Packages backend and builds frontend.

## Frontend (ht-frontend)

Common tasks:
- Lint: `npm run lint` or `npm run lint:check`
- Type check: `npm run type-check`
- Format: `npm run format` / `npm run format:check`
- Test: `npm test`, `npm run test:watch`, `npm run test:coverage`

Notes:
- Uses Turbopack for dev/build in scripts.
- Temporary setting: Next.js config allows builds with TypeScript errors while unrelated TS issues are being addressed.

## Backend (ht-backend)

Common tasks:
- Run (dev): `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`
- Test: `./mvnw test`
- Package: `./mvnw clean package`

Operational features:
- Actuator endpoints for health/metrics.

## Environment configuration

Backend (examples):
- Database URL, user, password via environment variables or application properties.
- Uses MySQL driver at runtime; H2 is available for dev/test.

Frontend (examples):
- Next.js environment variables via `.env.local` (e.g., `NEXT_PUBLIC_*`).

## Notable product updates

- Health Score experience has been merged into the main dashboard. The legacy route `/dashboard/health-score` now redirects to `/dashboard`.
- Navigation and sidebar references to the dedicated Health Score page have been removed.
- Profile page is simplified to a minimal, localStorage‑backed form (Name and Health Goal fields).

## Documentation

- Features overview: docs/features-overview.md
- Dependencies and rationale: docs/dependencies.md

## Authors

- Sourish Ghosh [@7sg56]
- Ayush Kumar [@AyushOg18]
- Ishaan Verma [@16Ishaan]
- Adhikshit Kumar [@Adhikshit775]
