import os
import sys

# Ensure backend root is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select
from datetime import datetime, timedelta
from src.db.session import engine, init_db
from src.models.category import Category, SubCategory
from src.models.shop import Shop
from src.models.product import Product, ProductImage
from src.models.review import Review
from src.models.order import Order, OrderItem
from src.models.customer import Customer

def seed():
    init_db()
    with Session(engine) as session:
        print("--- Starting AI Plaza Demo Data & Reviews Seed ---")

        # 1. Seed Customer
        existing_cust = session.exec(select(Customer).where(Customer.phone == "03001234567")).first()
        if not existing_cust:
            cust = Customer(
                phone="03001234567",
                full_name="Ahmed Khan",
                email="ahmed.khan@example.com",
                hashed_password="demo_hashed_password"
            )
            session.add(cust)
            session.commit()
            session.refresh(cust)
        else:
            cust = existing_cust

        # 2. Seed Reviews for products
        products = session.exec(select(Product)).all()
        sample_reviews = [
            ("Usman Tariq", 5, "Outstanding quality! Exceeded my expectations. Packaging was solid and delivered in 2 days."),
            ("Fatima Zahra", 5, "100% authentic product. Tested right away and works flawlessly. Highly recommend this seller on AI Plaza!"),
            ("Bilal Siddiqui", 4, "Very good value for money. Minor delay with courier, but product quality is 10/10."),
            ("Ayesha Noor", 5, "The build quality is superb. Genuine store warranty included. Will definitely order again!"),
            ("Hamza Ali", 4, "Works exactly as described. Clean finish and great performance.")
        ]

        for p in products:
            existing_revs = session.exec(select(Review).where(Review.product_id == p.id)).all()
            if len(existing_revs) < 2:
                for idx, (name, rating, comment) in enumerate(sample_reviews[:3]):
                    rev = Review(
                        product_id=p.id,
                        reviewer_name=name,
                        reviewer_email=f"{name.lower().replace(' ', '.')}@example.com",
                        rating=rating,
                        comment=comment,
                        is_verified_purchase=True,
                        created_at=datetime.utcnow() - timedelta(days=idx*3 + 1)
                    )
                    session.add(rev)
                session.commit()
                print(f"Added Reviews for product: {p.name}")

        # 3. Seed Sample Orders for Analytics
        shops = session.exec(select(Shop)).all()
        for s in shops:
            existing_orders = session.exec(select(Order).where(Order.shop_id == s.id)).all()
            if len(existing_orders) < 2:
                shop_prods = session.exec(select(Product).where(Product.shop_id == s.id)).all()
                if shop_prods:
                    p1 = shop_prods[0]
                    # Order 1 (Completed)
                    ord1 = Order(
                        shop_id=s.id,
                        guest_name="Zubair Ahmed",
                        guest_phone="0312-9876543",
                        guest_email="zubair@example.com",
                        guest_address="House 42, Block 6, PECHS, Karachi",
                        status="completed",
                        total_amount=p1.price,
                        created_at=datetime.utcnow() - timedelta(days=2)
                    )
                    session.add(ord1)
                    session.commit()
                    session.refresh(ord1)

                    item1 = OrderItem(
                        order_id=ord1.id,
                        product_id=p1.id,
                        quantity=1,
                        price_at_purchase=p1.price
                    )
                    session.add(item1)

                    # Order 2 (Pending/Processing)
                    ord2 = Order(
                        shop_id=s.id,
                        guest_name="Kashif Mehmood",
                        guest_phone="0321-4567890",
                        guest_email="kashif@example.com",
                        guest_address="Flat 302, Gulshan-e-Iqbal, Karachi",
                        status="confirmed",
                        total_amount=p1.price * 2,
                        created_at=datetime.utcnow() - timedelta(hours=6)
                    )
                    session.add(ord2)
                    session.commit()
                    session.refresh(ord2)

                    item2 = OrderItem(
                        order_id=ord2.id,
                        product_id=p1.id,
                        quantity=2,
                        price_at_purchase=p1.price
                    )
                    session.add(item2)
                    session.commit()
                    print(f"Added Demo Orders for Shop: {s.name}")

        print("--- Reviews & Analytics Demo Seed Finished! ---")

if __name__ == "__main__":
    seed()
