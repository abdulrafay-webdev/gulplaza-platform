import os
import sys
from sqlmodel import Session, select
from src.db.session import engine, init_db
from src.models.customer import Customer
from src.models.product import Product
from src.services import customer_service, ai_shopping_service
from src.services.ai_provider import get_ai_provider

def run_tests():
    print("=== 1. Initializing DB and AI Tables ===")
    init_db()
    
    with Session(engine) as session:
        print("=== 2. Testing Customer & Auth Setup ===")
        # Find or create a test customer
        cust = session.exec(select(Customer)).first()
        if not cust:
            print("Creating test customer...")
            cust = customer_service.create_customer(session, {
                "full_name": "Test AI Shopper",
                "email": "aishopper@test.com",
                "password": "password123"
            })
        print(f"Customer ready: ID={cust.id}, Name={cust.full_name}")

        print("=== 3. Testing AI Intent Extraction ===")
        ai_prov = get_ai_provider()
        intent = ai_prov.extract_shopping_intent("Mere paas red shirt hai, us ke matching pant chahiye 5000 budget mein")
        print(f"Extracted Intent: {intent}")

        print("=== 4. Testing Candidate Products DB Search ===")
        candidates = ai_shopping_service.search_candidate_products(session, intent)
        print(f"Found {len(candidates)} candidate products in DB")
        for c in candidates[:3]:
            print(f" - #{c['id']}: {c['name']} (Rs. {c['price']}) from '{c['shop_name']}'")

        print("=== 5. Testing Complete AI RAG Message Processing ===")
        res = ai_shopping_service.process_ai_message(
            session=session,
            chat_id=None,
            user_identity=f"customer:{cust.id}",
            user_type="customer",
            content="Mere paas red shirt hai, us ke liye matching pant suggest karo"
        )
        print("AI Assistant Response:")
        print(f"Chat ID: {res['chat']['id']}, Title: {res['chat']['title']}")
        print(f"AI Message: {res['assistant_message']['content']}")
        print(f"Recommended Products: {len(res['assistant_message']['products'])}")
        for p in res['assistant_message']['products']:
            print(f"   -> #{p['id']}: {p['name']} | Rs. {p['price']} | Store: {p['shop_name']}")

        print("=== 6. Testing User Chat History Loading ===")
        user_chats = ai_shopping_service.get_user_chats(session, f"customer:{cust.id}")
        print(f"User has {len(user_chats)} total chats in history")
        assert len(user_chats) >= 1, "Expected at least 1 chat in user history"

        print("=== ALL AI SHOPPING ASSISTANT BACKEND TESTS PASSED! ===")

if __name__ == "__main__":
    run_tests()
