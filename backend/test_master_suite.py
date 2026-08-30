import json
import base64
import httpx
from sqlmodel import Session, select
from src.db.session import engine, init_db
from src.models.product import Product
from src.models.ai_chat import AIChat
from src.services import ai_shopping_service

def run_master_audit_tests():
    print("==================================================")
    print("RUNNING MASTER AI SHOPPING ASSISTANT TEST SUITE")
    print("==================================================")
    init_db()

    with Session(engine) as session:
        # TEST 1: Greeting & Small Talk
        print("\n--- TEST 1: Greeting 'Hello' ---")
        chat1 = ai_shopping_service.get_or_create_chat(session, "user_test_1", "customer", initial_title="Greeting Test")
        res1 = ai_shopping_service.process_ai_message(session, chat1.id, "user_test_1", "customer", "Hello")
        print("AI Output:", res1["assistant_message"]["content"])
        print("Product count:", len(res1["assistant_message"]["products"]))
        assert len(res1["assistant_message"]["products"]) == 0, "Test 1 Failed: Products were forced on greeting!"

        # TEST 2: Context Setting -> Follow-up Matching
        print("\n--- TEST 2: Outfit Context & Matching Follow-up ---")
        chat2 = ai_shopping_service.get_or_create_chat(session, "user_test_2", "customer", initial_title="Red Shirt Outfit")
        res2_1 = ai_shopping_service.process_ai_message(session, chat2.id, "user_test_2", "customer", "Mere paas red shirt hai.")
        print("Turn 1 AI Output:", res2_1["assistant_message"]["content"])
        print("Turn 1 Products:", len(res2_1["assistant_message"]["products"]))
        assert len(res2_1["assistant_message"]["products"]) == 0, "Test 2.1 Failed: Products forced on context setting!"

        res2_2 = ai_shopping_service.process_ai_message(session, chat2.id, "user_test_2", "customer", "Iske saath konsi pant achi lagegi?")
        print("Turn 2 AI Output:", res2_2["assistant_message"]["content"])
        print("Turn 2 Products:", [p["name"] for p in res2_2["assistant_message"]["products"]])
        assert len(res2_2["assistant_message"]["products"]) > 0, "Test 2.2 Failed: No pants recommended for red shirt matching!"
        assert any("pant" in p["name"].lower() for p in res2_2["assistant_message"]["products"]), "Test 2.2 Failed: Expected pants in results"

        # TEST 3: Vague Query -> Clarification -> Budget Refinement
        print("\n--- TEST 3: Vague Shoes -> Refinement ---")
        chat3 = ai_shopping_service.get_or_create_chat(session, "user_test_3", "customer", initial_title="Shoes Search")
        res3_1 = ai_shopping_service.process_ai_message(session, chat3.id, "user_test_3", "customer", "Mujhe shoes chahiye.")
        print("Turn 1 AI Output:", res3_1["assistant_message"]["content"])
        print("Turn 1 Products:", len(res3_1["assistant_message"]["products"]))
        assert len(res3_1["assistant_message"]["products"]) == 0, "Test 3.1 Failed: Should ask clarifying question instead of forcing products!"

        res3_2 = ai_shopping_service.process_ai_message(session, chat3.id, "user_test_3", "customer", "Formal, black, budget 5000.")
        print("Turn 2 AI Output:", res3_2["assistant_message"]["content"])
        print("Turn 2 Products:", [p["name"] for p in res3_2["assistant_message"]["products"]])
        assert len(res3_2["assistant_message"]["products"]) > 0, "Test 3.2 Failed: Expected products after refinement"

        # TEST 4: Rejection & Alternatives
        print("\n--- TEST 4: Rejection 'Ye options pasand nahi aaye' ---")
        chat4 = ai_shopping_service.get_or_create_chat(session, "user_test_4", "customer", initial_title="Rejection Test")
        res4_1 = ai_shopping_service.process_ai_message(session, chat4.id, "user_test_4", "customer", "kisi ko gift dayna hay kuch suggest karo")
        first_ids = [p["id"] for p in res4_1["assistant_message"]["products"]]
        print("Initial Products:", [p["name"] for p in res4_1["assistant_message"]["products"]])

        res4_2 = ai_shopping_service.process_ai_message(session, chat4.id, "user_test_4", "customer", "nhi shoes pasand nahi aye kuch aur dikhao")
        print("Alternative AI Output:", res4_2["assistant_message"]["content"])
        print("Alternative Products:", [p["name"] for p in res4_2["assistant_message"]["products"]])
        for p in res4_2["assistant_message"]["products"]:
            assert "shoe" not in p["name"].lower() and "oxford" not in p["name"].lower() and "sneaker" not in p["name"].lower(), "Shoes leaked after rejection!"

        # TEST 5: Visual Image Search + Follow-up Refinement
        print("\n--- TEST 5: Visual Image Search + Multi-turn Follow-up ---")
        kettle_p = session.exec(select(Product).where(Product.name.ilike("%kettle%"))).first()
        if kettle_p and kettle_p.image_url:
            r_img = httpx.get(kettle_p.image_url)
            b64 = base64.b64encode(r_img.content).decode("utf-8")
            data_uri = f"data:image/jpeg;base64,{b64}"

            chat5 = ai_shopping_service.get_or_create_chat(session, "user_test_5", "customer", initial_title="Vision Test")
            res5_1 = ai_shopping_service.process_ai_message(
                session=session,
                chat_id=chat5.id,
                user_identity="user_test_5",
                user_type="customer",
                content="yeh item marketplace mein hai?",
                image_url=data_uri
            )
            print("Turn 1 Vision Output:", res5_1["assistant_message"]["content"])
            print("Turn 1 Vision Products:", [p["name"] for p in res5_1["assistant_message"]["products"]])
            assert len(res5_1["assistant_message"]["products"]) > 0, "Test 5.1 Failed: Expected vision product match"

            res5_2 = ai_shopping_service.process_ai_message(
                session=session,
                chat_id=chat5.id,
                user_identity="user_test_5",
                user_type="customer",
                content="is ke saath koi cookware set bhi hai?"
            )
            print("Turn 2 Follow-up Output:", res5_2["assistant_message"]["content"])
            print("Turn 2 Follow-up Products:", [p["name"] for p in res5_2["assistant_message"]["products"]])
            assert any("cookware" in p["name"].lower() for p in res5_2["assistant_message"]["products"]), "Test 5.2 Failed: Expected cookware in follow-up"

        # TEST 6: General Platform Question
        print("\n--- TEST 6: General Platform Question ---")
        chat6 = ai_shopping_service.get_or_create_chat(session, "user_test_6", "customer", initial_title="General Question")
        res6 = ai_shopping_service.process_ai_message(session, chat6.id, "user_test_6", "customer", "Delivery kitne din mein hoti hai?")
        print("AI Output:", res6["assistant_message"]["content"])
        print("Product count:", len(res6["assistant_message"]["products"]))
        assert len(res6["assistant_message"]["products"]) == 0, "Test 6 Failed: Products were forced on general question!"

        # TEST 7: Non-Existent Product Query
        print("\n--- TEST 7: Non-Existent Product (Drone Camera) ---")
        chat7 = ai_shopping_service.get_or_create_chat(session, "user_test_7", "customer", initial_title="Out of Stock Test")
        res7 = ai_shopping_service.process_ai_message(session, chat7.id, "user_test_7", "customer", "Mujhe 4K professional drone camera chahiye.")
        print("AI Output:", res7["assistant_message"]["content"])
        print("Product count:", len(res7["assistant_message"]["products"]))
        assert len(res7["assistant_message"]["products"]) == 0, "Test 7 Failed: Hallucinated product for drone camera!"

        # TEST 8: Reopening Old Chat Session & Context Continuation
        print("\n--- TEST 8: Reopening Old Chat Session ---")
        chat_detail = ai_shopping_service.get_chat_detail(session, chat2.id, "user_test_2")
        assert chat_detail is not None, "Test 8 Failed: Could not retrieve old chat detail"
        assert len(chat_detail["messages"]) >= 4, "Test 8 Failed: Previous messages missing in history"
        print(f"Retrieved chat #{chat_detail['id']} with {len(chat_detail['messages'])} messages successfully!")

        res8 = ai_shopping_service.process_ai_message(session, chat2.id, "user_test_2", "customer", "In pants ka delivery time kya hai?")
        print("Reopened Chat Follow-up Output:", res8["assistant_message"]["content"])

        print("\n==================================================")
        print("ALL 8 MASTER SCENARIOS PASSED WITH ZERO ERRORS!")
        print("==================================================")

if __name__ == "__main__":
    run_master_audit_tests()
