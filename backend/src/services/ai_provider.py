import os
import json
import time
import logging
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
import httpx

logger = logging.getLogger(__name__)

SUPPORTED_OPENAI_MODELS = [
    "gpt-4o-mini",
    "gpt-4o"
]

class AIProvider(ABC):
    @abstractmethod
    def process_conversational_turn(
        self,
        user_message: str,
        catalog_products: List[Dict[str, Any]],
        image_url: Optional[str] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Unified single-pass conversational AI reasoning, recommendation, and intent processing."""
        pass

    @abstractmethod
    def generate_text(self, prompt: str) -> str:
        """Generate copy/text from prompt for product descriptions or marketplace utilities."""
        pass


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o-mini"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model
        self._client = None

    def _get_client(self):
        """Lazy load OpenAI client to avoid unnecessary overhead."""
        if not self.api_key:
            return None
        if self._client is None:
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=self.api_key, timeout=30.0)
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
                return None
        return self._client

    def generate_text(self, prompt: str) -> str:
        """Generate high-converting marketing or product text using OpenAI."""
        client = self._get_client()
        if not client:
            logger.warning("OpenAI API key not configured for generate_text.")
            return ""

        models_to_try = [self.model] + [m for m in SUPPORTED_OPENAI_MODELS if m != self.model]

        for model_name in models_to_try:
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": "You are an expert ecommerce product catalog copywriter for AI Plaza, Pakistan."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3
                )
                if response.choices and response.choices[0].message.content:
                    return response.choices[0].message.content.strip()
            except Exception as e:
                logger.warning(f"OpenAI text generation attempt on {model_name} failed: {e}")
                continue

        return ""

    def process_conversational_turn(
        self,
        user_message: str,
        catalog_products: List[Dict[str, Any]],
        image_url: Optional[str] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Unified single-pass high-speed shopping intelligence engine powered by OpenAI:
        Handles intent detection, multi-turn memory, image understanding, order requests,
        clarification, styling advice, and product card ranking in ONE roundtrip.
        """
        client = self._get_client()
        if not client:
            logger.warning("OPENAI_API_KEY not configured. Using rule-based catalog matching fallback.")
            return self._fallback_conversational_turn(user_message, catalog_products, history=history)

        system_instruction = (
            "You are the world-class AI Personal Shopping Advisor for 'AI Plaza', Pakistan's premier online multi-vendor marketplace.\n\n"
            "CORE INTELLIGENCE & CONVERSATION RULES:\n"
            "1. TONE & VOCABULARY:\n"
            "   - Warm, natural, polite Pakistani Roman Urdu (e.g. 'Assalam-o-Alaikum!', 'Ji bilkul', 'Aap ke liye', 'Marketplace mein', 'Shukriya') or English if user writes in English.\n"
            "   - STRICTLY FORBIDDEN: NEVER use Hindi words like 'swagat', 'namaste', 'dhanyawad', 'kripya', 'mitra'.\n"
            "   - Sound like an expert in-store consultant: helpful, respectful, and sharp.\n\n"
            "2. ORDER INTENT & CHECKOUT GUIDANCE:\n"
            "   - If the user says 'mjhe ye order karna hay', 'buy karna hai', 'purchase karna hai', 'cart mein add karo':\n"
            "     Guide them warmly: explain that they can click the 'Add Cart' button right on the product card below and proceed to checkout for quick delivery across Pakistan (3-5 days). Return the exact product ID in recommended_product_ids!\n\n"
            "3. MULTI-TURN CONVERSATION & MEMORY:\n"
            "   - Understand context from previous messages (e.g., if user mentioned having a red shirt, and asks 'iske saath konsi pant achi lagegi?', recommend matching dark pants/trousers like Product #17 or #13).\n"
            "   - If user says 'ye pasand nahi aya' / 'nhi shoes nhi', strictly exclude rejected items and suggest alternative gift categories (Perfumes, Smartwatches, Earbuds, Cookware).\n"
            "   - If user asks a general question ('Delivery kitne din mein hoti hai?', 'Aap kaun ho?'), answer naturally with ZERO product cards (recommended_product_ids: []).\n\n"
            "4. CLARIFICATION ON VAGUE QUERIES:\n"
            "   - If user asks an underspecified request ('Mujhe shoes chahiye', 'Kapray dikhao') without style/budget:\n"
            "     Ask a polite clarifying question (e.g. 'Kis type ke shoes chahiye — formal, casual ya sports? Aur aapka budget kya hai?') with recommended_product_ids: [].\n\n"
            "5. PRODUCT RETRIEVAL FROM REAL CATALOG ONLY:\n"
            "   - You are provided with 'available_marketplace_products'. Select product IDs STRICTLY from this list.\n"
            "   - If relevant products exist, return their IDs in 'recommended_product_ids' and explain why they fit the user's need.\n"
            "   - If no relevant product exists in catalog, respond honestly without hallucinating: 'Filhal marketplace mein yeh product available nahi hai. Aap kuch din baad dobara check kar lijiye ga, main restock karwanay ki koshish karta hoon!' with recommended_product_ids: [].\n\n"
            "RETURN STRICT JSON FORMAT ONLY:\n"
            "{\n"
            '  "message": "Your conversational response in natural Roman Urdu.",\n'
            '  "recommended_product_ids": [id1, id2],\n'
            '  "demand_keyword": "e.g. electric kettle, formal shoes, pant, gift ideas" | null,\n'
            '  "category_hint": "e.g. Home Appliances, Clothes & Apparel, Shoes & Footwear" | null\n'
            "}"
        )

        messages: List[Dict[str, Any]] = [
            {"role": "system", "content": system_instruction}
        ]

        # Formatted Conversation History (up to 8 past turns)
        if history:
            for h in history[-8:]:
                role = "user" if h.get("role") == "user" else "assistant"
                content_text = h.get("content", "")
                prods_context = h.get("products_context", "")
                img_ctx = " [Image attached]" if h.get("image_url") else ""
                
                full_msg = f"{content_text}{img_ctx}"
                if prods_context and role == "assistant":
                    full_msg += f"\n[Previously Recommended Products: {prods_context}]"

                messages.append({
                    "role": role,
                    "content": full_msg
                })

        # Latest Image Part or Reference Image from History
        active_img_url = image_url
        if not active_img_url and history:
            for h in reversed(history):
                if h.get("image_url"):
                    active_img_url = h.get("image_url")
                    break

        # Compact Product Catalog Representation
        catalog_summary = []
        for p in catalog_products:
            catalog_summary.append({
                "id": p["id"],
                "name": p["name"],
                "price": p["price"],
                "shop": p["shop_name"],
                "description": p.get("short_description", "")
            })

        prompt_context = {
            "latest_user_message": user_message,
            "has_image": bool(active_img_url),
            "available_marketplace_products": catalog_summary
        }

        context_prompt = (
            f"Context & Available Marketplace Products:\n"
            f"{json.dumps(prompt_context, indent=2)}\n\n"
            f"Generate your response and select matching product IDs strictly from the available marketplace products."
        )

        # Build user turn payload (with optional vision block)
        if active_img_url:
            user_content: List[Dict[str, Any]] = [
                {"type": "text", "text": context_prompt},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": active_img_url,
                        "detail": "low"
                    }
                }
            ]
            messages.append({"role": "user", "content": user_content})
        else:
            messages.append({"role": "user", "content": context_prompt})

        models_to_try = [self.model] + [m for m in SUPPORTED_OPENAI_MODELS if m != self.model]

        for model_name in models_to_try:
            for attempt in range(1, 3):
                try:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        response_format={"type": "json_object"},
                        temperature=0.2
                    )

                    raw_text = response.choices[0].message.content
                    if not raw_text:
                        continue

                    parsed = json.loads(raw_text)
                    ids = parsed.get("recommended_product_ids", [])
                    valid_ids = [p["id"] for p in catalog_products]
                    final_ids = [int(i) for i in ids if int(i) in valid_ids]

                    return {
                        "message": parsed.get("message", "Aapke liye ye behtareen options hain:"),
                        "recommended_product_ids": final_ids,
                        "demand_keyword": parsed.get("demand_keyword"),
                        "category_hint": parsed.get("category_hint")
                    }
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON response from OpenAI ({model_name}): {e}")
                    break
                except Exception as e:
                    logger.warning(f"OpenAI API error on {model_name} (attempt {attempt}): {e}")
                    time.sleep(1.0 * attempt)

        # If all OpenAI model attempts fail, fall back gracefully
        return self._fallback_conversational_turn(user_message, catalog_products, history=history)

    def _fallback_conversational_turn(
        self,
        user_message: str,
        catalog_products: List[Dict[str, Any]],
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Fast rule-based fallback response when API is unavailable."""
        msg = user_message.lower()
        import re
        words = set(re.findall(r"\b\w+\b", msg))

        # Greetings
        if words.intersection({"salam", "assalam", "hello", "hi", "hey"}):
            return {
                "message": "Walaikum Assalam! Main AI Plaza ka Shopping Assistant hoon. Aaj main aapki shopping mein kya madad kar sakta hoon?",
                "recommended_product_ids": [],
                "demand_keyword": None,
                "category_hint": None
            }

        # Small talk / thanks
        if any(w in msg for w in ["shukriya", "thanks", "theek", "ok"]):
            return {
                "message": "Bohat shukriya! Agar mazeed koi product dekhna ho ya order place karna ho toh zaroor batayein.",
                "recommended_product_ids": [],
                "demand_keyword": None,
                "category_hint": None
            }

        # Order guidance
        if any(w in msg for w in ["order", "buy", "khareed", "purchase", "kettle"]):
            kettle_ids = [p["id"] for p in catalog_products if "kettle" in p["name"].lower()]
            if kettle_ids:
                return {
                    "message": "Ji bilkul! Is electric kettle ko order karne ke liye neeche diye gaye 'Add Cart' button par click karein aur checkout proceed karein. Yeh Apex Home Appliances ki taraf se fast boiling aur auto shut-off ke saath aati hai.",
                    "recommended_product_ids": kettle_ids[:1],
                    "demand_keyword": "electric kettle",
                    "category_hint": "Home Appliances"
                }

        # General search fallback
        matching_ids = []
        for p in catalog_products:
            p_name = p["name"].lower()
            if any(word in p_name for word in msg.split() if len(word) > 3):
                matching_ids.append(p["id"])

        if matching_ids:
            return {
                "message": "Aapki request ke mutabiq ye behtareen options marketplace mein available hain:",
                "recommended_product_ids": matching_ids[:3],
                "demand_keyword": msg[:30],
                "category_hint": None
            }

        return {
            "message": "Filhal marketplace mein is requirement ke mutabiq exact item available nahi hai. Aap kuch din baad dobara check kar lijiye ga, main restock karwanay ki koshish karta hoon!",
            "recommended_product_ids": [],
            "demand_keyword": None,
            "category_hint": None
        }


# Retained for fallback compatibility if needed
class GeminiProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-3.6-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = model

    def generate_text(self, prompt: str) -> str:
        return ""

    def process_conversational_turn(
        self,
        user_message: str,
        catalog_products: List[Dict[str, Any]],
        image_url: Optional[str] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        return OpenAIProvider()._fallback_conversational_turn(user_message, catalog_products, history)


def get_ai_provider() -> AIProvider:
    """Factory method returning the primary OpenAI provider instance."""
    return OpenAIProvider()
