import os
import json
import time
import base64
import logging
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
import httpx

logger = logging.getLogger(__name__)

# Fallback models in priority order
SUPPORTED_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash"
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

class GeminiProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-3.6-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = model

    def _fetch_image_base64(self, image_url: str) -> Optional[Tuple[str, str]]:
        """Extract image base64 data and mime type from Data URI or HTTP URL."""
        if not image_url:
            return None

        # 1. Direct Base64 Data URI
        if image_url.startswith("data:"):
            try:
                header, b64_data = image_url.split(",", 1)
                mime = header.split(";")[0].replace("data:", "")
                return b64_data, mime
            except Exception as e:
                logger.warning(f"Failed to parse base64 data URI: {e}")
                return None

        # 2. Remote HTTP/HTTPS Image URL
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.get(image_url)
                if res.status_code == 200:
                    mime = res.headers.get("content-type", "image/jpeg").split(";")[0]
                    b64 = base64.b64encode(res.content).decode("utf-8")
                    return b64, mime
        except Exception as e:
            logger.warning(f"Failed to fetch image for Gemini vision ({image_url}): {e}")
        return None

    def _post_with_retry(self, payload: Dict[str, Any], max_retries: int = 3) -> Optional[Dict[str, Any]]:
        """Execute Gemini API request with automatic model fallback and fast retry."""
        if not self.api_key:
            return None

        models_to_try = [self.model] + [m for m in SUPPORTED_MODELS if m != self.model]

        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
            for attempt in range(1, max_retries + 1):
                try:
                    with httpx.Client(timeout=25.0) as client:
                        res = client.post(
                            url,
                            json=payload,
                            headers={"Content-Type": "application/json"}
                        )
                        if res.status_code == 200:
                            return res.json()
                        elif res.status_code == 404:
                            logger.warning(f"Model {model_name} returned 404 (deprecated/unavailable). Switching to next model...")
                            break  # Break inner loop to try next model in models_to_try
                        elif res.status_code in [429, 500, 502, 503, 504]:
                            sleep_time = 2.0 * attempt if res.status_code == 429 else 1.0 * attempt
                            logger.warning(f"Gemini API status {res.status_code} on {model_name} (attempt {attempt}/{max_retries}). Retrying in {sleep_time}s...")
                            time.sleep(sleep_time)
                        else:
                            logger.error(f"Gemini API error {res.status_code} on {model_name}: {res.text}")
                            break
                except (httpx.TimeoutException, httpx.NetworkError) as e:
                    logger.warning(f"Gemini connection timeout on {model_name}: {e} (attempt {attempt}/{max_retries}).")
                    time.sleep(1.0 * attempt)
                except Exception as e:
                    logger.error(f"Unexpected error calling {model_name}: {e}")
                    break
        return None

    def process_conversational_turn(
        self,
        user_message: str,
        catalog_products: List[Dict[str, Any]],
        image_url: Optional[str] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Unified single-pass high-speed shopping intelligence engine:
        Handles intent detection, multi-turn memory, image understanding, order requests,
        clarification, styling advice, and product card ranking in ONE blazing-fast roundtrip.
        """
        if not self.api_key:
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

        parts: List[Dict[str, Any]] = []

        # Formatted Conversation History
        if history:
            formatted_history = []
            for h in history[-8:]:
                role_label = h.get("role", "user").upper()
                content_text = h.get("content", "")
                prods_context = h.get("products_context", "")
                img_ctx = f" [Image attached]" if h.get("image_url") else ""
                entry = f"{role_label}: {content_text}{img_ctx}"
                if prods_context:
                    entry += f"\n  -> {prods_context}"
                formatted_history.append(entry)
            parts.append({"text": "Recent Chat History:\n" + "\n".join(formatted_history)})

        # Latest Image Part or Reference Image from History
        active_img_url = image_url
        if not active_img_url and history:
            for h in reversed(history):
                if h.get("image_url"):
                    active_img_url = h.get("image_url")
                    break

        if active_img_url:
            img_data = self._fetch_image_base64(active_img_url)
            if img_data:
                b64, mime = img_data
                parts.append({
                    "inline_data": {
                        "mime_type": mime,
                        "data": b64
                    }
                })
                parts.append({"text": f"Attached/Reference Image uploaded in this chat."})

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

        parts.append({
            "text": f"Context & Available Marketplace Products:\n{json.dumps(prompt_context, indent=2)}\n\nGenerate your response and select matching product IDs strictly from the available marketplace products."
        })

        payload = {
            "contents": [{"parts": parts}],
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "generation_config": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        data = self._post_with_retry(payload)
        if data:
            try:
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
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
            except Exception as e:
                logger.error(f"Failed to parse unified Gemini response JSON: {e}")

        return self._fallback_conversational_turn(user_message, catalog_products, history=history)

    def _fallback_conversational_turn(
        self,
        user_message: str,
        catalog_products: List[Dict[str, Any]],
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Fast rule-based fallback response when API is unavailable."""
        msg = user_message.lower()

        # Greetings
        if any(w in msg for w in ["salam", "assalam", "hello", "hi", "hey"]):
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

def get_ai_provider() -> AIProvider:
    """Factory method to get the configured AI provider instance."""
    return GeminiProvider()
