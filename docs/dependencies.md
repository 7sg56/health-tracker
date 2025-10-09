# Dependencies and Rationale

This document lists the application dependencies (frontend, backend, and root tooling) with brief rationale for inclusion.

## Frontend (ht-frontend/package.json)

Core
- next (15.5.4): App framework for SSR/SSG, routing, and build tooling.
- react / react-dom (19.1.0): UI library and DOM bindings.
- typescript (^5): Type-safe development.

Styling & UI
- tailwindcss (^4): Utility-first styling.
- tailwindcss-animate (^1.0.7): Animation utilities.
- class-variance-authority (^0.7.1): Variant-based component styling ergonomics.
- tailwind-merge (^3.3.1): Class name conflict resolution.
- clsx (^2.1.1): Conditional class composition.
- @radix-ui/*: Accessible, unstyled primitives (Avatar, Checkbox, Dialog, Dropdown Menu, Label, Navigation Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Slider, Slot, Switch, Tabs) for building consistent, accessible UI.
- lucide-react (^0.544.0): Icon set.
- next-themes (^0.4.6): Light/dark theme management.
- critters (^0.0.23): Inline critical CSS for improved performance.

Forms & Validation
- react-hook-form (^7.64.0): Performant forms.
- zod (^4.1.11): Schema validation.
- @hookform/resolvers (^5.2.2): Connects React Hook Form to Zod schemas.

Data Visualization & UX
- recharts (^3.2.1): Charts for trends and insights.
- date-fns (^4.1.0): Date utilities.
- sonner (^2.0.7): Toast notifications.

Dev & Testing
- eslint (^9) and eslint-config-next (15.5.4): Linting and Next.js rules.
- @eslint/eslintrc (^3): ESLint configuration utilities.
- prettier (^3.6.2) and prettier-plugin-tailwindcss (^0.6.14): Code formatting.
- @types/*: Type definitions for Node, React, and Recharts.

Notes
- Uses Turbopack for dev/build via scripts (fast HMR and builds).

## Backend (ht-backend/pom.xml)

Core Spring Boot
- spring-boot-starter-web: RESTful web services and JSON serialization.
- spring-boot-starter-validation: Bean validation (Jakarta Validation).
- spring-boot-starter-data-jpa: ORM/data persistence with JPA/Hibernate.
- spring-boot-starter-security: Security framework for authn/authz (future-ready).
- spring-boot-starter-actuator: Operational endpoints (health, metrics, info).


Database & Persistence
- mysql-connector-j (runtime): JDBC driver for MySQL (optional in dev).
- HikariCP: High-performance JDBC connection pooling (via Spring Boot starter).
- h2 (runtime): In-memory DB for tests/development.

Testing
- spring-boot-starter-test (test scope): Testing utilities (JUnit, AssertJ, etc.).
- spring-security-test (test scope): Security-related testing helpers.

Build
- spring-boot-maven-plugin: Build/run Spring Boot applications.

Properties
- Java version: 25 (via <java.version>25</java.version>).

## Root Tooling (package.json at repo root)

- concurrently (^8.2.2): Run frontend and backend concurrently for local development.

Scripts
- dev: Starts both backend and frontend together.
- dev:backend: Runs Spring Boot (`./mvnw spring-boot:run`) with `dev` profile.
- dev:frontend: Runs Next.js dev server.
- install:all: Builds backend then installs frontend dependencies.
- build:all: Builds backend package then frontend build.

## Considerations & Follow-ups

- Authentication: Security starter is present in the backend and auth components exist in the frontend but are currently minimal/stubbed. Integrate when ready.
- TypeScript: Some TS issues are being temporarily ignored to enable builds. Plan to address and re-enable strict builds.
