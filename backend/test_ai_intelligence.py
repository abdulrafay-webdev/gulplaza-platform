import json
from sqlmodel import Session, select
from src.db.session import engine, init_db
from src.models.customer import Customer
from src.models.product import Product
from src.services import ai_shopping_service
from src.services.ai_provider import get_ai_provider

def run_intelligence_tests():
    print("=== TESTING ADVANCED AI INTENT & ACCURACY ENGINE ===")
    init_db()
    ai_prov = get_ai_provider()

    with Session(engine) as session:
        # TEST 1: Typo & Roman Urdu Kitchen Query
        query1 = "moi sitchen ka samaan hay"
        print(f"\n--- TEST 1: Query = '{query1}' ---")
        intent1 = ai_prov.extract_shopping_intent(query1)
        print("Intent 1 Extracted:", json.dumps(intent1, indent=2))
        candidates1 = ai_shopping_service.search_candidate_products(session, intent1)
        print(f"Found {len(candidates1)} candidate products:")
        for c in candidates1:
            print(f"  -> #{c['id']} | {c['name']} (Rs. {c['price']}) | Store: {c['shop_name']}")
        
        # Verify kitchen products were found
        assert len(candidates1) > 0, "Expected kitchen products to be found for 'sitchen' typo"
        assert any("cookware" in c["name"].lower() or "kettle" in c["name"].lower() or "fryer" in c["name"].lower() for c in candidates1), "Expected cookware/kitchen item in candidates"

        # TEST 2: Boys Office Suit Query
        query2 = "boys k liyay koi office ka suit"
        print(f"\n--- TEST 2: Query = '{query2}' ---")
        intent2 = ai_prov.extract_shopping_intent(query2)
        print("Intent 2 Extracted:", json.dumps(intent2, indent=2))
        assert intent2.get("gender_target") in ["men", "boys", "male"], f"Expected men/boys gender target, got {intent2.get('gender_target')}"
        candidates2 = ai_shopping_service.search_candidate_products(session, intent2)
        print(f"Found {len(candidates2)} candidate products:")
        for c in candidates2:
            print(f"  -> #{c['id']} | {c['name']} (Rs. {c['price']}) | Store: {c['shop_name']}")
        
        # Verify NO ladies/kurti products in boys results
        for c in candidates2:
            c_name = c['name'].lower()
            assert "kurti" not in c_name and "lawn" not in c_name and "ladies" not in c_name, f"Women product '{c['name']}' found in boys results!"
        print("Verified: 0 women/ladies products in boys results!")

        # TEST 3: End-to-End LLM Synthesis for Boys Suit
        cust = session.exec(select(Customer)).first()
        cust_id = cust.id if cust else 1
        res = ai_shopping_service.process_ai_message(
            session=session,
            chat_id=None,
            user_identity=f"customer:{cust_id}",
            user_type="customer",
            content=query2
        )
        print("\n--- TEST 3: AI Response for Boys Suit ---")
        print("AI Message:", res['assistant_message']['content'])
        print(f"Recommended Products ({len(res['assistant_message']['products'])}):")
        for p in res['assistant_message']['products']:
            print(f"  -> #{p['id']} {p['name']} | Rs. {p['price']} | Store: {p['shop_name']}")
            p_name = p['name'].lower()
            assert "kurti" not in p_name and "lawn" not in p_name, f"Female item '{p['name']}' recommended for boys!"

        print("\n=== ALL INTELLIGENCE & DEMOGRAPHIC TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_intelligence_tests()
