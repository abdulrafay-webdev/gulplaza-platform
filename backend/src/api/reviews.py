from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List, Optional, Dict, Any
from src.db.session import get_session
from src.models.review import Review, ReviewCreate, ReviewRead, ProductRatingSummary
from src.models.product import Product
from src.models.shop import Shop
from src.services import shop_service
from src.auth.deps import get_shop_owner

router = APIRouter()

@router.get("/products/{product_id}/reviews")
def get_product_reviews(product_id: int, session: Session = Depends(get_session)):
    """Get all approved reviews and rating breakdown strictly for a specific product."""
    product = session.get(Product, product_id)
    if not product or product.is_deleted:
        raise HTTPException(status_code=404, detail="Product not found")

    # Only show approved reviews specifically for THIS product
    reviews = session.exec(
        select(Review)
        .where(Review.product_id == product_id, Review.is_approved == True)
        .order_by(Review.created_at.desc())
    ).all()

    total_count = len(reviews)
    if total_count == 0:
        return {
            "reviews": [],
            "summary": {
                "average_rating": 0.0,
                "total_reviews": 0,
                "rating_distribution": {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
            }
        }

    distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    total_rating = 0
    for r in reviews:
        distribution[r.rating] = distribution.get(r.rating, 0) + 1
        total_rating += r.rating

    avg_rating = round(total_rating / total_count, 1)

    return {
        "reviews": reviews,
        "summary": {
            "average_rating": avg_rating,
            "total_reviews": total_count,
            "rating_distribution": distribution
        }
    }

@router.post("/products/{product_id}/reviews", response_model=Dict[str, Any])
def submit_product_review(
    product_id: int, 
    review_in: ReviewCreate, 
    session: Session = Depends(get_session)
):
    """Submit a customer review for a product. Automatically routes to product's shop for approval."""
    product = session.get(Product, product_id)
    if not product or product.is_deleted:
        raise HTTPException(status_code=404, detail="Product not found")

    if review_in.rating < 1 or review_in.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5 stars")

    if not review_in.reviewer_name.strip():
        raise HTTPException(status_code=400, detail="Reviewer name cannot be empty")

    if not review_in.comment.strip():
        raise HTTPException(status_code=400, detail="Review comment cannot be empty")

    review = Review(
        product_id=product_id,
        shop_id=product.shop_id,
        reviewer_name=review_in.reviewer_name.strip(),
        reviewer_email=review_in.reviewer_email,
        rating=review_in.rating,
        comment=review_in.comment.strip(),
        is_verified_purchase=True,
        is_approved=False # Pending review approval by shop owner
    )
    session.add(review)
    session.commit()
    session.refresh(review)

    return {
        "message": "Review submitted successfully! It has been sent to the store for approval.",
        "review": {
            "id": review.id,
            "product_id": review.product_id,
            "shop_id": review.shop_id,
            "reviewer_name": review.reviewer_name,
            "rating": review.rating,
            "comment": review.comment,
            "is_approved": review.is_approved,
            "created_at": review.created_at
        }
    }

# --- SELLER REVIEW GOVERNANCE ENDPOINTS ---

@router.get("/reviews/shop/me", response_model=List[Dict[str, Any]])
@router.get("/shop/me", response_model=List[Dict[str, Any]])
def get_my_shop_reviews(
    user = Depends(get_shop_owner),
    session: Session = Depends(get_session)
):
    """Get all reviews submitted for the current shop's products (Approved & Pending)."""
    shop = shop_service.get_shop_by_owner(session, user["id"])
    if not shop and user.get("shop_id"):
        shop = session.get(Shop, user["shop_id"])
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    reviews = session.exec(
        select(Review).where(Review.shop_id == shop.id).order_by(Review.created_at.desc())
    ).all()

    result = []
    for r in reviews:
        prod = session.get(Product, r.product_id)
        result.append({
            "id": r.id,
            "product_id": r.product_id,
            "product_name": prod.name if prod else "Unknown Product",
            "product_image": prod.image_url if prod else None,
            "reviewer_name": r.reviewer_name,
            "reviewer_email": r.reviewer_email,
            "rating": r.rating,
            "comment": r.comment,
            "is_approved": r.is_approved,
            "is_verified_purchase": r.is_verified_purchase,
            "created_at": r.created_at
        })
    return result

@router.patch("/reviews/{review_id}/approve", response_model=Dict[str, Any])
@router.patch("/{review_id}/approve", response_model=Dict[str, Any])
def approve_shop_review(
    review_id: int,
    user = Depends(get_shop_owner),
    session: Session = Depends(get_session)
):
    """Shop owner approves a review to make it live on the product page."""
    shop = shop_service.get_shop_by_owner(session, user["id"])
    if not shop and user.get("shop_id"):
        shop = session.get(Shop, user["shop_id"])
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    review = session.get(Review, review_id)
    if not review or (user.get("role") != "SUPER_ADMIN" and review.shop_id != shop.id):
        raise HTTPException(status_code=404, detail="Review not found for your store.")

    review.is_approved = True
    session.add(review)
    session.commit()
    session.refresh(review)
    return {"message": "Review approved successfully and is now visible on product page.", "id": review.id, "is_approved": True}

@router.delete("/reviews/{review_id}", response_model=Dict[str, Any])
@router.delete("/{review_id}", response_model=Dict[str, Any])
def delete_shop_review(
    review_id: int,
    user = Depends(get_shop_owner),
    session: Session = Depends(get_session)
):
    """Shop owner rejects or deletes a review from their store."""
    shop = shop_service.get_shop_by_owner(session, user["id"])
    if not shop and user.get("shop_id"):
        shop = session.get(Shop, user["shop_id"])
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    review = session.get(Review, review_id)
    if not review or (user.get("role") != "SUPER_ADMIN" and review.shop_id != shop.id):
        raise HTTPException(status_code=404, detail="Review not found for your store.")

    session.delete(review)
    session.commit()
    return {"message": "Review rejected and deleted.", "id": review_id}

@router.get("/recent")
def get_recent_marketplace_reviews(limit: int = 6, session: Session = Depends(get_session)):
    """Get latest approved reviews across the entire AI Plaza marketplace."""
    reviews = session.exec(
        select(Review).where(Review.is_approved == True).order_by(Review.created_at.desc()).limit(limit)
    ).all()
    
    result = []
    for r in reviews:
        prod = session.get(Product, r.product_id)
        result.append({
            "id": r.id,
            "reviewer_name": r.reviewer_name,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "product_id": r.product_id,
            "product_name": prod.name if prod else "Marketplace Item",
            "product_image": prod.image_url if prod else None
        })
    return result
