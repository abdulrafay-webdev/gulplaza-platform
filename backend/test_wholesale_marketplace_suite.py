import os
import sys
import uuid

# Ensure backend root is in python path
backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from fastapi.testclient import TestClient
from src.main import app
from src.db.session import engine
from sqlmodel import Session, select
from src.models.user import User
from src.models.shop import Shop
from src.models.product import Product
from src.models.order import Order

client = TestClient(app)

def test_full_wholesale_flow():
    print("==================================================")
    print("STARTING COMPREHENSIVE WHOLESALE FEATURE TEST SUITE")
    print("==================================================")

    uid_tag = uuid.uuid4().hex[:6]
    retail_email = f"retail_test_{uid_tag}@example.com"
    wholesale_email = f"wholesale_test_{uid_tag}@example.com"
    password = "TestPassword@123"

    # ------------------------------------------------------------------
    # TEST A: RETAIL SELLER SIGNUP & ADMIN APPROVAL
    # ------------------------------------------------------------------
    print("\n[TEST A] Retail Seller Signup & Admin Approval...")
    res_r = client.post("/api/v1/auth/seller/register", json={
        "full_name": "Retail Store Owner",
        "email": retail_email,
        "phone": f"0300{uid_tag[:7]}",
        "password": password,
        "shop_name": f"Retail Electronics {uid_tag}",
        "shop_description": "We sell gadgets directly to consumers",
        "seller_type": "RETAIL"
    })
    assert res_r.status_code == 200, f"Retail signup failed: {res_r.text}"
    retail_data = res_r.json()
    retail_token = retail_data["access_token"]
    retail_shop_id = retail_data["shop"]["id"]
    retail_user_id = retail_data["user"]["id"]
    assert retail_data["user"]["seller_type"] == "RETAIL"
    assert retail_data["shop"]["seller_type"] == "RETAIL"
    assert retail_data["shop"]["is_approved"] is False
    print(f"  -> Retail seller registered: User={retail_user_id}, Shop={retail_shop_id}, seller_type=RETAIL")

    # Admin Login & Approval
    res_admin_login = client.post("/api/v1/auth/admin/login", json={
        "email": "abdullrrafay@gmail.com",
        "password": "Rafay@2005"
    })
    assert res_admin_login.status_code == 200, f"Admin login failed: {res_admin_login.text}"
    admin_token = res_admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin approves retail shop
    res_app_r = client.post(f"/api/v1/admin/shops/{retail_shop_id}/approve", headers=admin_headers)
    assert res_app_r.status_code == 200
    assert res_app_r.json()["is_approved"] is True
    print(f"  -> Admin approved Retail Shop #{retail_shop_id}")

    # ------------------------------------------------------------------
    # TEST B: WHOLESALE SELLER SIGNUP & ADMIN APPROVAL
    # ------------------------------------------------------------------
    print("\n[TEST B] Wholesale Seller Signup & Admin Approval...")
    res_w = client.post("/api/v1/auth/seller/register", json={
        "full_name": "Wholesale Distributor",
        "email": wholesale_email,
        "phone": f"0301{uid_tag[:7]}",
        "password": password,
        "shop_name": f"Karachi Bulk Importers {uid_tag}",
        "shop_description": "Official bulk electronics distributor",
        "seller_type": "WHOLESALE"
    })
    assert res_w.status_code == 200, f"Wholesale signup failed: {res_w.text}"
    wholesale_data = res_w.json()
    wholesale_token = wholesale_data["access_token"]
    wholesale_shop_id = wholesale_data["shop"]["id"]
    wholesale_user_id = wholesale_data["user"]["id"]
    assert wholesale_data["user"]["seller_type"] == "WHOLESALE"
    assert wholesale_data["shop"]["seller_type"] == "WHOLESALE"
    assert wholesale_data["shop"]["is_approved"] is False
    print(f"  -> Wholesale seller registered: User={wholesale_user_id}, Shop={wholesale_shop_id}, seller_type=WHOLESALE")

    # Admin approves wholesale shop
    res_app_w = client.post(f"/api/v1/admin/shops/{wholesale_shop_id}/approve", headers=admin_headers)
    assert res_app_w.status_code == 200
    assert res_app_w.json()["is_approved"] is True
    print(f"  -> Admin approved Wholesale Shop #{wholesale_shop_id}")

    # ------------------------------------------------------------------
    # TEST C: PRODUCT CREATION & AUTO-TYPE CLASSIFICATION
    # ------------------------------------------------------------------
    print("\n[TEST C] Product Creation & Classification...")
    wholesale_headers = {"Authorization": f"Bearer {wholesale_token}"}
    retail_headers = {"Authorization": f"Bearer {retail_token}"}

    # Wholesale Seller adds a product (attacker tries sending product_type='RETAIL' to bypass)
    res_wp = client.post(f"/api/v1/shops/{wholesale_shop_id}/products", headers=wholesale_headers, json={
        "name": f"Bulk Wireless Earbuds Lot (100x) {uid_tag}",
        "short_description": "Wholesale master carton of bluetooth earbuds",
        "long_description": "Factory direct wholesale carton containing 100 units.",
        "price": 850.0,
        "stock_quantity": 500,
        "product_type": "RETAIL"  # Tamper attempt: MUST be overwritten by backend!
    })
    assert res_wp.status_code == 200, f"Wholesale product creation failed: {res_wp.text}"
    wholesale_product = res_wp.json()
    wholesale_product_id = wholesale_product["id"]
    assert wholesale_product["product_type"] == "WHOLESALE", f"Tamper bypass detected! Expected WHOLESALE, got {wholesale_product['product_type']}"
    print(f"  -> Wholesale product #{wholesale_product_id} auto-classified as {wholesale_product['product_type']} (tamper attempt neutralized)")

    # Retail Seller adds a retail product
    res_rp = client.post(f"/api/v1/shops/{retail_shop_id}/products", headers=retail_headers, json={
        "name": f"Single Wireless Earbuds {uid_tag}",
        "short_description": "Premium retail bluetooth earbuds",
        "price": 1800.0,
        "stock_quantity": 25,
        "product_type": "WHOLESALE" # Tamper attempt by retail seller: MUST be set to RETAIL
    })
    assert res_rp.status_code == 200
    retail_product = res_rp.json()
    retail_product_id = retail_product["id"]
    assert retail_product["product_type"] == "RETAIL"
    print(f"  -> Retail product #{retail_product_id} auto-classified as {retail_product['product_type']}")

    # ------------------------------------------------------------------
    # TEST F: PUBLIC & NORMAL CUSTOMER ISOLATION
    # ------------------------------------------------------------------
    print("\n[TEST F] Normal Customer & Public Isolation...")
    # 1. Public catalog list
    res_pub_prods = client.get("/api/v1/products?limit=100")
    assert res_pub_prods.status_code == 200
    pub_pids = [p["id"] for p in res_pub_prods.json()]
    assert wholesale_product_id not in pub_pids, "SECURITY BREACH: Wholesale product visible in public catalog!"
    assert retail_product_id in pub_pids, "Retail product missing from public catalog"
    print("  -> Public /products catalog excludes wholesale products: Verified")

    # 2. Public detail lookup of wholesale product
    res_pub_detail = client.get(f"/api/v1/products/{wholesale_product_id}")
    assert res_pub_detail.status_code in [404, 403], f"SECURITY BREACH: Wholesale product accessible via public GET /products/{{id}}! Status={res_pub_detail.status_code}"
    print("  -> Direct public lookup of wholesale product returned 404: Verified")

    # 3. Public search
    res_pub_search = client.get(f"/api/v1/search/?q={uid_tag}")
    assert res_pub_search.status_code == 200
    search_pids = [p["id"] for p in res_pub_search.json()["products"]]
    assert wholesale_product_id not in search_pids, "SECURITY BREACH: Wholesale product returned in public search!"
    print("  -> Unified public search excludes wholesale items: Verified")

    # 4. Public shop lookup of wholesale shop
    res_pub_shop = client.get(f"/api/v1/shops/{wholesale_shop_id}")
    assert res_pub_shop.status_code in [404, 403], "SECURITY BREACH: Wholesale shop browsable as public retail store!"
    print("  -> Wholesale store lookup via public /shops returned 404: Verified")

    # 5. Normal customer attempt to call /wholesale/products
    res_unauth_ws = client.get("/api/v1/wholesale/products")
    assert res_unauth_ws.status_code in [401, 403], "SECURITY BREACH: Public user accessed wholesale marketplace!"
    print("  -> Unauthenticated/normal customer access to /wholesale/products rejected: Verified")

    # ------------------------------------------------------------------
    # TEST D: APPROVED RETAIL SELLER WHOLESALE MARKETPLACE ACCESS & BUYING
    # ------------------------------------------------------------------
    print("\n[TEST D] Approved Retail Seller Wholesale Sourcing & Purchasing...")
    # Retail seller calls /wholesale/products
    res_ws_list = client.get("/api/v1/wholesale/products", headers=retail_headers)
    assert res_ws_list.status_code == 200, f"Retail seller failed to view wholesale catalog: {res_ws_list.text}"
    ws_pids = [p["id"] for p in res_ws_list.json()]
    assert wholesale_product_id in ws_pids, "Wholesale product missing from Wholesale Marketplace!"
    assert retail_product_id not in ws_pids, "Retail product incorrectly listed in Wholesale Marketplace!"
    print(f"  -> Retail seller successfully viewed wholesale product #{wholesale_product_id} in Wholesale Marketplace")

    # Retail seller views wholesale product detail
    res_ws_single = client.get(f"/api/v1/wholesale/products/{wholesale_product_id}", headers=retail_headers)
    assert res_ws_single.status_code == 200
    assert res_ws_single.json()["product_type"] == "WHOLESALE"

    # Retail seller orders wholesale products via existing Cart Checkout (Cash on Delivery)
    res_checkout = client.post("/api/v1/cart/checkout", headers=retail_headers, json={
        "items": [
            {
                "product_id": wholesale_product_id,
                "quantity": 20,
                "price": 850.0
            }
        ],
        "guest_name": f"Retail Store {uid_tag}",
        "guest_email": retail_email,
        "guest_phone": "03001234567",
        "guest_address": "Shop #12, First Floor, AI Plaza, Karachi"
    })
    assert res_checkout.status_code == 200, f"Wholesale checkout failed: {res_checkout.text}"
    order_ids = res_checkout.json()["order_ids"]
    assert len(order_ids) > 0
    wholesale_order_id = order_ids[0]
    print(f"  -> Retail seller successfully placed wholesale order #{wholesale_order_id} via COD")

    # ------------------------------------------------------------------
    # TEST E: WHOLESALE ORDER VISIBILITY & STATUS MANAGEMENT
    # ------------------------------------------------------------------
    print("\n[TEST E] Wholesale Order Visibility & Management...")
    # Wholesale vendor receives order
    res_vendor_orders = client.get("/api/v1/orders", headers=wholesale_headers)
    assert res_vendor_orders.status_code == 200
    vendor_order_ids = [o["id"] for o in res_vendor_orders.json()]
    assert wholesale_order_id in vendor_order_ids, "Wholesale order missing from wholesale seller orders!"
    
    # Wholesale vendor updates status to 'confirmed'
    res_status = client.patch(f"/api/v1/orders/{wholesale_order_id}/status", headers=wholesale_headers, json={
        "status": "confirmed"
    })
    assert res_status.status_code == 200
    assert res_status.json()["status"] == "confirmed"
    print(f"  -> Wholesale vendor confirmed order #{wholesale_order_id}")

    # Retail seller views their wholesale purchases
    res_retail_purchases = client.get("/api/v1/wholesale/orders", headers=retail_headers)
    assert res_retail_purchases.status_code == 200
    retail_purchases_ids = [o["id"] for o in res_retail_purchases.json()]
    assert wholesale_order_id in retail_purchases_ids, "Wholesale order missing from retail seller sourcing purchases!"
    print(f"  -> Retail seller verified order #{wholesale_order_id} in /wholesale/orders")

    # ------------------------------------------------------------------
    # TEST G: ACCOUNT SEPARATION INVARIANTS
    # ------------------------------------------------------------------
    print("\n[TEST G] Account Separation Invariants...")
    # 1. Wholesale seller tries to access wholesale marketplace as a buyer
    res_ws_as_buyer = client.get("/api/v1/wholesale/products", headers=wholesale_headers)
    assert res_ws_as_buyer.status_code == 403, "SECURITY BREACH: Wholesale seller allowed into buyer wholesale marketplace!"
    print("  -> Wholesale seller blocked from buyer wholesale marketplace: Verified (403 Forbidden)")

    # 2. Wholesale seller tries to buy wholesale product
    res_ws_buy = client.post("/api/v1/cart/checkout", headers=wholesale_headers, json={
        "items": [{"product_id": wholesale_product_id, "quantity": 5, "price": 850.0}]
    })
    assert res_ws_buy.status_code == 400, "SECURITY BREACH: Wholesale seller allowed to buy wholesale goods!"
    print("  -> Wholesale seller blocked from checkout of wholesale products: Verified")

    # 3. Normal customer / unauthenticated user tries to buy wholesale product
    res_anon_buy = client.post("/api/v1/cart/checkout", json={
        "items": [{"product_id": wholesale_product_id, "quantity": 5, "price": 850.0}],
        "guest_name": "Intruder",
        "guest_email": "intruder@example.com"
    })
    assert res_anon_buy.status_code == 400, "SECURITY BREACH: Unauthenticated user bought wholesale product!"
    print("  -> Unauthenticated user blocked from purchasing wholesale products: Verified")

    # ------------------------------------------------------------------
    # TEST H: EXISTING RETAIL SYSTEM CONTINUES WORKING
    # ------------------------------------------------------------------
    print("\n[TEST H] Existing B2C Retail Flow Continues Unbroken...")
    # Normal customer buys retail product
    res_retail_checkout = client.post("/api/v1/cart/checkout", json={
        "items": [{"product_id": retail_product_id, "quantity": 1, "price": 1800.0}],
        "guest_name": "Normal Shopper",
        "guest_email": "shopper@gmail.com",
        "guest_phone": "03331234567",
        "guest_address": "DHA Phase 5, Karachi"
    })
    assert res_retail_checkout.status_code == 200, f"Retail customer checkout failed: {res_retail_checkout.text}"
    retail_order_id = res_retail_checkout.json()["order_ids"][0]
    print(f"  -> Normal customer successfully placed retail order #{retail_order_id}")

    # Retail seller sees the consumer order in their store dashboard
    res_r_orders = client.get("/api/v1/orders", headers=retail_headers)
    assert res_r_orders.status_code == 200
    r_order_ids = [o["id"] for o in res_r_orders.json()]
    assert retail_order_id in r_order_ids, "Retail order missing from retail seller dashboard!"
    print(f"  -> Retail seller dashboard received consumer order #{retail_order_id}")

    # ------------------------------------------------------------------
    # TEST I: MIXED CART PREVENTED
    # ------------------------------------------------------------------
    print("\n[TEST I] Mixed Cart Security Prevention...")
    res_mixed_cart = client.post("/api/v1/cart/checkout", headers=retail_headers, json={
        "items": [
            {"product_id": wholesale_product_id, "quantity": 10, "price": 850.0},
            {"product_id": retail_product_id, "quantity": 1, "price": 1800.0}
        ]
    })
    assert res_mixed_cart.status_code == 400, "SECURITY BREACH: Mixed retail and wholesale cart allowed!"
    print("  -> Mixed retail + wholesale cart properly rejected: Verified")

    print("\n==================================================")
    print("ALL TESTS (TEST A THROUGH TEST I) PASSED 100%!")
    print("==================================================")

if __name__ == "__main__":
    test_full_wholesale_flow()
