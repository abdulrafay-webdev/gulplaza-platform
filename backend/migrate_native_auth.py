import os
from sqlalchemy import text, inspect
from sqlmodel import Session, select
from src.db.session import engine
from src.models.user import User
from src.models.shop import Shop
from src.models.product import Product
from src.models.category import Category
from src.models.customer import Customer
from src.models.order import Order, OrderItem
from src.models.review import Review
from src.models.ai_chat import AIChat, AIMessage, AIDemandInsight
from src.services.customer_service import get_password_hash

def run_migration():
    print("=== STARTING NATIVE AUTH MIGRATION ===")
    
    with engine.connect() as conn:
        insp = inspect(conn)
        existing_cols = [c['name'] for c in insp.get_columns('user')]
        print("Existing user columns:", existing_cols)
        
        # Add missing columns
        if 'phone' not in existing_cols:
            conn.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS phone VARCHAR;"))
            print("Added phone column")
        if 'full_name' not in existing_cols:
            conn.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS full_name VARCHAR;"))
            print("Added full_name column")
        if 'hashed_password' not in existing_cols:
            conn.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS hashed_password VARCHAR;"))
            print("Added hashed_password column")
        if 'shop_id' not in existing_cols:
            conn.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS shop_id INTEGER;"))
            print("Added shop_id column")
        if 'created_at' not in existing_cols:
            conn.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
            print("Added created_at column")
        conn.commit()

    with Session(engine) as session:
        # 1. Super Admin Account
        admin_email = "abdullrrafay@gmail.com"
        admin_pass = "Rafay@2005"
        
        existing_admin = session.exec(select(User).where(User.email == admin_email)).first()
        if not existing_admin:
            admin_user = User(
                id="super_admin_rafay",
                email=admin_email,
                full_name="Abdul Rafay (Super Admin)",
                hashed_password=get_password_hash(admin_pass),
                role="SUPER_ADMIN",
                is_active=True
            )
            session.add(admin_user)
            print(f"Created Super Admin: {admin_email} (Password: {admin_pass})")
        else:
            existing_admin.hashed_password = get_password_hash(admin_pass)
            existing_admin.role = "SUPER_ADMIN"
            session.add(existing_admin)
            print(f"Updated Super Admin password: {admin_email}")

        # 2. Existing Registered Shops
        shops = session.exec(select(Shop)).all()
        for s in shops:
            slug = s.name.lower().replace(" ", "").replace("&", "").replace("-", "")
            shop_email = f"{slug}@aiplaza.com"
            default_pass = "Shop@1234"
            
            user_id = s.owner_clerk_id or f"seller_{s.id}"
            user_obj = session.get(User, user_id)
            if not user_obj:
                user_obj = session.exec(select(User).where(User.email == shop_email)).first()
                
            if not user_obj:
                user_obj = User(
                    id=user_id,
                    email=shop_email,
                    full_name=f"{s.name} Owner",
                    hashed_password=get_password_hash(default_pass),
                    role="SELLER",
                    shop_id=s.id,
                    is_active=True
                )
                session.add(user_obj)
                print(f"Created Seller for shop '{s.name}': Email: {shop_email}, Password: {default_pass}")
            else:
                user_obj.shop_id = s.id
                user_obj.role = "SELLER"
                if not user_obj.hashed_password:
                    user_obj.hashed_password = get_password_hash(default_pass)
                session.add(user_obj)
                print(f"Updated Seller for shop '{s.name}': Email: {user_obj.email}")

        session.commit()
    print("=== NATIVE AUTH MIGRATION COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_migration()
