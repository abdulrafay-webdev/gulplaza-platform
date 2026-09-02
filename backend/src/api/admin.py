from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List, Optional
from src.db.session import get_session
from src.models.shop import Shop
from src.models.product import Product
from src.models.order import Order, OrderItem
from src.models.customer import Customer
from src.models.category import Category
from src.models.review import Review
from src.models.user import User
from src.models.ai_chat import AIDemandInsight
from src.auth.deps import get_super_admin

router = APIRouter()

@router.get("/analytics")
def get_platform_analytics(user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """Comprehensive Super Admin Platform Analytics & KPIs."""
    # 1. Total Platform Revenue
    orders = session.exec(select(Order)).all()
    total_revenue = sum(o.total_amount for o in orders if o.status != "cancelled")
    
    # 2. Orders Breakdown
    orders_by_status = {
        "pending": 0,
        "confirmed": 0,
        "shipped": 0,
        "completed": 0,
        "cancelled": 0
    }
    for o in orders:
        st = o.status.lower()
        if st in orders_by_status:
            orders_by_status[st] += 1
        else:
            orders_by_status[st] = 1

    # 3. Shops Metrics
    all_shops = session.exec(select(Shop)).all()
    total_shops = len(all_shops)
    approved_shops = sum(1 for s in all_shops if s.is_approved)
    pending_shops = sum(1 for s in all_shops if not s.is_approved)
    active_shops = sum(1 for s in all_shops if s.is_active and s.is_approved)

    # 4. Products & Stock Metrics
    all_products = session.exec(select(Product).where(Product.is_deleted == False)).all()
    total_products = len(all_products)
    low_stock_products = sum(1 for p in all_products if p.stock_quantity <= 3)
    out_of_stock_products = sum(1 for p in all_products if p.stock_quantity == 0)

    # 5. Customer & Reviews
    total_customers = len(session.exec(select(Customer)).all())
    total_reviews = len(session.exec(select(Review)).all())

    # 6. Top Performing Shops (by revenue)
    shop_revenue_map = {}
    for o in orders:
        if o.status != "cancelled":
            shop_revenue_map[o.shop_id] = shop_revenue_map.get(o.shop_id, 0) + o.total_amount

    top_shops = []
    for s in all_shops:
        top_shops.append({
            "id": s.id,
            "name": s.name,
            "logo_url": s.logo_url,
            "is_approved": s.is_approved,
            "is_active": s.is_active,
            "total_sales": shop_revenue_map.get(s.id, 0.0),
            "products_count": sum(1 for p in all_products if p.shop_id == s.id)
        })
    top_shops.sort(key=lambda x: x["total_sales"], reverse=True)

    # 7. Recent Platform Orders (Latest 10)
    recent_orders_list = []
    latest_orders = session.exec(select(Order).order_by(Order.created_at.desc()).limit(10)).all()
    for o in latest_orders:
        shop = session.get(Shop, o.shop_id)
        recent_orders_list.append({
            "id": o.id,
            "shop_id": o.shop_id,
            "shop_name": shop.name if shop else f"Shop #{o.shop_id}",
            "customer_name": o.guest_name or "Guest Customer",
            "customer_phone": o.guest_phone or "N/A",
            "total_amount": o.total_amount,
            "status": o.status,
            "created_at": o.created_at,
            "items_count": len(o.items) if o.items else 0
        })

    # 8. High Demand Shopper Queries from AI Assistant
    demands = session.exec(
        select(AIDemandInsight).order_by(AIDemandInsight.request_count.desc(), AIDemandInsight.last_requested_at.desc()).limit(10)
    ).all()

    demands_list = [
        {
            "id": d.id,
            "query_text": d.query_text,
            "category_hint": d.category_hint or "General Market",
            "request_count": d.request_count,
            "had_direct_match": d.had_direct_match,
            "last_requested_at": d.last_requested_at
        } for d in demands
    ]

    return {
        "overview": {
            "total_revenue": total_revenue,
            "total_orders": len(orders),
            "total_shops": total_shops,
            "approved_shops": approved_shops,
            "pending_shops": pending_shops,
            "active_shops": active_shops,
            "total_products": total_products,
            "low_stock_products": low_stock_products,
            "out_of_stock_products": out_of_stock_products,
            "total_customers": total_customers,
            "total_reviews": total_reviews
        },
        "orders_breakdown": orders_by_status,
        "top_shops": top_shops,
        "recent_orders": recent_orders_list,
        "trending_ai_demands": demands_list
    }

@router.get("/shops", response_model=List[Shop])
def list_all_shops(approved: bool = None, user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """List all shops (Admin). Optional filter by approval status."""
    query = select(Shop)
    if approved is not None:
        query = query.where(Shop.is_approved == approved)
    return session.exec(query).all()

@router.post("/shops/{shop_id}/approve", response_model=Shop)
def approve_shop(shop_id: int, user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """Approve a shop."""
    shop = session.get(Shop, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop.is_approved = True
    session.add(shop)
    session.commit()
    session.refresh(shop)
    return shop

@router.patch("/shops/{shop_id}/toggle-active", response_model=Shop)
def toggle_shop_active(shop_id: int, user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """Activate or Deactivate a shop."""
    shop = session.get(Shop, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop.is_active = not shop.is_active
    session.add(shop)
    session.commit()
    session.refresh(shop)
    return shop

@router.delete("/shops/{shop_id}")
def delete_shop(shop_id: int, user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """Permanently delete a shop."""
    shop = session.get(Shop, shop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    session.delete(shop)
    session.commit()
    return {"message": "Shop deleted successfully"}

# --- ADMIN REVIEWS MODERATION ---

@router.get("/reviews")
def list_all_marketplace_reviews(user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """List all reviews across all shops and products for admin moderation."""
    reviews = session.exec(select(Review).order_by(Review.created_at.desc())).all()
    result = []
    for r in reviews:
        prod = session.get(Product, r.product_id)
        shop = session.get(Shop, r.shop_id) if r.shop_id else (prod.shop if prod else None)
        result.append({
            "id": r.id,
            "product_id": r.product_id,
            "product_name": prod.name if prod else "Marketplace Item",
            "product_image": prod.image_url if prod else None,
            "shop_id": shop.id if shop else r.shop_id,
            "shop_name": shop.name if shop else f"Shop #{r.shop_id}",
            "reviewer_name": r.reviewer_name,
            "reviewer_email": r.reviewer_email,
            "rating": r.rating,
            "comment": r.comment,
            "is_approved": r.is_approved,
            "is_verified_purchase": r.is_verified_purchase,
            "created_at": r.created_at
        })
    return result

@router.patch("/reviews/{review_id}/approve")
def admin_approve_review(review_id: int, user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """Admin approves a review to make it visible."""
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_approved = True
    session.add(review)
    session.commit()
    session.refresh(review)
    return {"message": "Review approved successfully", "id": review.id, "is_approved": True}

@router.delete("/reviews/{review_id}")
def admin_delete_review(review_id: int, user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """Admin deletes/rejects a review."""
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    session.delete(review)
    session.commit()
    return {"message": "Review deleted successfully", "id": review_id}

# --- ADMIN USERS (SELLERS & CUSTOMERS) MANAGEMENT ---

@router.get("/users")
def list_all_platform_users(user = Depends(get_super_admin), session: Session = Depends(get_session)):
    """List all platform users categorized into Sellers and Customers with collective profile details."""
    # 1. Sellers from User model (excluding root super admin)
    seller_users = session.exec(select(User).order_by(User.created_at.desc())).all()
    sellers_list = []
    for u in seller_users:
        if u.role == "SUPER_ADMIN" and u.email == "abdullrrafay@gmail.com":
            continue
        shop = session.get(Shop, u.shop_id) if u.shop_id else None
        if not shop:
            shop = session.exec(select(Shop).where(Shop.owner_id == u.id)).first()
        
        products_count = 0
        orders_count = 0
        if shop:
            products_count = len(session.exec(select(Product).where(Product.shop_id == shop.id, Product.is_deleted == False)).all())
            orders_count = len(session.exec(select(Order).where(Order.shop_id == shop.id)).all())

        sellers_list.append({
            "id": str(u.id),
            "full_name": u.full_name or (shop.name if shop else "Registered Seller"),
            "email": u.email or "N/A",
            "phone": u.phone or "N/A",
            "role": u.role,
            "is_active": u.is_active,
            "shop_id": shop.id if shop else u.shop_id,
            "shop_name": shop.name if shop else "No Store Attached",
            "shop_category": getattr(shop, "category", None) or "General",
            "shop_address": getattr(shop, "address", None) or "AI Plaza, Karachi",
            "shop_is_approved": shop.is_approved if shop else False,
            "created_at": str(u.created_at) if u.created_at else "",
            "products_count": products_count,
            "orders_count": orders_count,
            "hashed_password": u.hashed_password or "Encrypted (bcrypt hash)",
        })

    # Also include any approved/pending shops that might not have a direct User record
    all_shops = session.exec(select(Shop)).all()
    existing_shop_ids = {s["shop_id"] for s in sellers_list if s["shop_id"]}
    for sh in all_shops:
        if sh.id not in existing_shop_ids:
            sellers_list.append({
                "id": f"shop_seller_{sh.id}",
                "full_name": f"{sh.name} (Store Owner)",
                "email": f"shop{sh.id}@aiplaza.pk",
                "phone": getattr(sh, "phone", "N/A"),
                "role": "SELLER",
                "is_active": sh.is_active,
                "shop_id": sh.id,
                "shop_name": sh.name,
                "shop_category": getattr(sh, "category", None) or "General",
                "shop_address": getattr(sh, "address", None) or "AI Plaza, Karachi",
                "shop_is_approved": sh.is_approved,
                "created_at": str(getattr(sh, "created_at", "")) or "",
                "products_count": len(session.exec(select(Product).where(Product.shop_id == sh.id, Product.is_deleted == False)).all()),
                "orders_count": len(session.exec(select(Order).where(Order.shop_id == sh.id)).all()),
                "hashed_password": "Encrypted (Store Credentials)",
            })

    # 2. Customers
    customer_records = session.exec(select(Customer).order_by(Customer.created_at.desc())).all()
    customers_list = []
    for c in customer_records:
        orders = session.exec(select(Order).where(Order.customer_id == c.id)).all()
        latest_address = "N/A"
        latest_city = "Pakistan"
        for o in orders:
            if o.guest_address:
                latest_address = o.guest_address
                break

        customers_list.append({
            "id": c.id,
            "full_name": c.full_name,
            "email": c.email or "N/A",
            "phone": c.phone or "N/A",
            "created_at": c.created_at,
            "hashed_password": c.hashed_password,
            "total_orders": len(orders),
            "total_spent": sum(o.total_amount for o in orders if o.status != "cancelled"),
            "shipping_address": latest_address,
            "city": latest_city
        })

    return {
        "sellers": sellers_list,
        "customers": customers_list,
        "total_sellers": len(sellers_list),
        "total_customers": len(customers_list)
    }

