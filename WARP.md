# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview

- Monorepo with two apps and some orchestration at the root:
- ht-backend: Spring Boot (Maven) REST API with MySQL, JPA, Spring Security, and Actuator
  - ht-frontend: Next.js 15 + TypeScript + Turbopack + ESLint + Prettier
  - Root package.json: convenience scripts to run both services together for local dev and simple build orchestration
- Default local ports:
  - Backend app: 8080 (HTTP)
  - Backend management/actuator: 8081
  - Frontend app: 3000
- Frontend API base URL is configured via NEXT_PUBLIC_API_BASE_URL (defaults to http://localhost:8080 in dev Compose)

Common commands

Root (orchestration)

- Install dependencies for both apps
  - npm run install:all
- Start both apps for development (concurrently)
  - npm run dev
- Start backend only (dev profile)
  - npm run dev:backend
- Start frontend only (Next.js dev)
  - npm run dev:frontend

Backend (ht-backend)

- Run in development profile with live reload
  - cd ht-backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
- Build JAR (skip tests)
  - cd ht-backend && ./mvnw clean package -DskipTests
- Run unit tests
  - cd ht-backend && ./mvnw test
- Run a single test class
  - cd ht-backend && ./mvnw -Dtest=MyTestClass test
- Run a single test method
  - cd ht-backend && ./mvnw -Dtest=MyTestClass#myTestMethod test

Frontend (ht-frontend)

- Dev server (Turbopack)
  - cd ht-frontend && npm run dev
- Build (Turbopack)
  - cd ht-frontend && npm run build
- Start built app
  - cd ht-frontend && npm start
- Lint (check or fix)
  - cd ht-frontend && npm run lint:check
  - cd ht-frontend && npm run lint
- Type-check
  - cd ht-frontend && npm run type-check
- Format (check or write)
  - cd ht-frontend && npm run format:check
  - cd ht-frontend && npm run format



High-level architecture

- Frontend (Next.js 15)
  - TypeScript project with path aliases configured in tsconfig.json (e.g., @/components/*, @/lib/*)
  - Next.js configuration in next.config.ts enabling experimental optimizations and security headers
  - API base URL is read from NEXT_PUBLIC_API_BASE_URL; keep this aligned across local dev, Compose, and deployment

- Backend (Spring Boot)
  - Spring Data JPA for persistence, Spring Security for authentication/authorization, Validation for DTOs, and Actuator for health
  - Profiles:
    - dev: local development
  - Notable ports:
    - 8080 app port

Conventions and implementation notes

- Frontend path aliases are defined in ht-frontend/tsconfig.json; import using @/… to match existing code
- next.config.ts sets security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) — keep these consistent when adding routes or middleware
- For Dockerized frontend "standalone" output, the scripts include build:standalone (BUILD_STANDALONE=true next build). The provided Dockerfile copies .next/standalone; ensure the build emits standalone output if you change build scripts
