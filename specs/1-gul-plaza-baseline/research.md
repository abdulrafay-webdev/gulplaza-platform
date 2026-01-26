# Research: Gul Plaza Baseline

## Decisions & Rationale

### 1. Frontend Technology
- **Decision**: **React (Vite)**
- **Rationale**: Provides a fast, interactive user experience required for Dashboards and modern E-commerce sites. Clean separation from the FastAPI backend allows independent development and scaling.
- **Alternatives**: 
  - *Next.js*: Better for SEO, but adds complexity with SSR. React+Vite is simpler for a baseline MVP.
  - *Jinja2 Templates*: Tightly coupled with backend, harder to manage complex dashboard state.

### 2. Authentication Integration
- **Decision**: **Clerk Python SDK + JWT Verification**
- **Rationale**: Clerk provides robust identity management. We will verify JWTs in FastAPI dependencies to protect routes. User Roles (ADMIN, SHOP_OWNER) will be stored in `publicMetadata` and synced/verified on every request.
- **Alternatives**:
  - *Homegrown Auth*: High security risk, violates "Simplicity".
  - *Firebase*: Clerk is explicitly requested.

### 3. Data Isolation Strategy
- **Decision**: **Application-Level Filtering**
- **Rationale**: Every database query for Shop Owners MUST include `where(Shop.id == current_user.shop_id)`. This is explicit and easy to audit in the code.
- **Alternatives**:
  - *Postgres RLS (Row Level Security)*: More secure but complex to manage users in DB. Application-level is standard for MVP.
  - *Separate Schemas*: Too complex for "Gul Plaza" scale initially.

### 4. Multi-Shop Order Handling
- **Decision**: **Split-Order on Checkout**
- **Rationale**: When a cart contains items from multiple shops, the backend will create one parent `Transaction` (optional) and multiple `Order` records (one per shop). This ensures Shop A never sees Shop B's items in an Order record.
- **Alternatives**:
  - *Unified Order*: Violates data isolation; Shop A would see Shop B's items in the same list.

### 5. Frontend Structure
- **Decision**: **Single React App with Roles**
- **Rationale**: One codebase (`frontend/`) serving all 3 parts (Public, Dashboard, Admin) using Route Guards (e.g., `<ProtectedRoute role="admin">`). Simpler than maintaining 3 separate repos.
- **Alternatives**:
  - *3 Separate Apps*: Too much boilerplate and maintenance for baseline.

## Clarifications Resolved
- **Frontend**: React (Vite) selected.
- **Payment**: COD selected (from Spec).
