import os
import json
import base64
import logging
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
import httpx

logger = logging.getLogger(__name__)

class AIProvider(ABC):
    @abstractmethod
    def extract_shopping_intent(self, user_message: str, image_url: Optional[str] = None) -> Dict[str, Any]:
        """Extract search query, category, price range, color, and matching attributes from user message/image."""
        pass

    @abstractmethod
    def generate_shopping_recommendation(
        self, 
        user_message: str, 
        candidate_products: List[Dict[str, Any]], 
        image_url: Optional[str] = None
    ) -> Tuple[str, List[int]]:
        """Generate conversational Urdu/English shopping advice and rank matching product IDs."""
        pass

class GeminiProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = model
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    def _fetch_image_base64(self, image_url: str) -> Optional[Tuple[str, str]]:
        """Download image and return (base64_str, mime_type)."""
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.get(image_url)
                if res.status_code == 200:
                    mime = res.headers.get("content-type", "image/jpeg").split(";")[0]
                    b64 = base64.b64encode(res.content).decode("utf-8")
                    return b64, mime
        except Exception as e:
            logger.warning(f"Failed to fetch image for Gemini vision: {e}")
        return None

    def extract_shopping_intent(self, user_message: str, image_url: Optional[str] = None) -> Dict[str, Any]:
        if not self.api_key:
            return self._fallback_extract_intent(user_message)

        system_instruction = (
            "You are an expert e-commerce shopping assistant for AI Plaza, a multi-vendor marketplace in Pakistan. "
            "Your task is to analyze user queries (which may be in English, Urdu, or Roman Urdu) and optional images, "
            "and extract structured search parameters to query the product database.\n\n"
            "Return ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "search_terms": ["keyword1", "keyword2"],\n'
            '  "category_hint": "Home Appliances" | "Gadgets & Electronics" | "Clothes & Apparel" | "Shoes & Footwear" | "Cosmetics & Fragrances" | "Crockery & Kitchenware" | null,\n'
            '  "color": "color name" | null,\n'
            '  "min_price": number | null,\n'
            '  "max_price": number | null,\n'
            '  "intent_type": "matching" | "similar" | "search" | "general",\n'
            '  "target_item": "e.g. pant, dupatta, shoes, kettle, earbuds"\n'
            "}"
        )

        parts: List[Dict[str, Any]] = []
        if image_url:
            img_data = self._fetch_image_base64(image_url)
            if img_data:
                b64, mime = img_data
                parts.append({
                    "inline_data": {
                        "mime_type": mime,
                        "data": b64
                    }
                })
                parts.append({"text": f"Analyze this image and the user's message: '{user_message}' to determine what matching or similar item they need."})
            else:
                parts.append({"text": f"User message (image link was {image_url}): '{user_message}'"})
        else:
            parts.append({"text": f"User message: '{user_message}'"})

        payload = {
            "contents": [{"parts": parts}],
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "generation_config": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        try:
            with httpx.Client(timeout=15.0) as client:
                res = client.post(
                    f"{self.base_url}?key={self.api_key}",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(raw_text)
                else:
                    logger.error(f"Gemini intent API error {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Gemini intent extraction failed: {e}")

        return self._fallback_extract_intent(user_message)

    def generate_shopping_recommendation(
        self, 
        user_message: str, 
        candidate_products: List[Dict[str, Any]], 
        image_url: Optional[str] = None
    ) -> Tuple[str, List[int]]:
        if not self.api_key:
            return self._fallback_recommendation(user_message, candidate_products)

        system_instruction = (
            "You are the helpful, intelligent AI Shopping Assistant for 'AI Plaza', an online multi-vendor marketplace in Pakistan. "
            "You help shoppers find products, matching outfits, electronics, appliances, and footwear.\n\n"
            "CRITICAL LANGUAGE & TONE RULES:\n"
            "1. STRICTLY DO NOT USE HINDI WORDS like 'swagat', 'namaste', 'dhanyawad', 'kripya', 'mitra', 'aabhar'. "
            "Use natural Pakistani Roman Urdu and polite Urdu expressions (e.g. 'Assalam-o-Alaikum', 'Ji bilkul', 'Aap ke liye', 'Marketplace mein', 'Shukriya') or English if the query is in English.\n"
            "2. ALWAYS select and recommend ONLY from the provided candidate products list. NEVER make up or hallucinate fake products or prices.\n"
            "3. EXACT VS ALTERNATIVE PRODUCT HANDLING:\n"
            "   - If the exact requested product is found in candidate products, recommend it and explain why it fits.\n"
            "   - If the exact product is not available, but related/alternative products are present in candidate products, politely explain that exact product is not in stock, but show these great ALTERNATIVE options (e.g. 'Aapka exact item is waqt available nahi hai, lekin aap ke liye ye behtareen alternate options dhoonday hain:').\n"
            "   - If candidate products list is EMPTY or has zero relevant alternatives, STRICTLY respond with this exact meaning:\n"
            "     'Filhal marketplace mein yeh product ya is ka alternate available nahi hai. Aap kuch din baad dobara check kar lijiye ga, main restock karwanay ki koshish karta hoon!'\n"
            "4. Return a strict JSON response format:\n"
            "{\n"
            '  "message": "Your conversational response here in Roman Urdu/English.",\n'
            '  "recommended_product_ids": [id1, id2]\n'
            "}"
        )

        prompt_context = {
            "user_query": user_message,
            "has_image": bool(image_url),
            "available_marketplace_products": candidate_products
        }

        parts: List[Dict[str, Any]] = []
        if image_url:
            img_data = self._fetch_image_base64(image_url)
            if img_data:
                b64, mime = img_data
                parts.append({
                    "inline_data": {
                        "mime_type": mime,
                        "data": b64
                    }
                })

        parts.append({
            "text": f"Context and Candidate Products:\n{json.dumps(prompt_context, indent=2)}\n\nRecommend matching or alternative products from this list according to the rules."
        })

        payload = {
            "contents": [{"parts": parts}],
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "generation_config": {
                "response_mime_type": "application/json",
                "temperature": 0.3
            }
        }

        try:
            with httpx.Client(timeout=20.0) as client:
                res = client.post(
                    f"{self.base_url}?key={self.api_key}",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(raw_text)
                    msg = parsed.get("message", "Aapke liye ye behtareen marketplace options hain:")
                    ids = parsed.get("recommended_product_ids", [])
                    # Validate that IDs belong to candidate products
                    valid_ids = [p["id"] for p in candidate_products]
                    final_ids = [int(i) for i in ids if int(i) in valid_ids]
                    return msg, final_ids
                else:
                    logger.error(f"Gemini recommendation API error {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Gemini recommendation generation failed: {e}")

        return self._fallback_recommendation(user_message, candidate_products)

    def _fallback_extract_intent(self, message: str) -> Dict[str, Any]:
        """Rule-based fallback intent parser for offline/quota resilient operations."""
        msg = message.lower()
        terms = []
        category = None
        max_price = None

        # Price detection (e.g. 5000 ke andar, under 3000)
        import re
        price_match = re.search(r'(\d+)\s*(?:k|thousand|hazar|ke andar|under|tak)?', msg)
        if price_match:
            val = int(price_match.group(1))
            if val < 500:  # e.g. "5k"
                val *= 1000
            max_price = val

        # Category & Item hints
        if any(w in msg for w in ["pant", "trouser", "jeans", "shirt", "kurta", "dress", "dupatta", "lawn", "clothing"]):
            category = "Clothes & Apparel"
            terms.extend(["pant", "trouser", "jeans", "shirt", "dress", "dupatta", "kurta"])
        elif any(w in msg for w in ["shoe", "shoes", "sneaker", "oxford", "chappal", "sandals", "footwear"]):
            category = "Shoes & Footwear"
            terms.extend(["shoe", "sneaker", "oxford", "leather"])
        elif any(w in msg for w in ["earbud", "smartwatch", "watch", "charger", "gadget", "headphone", "electronics"]):
            category = "Gadgets & Electronics"
            terms.extend(["earbuds", "smartwatch", "charger", "wireless"])
        elif any(w in msg for w in ["fryer", "vacuum", "kettle", "iron", "appliance"]):
            category = "Home Appliances"
            terms.extend(["fryer", "vacuum", "kettle", "blender"])
        elif any(w in msg for w in ["crockery", "cookware", "pan", "pot", "plate", "kitchen"]):
            category = "Crockery & Kitchenware"
            terms.extend(["cookware", "granite", "crockery"])
        elif any(w in msg for w in ["perfume", "fragrance", "oud", "lipstick", "beauty", "cosmetic"]):
            category = "Cosmetics & Fragrances"
            terms.extend(["oud", "perfume", "parfum"])

        return {
            "search_terms": terms or msg.split(),
            "category_hint": category,
            "color": "black" if "black" in msg else ("white" if "white" in msg else ("blue" if "blue" in msg else None)),
            "min_price": None,
            "max_price": max_price,
            "intent_type": "matching" if "match" in msg else "search",
            "target_item": terms[0] if terms else None
        }

    def _fallback_recommendation(self, user_message: str, candidate_products: List[Dict[str, Any]]) -> Tuple[str, List[int]]:
        if not candidate_products:
            return (
                "Filhal marketplace mein yeh product ya is ka alternate available nahi hai. Aap kuch din baad dobara check kar lijiye ga, main restock karwanay ki koshish karta hoon!",
                []
            )

        ids = [p["id"] for p in candidate_products[:4]]
        return (
            f"Aapki request ke mutabiq exact item ke sath ye behtareen alternate options marketplace mein available hain:",
            ids
        )

def get_ai_provider() -> AIProvider:
    """Factory method to get the configured AI provider instance."""
    return GeminiProvider()
