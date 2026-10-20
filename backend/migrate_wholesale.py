import os
import sys
from sqlalchemy import text, inspect

# Ensure backend root is in python path
backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from src.db.session import engine

def run_wholesale_migration():
    print("=== STARTING WHOLESALE FEATURE DATABASE MIGRATION ===")
    
    with engine.connect() as conn:
        insp = inspect(conn)
        tables = insp.get_table_names()
        print("Existing tables in database:", tables)

        # 1. Update "user" table
        if "user" in tables:
            user_cols = [c['name'] for c in insp.get_columns('user')]
            print("Current 'user' columns:", user_cols)
            if 'seller_type' not in user_cols:
                conn.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS seller_type VARCHAR DEFAULT 'RETAIL';"))
                conn.execute(text("UPDATE \"user\" SET seller_type = 'RETAIL' WHERE seller_type IS NULL;"))
                print("Added seller_type to 'user' table and initialized defaults.")
            else:
                print("seller_type already exists on 'user'.")

        # 2. Update "shop" table
        if "shop" in tables:
            shop_cols = [c['name'] for c in insp.get_columns('shop')]
            print("Current 'shop' columns:", shop_cols)
            if 'seller_type' not in shop_cols:
                conn.execute(text("ALTER TABLE shop ADD COLUMN IF NOT EXISTS seller_type VARCHAR DEFAULT 'RETAIL';"))
                conn.execute(text("UPDATE shop SET seller_type = 'RETAIL' WHERE seller_type IS NULL;"))
                print("Added seller_type to 'shop' table and initialized defaults.")
            else:
                print("seller_type already exists on 'shop'.")

        # 3. Update "product" table
        if "product" in tables:
            prod_cols = [c['name'] for c in insp.get_columns('product')]
            print("Current 'product' columns:", prod_cols)
            if 'product_type' not in prod_cols:
                conn.execute(text("ALTER TABLE product ADD COLUMN IF NOT EXISTS product_type VARCHAR DEFAULT 'RETAIL';"))
                conn.execute(text("UPDATE product SET product_type = 'RETAIL' WHERE product_type IS NULL;"))
                print("Added product_type to 'product' table and initialized defaults.")
            if 'moq' not in prod_cols:
                conn.execute(text("ALTER TABLE product ADD COLUMN IF NOT EXISTS moq INTEGER DEFAULT 1;"))
                conn.execute(text("UPDATE product SET moq = 1 WHERE moq IS NULL;"))
                print("Added moq to 'product' table and initialized defaults.")
            else:
                print("moq already exists on 'product'.")

        # 4. Update "order" table
        if "order" in tables:
            order_cols = [c['name'] for c in insp.get_columns('order')]
            print("Current 'order' columns:", order_cols)
            if 'order_type' not in order_cols:
                conn.execute(text("ALTER TABLE \"order\" ADD COLUMN IF NOT EXISTS order_type VARCHAR DEFAULT 'RETAIL';"))
                conn.execute(text("UPDATE \"order\" SET order_type = 'RETAIL' WHERE order_type IS NULL;"))
                print("Added order_type to 'order' table and initialized defaults.")
            else:
                print("order_type already exists on 'order'.")

            if 'buyer_shop_id' not in order_cols:
                conn.execute(text("ALTER TABLE \"order\" ADD COLUMN IF NOT EXISTS buyer_shop_id INTEGER;"))
                print("Added buyer_shop_id to 'order' table.")
            else:
                print("buyer_shop_id already exists on 'order'.")

        conn.commit()
        print("=== WHOLESALE DATABASE MIGRATION COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_wholesale_migration()
