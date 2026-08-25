import json
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlmodel import Session, select
from sqlalchemy import or_, and_
from sqlalchemy.orm import selectinload

from src.models.ai_chat import AIChat, AIMessage, AIDemandInsight
from src.models.product import Product, ProductImage
from src.models.shop import Shop
from src.models.review import Review
from src.services.ai_provider import get_ai_provider

logger = logging.getLogger(__name__)

def record_customer_demand(
    session: Session, 
    query_text: str, 
    category_hint: Optional[str] = None, 
    had_direct_match: bool = True
):
    """Track search demand so sellers can see trending customer requests on their dashboard."""
    try:
        clean_query = query_text.strip().lower()
        if not clean_query or len(clean_query) < 3:
            return

        # Find existing demand record
        statement = select(AIDemandInsight).where(AIDemandInsight.query_text == clean_query)
        existing = session.exec(statement).first()

        if existing:
            existing.request_count += 1
            existing.last_requested_at = datetime.utcnow()
            if not had_direct_match:
                existing.had_direct_match = False
            if category_hint and not existing.category_hint:
                existing.category_hint = category_hint
            session.add(existing)
        else:
            new_insight = AIDemandInsight(
                query_text=clean_query,
                category_hint=category_hint,
                request_count=1,
                had_direct_match=had_direct_match,
                last_requested_at=datetime.utcnow()
            )
            session.add(new_insight)
        session.commit()
    except Exception as e:
        logger.error(f"Failed to record customer demand insight: {e}")
        session.rollback()

