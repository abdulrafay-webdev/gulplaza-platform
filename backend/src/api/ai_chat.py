import os
import base64
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from jose import jwt

from src.db.session import get_session
from src.models.ai_chat import (
    AIChat, 
    AIMessage, 
    AIChatCreate, 
    AIChatUpdate, 
    AIMessageCreate, 
    AIChatRead, 
    AIChatDetailRead
)
from src.models.customer import Customer
from src.services import customer_service, ai_shopping_service, image_service

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Unified authentication dependency:
    Resolves either Customer JWT or Clerk JWT token to derive user identity.
    """
    token = credentials.credentials
    # 1. Try Customer JWT first
    try:
        payload = jwt.decode(token, customer_service.SECRET_KEY, algorithms=[customer_service.ALGORITHM])
        customer_id = payload.get("sub")
        if customer_id:
            customer = session.get(Customer, int(customer_id))
            if customer:
                return {
                    "identity": f"customer:{customer.id}",
                    "type": "customer",
                    "id": customer.id,
                    "name": customer.full_name
                }
    except Exception:
        pass

    # 2. Fallback to Clerk JWT
    try:
        payload = jwt.get_unverified_claims(token)
        user_id = payload.get("sub")
        if user_id:
            return {
                "identity": f"clerk:{user_id}",
                "type": "clerk",
                "id": user_id,
                "name": "Marketplace Member"
            }
    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Please sign in to access your AI Shopping Assistant."
    )

@router.get("/chats", response_model=List[Dict[str, Any]])
def list_chats(
    user = Depends(get_authenticated_user),
    session: Session = Depends(get_session)
):
    """Retrieve all shopping chat sessions for the authenticated user."""
    return ai_shopping_service.get_user_chats(session, user["identity"])

@router.post("/chats", response_model=Dict[str, Any])
def create_chat(
    data: Optional[AIChatCreate] = None,
    user = Depends(get_authenticated_user),
    session: Session = Depends(get_session)
):
    """Create a new AI shopping conversation."""
    initial_title = None
    if data and data.initial_message:
        initial_title = data.initial_message[:35] + ("..." if len(data.initial_message) > 35 else "")

    chat = ai_shopping_service.get_or_create_chat(
        session, 
        user_identity=user["identity"], 
        user_type=user["type"],
        initial_title=initial_title
    )

    # If initial message provided, process it right away
    if data and (data.initial_message or data.image_url):
        return ai_shopping_service.process_ai_message(
            session=session,
            chat_id=chat.id,
            user_identity=user["identity"],
            user_type=user["type"],
            content=data.initial_message or "What do you recommend based on this image?",
            image_url=data.image_url
        )

    return {
        "chat": {
            "id": chat.id,
            "title": chat.title,
            "created_at": chat.created_at,
            "updated_at": chat.updated_at
        },
        "messages": []
    }

@router.get("/chats/{chat_id}", response_model=Dict[str, Any])
def get_chat(
    chat_id: int,
    user = Depends(get_authenticated_user),
    session: Session = Depends(get_session)
):
    """Get single conversation detail with all messages and hydrated product cards."""
    chat_data = ai_shopping_service.get_chat_detail(session, chat_id, user["identity"])
    if not chat_data:
        raise HTTPException(status_code=404, detail="Chat conversation not found.")
    return chat_data

@router.post("/chats/{chat_id}/messages", response_model=Dict[str, Any])
def send_message(
    chat_id: int,
    data: AIMessageCreate,
    user = Depends(get_authenticated_user),
    session: Session = Depends(get_session)
):
    """Send a user message/image to the AI Assistant and get real product recommendations."""
    if not data.content.strip() and not data.image_url:
        raise HTTPException(status_code=400, detail="Message content or image is required.")

    return ai_shopping_service.process_ai_message(
        session=session,
        chat_id=chat_id,
        user_identity=user["identity"],
        user_type=user["type"],
        content=data.content.strip(),
        image_url=data.image_url
    )

@router.patch("/chats/{chat_id}/title", response_model=Dict[str, Any])
def rename_chat(
    chat_id: int,
    data: AIChatUpdate,
    user = Depends(get_authenticated_user),
    session: Session = Depends(get_session)
):
    """Rename a chat title."""
    chat = session.get(AIChat, chat_id)
    if not chat or chat.user_identity != user["identity"]:
        raise HTTPException(status_code=404, detail="Chat not found.")

    chat.title = data.title.strip()
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return {"id": chat.id, "title": chat.title}

@router.delete("/chats/{chat_id}", response_model=Dict[str, Any])
def delete_chat(
    chat_id: int,
    user = Depends(get_authenticated_user),
    session: Session = Depends(get_session)
):
    """Permanently delete a chat conversation and its messages."""
    chat = session.get(AIChat, chat_id)
    if not chat or chat.user_identity != user["identity"]:
        raise HTTPException(status_code=404, detail="Chat not found.")

    session.delete(chat)
    session.commit()
    return {"message": "Chat conversation deleted successfully."}

@router.post("/upload-image", response_model=Dict[str, str])
async def upload_chat_image(
    file: UploadFile = File(...),
    user = Depends(get_authenticated_user)
):
    """Upload visual shopping query image via ImageKit."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit.")

    try:
        # Use existing imagekit service to upload
        import uuid
        file_name = f"chat_{uuid.uuid4().hex[:8]}_{file.filename}"
        upload_result = image_service.imagekit.upload_file(
            file=file_bytes,
            file_name=file_name,
            options={
                "folder": "/ai-plaza/chat-uploads",
                "use_unique_file_name": True
            }
        )
        url = upload_result.response_metadata.raw.get("url") or upload_result.url
        return {"url": url}
    except Exception as e:
        logger.error(f"ImageKit upload failed: {e}. Using base64 data URI fallback.")
        # Fallback to base64 Data URI if ImageKit fails
        b64 = base64.b64encode(file_bytes).decode("utf-8")
        data_uri = f"data:{file.content_type};base64,{b64}"
        return {"url": data_uri}

