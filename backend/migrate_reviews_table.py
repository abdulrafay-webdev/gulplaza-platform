from sqlalchemy import text
from src.db.session import engine

def migrate_review_table():
    with engine.connect() as conn:
        print("Migrating review table...")
        # Add shop_id column if not exists
        conn.execute(text("ALTER TABLE review ADD COLUMN IF NOT EXISTS shop_id INTEGER;"))
        # Add is_approved column if not exists
        conn.execute(text("ALTER TABLE review ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;"))
        # Clear any old demo reviews
        conn.execute(text("DELETE FROM review;"))
        conn.commit()
        print("Review table migrated and demo reviews cleared successfully!")

if __name__ == "__main__":
    migrate_review_table()
