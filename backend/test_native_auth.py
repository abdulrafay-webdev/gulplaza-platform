from fastapi.testclient import TestClient
from src.main import app
import time

client = TestClient(app)

def test_auth_flows():
    print("=== TESTING NATIVE AUTH FLOWS ===")
    
    # 1. Test Super Admin Login
    print("\n1. Testing Super Admin Login...")
    admin_res = client.post("/api/v1/auth/admin/login", json={
        "email": "abdullrrafay@gmail.com",
        "password": "Rafay@2005"
    })
    print("Admin Login Status:", admin_res.status_code)
    assert admin_res.status_code == 200, f"Admin login failed: {admin_res.text}"
    admin_data = admin_res.json()
    admin_token = admin_data["access_token"]
    print("Admin Token acquired. Role:", admin_data["user"]["role"])

    # 2. Test Admin Protected Route
    admin_analytics_res = client.get("/api/v1/admin/analytics", headers={
        "Authorization": f"Bearer {admin_token}"
    })
    print("Admin Analytics Status:", admin_analytics_res.status_code)
    assert admin_analytics_res.status_code == 200, f"Admin analytics failed: {admin_analytics_res.text}"

    # 3. Test Existing Shop Seller Login
    print("\n2. Testing Existing Shop Login (creative@aiplaza.com)...")
    seller_res = client.post("/api/v1/auth/seller/login", json={
        "login_id": "creative@aiplaza.com",
        "password": "Shop@1234"
    })
    print("Seller Login Status:", seller_res.status_code)
    assert seller_res.status_code == 200, f"Seller login failed: {seller_res.text}"
    seller_data = seller_res.json()
    seller_token = seller_data["access_token"]
    print("Seller Logged in! Shop:", seller_data["shop"]["name"], "Approved:", seller_data["shop"]["is_approved"])

    # 4. Test New Seller Registration
    ts = int(time.time())
    new_shop_name = f"Test Store {ts}"
    new_email = f"testvendor_{ts}@test.com"
    print(f"\n3. Testing New Seller Registration for '{new_shop_name}'...")
    reg_res = client.post("/api/v1/auth/seller/register", json={
        "full_name": "Test Vendor",
        "email": new_email,
        "phone": f"0300{ts%10000000:07d}",
        "password": "Password@123",
        "shop_name": new_shop_name,
        "shop_description": "A new modern test store"
    })
    print("Registration Status:", reg_res.status_code)
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()
    new_shop_id = reg_data["shop"]["id"]
    print("New Shop ID:", new_shop_id, "is_approved:", reg_data["shop"]["is_approved"])
    assert reg_data["shop"]["is_approved"] == False, "New shop should be pending approval"

    # 5. Super Admin Approves New Shop
    print(f"\n4. Super Admin Approving Shop #{new_shop_id}...")
    approve_res = client.post(f"/api/v1/admin/shops/{new_shop_id}/approve", headers={
        "Authorization": f"Bearer {admin_token}"
    })
    print("Approve Status:", approve_res.status_code)
    assert approve_res.status_code == 200, f"Approval failed: {approve_res.text}"
    print("Shop Approved Successfully!")

    # 6. Login with new seller after approval
    print("\n5. Testing Seller Login for approved shop...")
    new_login_res = client.post("/api/v1/auth/seller/login", json={
        "login_id": new_email,
        "password": "Password@123"
    })
    print("New Seller Login Status:", new_login_res.status_code)
    assert new_login_res.status_code == 200, f"New seller login failed: {new_login_res.text}"
    new_seller_data = new_login_res.json()
    print("New Seller Logged In! is_approved:", new_seller_data["shop"]["is_approved"])
    assert new_seller_data["shop"]["is_approved"] == True, "Shop should now be approved"

    print("\n=== ALL NATIVE AUTH TESTS PASSED 100%! ===")

if __name__ == "__main__":
    test_auth_flows()
