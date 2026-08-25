from sqlmodel import Session, select
from datetime import datetime
from src.db.session import engine, init_db
from src.models.ai_chat import AIDemandInsight

def seed_demand_insights():
    init_db()
    
    sample_demands = [
        {
            "query_text": "Black formal trousers / pants for office wear under 3500",
            "category_hint": "Clothes & Apparel",
            "request_count": 34,
            "had_direct_match": False
        },
        {
            "query_text": "Wireless ANC earbuds with deep bass under 4000 PKR",
            "category_hint": "Gadgets & Electronics",
            "request_count": 28,
            "had_direct_match": True
        },
        {
            "query_text": "Embroidered chiffon dupatta matching red lawn suit",
            "category_hint": "Clothes & Apparel",
            "request_count": 22,
            "had_direct_match": False
        },
        {
            "query_text": "Digital air fryer 5.5L low power consumption",
            "category_hint": "Home Appliances",
            "request_count": 19,
            "had_direct_match": True
        },
        {
            "query_text": "Genuine leather oxford shoes black formal size 42",
            "category_hint": "Shoes & Footwear",
            "request_count": 16,
            "had_direct_match": True
        },
        {
            "query_text": "Smartwatch with bluetooth calling and amoled display",
            "category_hint": "Gadgets & Electronics",
            "request_count": 15,
            "had_direct_match": True
        },
        {
            "query_text": "Non-stick marble granite cooking pots and frying pan set",
            "category_hint": "Crockery & Kitchenware",
            "request_count": 11,
            "had_direct_match": True
        },
        {
            "query_text": "Long lasting arabic oud perfume for men and women",
            "category_hint": "Cosmetics & Fragrances",
            "request_count": 9,
            "had_direct_match": True
        }
    ]

    with Session(engine) as session:
        for d in sample_demands:
            existing = session.exec(
                select(AIDemandInsight).where(AIDemandInsight.query_text == d["query_text"])
            ).first()
            if existing:
                existing.request_count = d["request_count"]
                existing.had_direct_match = d["had_direct_match"]
                existing.category_hint = d["category_hint"]
                existing.last_requested_at = datetime.utcnow()
                session.add(existing)
            else:
                insight = AIDemandInsight(
                    query_text=d["query_text"],
                    category_hint=d["category_hint"],
                    request_count=d["request_count"],
                    had_direct_match=d["had_direct_match"],
                    last_requested_at=datetime.utcnow()
                )
                session.add(insight)
        session.commit()
        print(f"Successfully seeded {len(sample_demands)} AI Demand Insights into Database!")

if __name__ == "__main__":
    seed_demand_insights()
