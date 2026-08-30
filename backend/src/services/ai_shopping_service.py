import re
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
from src.models.category import Category
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
    """List all chats for an authenticated user with eager message loading to prevent N+1 queries."""
    statement = (
        select(AIChat)
        .where(AIChat.user_identity == user_identity)
        .options(selectinload(AIChat.messages))
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


_STOPWORDS = {
    "chahiye", "chahye", "dikhao", "mujhe", "mjhe", "kya", "hai", "hay",
    "karo", "karna", "keliye", "liye", "under", "with", "good", "best",
    "the", "and", "for", "koi", "acha", "achi", "sasta", "please",
}

def _keywords(query: str) -> List[str]:
    """Extract meaningful search keywords from a user message."""
    words = [w.strip(".,!?()").lower() for w in (query or "").split()]
    return [w for w in words if len(w) > 3 and w not in _STOPWORDS][:6]


def get_active_catalog_products(
    session: Session,
    query: str = "",
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """Fetch active, in-stock products, prioritising keyword matches."""
    base_filters = [
        Product.is_deleted == False,
        Product.is_active == True,
        Product.stock_quantity > 0,
    ]

    selected: Dict[int, Any] = {}
    kws = _keywords(query)

    if kws:
        conds = []
        for kw in kws:
            like = f"%{kw}%"
            conds.append(Product.name.ilike(like))
            conds.append(Product.short_description.ilike(like))
        matches = session.exec(
            select(Product).where(*base_filters, or_(*conds))
            .options(selectinload(Product.shop))
            .limit(limit)
        ).all()
        selected = {p.id: p for p in matches}

    # Backfill with recent catalog so the model can still cross-sell
    if len(selected) < limit:
        fill = session.exec(
            select(Product).where(*base_filters)
            .options(selectinload(Product.shop))
            .order_by(Product.id.desc())
            .limit(limit - len(selected))
        ).all()
        for p in fill:
            selected.setdefault(p.id, p)

    return [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "shop_name": p.shop.name if p.shop else "AI Plaza Store",
            "short_description": p.short_description or "",
            "stock_quantity": p.stock_quantity,
        }
        for p in list(selected.values())[:limit]
    ]


def _sanitize_demand_keyword(raw: Optional[str], fallback: str) -> str:
    """Clean and truncate demand keyword to prevent dashboard pollution."""
    text = (raw or fallback or "").strip()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s&+-]", "", text, flags=re.UNICODE)
    return text[:60].strip().lower()


def process_ai_message(
    session: Session,
    chat_id: int,
    user_identity: str,
    user_type: str,
    content: str,
    image_url: Optional[str] = None
) -> Dict[str, Any]:
    """Execute shopping assistant pipeline with conversation memory and product recommendations."""
    chat = get_or_create_chat(session, user_identity, user_type, chat_id=chat_id)

    # 1. Load recent conversation history with batched product hydration
    recent = chat.messages[-10:]

    all_ids: List[int] = []
    per_msg_ids: Dict[int, List[int]] = {}
    for m in recent:
        if not m.product_ids_json:
            continue
        try:
            pids = json.loads(m.product_ids_json)
        except Exception:
            continue
        if isinstance(pids, list) and pids:
            clean = [int(p) for p in pids if isinstance(p, (int, str)) and str(p).isdigit()]
            per_msg_ids[m.id] = clean
            all_ids.extend(clean)

    card_map: Dict[int, Dict[str, Any]] = {}
    if all_ids:
        card_map = {c["id"]: c for c in hydrate_product_cards(session, list(dict.fromkeys(all_ids)))}

    history = []
    for m in recent:
        prods_summary = ""
        ids = per_msg_ids.get(m.id)
        if ids:
            names = [
                f"#{card_map[i]['id']} {card_map[i]['name']} (Rs. {card_map[i]['price']})"
                for i in ids if i in card_map
            ]
            if names:
                prods_summary = "Recommended: " + ", ".join(names)
        history.append({
            "role": m.role,
            "content": m.content,
            "image_url": m.image_url,
            "products_context": prods_summary,
        })

    # 2. Save Current User Message to DB
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

    # 3. Retrieve Active Marketplace Catalog (keyword-filtered, limited)
    catalog_products = get_active_catalog_products(session, query=content, limit=50)

    # 4. Execute Unified Conversational Turn in Single Gemini Call
    ai = get_ai_provider()
    result = ai.process_conversational_turn(
        user_message=content,
        catalog_products=catalog_products,
        image_url=image_url,
        history=history
    )

    ai_response_text = result.get("message") or "Aapke liye ye behtareen options hain:"
    recommended_ids = result.get("recommended_product_ids", [])
    demand_keyword = _sanitize_demand_keyword(result.get("demand_keyword"), content)

    # 5. Save Assistant Message to DB
    assistant_msg = AIMessage(
        chat_id=chat.id,
        role="assistant",
        content=ai_response_text,
        message_type="product_recommendation" if recommended_ids else "text",
        product_ids_json=json.dumps(recommended_ids) if recommended_ids else None,
        created_at=datetime.utcnow()
    )
    session.add(assistant_msg)

    # 6. Auto-generate chat title if it's the first message
    if chat.title == "New Shopping Conversation" or chat.title == "Shopping Assistant Chat":
        clean_title = content[:35] + ("..." if len(content) > 35 else "")
        if image_url and not content:
            clean_title = "Visual Shopping Search"
        chat.title = clean_title

    chat.updated_at = datetime.utcnow()
    session.commit()
    session.refresh(assistant_msg)

    # 7. Record Demand Insight AFTER commit so rollback can never discard messages
    if recommended_ids or len(content.split()) >= 2:
        record_customer_demand(
            session=session,
            query_text=demand_keyword,
            category_hint=result.get("category_hint"),
            had_direct_match=bool(recommended_ids)
        )

    # 8. Hydrate recommended product cards for UI presentation
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
