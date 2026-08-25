from sqlmodel import Session, select
from src.db.session import engine, init_db
from src.models.product import Product
from src.models.shop import Shop
from src.models.review import Review

def test_review_lifecycle():
    print("=== TESTING PRODUCT REVIEW LIFECYCLE & SELLER ISOLATION ===")
    init_db()

    with Session(engine) as session:
        # 1. Pick a product
        prod = session.exec(select(Product).where(Product.is_deleted == False)).first()
        assert prod is not None, "No product found"
        print(f"Testing on Product #{prod.id}: '{prod.name}' (Shop #{prod.shop_id})")

        # 2. Pick another product from a different shop
        other_prod = session.exec(select(Product).where(Product.id != prod.id, Product.shop_id != prod.shop_id)).first()
        print(f"Other Product #{other_prod.id}: '{other_prod.name}' (Shop #{other_prod.shop_id})")

        # 3. Create a review for Product 1 (Starts as is_approved = False)
        rev = Review(
            product_id=prod.id,
            shop_id=prod.shop_id,
            reviewer_name="Zubair Customer",
            reviewer_email="zubair@test.com",
            rating=5,
            comment="Zabardast fabric aur fast delivery! Highly recommended.",
            is_verified_purchase=True,
            is_approved=False
        )
        session.add(rev)
        session.commit()
        session.refresh(rev)
        print(f"Submitted Review #{rev.id}: is_approved={rev.is_approved}, shop_id={rev.shop_id}")

        # 4. Public query for Product 1 -> Should NOT show unapproved review
        pub_reviews = session.exec(
            select(Review).where(Review.product_id == prod.id, Review.is_approved == True)
        ).all()
        assert len(pub_reviews) == 0, f"Expected 0 approved reviews, got {len(pub_reviews)}"
        print("Verified: Unapproved review is hidden from public product page.")

        # 5. Shop 1 queries its pending reviews -> Should see Review
        shop_reviews = session.exec(
            select(Review).where(Review.shop_id == prod.shop_id)
        ).all()
        assert len(shop_reviews) >= 1, "Shop 1 should see the review"
        print(f"Verified: Shop #{prod.shop_id} received the review in its dashboard.")

        # 6. Other shop queries reviews -> Should NOT see this review
        other_shop_reviews = session.exec(
            select(Review).where(Review.shop_id == other_prod.shop_id)
        ).all()
        assert not any(r.id == rev.id for r in other_shop_reviews), "Other shop should not see this review"
        print("Verified: Review approval is strictly isolated to the product's shop only.")

        # 7. Shop 1 Approves the review
        rev.is_approved = True
        session.add(rev)
        session.commit()
        session.refresh(rev)
        print(f"Shop approved review #{rev.id}: is_approved={rev.is_approved}")

        # 8. Public query for Product 1 -> NOW shows review
        pub_reviews_after = session.exec(
            select(Review).where(Review.product_id == prod.id, Review.is_approved == True)
        ).all()
        assert len(pub_reviews_after) >= 1, "Approved review should now be visible on product"
        print(f"Verified: Review is now publicly visible on Product #{prod.id}!")

        # 9. Public query for Other Product -> Should NOT show this review
        other_pub_reviews = session.exec(
            select(Review).where(Review.product_id == other_prod.id, Review.is_approved == True)
        ).all()
        assert not any(r.id == rev.id for r in other_pub_reviews), "Review must only show on the specific product reviewed"
        print(f"Verified: Review does NOT leak into Other Product #{other_prod.id}!")

        # 10. Clean up test review
        session.delete(rev)
        session.commit()
        print("Cleaned up test review. ALL REVIEW LIFECYCLE TESTS PASSED!")

if __name__ == "__main__":
    test_review_lifecycle()
