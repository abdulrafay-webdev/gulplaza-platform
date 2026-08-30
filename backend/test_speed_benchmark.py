import time
from sqlmodel import Session
from src.db.session import engine, init_db
from src.services import ai_shopping_service

def test_speed_and_order_flow():
    print("=== TESTING UNIFIED SINGLE-PASS AI ASSISTANT SPEED & QUALITY ===")
    init_db()

    with Session(engine) as session:
        chat = ai_shopping_service.get_or_create_chat(
            session=session,
            user_identity="speed_test_user",
            user_type="customer",
            initial_title="Speed Test"
        )

        query = "mjhe ye stainless steel electric kettle ko order karna hay"
        print(f"\nUser Query: '{query}'")

        start_time = time.time()
        res = ai_shopping_service.process_ai_message(
            session=session,
            chat_id=chat.id,
            user_identity="speed_test_user",
            user_type="customer",
            content=query
        )
        elapsed = time.time() - start_time

        ai_msg = res["assistant_message"]["content"]
        prods = [p["name"] for p in res["assistant_message"]["products"]]

        print(f"\nAI Response Time: {elapsed:.2f} seconds ⚡")
        print("AI Message:", ai_msg)
        print("Recommended Products:", prods)

        assert elapsed < 4.0, f"Expected response time < 4.0s, got {elapsed:.2f}s"
        assert len(prods) > 0, "Expected kettle product card"
        assert any("kettle" in p.lower() for p in prods), "Expected kettle product in results"
        print("\n=== SPEED & ORDER FLOW TEST PASSED 100%! ===")

if __name__ == "__main__":
    test_speed_and_order_flow()
