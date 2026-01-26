<!--
SYNC IMPACT REPORT
Version: 1.1.0
- Refined Principle I: Added explicit pause requirement for credentials.
- Refined Principle VI: Added explicit requirement to link to dashboard/docs for credentials.
- Confirmed Tech Stack and Domain principles.
-->

# Gul Plaza Multi-Shop Ordering Platform Constitution

## Core Principles

### I. Explicit Configuration & No Assumptions
You must not proceed without necessary credentials or configurations. You will never guess or assume defaults. If a credential or access is required, you must clearly state it and **PAUSE** implementation until provided. You will only move to the next step after credentials are received.

### II. Simplicity & Explainability
Every architectural and code decision must be simple and easily explainable. Avoid over-engineering.

### III. Domain Focus
The project is strictly a multi-shop ordering platform for **Gul Plaza**. All features must support this scope.

### IV. Strict Tech Stack Compliance
Adhere strictly to the defined technology stack:
- **Backend**: FastAPI + SQLModel + Neon PostgreSQL
- **Authentication & Roles**: Clerk
Deviations are not permitted without constitutional amendment.

### V. Security & Isolation
**Data isolation is mandatory.** Each shop owner must ONLY be able to see their own shop's orders. This is a non-negotiable security requirement.

### VI. Operational Guidance
For every required credential, you must explicitly state **where to find it** (e.g., specific dashboard URL, official documentation section, or service page).

### VII. Implementation Gating
Coding is only allowed after the `/sp.implement` command and **after** required credentials have been provided.

## Governance

### Amendment Process
Amendments require explicit user instruction.

### Compliance
All plans and code must be verified against these principles.

**Version**: 1.1.0 | **Ratified**: 2026-01-24 | **Last Amended**: 2026-01-24