def get_or_create_chat(
    session: Session, 
    user_identity: str, 
    user_type: str = "customer", 
    chat_id: Optional[int] = None,
    initial_title: Optional[str] = None
) -> AIChat:
    """Retrieve existing chat belonging to user or create a new one."""
    if chat_id:
        chat = session.get(AIChat, chat_id)
        if chat and chat.user_identity == user_identity:
            return chat

    title = initial_title or "New Shopping Conversation"
    chat = AIChat(
        user_identity=user_identity,
        user_type=user_type,
        title=title,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return chat

def get_user_chats(session: Session, user_identity: str) -> List[Dict[str, Any]]:
    """List all chats for an authenticated user sorted by latest activity."""
    statement = (
        select(AIChat)
        .where(AIChat.user_identity == user_identity)
        .order_by(AIChat.updated_at.desc())
    )
    chats = session.exec(statement).all()

    result = []
    for c in chats:
        messages_count = len(c.messages)
        last_msg = c.messages[-1].content if c.messages else None
        result.append({
            "id": c.id,
            "title": c.title,
            "user_identity": c.user_identity,
            "user_type": c.user_type,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "messages_count": messages_count,
            "last_message": last_msg
        })
    return result

def get_chat_detail(session: Session, chat_id: int, user_identity: str) -> Optional[Dict[str, Any]]:
    """Fetch complete chat history with hydrated product recommendation cards."""
    chat = session.get(AIChat, chat_id)
    if not chat or chat.user_identity != user_identity:
        return None

    messages_data = []
    for msg in chat.messages:
        product_cards = []
        if msg.product_ids_json:
            try:
                p_ids = json.loads(msg.product_ids_json)
                if isinstance(p_ids, list) and p_ids:
                    product_cards = hydrate_product_cards(session, p_ids)
            except Exception as e:
                logger.error(f"Error parsing product_ids_json for message {msg.id}: {e}")

        messages_data.append({
            "id": msg.id,
            "chat_id": msg.chat_id,
            "role": msg.role,
            "content": msg.content,
            "message_type": msg.message_type,
            "image_url": msg.image_url,
            "product_ids_json": msg.product_ids_json,
            "created_at": msg.created_at,
            "products": product_cards
        })

    return {
        "id": chat.id,
        "title": chat.title,
        "user_identity": chat.user_identity,
        "user_type": chat.user_type,
        "created_at": chat.created_at,
        "updated_at": chat.updated_at,
        "messages": messages_data
    }

def hydrate_product_cards(session: Session, product_ids: List[int]) -> List[Dict[str, Any]]:
    """Retrieve full product objects with shop information and images."""
    if not product_ids:
        return []

    statement = (
        select(Product)
        .where(Product.id.in_(product_ids), Product.is_deleted == False)
        .options(selectinload(Product.images), selectinload(Product.shop))
    )
    products = session.exec(statement).all()

    # Preserve ranking order from product_ids
    product_map = {p.id: p for p in products}
    hydrated = []
    for pid in product_ids:
        if pid in product_map:
            p = product_map[pid]
            thumb = p.image_url
            if not thumb and p.images:
                thumb = p.images[0].url

            hydrated.append({
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "stock_quantity": p.stock_quantity,
                "image_url": thumb,
                "short_description": p.short_description,
                "shop_id": p.shop_id,
                "shop_name": p.shop.name if p.shop else "AI Plaza Store",
                "is_active": p.is_active
            })
    return hydrated

def search_candidate_products(session: Session, intent: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Query live marketplace database for exact matching or closest alternative products.
    """
    query = select(Product).where(
        Product.is_deleted == False,
        Product.is_active == True,
        Product.stock_quantity > 0
    ).options(selectinload(Product.shop))

    # Apply Price Filters
    if intent.get("max_price"):
        try:
            query = query.where(Product.price <= float(intent["max_price"]))
        except Exception:
            pass

    if intent.get("min_price"):
        try:
            query = query.where(Product.price >= float(intent["min_price"]))
        except Exception:
            pass

    search_terms = intent.get("search_terms", [])
    target_item = intent.get("target_item")
    color = intent.get("color")
    category_hint = intent.get("category_hint")

    conditions = []
    if target_item:
        conditions.append(Product.name.ilike(f"%{target_item}%"))
        conditions.append(Product.short_description.ilike(f"%{target_item}%"))

    for term in search_terms:
        if len(term) >= 3:
            conditions.append(Product.name.ilike(f"%{term}%"))
            conditions.append(Product.short_description.ilike(f"%{term}%"))

    if color:
        conditions.append(Product.name.ilike(f"%{color}%"))
        conditions.append(Product.short_description.ilike(f"%{color}%"))

    if conditions:
        query = query.where(or_(*conditions))

    results = session.exec(query.limit(8)).all()

    # If exact search returned results, return them
    if len(results) >= 2:
        return [
            {
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "shop_name": p.shop.name if p.shop else "AI Plaza Partner",
                "short_description": p.short_description,
                "stock_quantity": p.stock_quantity
            } for p in results
        ]

    # ALTERNATIVES RETRIEVAL:
    # If exact item was not found or only 1 found, fetch closest alternative products from same category or related items
    alt_conditions = []
    if category_hint:
        alt_conditions.append(Product.name.ilike(f"%{category_hint}%"))
        alt_conditions.append(Product.short_description.ilike(f"%{category_hint}%"))

    # Add general category items as alternatives
    alt_query = select(Product).where(
        Product.is_deleted == False,
        Product.is_active == True,
        Product.stock_quantity > 0
    ).options(selectinload(Product.shop))

    if alt_conditions:
        alt_query = alt_query.where(or_(*alt_conditions))

    alt_results = session.exec(alt_query.limit(6)).all()

    # Merge results and alternatives
    combined = list(results)
    seen_ids = {p.id for p in combined}
    for alt in alt_results:
        if alt.id not in seen_ids:
            combined.append(alt)
            seen_ids.add(alt.id)

    candidates = []
    for p in combined:
        candidates.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "shop_name": p.shop.name if p.shop else "AI Plaza Partner",
            "short_description": p.short_description,
            "stock_quantity": p.stock_quantity
        })
    return candidates

def process_ai_message(
    session: Session,
    chat_id: int,
    user_identity: str,
    user_type: str,
    content: str,
    image_url: Optional[str] = None
) -> Dict[str, Any]:
    """Execute complete Shopping Assistant RAG pipeline."""
    chat = get_or_create_chat(session, user_identity, user_type, chat_id=chat_id)

    # 1. Save User Message
    user_msg = AIMessage(
        chat_id=chat.id,
        role="user",
        content=content,
        message_type="image" if image_url and not content else ("mixed" if image_url else "text"),
        image_url=image_url,
        created_at=datetime.utcnow()
    )
    session.add(user_msg)
    session.flush()

    # 2. Extract Intent with AI Provider
    ai = get_ai_provider()
    intent = ai.extract_shopping_intent(content, image_url=image_url)
    logger.info(f"Extracted AI Shopping Intent: {intent}")

    # 3. Retrieve Candidate Products from Database (Exact + Alternatives)
    candidate_products = search_candidate_products(session, intent)
    logger.info(f"Found {len(candidate_products)} candidate/alternate products in marketplace")

    # 4. Generate AI Shopping Advice & Recommendation Ranking
    ai_response_text, recommended_ids = ai.generate_shopping_recommendation(
        content, 
        candidate_products, 
        image_url=image_url
    )

    # 5. Record Demand Insight for Seller Dashboard
    record_customer_demand(
        session=session,
        query_text=content,
        category_hint=intent.get("category_hint"),
        had_direct_match=bool(recommended_ids)
    )

    # 6. Save Assistant Message
    assistant_msg = AIMessage(
        chat_id=chat.id,
        role="assistant",
        content=ai_response_text,
        message_type="product_recommendation" if recommended_ids else "text",
        product_ids_json=json.dumps(recommended_ids) if recommended_ids else None,
        created_at=datetime.utcnow()
    )
    session.add(assistant_msg)

    # 7. Auto-generate chat title if it's the first message
    if chat.title == "New Shopping Conversation" or chat.title == "Shopping Assistant Chat":
        clean_title = content[:35] + ("..." if len(content) > 35 else "")
        if image_url and not content:
            clean_title = "Visual Shopping Search"
        chat.title = clean_title

    chat.updated_at = datetime.utcnow()
    session.commit()
    session.refresh(assistant_msg)

    # 8. Hydrate recommended product cards for instant UI presentation
    product_cards = hydrate_product_cards(session, recommended_ids)

    return {
        "user_message": {
            "id": user_msg.id,
            "chat_id": chat.id,
            "role": "user",
            "content": user_msg.content,
            "image_url": user_msg.image_url,
            "created_at": user_msg.created_at
        },
        "assistant_message": {
            "id": assistant_msg.id,
            "chat_id": chat.id,
            "role": "assistant",
            "content": assistant_msg.content,
            "message_type": assistant_msg.message_type,
            "image_url": assistant_msg.image_url,
            "product_ids_json": assistant_msg.product_ids_json,
            "created_at": assistant_msg.created_at,
            "products": product_cards
        },
        "chat": {
            "id": chat.id,
            "title": chat.title,
            "updated_at": chat.updated_at
        }
    }
