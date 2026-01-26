# Feature Specification: Gul Plaza Baseline

**Feature Branch**: `1-gul-plaza-baseline`  
**Created**: 2026-01-24  
**Status**: Draft  
**Input**: User description: "Is project ki baseline specification create karo without writing any code. Platform ka objective: Gul Plaza ki saari shops list karna, Shop-wise products show karna, Har order sirf us shop owner ke dashboard mein visible ho..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shop Owner Setup & Product Management (Priority: P1)

A Shop Owner logs in, configures their shop profile, and manages their product catalog.

**Why this priority**: Without shops and products, there is nothing for customers to buy. This is the supply side of the platform.

**Independent Test**: Create a Shop Owner account, login, create a shop "Test Shop", add a product "Test Item", and verify "Test Item" appears in the shop's product list.

**Acceptance Scenarios**:

1. **Given** a new Shop Owner user, **When** they log in for the first time, **Then** they should be prompted/able to create their Shop profile.
2. **Given** an active Shop Owner, **When** they add a new Product with valid details, **Then** the product is saved and associated ONLY with their shop.
3. **Given** a Shop Owner, **When** they view their dashboard, **Then** they see ONLY their own products.

---

### User Story 2 - Customer Browsing & Ordering (Priority: P1)

A Customer visits the public website, browses shops, selects products, and places an order.

**Why this priority**: This is the core business value—enabling transactions.

**Independent Test**: Visit the public site as a guest/user, view "Test Shop", add "Test Item" to cart, and complete checkout.

**Acceptance Scenarios**:

1. **Given** a visitor, **When** they land on the homepage, **Then** they see a list of all available Shops.
2. **Given** a visitor on a Shop's page, **When** they browse, **Then** they see products belonging ONLY to that Shop.
3. **Given** a customer with items in cart, **When** they checkout, **Then** an Order is created in the system.

---

### User Story 3 - Order Management & Isolation (Priority: P1)

A Shop Owner views and updates the status of orders received for their shop.

**Why this priority**: Essential for fulfillment and ensuring the data isolation constraint.

**Independent Test**: Place an order for Shop A. Log in as Shop A Owner and verify order visibility. Log in as Shop B Owner and verify order INVISIBILITY.

**Acceptance Scenarios**:

1. **Given** a new order for Shop A, **When** Shop A Owner views their dashboard, **Then** the order is visible.
2. **Given** a new order for Shop A, **When** Shop B Owner views their dashboard, **Then** the order is NOT visible (Strict Data Isolation).
3. **Given** an open order, **When** the Shop Owner updates status to "Completed", **Then** the order lifecycle is updated.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate users via Clerk using defined roles (ADMIN, SHOP_OWNER, USER).
- **FR-002**: System MUST store User Role and Shop ID in Clerk `publicMetadata` to enforce access control.
- **FR-003**: System MUST allow Shop Owners to create and update their Shop profile (Name, Description, Image).
- **FR-004**: System MUST allow Shop Owners to manage Products (Name, Description, Price, Stock) for their specific Shop.
- **FR-005**: Public Website MUST display a directory of all registered Shops.
- **FR-006**: Public Website MUST allow filtering/viewing products by Shop.
- **FR-007**: System MUST support an Order Lifecycle (e.g., Pending -> Confirmed -> Completed -> Cancelled).
- **FR-008**: System MUST enforce strict data isolation: A Shop Owner query for orders MUST strictly filter by their assigned Shop ID.
- **FR-009**: System MUST allow Customers to place orders.
- **FR-010**: System MUST handle payments via **Cash on Delivery (COD)**.
- **FR-011**: An Order MUST contain items from **multiple shops**. The system MUST automatically split a multi-shop checkout into separate **Child Orders** (one per shop) to maintain strict data isolation for Shop Owners.

### Key Entities

- **User**: Maps to Clerk Identity, holds Role.
- **Shop**: Belongs to a Shop Owner.
- **Product**: Belongs to a Shop.
- **Order**: Belongs to a Shop and a Customer.
- **OrderItem**: Links Product to Order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Shop Owner sees 0% of orders belonging to other shops (Security/Isolation).
- **SC-002**: A customer can complete a purchase flow (Shop Selection -> Product -> Checkout) in under 3 minutes.
- **SC-003**: System successfully syncs Clerk Metadata (Role/ShopID) to backend permissions for 100% of requests.

### Edge Cases

- User logs in without a role assigned.
- Shop Owner tries to access a URL for another shop's order directly.
- Product goes out of stock while in a customer's cart.
