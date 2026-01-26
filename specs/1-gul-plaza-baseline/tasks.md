---
description: "Task list for Gul Plaza Baseline implementation"
---

# Tasks: Gul Plaza Baseline

**Input**: Design documents from `/specs/1-gul-plaza-baseline/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested, but structure assumes testing capability.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: [US1] Shop Owner, [US2] Customer, [US3] Order Mgmt
- **System**: Backend (FastAPI) or Frontend (React)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, DB connection, Auth integration.

- [x] T001 Create monorepo structure (backend/, frontend/) per plan in `specs/1-gul-plaza-baseline/plan.md`
- [x] T002 Initialize Backend: Python virtualenv, install FastAPI, SQLModel, Uvicorn in `backend/requirements.txt`
- [x] T003 Initialize Frontend: React + Vite project in `frontend/`
- [x] T004 [P] Configure Environment: Create `.env` from `.env.example` with placeholders for `DATABASE_URL`, `CLERK_KEYS` in `backend/.env`
- [x] T005 [P] Setup Database: Configure SQLModel engine and initial connection check in `backend/src/db/session.py` (Requires: `DATABASE_URL` from Neon)
- [x] T006 [P] Setup Auth: Implement Clerk JWT verification dependency in `backend/src/auth/deps.py` (Requires: `CLERK_KEYS` from Clerk)

**Checkpoint**: Backend runs and connects to DB. Auth middleware ready.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core entities and routing structure required by all stories.

- [x] T007 Define Base Models: Create `User` (Identity) model in `backend/src/models/user.py`
- [x] T008 Setup API Router: Create main `api_router` and mount to app in `backend/src/main.py`
- [x] T009 [P] Setup CORS: Configure CORS for Frontend URL in `backend/src/main.py`
- [x] T010 [P] Frontend Setup: Install `axios`, `react-router-dom`, `@clerk/clerk-react` in `frontend/package.json`
- [x] T011 Frontend Auth: Wrap App in `ClerkProvider` in `frontend/src/main.tsx`

**Checkpoint**: Foundation ready - User Stories can start.

---

## Phase 3: User Story 1 - Shop Owner Setup & Product Management (Priority: P1) 🎯 MVP

**Goal**: Enable Shop Owners to create shops and manage products. Supply side.

**Independent Test**: Login as Shop Owner -> Create Shop -> Create Product -> Verify Product List.

### Backend Implementation [US1]

- [x] T012 [P] [US1] Create `Shop` SQLModel entity in `backend/src/models/shop.py`
- [x] T013 [P] [US1] Create `Product` SQLModel entity in `backend/src/models/product.py`
- [x] T014 [US1] Run Migrations: Generate and apply alembic migrations for Shop/Product (System: DB)
- [x] T015 [US1] Implement Shop Service: Create CRUD logic ensuring owner isolation in `backend/src/services/shop_service.py`
- [x] T016 [US1] Implement Shop API: Create `POST /shops`, `GET /shops/me` endpoints in `backend/src/api/shops.py`
- [x] T017 [US1] Implement Product Service: Create CRUD logic linked to Shop in `backend/src/services/product_service.py`
- [x] T018 [US1] Implement Product API: Create `POST /shops/{id}/products`, `GET /shops/{id}/products` in `backend/src/api/products.py`

### Frontend Implementation [US1]

- [x] T019 [P] [US1] Create Shop Owner Layout: Dashboard shell with Sidebar in `frontend/src/layouts/ShopLayout.tsx`
- [x] T020 [US1] Create Shop Form: UI to create/edit Shop profile in `frontend/src/pages/shop/ShopSettings.tsx`
- [x] T021 [US1] Create Product List: UI to list products in `frontend/src/pages/shop/ProductList.tsx`
- [x] T022 [US1] Create Product Form: UI to add/edit products in `frontend/src/pages/shop/ProductForm.tsx`
- [x] T023 [US1] Integrate Shop/Product APIs: Connect Frontend forms to Backend endpoints in `frontend/src/services/api.ts`

**Checkpoint**: Shop Owners can fully manage their inventory.

---

## Phase 4: User Story 2 - Customer Browsing & Ordering (Priority: P1)

**Goal**: Enable Customers to browse shops/products and place orders. Demand side.

**Independent Test**: Browse Shops -> Add to Cart -> Checkout -> Verify Order Created.

### Backend Implementation [US2]

- [x] T024 [P] [US2] Create `Order` and `OrderItem` models in `backend/src/models/order.py`
- [x] T025 [US2] Run Migrations: Generate and apply migrations for Order entities (System: DB)
- [x] T026 [US2] Implement Public Shop API: `GET /shops` (Public directory) in `backend/src/api/public.py` (Handled by shops.py)
- [x] T027 [US2] Implement Checkout Service: Logic to split cart items into multiple Orders (one per Shop) in `backend/src/services/checkout_service.py`
- [x] T028 [US2] Implement Checkout API: `POST /cart/checkout` endpoint in `backend/src/api/checkout.py`

### Frontend Implementation [US2]

- [x] T029 [P] [US2] Create Public Layout: Header, Footer, Shop Directory in `frontend/src/layouts/PublicLayout.tsx`
- [x] T030 [US2] Create Shop Detail Page: View Shop and its Products in `frontend/src/pages/public/ShopDetail.tsx`
- [x] T031 [US2] Create Cart Context: State management for multi-shop cart in `frontend/src/context/CartContext.tsx`
- [x] T032 [US2] Create Cart UI: Slide-over or Page to view cart items in `frontend/src/components/Cart.tsx`
- [x] T033 [US2] Create Checkout Page: Simple form (COD) and "Place Order" button in `frontend/src/pages/public/Checkout.tsx`

**Checkpoint**: Customers can browse and place orders (Database populated).

---

## Phase 5: User Story 3 - Order Management & Isolation (Priority: P1)

**Goal**: Enable Shop Owners to view/manage THEIR orders only. Fulfillment.

**Independent Test**: Shop Owner A sees Order A. Shop Owner B sees NOTHING.

### Backend Implementation [US3]

- [x] T034 [P] [US3] Implement Order Query Service: Enforce `shop_id` filtering for Owners in `backend/src/services/order_service.py`
- [x] T035 [US3] Implement Order API: `GET /orders` (Context sensitive) and `PATCH /orders/{id}/status` in `backend/src/api/orders.py`

### Frontend Implementation [US3]

- [x] T036 [P] [US3] Create Order List: UI for Shop Owners to view incoming orders in `frontend/src/pages/shop/OrderList.tsx`
- [x] T037 [US3] Create Order Detail: View items and change status (Pending -> Completed) in `frontend/src/pages/shop/OrderDetail.tsx`

**Checkpoint**: Full marketplace loop complete. Isolation verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and validation.

- [x] T038 [P] Documentation: Update `README.md` with final run instructions
- [x] T039 Code Cleanup: Remove unused imports and TODOs in `backend/`
- [x] T040 UI Polish: Ensure responsive design on Public pages
- [x] T041 Run Verification: Execute `quickstart.md` validation steps manually

---

## Dependencies & Execution Order

1. **Setup (Phase 1)**: Prerequisites.
2. **Foundation (Phase 2)**: DB/Auth/Models - Blocks everything.
3. **US1 (Phase 3)**: Independent. Can start after Foundation.
4. **US2 (Phase 4)**: Depends on US1 (needs Products/Shops to exist).
5. **US3 (Phase 5)**: Depends on US2 (needs Orders to exist).

### Implementation Strategy

1. **MVP**: Complete Phases 1, 2, 3. Shop Owners can onboard.
2. **Marketplace Launch**: Complete Phase 4. Customers can buy.
3. **Fulfillment**: Complete Phase 5. Owners can process orders.