from pydantic import BaseModel
from src.models.category import Category
import json

class GenerateDescriptionRequest(BaseModel):
    title: str
    category_id: Optional[int] = None

def _clean_str(val, default_text=""):
    if val is None:
        return default_text
    if isinstance(val, str):
        return val.strip() or default_text
    if isinstance(val, (list, tuple)):
        bullets = [f"• {str(item).lstrip('•- *').strip()}" for item in val if str(item).strip()]
        return "\n".join(bullets) if bullets else default_text
    if isinstance(val, dict):
        lines = [f"• {k}: {v}" for k, v in val.items() if str(v).strip()]
        return "\n".join(lines) if lines else default_text
    return str(val).strip() or default_text

@router.post("/generate-description")
def generate_product_description(
    data: GenerateDescriptionRequest,
    session: Session = Depends(get_session)
):
    """Auto-generate high converting product description using AI."""
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    cat_name = "General"
    if data.category_id:
        cat = session.get(Category, data.category_id)
        if cat:
            cat_name = cat.name

    provider = ai_shopping_service.get_ai_provider()
    prompt = (
        f"You are an expert ecommerce copywriter for Pakistan's AI Plaza marketplace. "
        f"Generate a short summary (1-2 punchy sentences) and a detailed bulleted product description for:\n"
        f"Product Title: {title}\n"
        f"Category: {cat_name}\n\n"
        f"Return ONLY a valid JSON object with keys 'short_description' and 'long_description'. "
        f"Both 'short_description' and 'long_description' MUST be single string values, NOT arrays or lists. "
        f"No markdown fences."
    )
    
    try:
        raw_text = provider.generate_text(prompt)
        clean_json = raw_text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean_json)
        return {
            "short_description": _clean_str(parsed.get("short_description"), f"Premium quality {title} with long-lasting performance."),
            "long_description": _clean_str(parsed.get("long_description"), f"• High quality {title}\n• Ideal for daily use\n• 100% genuine guaranteed")
        }
    except Exception as e:
        logger.error(f"Description generation fallback: {e}")
        return {
            "short_description": f"Top quality {title} designed for reliable durability and peak performance.",
            "long_description": f"• Genuine quality guaranteed\n• Premium {cat_name} product\n• Fast delivery across Pakistan\n• Reliable build and sleek design"
        }
