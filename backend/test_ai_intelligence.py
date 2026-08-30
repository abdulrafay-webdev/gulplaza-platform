import json
import base64
import httpx
from sqlmodel import Session, select
from src.db.session import engine, init_db
from src.models.customer import Customer
from src.models.product import Product
from src.models.shop import Shop
from src.services import ai_shopping_service
from src.services.ai_provider import get_ai_provider

def run_tests():
    print("=== TESTING COMPREHENSIVE AI SHOPPING INTELLIGENCE ===")
    init_db()
    ai_prov = get_ai_provider()

    with Session(engine) as session:
        # TEST 1: 'tea cattle' typo test
        q1 = "tea cattle"
        print(f"\n--- TEST 1: Query = '{q1}' ---")
        intent1 = ai_prov.extract_shopping_intent(q1)
        print("Intent 1:", json.dumps(intent1, indent=2))
        candidates1 = ai_shopping_service.search_candidate_products(session, intent1)
        print(f"Candidates ({len(candidates1)}):")
        for c in candidates1:
            print(f"  -> #{c['id']} {c['name']} (Rs. {c['price']})")
        
        # Verify Electric Kettle is found as candidate
        assert any("kettle" in c["name"].lower() for c in candidates1), "Expected Kettle in candidates for 'tea cattle'"

        # Run full process_ai_message for tea cattle
        res1 = ai_shopping_service.process_ai_message(
            session=session,
            chat_id=None,
            user_identity="test:1",
            user_type="customer",
            content=q1
        )
        print("AI Response 1 Message:", res1["assistant_message"]["content"])
        print("AI Response 1 Products:", [p["name"] for p in res1["assistant_message"]["products"]])
        assert any("kettle" in p["name"].lower() for p in res1["assistant_message"]["products"]), "Expected kettle in recommended products"

        # TEST 2: Ambiguous query 'kuch acha sa gift dikhao' (Clarification test)
        q2 = "kuch acha sa gift dikhao"
        print(f"\n--- TEST 2: Ambiguous Query = '{q2}' ---")
        intent2 = ai_prov.extract_shopping_intent(q2)
        print("Intent 2:", json.dumps(intent2, indent=2))
        res2 = ai_shopping_service.process_ai_message(
            session=session,
            chat_id=None,
            user_identity="test:1",
            user_type="customer",
            content=q2
        )
        print("AI Clarification Question:", res2["assistant_message"]["content"])
        assert len(res2["assistant_message"]["content"]) > 10, "Expected clarifying question from AI"

        # TEST 3: Boys Office Suit (Demographic Isolation test)
        q3 = "boys k liyay koi office ka suit"
        print(f"\n--- TEST 3: Query = '{q3}' ---")
        res3 = ai_shopping_service.process_ai_message(
            session=session,
            chat_id=None,
            user_identity="test:1",
            user_type="customer",
            content=q3
        )
        print("AI Response 3 Message:", res3["assistant_message"]["content"])
        print("AI Response 3 Products:", [p["name"] for p in res3["assistant_message"]["products"]])
        for p in res3["assistant_message"]["products"]:
            p_name = p["name"].lower()
            assert "kurti" not in p_name and "lawn" not in p_name and "ladies" not in p_name, f"Female item '{p['name']}' leaked to boys query!"

        # TEST 4: Visual Image Search with Base64 Data URI
        print("\n--- TEST 4: Visual Image Search with Data URI ---")
        kettle_p = session.exec(select(Product).where(Product.name.ilike("%kettle%"))).first()
        if kettle_p and kettle_p.image_url:
            r_img = httpx.get(kettle_p.image_url)
            b64 = base64.b64encode(r_img.content).decode("utf-8")
            data_uri = f"data:image/jpeg;base64,{b64}"
            
            res4 = ai_shopping_service.process_ai_message(
                session=session,
                chat_id=None,
                user_identity="test:1",
                user_type="customer",
                content="yeh item marketplace mein hai?",
                image_url=data_uri
            )
            print("AI Response 4 (Vision) Message:", res4["assistant_message"]["content"])
            print("AI Response 4 (Vision) Products:", [p["name"] for p in res4["assistant_message"]["products"]])
            assert len(res4["assistant_message"]["products"]) > 0, "Expected vision product match"

        print("\n=== ALL 4 ADVANCED INTELLIGENCE TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
