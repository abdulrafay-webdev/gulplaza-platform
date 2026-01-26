# Data Model: Gul Plaza Baseline

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    SHOP ||--o{ PRODUCT : contains
    SHOP ||--o{ ORDER : receives
    USER ||--o{ SHOP : owns
    USER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : defined_in

    SHOP {
        int id PK
        string owner_clerk_id "Clerk User ID"
        string name
        string description
        string image_url
        boolean is_active
    }

    PRODUCT {
        int id PK
        int shop_id FK
        string name
        string description
        decimal price
        int stock_quantity
        boolean is_active
    }

    ORDER {
        int id PK
        int shop_id FK
        string customer_clerk_id "Clerk User ID"
        string status "pending, confirmed, completed, cancelled"
        decimal total_amount
        datetime created_at
    }

    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_at_purchase
    }
```

## Schema Definitions (SQLModel)

### Shop
- **Constraints**: `owner_clerk_id` is unique (One shop per owner for MVP simplicity, or One-to-Many? Spec doesn't strictly limit, but "Shop Owner" usually implies 1-1 relationship for simplicity. Let's allow One-to-Many but enforce at least one).
- **Isolation**: Queries MUST filter by `owner_clerk_id` for Shop Owners.

### Order
- **Status Enum**: `PENDING`, `CONFIRMED`, `SHIPPED`, `COMPLETED`, `CANCELLED`.
- **Isolation**: 
  - Shop Owner sees `Order.shop_id == self.shop_id`.
  - Customer sees `Order.customer_clerk_id == self.id`.

### Product
- **Constraints**: Price > 0, Stock >= 0.
