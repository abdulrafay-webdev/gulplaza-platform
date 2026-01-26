from sqlmodel import Session, select
from typing import List, Optional
from ..models.category import Category, SubCategory

# --- MAIN CATEGORY ---
def create_category(session: Session, category: Category) -> Category:
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

def get_all_categories(session: Session) -> List[Category]:
    return session.exec(select(Category).where(Category.is_active == True)).all()

def get_category_by_id(session: Session, category_id: int) -> Optional[Category]:
    return session.get(Category, category_id)

# --- SUB CATEGORY ---
def create_subcategory(session: Session, subcategory: SubCategory) -> SubCategory:
    session.add(subcategory)
    session.commit()
    session.refresh(subcategory)
    return subcategory

def get_subcategories_by_shop(session: Session, shop_id: int, main_category_id: Optional[int] = None) -> List[SubCategory]:
    query = select(SubCategory).where(SubCategory.shop_id == shop_id)
    if main_category_id:
        query = query.where(SubCategory.main_category_id == main_category_id)
    return session.exec(query).all()
