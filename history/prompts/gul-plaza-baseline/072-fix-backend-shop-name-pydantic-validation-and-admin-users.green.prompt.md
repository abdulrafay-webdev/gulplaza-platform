---
id: "072"
title: "Fix Backend Shop Name Pydantic Validation, Models Registration, and Admin Users"
stage: green
date: 2026-09-02
surface: agent
model: gemini-3.6-flash
feature: gul-plaza-baseline
branch: 1-gul-plaza-baseline
user: Yousuf Traders
command: "web may admin login kartay huay ye error araha hay [HMR] connected (index):1 Access to XMLHttpRequest at 'http://localhost:8000/api/v1/products?limit=50' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. or app successfully login horaha hay but user or reviews nhi arahay us may"
labels: ["cors-fix", "pydantic-validation", "sqlmodel", "admin-users-fix", "backend-500-error"]
links: null
files:
 - backend/src/models/__init__.py
 - backend/src/models/product.py
 - backend/src/api/products.py
 - backend/src/api/orders.py
 - backend/src/api/admin.py
 - backend/src/services/order_service.py
tests:
 - curl.exe verified HTTP 200 OK with Access-Control-Allow-Origin: http://localhost:3000
 - Tested list_all_platform_users returning 12 sellers and 5 customers with 0 errors
 - Tested list_all_marketplace_reviews returning reviews list with 0 errors
 - Tested list_all_products returning products with shop names with 0 errors
---

# Accomplishments

1. **Resolved 500 Internal Server Error & CORS Block on `/api/v1/products`**:
   - Identified that calling `setattr(p, "shop_name", ...)` on `Product` table instances failed with `ValueError: "Product" object has no field "shop_name"` because Pydantic models with strict schemas reject undeclared attributes.
   - Refactored `list_all_products` and `get_product` in `backend/src/api/products.py` to validate into `ProductRead.model_validate(p, update={"shop_name": shop_map.get(p.shop_id)})`, safely populating the shop name.
   - Created `backend/src/models/__init__.py` registering all SQLModel models and resolved runtime imports in `product.py` to prevent SQLAlchemy mapper configuration lookup failures.
   - Verified live with `curl.exe -i -H "Origin: http://localhost:3000" http://localhost:8000/api/v1/products?limit=5`: returns `HTTP 200 OK` with `access-control-allow-origin: http://localhost:3000`.

2. **Resolved Admin Users & Reviews Data Failure (`GET /admin/users` & `/admin/reviews`)**:
   - Fixed `AttributeError: 'Shop' object has no attribute 'category'` in `list_all_platform_users` ([backend/src/api/admin.py](file:///D:/gul-plaza/backend/src/api/admin.py)) by safely using `getattr(shop, "category", None)` and `getattr(shop, "address", None)`.
   - Fixed `order_service.py` to prevent invalid `setattr` on `Order` table instances.
   - Verified `list_all_platform_users` returns `12 sellers` and `5 customers` with all collective profile details.
