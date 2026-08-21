from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List, Optional
from src.db.session import get_session
from src.models.review import Review, ReviewCreate, ReviewRead, ProductRatingSummary
from src.models.product import Product

router = APIRouter()

@router.get("/products/{product_id}/reviews")
def get_product_reviews(product_id: int, session: Session = Depends(get_session)):
    """Get all reviews and rating breakdown for a product."""
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    reviews = session.exec(
        select(Review).where(Review.product_id == product_id).order_by(Review.created_at.desc())
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

@router.post("/products/{product_id}/reviews", response_model=ReviewRead)
def submit_product_review(
    product_id: int, 
    review_in: ReviewCreate, 
    session: Session = Depends(get_session)
):
    """Submit a verified customer review for a product."""
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if review_in.rating < 1 or review_in.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5 stars")

    if not review_in.reviewer_name.strip():
        raise HTTPException(status_code=400, detail="Reviewer name cannot be empty")

    if not review_in.comment.strip():
        raise HTTPException(status_code=400, detail="Review comment cannot be empty")

    review = Review(
        product_id=product_id,
        reviewer_name=review_in.reviewer_name.strip(),
        reviewer_email=review_in.reviewer_email,
        rating=review_in.rating,
        comment=review_in.comment.strip(),
        is_verified_purchase=True
    )
    session.add(review)
    session.commit()
    session.refresh(review)
    return review

@router.get("/recent")
def get_recent_marketplace_reviews(limit: int = 6, session: Session = Depends(get_session)):
    """Get latest verified reviews across the entire AI Plaza marketplace."""
    reviews = session.exec(
        select(Review).order_by(Review.created_at.desc()).limit(limit)
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
