import json
from sqlmodel import Session, select
from src.db.session import engine, init_db
from src.models.customer import Customer
from src.models.product import Product
from src.models.ai_chat import AIChat
from src.services import ai_shopping_service

def test_exact_user_conversation():
    print("=== TESTING EXACT USER MULTI-TURN CONVERSATION ===")
    init_db()

    with Session(engine) as session:
        # Create fresh test chat
        chat = ai_shopping_service.get_or_create_chat(
            session=session,
            user_identity="test_user:99",
            user_type="customer",
            initial_title="Multi-Turn Gift Test"
        )
        chat_id = chat.id

        # Turn 1: 'kuch gift k liyay batao'
        print("\n--- TURN 1: 'kuch gift k liyay batao' ---")
        t1 = ai_shopping_service.process_ai_message(
            session=session,
            chat_id=chat_id,
            user_identity="test_user:99",
            user_type="customer",
            content="kuch gift k liyay batao"
        )
        print("AI T1:", t1["assistant_message"]["content"])
        print("T1 Products:", [p["name"] for p in t1["assistant_message"]["products"]])
        assert "nahi hai" not in t1["assistant_message"]["content"] or len(t1["assistant_message"]["products"]) > 0, "Turn 1 failed: gave not-in-stock message for gifts!"

        # Turn 2: 'kisi ko gift dayna hay kuch suggest karo'
        print("\n--- TURN 2: 'kisi ko gift dayna hay kuch suggest karo' ---")
        t2 = ai_shopping_service.process_ai_message(
            session=session,
            chat_id=chat_id,
            user_identity="test_user:99",
            user_type="customer",
            content="kisi ko gift dayna hay kuch suggest karo"
        )
        print("AI T2:", t2["assistant_message"]["content"])
        print("T2 Products:", [p["name"] for p in t2["assistant_message"]["products"]])
        assert len(t2["assistant_message"]["products"]) > 0, "Turn 2 failed: expected products for gift query"

        # Turn 3: 'nhi shoes nhi' (CRITICAL NEGATION TEST)
        print("\n--- TURN 3: 'nhi shoes nhi' ---")
        t3 = ai_shopping_service.process_ai_message(
            session=session,
            chat_id=chat_id,
            user_identity="test_user:99",
            user_type="customer",
            content="nhi shoes nhi"
        )
        print("AI T3:", t3["assistant_message"]["content"])
        print("T3 Products:", [p["name"] for p in t3["assistant_message"]["products"]])
        for p in t3["assistant_message"]["products"]:
            p_name = p["name"].lower()
            assert "shoe" not in p_name and "oxford" not in p_name and "sneaker" not in p_name, f"Shoes '{p['name']}' returned after user said 'nhi shoes nhi'!"
        print("Verified: ZERO shoes returned after negation!")

        # Turn 4: 'shukriya' (Small talk test)
        print("\n--- TURN 4: 'shukriya' ---")
        t4 = ai_shopping_service.process_ai_message(
            session=session,
            chat_id=chat_id,
            user_identity="test_user:99",
            user_type="customer",
            content="shukriya"
        )
        print("AI T4:", t4["assistant_message"]["content"])
        assert len(t4["assistant_message"]["products"]) == 0, "Turn 4 failed: expected 0 product cards for 'shukriya'"

        print("\n=== MULTI-TURN CONVERSATION & NEGATIONS TEST PASSED 100%! ===")

if __name__ == "__main__":
    test_exact_user_conversation()
