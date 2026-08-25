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
        """Extract search query, category, price range, color, gender, and matching attributes from user message/image."""
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
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.0-flash"):
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
            "You are a senior Pakistani e-commerce AI expert for 'AI Plaza'. "
            "Shoppers will message you in English, Urdu, or Roman Urdu, often with typos, phonetic spellings, and colloquial shopping slang.\n\n"
            "MANDATORY ANALYSIS RULES:\n"
            "1. PHONETIC & TYPO NORMALIZATION:\n"
            "   - 'sitchen', 'kichen', 'moi/koi sitchen ka samaan', 'bartan', 'handi', 'bawarcheehana', 'cooking' -> target_item: 'cookware', 'kitchenware', 'crockery', category_hint: 'Crockery & Kitchenware', search_terms: ['cookware', 'granite', 'pot', 'pan', 'kettle', 'fryer', 'crockery', 'kitchen'].\n"
            "   - 'pent', 'pnt', 'pant', 'trouser', 'jeans' -> target_item: 'pant', 'trouser', category_hint: 'Clothes & Apparel'.\n"
            "   - 'soot', 'suit', 'coatpant', 'coat pant', 'pant shirt', 'shalwar kameez' -> target_item: 'suit', 'coat pant', 'pant shirt'.\n"
            "   - 'jootay', 'jote', 'shoes', 'sneakers', 'oxford', 'chappal' -> target_item: 'shoes', category_hint: 'Shoes & Footwear'.\n"
            "   - 'itarr', 'khushbu', 'perfume', 'oud', 'attar' -> target_item: 'perfume', 'oud', category_hint: 'Cosmetics & Fragrances'.\n"
            "   - 'air fryer', 'kettle', 'vacuum', 'iron', 'blender' -> target_item: 'appliances', category_hint: 'Home Appliances'.\n\n"
            "2. GENDER & DEMOGRAPHIC IDENTIFICATION (CRITICAL):\n"
            "   - If user mentions 'boys', 'boy', 'larke', 'larka', 'men', 'gents', 'mardana', 'dulha', 'office suit for boys/men' -> gender_target: 'men', negative_terms: ['ladies', 'women', 'kurti', 'lawn', 'dupatta', 'chiffon', 'frock', 'female', 'girl', 'bridal'].\n"
            "   - If user mentions 'girls', 'girl', 'larkiyan', 'larki', 'women', 'ladies', 'zanana', 'dulhan', 'frock', 'kurti', 'lawn', 'dupatta' -> gender_target: 'women', negative_terms: ['gents', 'groom', 'boys coat', 'mens'].\n"
            "   - If user mentions 'kids', 'bache', 'bachon' -> gender_target: 'kids'.\n"
            "   - If general/household/unspecified -> gender_target: null, negative_terms: [].\n\n"
            "3. RETURN STRICT JSON SCHEMA ONLY:\n"
            "{\n"
            '  "search_terms": ["term1", "term2", "term3"],\n'
            '  "negative_terms": ["word1", "word2"],\n'
            '  "gender_target": "men" | "women" | "kids" | "unisex" | null,\n'
            '  "target_item": "e.g. cookware, coat pant, oxford shoes, kettle, air fryer",\n'
            '  "category_hint": "Home Appliances" | "Gadgets & Electronics" | "Clothes & Apparel" | "Shoes & Footwear" | "Cosmetics & Fragrances" | "Crockery & Kitchenware" | null,\n'
            '  "color": "color name" | null,\n'
            '  "min_price": number | null,\n'
            '  "max_price": number | null,\n'
            '  "intent_type": "matching" | "search" | "similar" | "general"\n'
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
                parts.append({"text": f"Analyze this image and user query: '{user_message}' to determine target item, gender/demographics, category and search terms."})
            else:
                parts.append({"text": f"User message: '{user_message}'"})
        else:
            parts.append({"text": f"User message: '{user_message}'"})

        payload = {
            "contents": [{"parts": parts}],
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "generation_config": {
                "response_mime_type": "application/json",
                "temperature": 0.1
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
            "You are the intelligent, polite AI Shopping Advisor for 'AI Plaza', Pakistan's premier online multi-vendor marketplace.\n\n"
            "CRITICAL RULES:\n"
            "1. TONE & VOCABULARY:\n"
            "   - Speak in warm, natural Pakistani Roman Urdu and polite Urdu (e.g. 'Assalam-o-Alaikum', 'Ji bilkul', 'Aap ke liye', 'Marketplace mein').\n"
            "   - STRICTLY FORBIDDEN: NEVER use Hindi words like 'swagat', 'namaste', 'dhanyawad', 'kripya', 'mitra'.\n\n"
            "2. GENDER & CATEGORY INTEGRITY:\n"
            "   - If the user asks for men's/boys' items (e.g. 'boys office suit'), ONLY recommend men's/boys' items (coatpant, pant shirt, oxford shoes, linen kurta). NEVER recommend ladies' dresses or kurti.\n"
            "   - If the user asks for kitchen items/appliances/cookware, ONLY recommend relevant kitchen products (cookware sets, kettle, air fryer, utensils).\n\n"
            "3. RECOMMENDATION LOGIC:\n"
            "   - Choose the best matching product IDs STRICTLY from candidate products list.\n"
            "   - If exact product is found, recommend it and explain why it fits.\n"
            "   - If exact item is slightly different but candidate list has great ALTERNATIVE items matching the requested demographic and purpose, recommend them and explain they are great alternates.\n"
            "   - If candidate products list is EMPTY (or contains zero suitable items for the requested demographic), reply with:\n"
            "     'Filhal marketplace mein yeh product ya is ka alternate available nahi hai. Aap kuch din baad dobara check kar lijiye ga, main restock karwanay ki koshish karta hoon!' (with recommended_product_ids: []).\n\n"
            "4. Return strict JSON format:\n"
            "{\n"
            '  "message": "Your conversational advice in Roman Urdu.",\n'
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
            "text": f"Context and Candidate Products:\n{json.dumps(prompt_context, indent=2)}\n\nRecommend the best matching products from this list."
        })

        payload = {
            "contents": [{"parts": parts}],
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "generation_config": {
                "response_mime_type": "application/json",
                "temperature": 0.2
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
                    # Validate IDs belong to candidate products
                    valid_ids = [p["id"] for p in candidate_products]
                    final_ids = [int(i) for i in ids if int(i) in valid_ids]
                    return msg, final_ids
                else:
                    logger.error(f"Gemini recommendation API error {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Gemini recommendation generation failed: {e}")

        return self._fallback_recommendation(user_message, candidate_products)

    def _fallback_extract_intent(self, message: str) -> Dict[str, Any]:
        """Rule-based fallback intent parser with typo correction."""
        msg = message.lower()
        terms = []
        negative_terms = []
        category = None
        gender_target = None
        max_price = None

        # Price detection
        import re
        price_match = re.search(r'(\d+)\s*(?:k|thousand|hazar|ke andar|under|tak)?', msg)
        if price_match:
            val = int(price_match.group(1))
            if val < 500:
                val *= 1000
            max_price = val

        # Gender Detection
        if any(w in msg for w in ["boy", "boys", "larke", "larka", "men", "mens", "gents", "mardana", "dulha"]):
            gender_target = "men"
            negative_terms = ["ladies", "women", "kurti", "lawn", "dupatta", "female", "frock"]
        elif any(w in msg for w in ["girl", "girls", "larki", "larkiyan", "women", "ladies", "zanana", "frock", "kurti", "lawn"]):
            gender_target = "women"
            negative_terms = ["gents", "groom", "boys coat"]

        # Category & Item detection with typo handling
        if any(w in msg for w in ["kitchen", "sitchen", "kichen", "cookware", "bartan", "handi", "pan", "pot", "crockery"]):
            category = "Crockery & Kitchenware"
            terms.extend(["cookware", "granite", "pot", "pan", "kettle", "fryer", "crockery"])
        elif any(w in msg for w in ["suit", "soot", "coatpant", "coat pant", "pant", "pent", "pnt", "trouser", "shirt", "shalwar"]):
            category = "Clothes & Apparel"
            if gender_target == "men":
                terms.extend(["coat", "pant", "shirt", "suit", "kurta", "shalwar"])
            else:
                terms.extend(["kurti", "suit", "lawn", "dress", "shirt"])
        elif any(w in msg for w in ["shoe", "shoes", "jootay", "jote", "sneaker", "oxford", "chappal", "sandals"]):
            category = "Shoes & Footwear"
            terms.extend(["shoe", "oxford", "sneakers", "leather"])
        elif any(w in msg for w in ["earbud", "smartwatch", "watch", "charger", "gadget", "headphone"]):
            category = "Gadgets & Electronics"
            terms.extend(["earbuds", "smartwatch", "charger", "wireless"])
        elif any(w in msg for w in ["fryer", "vacuum", "kettle", "iron", "appliance"]):
            category = "Home Appliances"
            terms.extend(["fryer", "vacuum", "kettle", "blender"])
        elif any(w in msg for w in ["perfume", "fragrance", "oud", "attar", "khushbu"]):
            category = "Cosmetics & Fragrances"
            terms.extend(["oud", "perfume", "parfum"])

        return {
            "search_terms": terms or msg.split(),
            "negative_terms": negative_terms,
            "gender_target": gender_target,
            "category_hint": category,
            "color": "black" if "black" in msg else ("white" if "white" in msg else ("blue" if "blue" in msg else None)),
            "min_price": None,
            "max_price": max_price,
            "intent_type": "search",
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
            "Aapki request ke mutabiq ye behtareen options marketplace mein available hain:",
            ids
        )

def get_ai_provider() -> AIProvider:
    """Factory method to get the configured AI provider instance."""
    return GeminiProvider()
