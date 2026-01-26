# Implementation Plan: Gul Plaza Baseline

**Branch**: `1-gul-plaza-baseline` | **Date**: 2026-01-24 | **Spec**: [specs/1-gul-plaza-baseline/spec.md](spec.md)
**Input**: Feature specification from `specs/1-gul-plaza-baseline/spec.md`

## Summary

Build a multi-shop ordering platform for Gul Plaza using FastAPI, Neon (PostgreSQL), and Clerk. The system ensures strict data isolation where Shop Owners only see their own orders. Implementation is divided into 4 phases: Foundation, Core Marketplace, Admin/Shop Controls, and Scalability.

## Technical Context

**Language/Version**: Python 3.10+
**Primary Dependencies**: FastAPI, SQLModel, Uvicorn, Clerk (Python SDK)
**Storage**: Neon PostgreSQL (via SQLModel/SQLAlchemy)
**Testing**: pytest
**Target Platform**: Web (Backend API + Frontend)
**Project Type**: Web Application (Client-Server)
**Performance Goals**: Standard web performance (<500ms API response)
**Constraints**: **Strict Data Isolation** (Tenant = Shop), **Cash on Delivery (COD)** only.
**Scale/Scope**: Baseline MVP.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Explicit Configuration**: Plan identifies credentials needed (Clerk, Neon).
- [x] **Simplicity**: Standard FastAPI + SQLModel patterns.
- [x] **Domain Focus**: Gul Plaza multi-shop scope.
- [x] **Tech Stack**: Strict adherence (FastAPI, SQLModel, Neon, Clerk).
- [x] **Security**: Isolation design in data model (ShopID filtering).
- [x] **Operational Guidance**: Plan includes links to dashboards.
- [x] **Implementation Gating**: No code until `/sp.implement`.

## Project Structure

### Documentation (this feature)

```text
specs/1-gul-plaza-baseline/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── auth/            # Clerk integration
│   ├── models/          # SQLModel entities
│   ├── api/             # FastAPI routers
│   ├── services/        # Business logic (Order splitting)
│   └── main.py          # App entrypoint
└── tests/

# Frontend structure TBD based on research
frontend/
```

**Structure Decision**: Monorepo with `backend/` and `frontend/` directories to separate concerns while keeping the domain unified.

## Implementation Phases (User Requested)

### Phase 1: Foundation & Credentials Readiness
- **Build**: Project setup, Database connection, Auth integration.
- **System**: Backend Core.
- **Credentials**:
  - **Neon PostgreSQL Connection String**: `DATABASE_URL`
    - *Source*: [Neon Console](https://console.neon.tech/) -> Project Dashboard -> Connection Details.
  - **Clerk Publishable Key & Secret Key**: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
    - *Source*: [Clerk Dashboard](https://dashboard.clerk.com/) -> API Keys.
- **Pause**: Implementation pauses until these are configured in `.env`.

### Phase 2: Core Marketplace Flow
- **Build**: Public Shop Listing, Product Display, Cart Management, Multi-shop Checkout (Split Order Logic).
- **System**: Public Website + Backend API.
- **Credentials**: None additional.

### Phase 3: Admin & Shop Owner Controls
- **Build**: Shop Owner Dashboard (Order View, Product Mgmt), Admin Panel (Shop Approval).
- **System**: Shop Owner Dashboard + Admin Panel.
- **Credentials**: None additional (uses Clerk Roles).

### Phase 4: Scalability & Future Features
- **Build**: Optimization, Caching, Future Payment Gateways.
- **System**: Full Platform.
- **Credentials**: Future (e.g., Stripe) - Not required for Baseline.
