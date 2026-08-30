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

# Common Pakistani Roman Urdu / typo synonyms dictionary
SYNONYM_MAP = {
    "cattle": ["kettle", "electric kettle", "tea"],
    "ketle": ["kettle", "electric kettle"],
    "ketal": ["kettle", "electric kettle"],
    "kettal": ["kettle", "electric kettle"],
    "sitchen": ["cookware", "kitchen", "crockery", "granite", "pot", "pan"],
    "kichen": ["cookware", "kitchen", "crockery", "granite", "pot", "pan"],
    "bartan": ["cookware", "granite", "non-stick", "pot", "pan", "crockery"],
    "handi": ["cookware", "granite", "pot", "pan"],
    "soot": ["suit", "coatpant", "pant shirt", "shalwar"],
    "pent": ["pant", "trouser", "pant shirt"],
    "pnt": ["pant", "trouser", "pant shirt"],
    "jootay": ["shoes", "oxford", "sneakers", "leather"],
    "jote": ["shoes", "oxford", "sneakers", "leather"],
    "ghari": ["smartwatch", "watch", "amoled"],
    "itarr": ["oud", "perfume", "parfum", "fragrance"],
    "khushbu": ["oud", "perfume", "parfum"],
    "fryer": ["air fryer", "digital air fryer"],
    "vacuum": ["robotic vacuum", "vacuum cleaner"],
}

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
    Intelligent candidate search:
    1. Typo / phonetic expansion
    2. Gender & Demographic Disqualification (e.g. no women kurti for boys suit)
    3. Multi-keyword relevance scoring across product name, descriptions, category, and shop
    """
    # If the user query is very ambiguous and needs clarification, return empty candidates to prompt clarification
    if intent.get("needs_clarification") and not intent.get("target_item") and not intent.get("search_terms"):
        return []

    all_products = session.exec(
        select(Product)
        .where(Product.is_deleted == False, Product.is_active == True, Product.stock_quantity > 0)
        .options(selectinload(Product.shop))
    ).all()

    gender_target = (intent.get("gender_target") or "").lower()
    negative_terms = [t.lower() for t in intent.get("negative_terms", [])]
    raw_search_terms = [t.lower() for t in intent.get("search_terms", []) if len(t) >= 2]
    target_item = (intent.get("target_item") or "").lower()
    category_hint = (intent.get("category_hint") or "").lower()
    color = (intent.get("color") or "").lower()
    max_price = intent.get("max_price")
    min_price = intent.get("min_price")

    # Expand search terms using synonym map
    search_terms = list(raw_search_terms)
    for term in raw_search_terms:
        if term in SYNONYM_MAP:
            search_terms.extend(SYNONYM_MAP[term])
    if target_item in SYNONYM_MAP:
        search_terms.extend(SYNONYM_MAP[target_item])

    search_terms = list(set(search_terms))

    # Demographic keywords
    women_apparel_keywords = ["kurti", "lawn", "dupatta", "chiffon", "ladies", "women", "frock", "lehenga", "female", "girl", "bridal"]
    men_apparel_keywords = ["coatpant", "coat pant", "pant shirt", "groom", "gents", "mens", "men's", "linen kurta", "oxford"]

    scored_candidates = []

    for p in all_products:
        p_name = (p.name or "").lower()
        p_desc = ((p.short_description or "") + " " + (p.long_description or "")).lower()
        p_shop = (p.shop.name if p.shop else "").lower()
        combined_text = f"{p_name} {p_desc} {p_shop}"

        # 1. Price check
        if max_price and p.price > float(max_price):
            continue
        if min_price and p.price < float(min_price):
            continue

        # 2. Gender / Demographic Negative Filtering
        if gender_target in ["men", "boys", "male"]:
            # Disqualify if product contains women's markers
            if any(w in p_name for w in women_apparel_keywords) or any(neg in p_name for neg in negative_terms):
                continue

        if gender_target in ["women", "girls", "female"]:
            # Disqualify if product is explicitly men's coatpant / groom
            if any(w in p_name for w in ["groom wedding", "boys coat", "gents"]):
                continue

        # 3. Calculate Relevance Score
        score = 0

        # Exact target item matching
        if target_item:
            if target_item in p_name:
                score += 35
            elif target_item in p_desc:
                score += 15

        # Search terms matching
        for term in search_terms:
            if term in p_name:
                score += 15
            elif term in p_desc:
                score += 8
            elif term in p_shop:
                score += 5

        # Kettle / Tea Intent Special Scoring
        if any(k in target_item or k in search_terms for k in ["kettle", "cattle", "tea", "electric kettle"]):
            if "kettle" in p_name:
                score += 45
            if "stainless steel" in p_name:
                score += 15

        # Kitchen / Cookware Intent Special Scoring
        if category_hint in ["crockery & kitchenware", "home appliances"] or any(k in target_item for k in ["cookware", "kitchen", "kettle", "fryer", "crockery", "pot", "pan"]):
            if any(k in p_name for k in ["cookware", "granite", "non-stick", "kettle", "fryer", "vacuum", "crockery"]):
                score += 35
            if any(k in p_shop for k in ["crockery", "cookware", "kitchen", "appliances", "electronics"]):
                score += 15

        # Men's Suit / Apparel Intent Special Scoring
        if gender_target in ["men", "boys"] and any(k in target_item or k in search_terms for k in ["suit", "coat", "pant", "shirt", "office"]):
            if any(k in p_name for k in ["coatpant", "coat pant", "pant shirt", "linen kurta", "oxford"]):
                score += 35

        # Shoes Intent Special Scoring
        if any(k in target_item or k in search_terms for k in ["shoes", "shoe", "oxford", "sneakers", "leather"]):
            if any(k in p_name for k in ["shoes", "oxford", "sneakers", "leather"]):
                score += 35

        # Color match
        if color and color in combined_text:
            score += 8

        # If product has a positive relevance score, add to candidates
        if score > 0:
            scored_candidates.append({
                "product": p,
                "score": score
            })

    # Sort candidates by relevance score descending
    scored_candidates.sort(key=lambda x: x["score"], reverse=True)

    # Return top 8 candidate products
    candidates = []
    for item in scored_candidates[:8]:
        p = item["product"]
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

    # 3. Retrieve Candidate Products from Database (Intelligent Demographics & Scoring)
    candidate_products = search_candidate_products(session, intent)
    logger.info(f"Found {len(candidate_products)} candidate/alternate products in marketplace")

    # 4. Generate AI Shopping Advice & Recommendation Ranking
    ai_response_text, recommended_ids = ai.generate_shopping_recommendation(
        user_message=content, 
        candidate_products=candidate_products, 
        image_url=image_url,
        intent=intent
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
