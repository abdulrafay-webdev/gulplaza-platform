import os
import json
import time
import base64
import logging
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
import httpx

logger = logging.getLogger(__name__)

class AIProvider(ABC):
    @abstractmethod
    def extract_shopping_intent(
        self, 
        user_message: str, 
        image_url: Optional[str] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Extract multi-turn search intent, negations, category, price, gender, clarification, and visual attributes."""
        pass

    @abstractmethod
    def generate_shopping_recommendation(
        self, 
        user_message: str, 
        candidate_products: List[Dict[str, Any]], 
        image_url: Optional[str] = None,
        intent: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[str, List[int]]:
        """Generate conversational Urdu/English shopping advice, explain features, and rank matching product IDs."""
        pass

class GeminiProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = model
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

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
            with httpx.Client(timeout=12.0) as client:
                res = client.get(image_url)
                if res.status_code == 200:
                    mime = res.headers.get("content-type", "image/jpeg").split(";")[0]
                    b64 = base64.b64encode(res.content).decode("utf-8")
                    return b64, mime
        except Exception as e:
            logger.warning(f"Failed to fetch image for Gemini vision ({image_url}): {e}")
        return None

    def _post_with_retry(self, payload: Dict[str, Any], max_retries: int = 3) -> Optional[Dict[str, Any]]:
        """Execute Gemini API request with automatic retry on 503/429/connection spikes."""
        if not self.api_key:
            return None

        for attempt in range(1, max_retries + 1):
            try:
                with httpx.Client(timeout=25.0) as client:
                    res = client.post(
                        f"{self.base_url}?key={self.api_key}",
                        json=payload,
                        headers={"Content-Type": "application/json"}
                    )
                    if res.status_code == 200:
                        return res.json()
                    elif res.status_code in [429, 500, 502, 503, 504]:
                        logger.warning(f"Gemini API transient error {res.status_code} (attempt {attempt}/{max_retries}). Retrying in 1.5s...")
                        time.sleep(1.5 * attempt)
                    else:
                        logger.error(f"Gemini API client error {res.status_code}: {res.text}")
                        return None
            except (httpx.TimeoutException, httpx.NetworkError) as e:
                logger.warning(f"Gemini connection timeout/error: {e} (attempt {attempt}/{max_retries}). Retrying...")
                time.sleep(1.5 * attempt)
            except Exception as e:
                logger.error(f"Unexpected error in Gemini API call: {e}")
                return None
        return None

    def extract_shopping_intent(
        self, 
        user_message: str, 
        image_url: Optional[str] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        if not self.api_key:
            return self._fallback_extract_intent(user_message, history=history)

        system_instruction = (
            "You are the senior conversational AI architect & intent analyzer for 'AI Plaza', Pakistan's premier multi-vendor marketplace.\n"
            "Your job is to analyze the user's message in the context of the entire multi-turn chat history (including past recommendations, rejected items, and uploaded images).\n\n"
            "MANDATORY INTENT RULES:\n"
            "1. CASUAL CHAT & CONTEXT SETTING (ZERO PRODUCTS NEEDED):\n"
            "   - If user is greeting ('Hello', 'Salam', 'Kaise ho'), expressing gratitude ('Shukriya', 'Thanks'), or acknowledging ('Ok', 'Theek hai'):\n"
            "     Set needs_product_search = false, is_conversational_only = true, search_terms = [].\n"
            "   - If user is setting context without directly asking for a product search yet (e.g. 'Mere paas red shirt hai', 'Kal meri dost ki shadi hai'):\n"
            "     Set needs_product_search = false, is_context_setting = true, extracted_context = 'user has red shirt'.\n"
            "   - If user asks a general marketplace / platform question (e.g. 'Delivery kitne din mein hoti hai?', 'Aap kaun ho?'):\n"
            "     Set needs_product_search = false, is_conversational_only = true.\n\n"
            "2. VAGUE / UNDERSPECIFIED QUERIES (CLARIFICATION NEEDED):\n"
            "   - If user says something too broad (e.g. 'Mujhe shoes chahiye', 'Kapray dikhao', 'Dress suggest karo') without specifying gender, occasion, or style:\n"
            "     Set needs_clarification = true, needs_product_search = false, and provide a polite, natural clarification_question in Roman Urdu.\n"
            "   - But if query has sufficient specifics (e.g. 'Formal black shoes 5000 ke andar', 'tea cattle', 'boys office suit', or outfit matching follow-up):\n"
            "     Set needs_clarification = false, needs_product_search = true.\n\n"
            "3. MULTI-TURN ANAPHORA & CONTEXT CONTINUATION:\n"
            "   - When user says 'Iske saath konsi pant achi lagegi?' after mentioning 'red shirt':\n"
            "     Understand 'iske' = red shirt. Target item = 'pant' / 'trousers', matching colors = ['black', 'navy', 'beige', 'grey'], search_terms = ['pant', 'trousers', 'black', 'navy', 'chinos'].\n"
            "   - When user says 'Formal, black, budget 5000' after discussing shoes:\n"
            "     Understand category = 'Shoes & Footwear', target_item = 'formal shoes', color = 'black', max_price = 5000, needs_product_search = true.\n"
            "   - When user says 'Ye pasand nahi aya' / 'Dusra option dikhao' / 'Nhi shoes nhi':\n"
            "     Add the rejected item or category to 'negative_terms' (e.g. ['shoes', 'sneakers', 'oxford']).\n"
            "   - When user says 'Sasta wala' or 'Budget 5000 ke andar rakho':\n"
            "     Inherit the previous product type and set max_price = 5000.\n\n"
            "4. PHONETIC & TYPO NORMALIZATION:\n"
            "   - 'tea cattle', 'cattle', 'ketle', 'ketal', 'kettal', 'chay ki ketli' -> target_item: 'electric kettle', category_hint: 'Home Appliances', search_terms: ['kettle', 'electric kettle', 'tea', 'stainless steel'].\n"
            "   - 'sitchen', 'kichen', 'moi/koi sitchen ka samaan', 'bartan', 'handi' -> target_item: 'cookware', category_hint: 'Crockery & Kitchenware', search_terms: ['cookware', 'granite', 'pot', 'pan'].\n"
            "   - 'pent', 'pnt', 'pant', 'trouser' -> target_item: 'pant', category_hint: 'Clothes & Apparel'.\n"
            "   - 'soot', 'suit', 'coatpant', 'coat pant' -> target_item: 'suit', 'coat pant', category_hint: 'Clothes & Apparel'.\n"
            "   - 'jootay', 'jote', 'shoes', 'sneakers', 'oxford' -> target_item: 'shoes', category_hint: 'Shoes & Footwear'.\n"
            "   - 'itarr', 'khushbu', 'perfume', 'oud' -> target_item: 'perfume', 'oud', category_hint: 'Cosmetics & Fragrances'.\n\n"
            "5. GENDER & DEMOGRAPHIC TARGETING:\n"
            "   - 'boys', 'larke', 'men', 'gents', 'mardana' -> gender_target: 'men', negative_terms: ['ladies', 'women', 'kurti', 'lawn', 'dupatta', 'chiffon', 'frock', 'female', 'girl', 'bridal'].\n"
            "   - 'girls', 'larkiyan', 'women', 'ladies', 'zanana' -> gender_target: 'women', negative_terms: ['gents', 'groom', 'boys coat', 'mens'].\n\n"
            "6. IMAGE VISUAL CONTEXT:\n"
            "   - If image is present (current or from recent history), recognize the item, style, colors, and determine whether user wants similar item or matching complementary items.\n\n"
            "RETURN STRICT JSON ONLY:\n"
            "{\n"
            '  "needs_product_search": boolean,\n'
            '  "is_conversational_only": boolean,\n'
            '  "is_context_setting": boolean,\n'
            '  "needs_clarification": boolean,\n'
            '  "clarification_question": "string or null",\n'
            '  "search_terms": ["term1", "term2"],\n'
            '  "negative_terms": ["neg1", "neg2"],\n'
            '  "gender_target": "men" | "women" | "kids" | "unisex" | null,\n'
            '  "target_item": "e.g. pant, electric kettle, formal shoes, perfume, gift ideas" | null,\n'
            '  "category_hint": "Home Appliances" | "Gadgets & Electronics" | "Clothes & Apparel" | "Shoes & Footwear" | "Cosmetics & Fragrances" | "Crockery & Kitchenware" | null,\n'
            '  "color": "color name" | null,\n'
            '  "min_price": number | null,\n'
            '  "max_price": number | null,\n'
            '  "is_gift_query": boolean,\n'
            '  "visual_description": "visual description if image provided, else null"\n'
            "}"
        )

        parts: List[Dict[str, Any]] = []

        # Multi-turn history formatting
        if history:
            formatted_history = []
            for h in history[-8:]:
                role_label = h.get("role", "user").upper()
                content_text = h.get("content", "")
                prods_context = h.get("products_context", "")
                img_ctx = f" [Image attached: {h.get('image_url')}]" if h.get("image_url") else ""
                entry = f"{role_label}: {content_text}{img_ctx}"
                if prods_context:
                    entry += f"\n  -> {prods_context}"
                formatted_history.append(entry)
            parts.append({"text": "Conversation History:\n" + "\n".join(formatted_history)})

        # Latest image part if provided
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
                parts.append({"text": f"Latest User Message (with image attached): '{user_message}'"})
            else:
                parts.append({"text": f"Latest User Message: '{user_message}'"})
        else:
            # Check if an earlier turn in history had an active image
            past_image_url = None
            if history:
                for h in reversed(history):
                    if h.get("image_url"):
                        past_image_url = h.get("image_url")
                        break
            if past_image_url:
                img_data = self._fetch_image_base64(past_image_url)
                if img_data:
                    b64, mime = img_data
                    parts.append({
                        "inline_data": {
                            "mime_type": mime,
                            "data": b64
                        }
                    })
                    parts.append({"text": f"Reference Image from earlier in this conversation (URL: {past_image_url})"})
            parts.append({"text": f"Latest User Message: '{user_message}'"})

        payload = {
            "contents": [{"parts": parts}],
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "generation_config": {
                "response_mime_type": "application/json",
                "temperature": 0.1
            }
        }

        data = self._post_with_retry(payload)
        if data:
            try:
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(raw_text)
            except Exception as e:
                logger.error(f"Failed to parse Gemini intent JSON: {e}")

        return self._fallback_extract_intent(user_message, history=history)

    def generate_shopping_recommendation(
        self, 
        user_message: str, 
        candidate_products: List[Dict[str, Any]], 
        image_url: Optional[str] = None,
        intent: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[str, List[int]]:
        if not self.api_key:
            return self._fallback_recommendation(user_message, candidate_products)

        # 1. Handle Greetings / Small Talk / Context Setting (No product search was needed)
        if intent and intent.get("is_conversational_only"):
            msg_lower = user_message.lower().strip()
            if any(w in msg_lower for w in ["salam", "assalam", "hello", "hi", "hey"]):
                return "Walaikum Assalam! Main AI Plaza ka Shopping Assistant hoon. Aaj main aapki shopping ya outfit matching mein kya madad kar sakta hoon?", []
            if any(w in msg_lower for w in ["how are you", "kaise ho", "kese ho", "kya haal"]):
                return "Alhamdulillah, main bilkul theek hoon! Aap batayein, aaj kis cheez ki shopping ya recommendation dekhna chahte hain?", []
            if any(w in msg_lower for w in ["shukriya", "thanks", "thank you", "jazakallah"]):
                return "Bohat shukriya! Agar mazeed koi product dekhna ho ya koi sawal ho toh zaroor batayein.", []
            if any(w in msg_lower for w in ["theek", "ok", "acha", "sahi", "done"]):
                return "Zabardast! Agar koi aur cheez dhoondni ho ya order place karna ho toh batayein.", []

        if intent and intent.get("is_context_setting") and not candidate_products:
            msg_lower = user_message.lower()
            if "red shirt" in msg_lower or "shirt" in msg_lower:
                return "Zabardast! Red shirt ke saath stylish look create ki ja sakti hai. Aapko is ke matching pants, shoes ya koi accessory chahiye?", []
            return "Samajh gaya! Is ke mutabiq aapko kya suggest karoon — matching clothes, shoes ya koi aur cheez?", []

        # 2. Handle Ambiguous Queries with Direct Clarification
        if intent and intent.get("needs_clarification") and intent.get("clarification_question") and not candidate_products:
            return intent["clarification_question"], []

        system_instruction = (
            "You are the friendly, expert AI Personal Shopping Advisor for 'AI Plaza', Pakistan's premier online multi-vendor marketplace.\n\n"
            "CONVERSATION & ADVISORY GUIDELINES:\n"
            "1. LANGUAGE & TONE:\n"
            "   - Communicate in warm, natural Pakistani Roman Urdu and polite Urdu (e.g. 'Assalam-o-Alaikum!', 'Ji bilkul', 'Aap ke liye', 'Marketplace mein', 'Shukriya') or English if the user wrote in English.\n"
            "   - STRICTLY FORBIDDEN: NEVER use Hindi words like 'swagat', 'namaste', 'dhanyawad', 'kripya', 'mitra'.\n"
            "   - Talk naturally like an experienced in-store fashion consultant or shopkeeper: explain why specific colors, cuts, materials, or products fit the customer's goal.\n\n"
            "2. MULTI-TURN CONVERSATION & MEMORY:\n"
            "   - Reference prior context naturally (e.g., if user mentioned having a red shirt and asked for matching pants, say: 'Aapki red shirt ke sath black ya dark navy pants bohot stylish lagengi! Hamare paas ye behtareen options hain:').\n"
            "   - If user rejected previous options (e.g. 'nhi shoes nhi' or 'ye pasand nahi aya'), warmly acknowledge it: 'Bilkul samajh gaya, shoes ke ilawa gift ke liye hamare paas yeh options hain:' and present alternative categories.\n\n"
            "3. GENDER & CATEGORY INTEGRITY:\n"
            "   - If user asks for men's/boys' items, NEVER recommend ladies' dresses/kurtis.\n"
            "   - If user asks for kitchen items (e.g. 'tea cattle', 'cookware'), recommend relevant kitchen products.\n\n"
            "4. EXACT VS ALTERNATIVE PRODUCTS:\n"
            "   - When candidate products are available and relevant (including matching items or sets like pant shirt, coatpant, shoes, outfits, cookware), select the matching product IDs and return them in recommended_product_ids!\n"
            "   - If exact product is in candidate list, recommend it and explain its standout features.\n"
            "   - If exact product is not in stock, but closest alternatives matching the demographic/purpose are in candidates, explain naturally: 'Aapka exact item is waqt available nahi hai, lekin aap ke liye ye behtareen alternate options mojoud hain:' and include their product IDs.\n"
            "   - If candidate products list is EMPTY (or contains zero suitable items), respond honestly and naturally without hallucinating products:\n"
            "     'Filhal marketplace mein is requirement ke mutabiq product available nahi hai. Aap kuch din baad dobara check kar lijiye ga, main restock karwanay ki koshish karta hoon!' (with recommended_product_ids: []).\n\n"
            "5. RETURN STRICT JSON FORMAT ONLY:\n"
            "{\n"
            '  "message": "Your conversational, helpful advice in natural Roman Urdu.",\n'
            '  "recommended_product_ids": [id1, id2]\n'
            "}"
        )

        formatted_history = []
        if history:
            for h in history[-8:]:
                role_label = h.get("role", "user").upper()
                content_text = h.get("content", "")
                prods_context = h.get("products_context", "")
                entry = f"{role_label}: {content_text}"
                if prods_context:
                    entry += f"\n  -> {prods_context}"
                formatted_history.append(entry)

        prompt_context = {
            "user_query": user_message,
            "has_image": bool(image_url),
            "visual_description": intent.get("visual_description") if intent else None,
            "negative_terms": intent.get("negative_terms") if intent else [],
            "available_marketplace_products": candidate_products
        }

        parts: List[Dict[str, Any]] = []
        if formatted_history:
            parts.append({"text": "Recent Conversation History:\n" + "\n".join(formatted_history)})

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
        else:
            # Check if an earlier turn in history had an active image
            past_image_url = None
            if history:
                for h in reversed(history):
                    if h.get("image_url"):
                        past_image_url = h.get("image_url")
                        break
            if past_image_url:
                img_data = self._fetch_image_base64(past_image_url)
                if img_data:
                    b64, mime = img_data
                    parts.append({
                        "inline_data": {
                            "mime_type": mime,
                            "data": b64
                        }
                    })
                    parts.append({"text": f"Reference Image from earlier in conversation (URL: {past_image_url})"})

        parts.append({
            "text": f"Context and Candidate Products:\n{json.dumps(prompt_context, indent=2)}\n\nGenerate natural, personalized shopping advice and pick matching product IDs strictly from the candidate products list."
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
                msg = parsed.get("message", "Aapke liye ye behtareen marketplace options hain:")
                ids = parsed.get("recommended_product_ids", [])
                valid_ids = [p["id"] for p in candidate_products]
                final_ids = [int(i) for i in ids if int(i) in valid_ids]
                return msg, final_ids
            except Exception as e:
                logger.error(f"Failed to parse Gemini recommendation JSON: {e}")

        return self._fallback_recommendation(user_message, candidate_products)

    def _fallback_extract_intent(
        self, 
        message: str, 
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Rule-based fallback intent parser with typo correction and history awareness."""
        msg = message.lower()
        terms = []
        negative_terms = []
        category = None
        gender_target = None
        max_price = None
        is_gift = "gift" in msg or "tohfa" in msg

        # Context setting check
        if any(w in msg for w in ["mere paas", "i have", "apne paas", "pasand hai"]) and not any(w in msg for w in ["chahiye", "dhoondo", "dikhao", "suggest"]):
            return {
                "needs_product_search": False,
                "is_conversational_only": False,
                "is_context_setting": True,
                "needs_clarification": False,
                "clarification_question": None,
                "search_terms": [],
                "negative_terms": [],
                "gender_target": None,
                "target_item": None,
                "category_hint": None,
                "color": None,
                "min_price": None,
                "max_price": None,
                "is_gift_query": False,
                "visual_description": None
            }

        # Conversational check
        if any(w in msg for w in ["salam", "hello", "hi", "kaise ho", "kya haal", "shukriya", "thanks", "ok", "theek"]):
            return {
                "needs_product_search": False,
                "is_conversational_only": True,
                "is_context_setting": False,
                "needs_clarification": False,
                "clarification_question": None,
                "search_terms": [],
                "negative_terms": [],
                "gender_target": None,
                "target_item": None,
                "category_hint": None,
                "color": None,
                "min_price": None,
                "max_price": None,
                "is_gift_query": False,
                "visual_description": None
            }

        # Check history for prior context (e.g. shoes)
        history_text = ""
        if history:
            history_text = " ".join([h.get("content", "").lower() for h in history])

        # Negation check
        if any(w in msg for w in ["nhi", "nahi", "not", "ke ilawa", "baghair", "chhor kar"]):
            if "shoe" in msg or "joot" in msg:
                negative_terms.extend(["shoes", "oxford", "sneakers", "leather shoes"])
                terms.extend(["oud", "perfume", "smartwatch", "earbuds", "cookware"])
                is_gift = True

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
            negative_terms.extend(["ladies", "women", "kurti", "lawn", "dupatta", "female", "frock"])
        elif any(w in msg for w in ["girl", "girls", "larki", "larkiyan", "women", "ladies", "zanana", "frock", "kurti", "lawn"]):
            gender_target = "women"
            negative_terms.extend(["gents", "groom", "boys coat"])

        # Gift handling
        if is_gift and not terms:
            terms = ["oud", "perfume", "smartwatch", "earbuds", "cookware", "kettle"]

        # Category & Item detection with typo handling & history inheritance
        if any(w in msg for w in ["cattle", "kettle", "ketle", "ketli", "ketal", "tea"]):
            category = "Home Appliances"
            terms.extend(["kettle", "electric kettle", "tea", "stainless steel"])
        elif any(w in msg for w in ["kitchen", "sitchen", "kichen", "cookware", "bartan", "handi", "pan", "pot", "crockery"]):
            category = "Crockery & Kitchenware"
            terms.extend(["cookware", "granite", "pot", "pan", "kettle", "fryer", "crockery"])
        elif any(w in msg for w in ["pant", "pent", "pnt", "trouser"]) or "red shirt" in history_text:
            category = "Clothes & Apparel"
            terms.extend(["pant", "trouser", "pant shirt", "coatpant"])
        elif any(w in msg for w in ["suit", "soot", "coatpant", "coat pant", "shirt", "shalwar"]):
            category = "Clothes & Apparel"
            if gender_target == "men":
                terms.extend(["coat", "pant", "shirt", "suit", "kurta", "shalwar"])
            else:
                terms.extend(["kurti", "suit", "lawn", "dress", "shirt"])
        elif (any(w in msg for w in ["shoe", "shoes", "jootay", "jote", "sneaker", "oxford", "chappal", "sandals", "formal"]) or "shoe" in history_text) and "nhi" not in msg:
            category = "Shoes & Footwear"
            terms.extend(["shoe", "oxford", "sneakers", "leather"])
        elif any(w in msg for w in ["earbud", "smartwatch", "watch", "charger", "gadget", "headphone"]):
            category = "Gadgets & Electronics"
            terms.extend(["earbuds", "smartwatch", "charger", "wireless"])
        elif any(w in msg for w in ["fryer", "vacuum", "iron", "appliance"]):
            category = "Home Appliances"
            terms.extend(["fryer", "vacuum", "kettle", "blender"])
        elif any(w in msg for w in ["perfume", "fragrance", "oud", "attar", "khushbu"]):
            category = "Cosmetics & Fragrances"
            terms.extend(["oud", "perfume", "parfum"])

        return {
            "needs_product_search": bool(terms or is_gift),
            "is_conversational_only": False,
            "is_context_setting": False,
            "needs_clarification": False,
            "clarification_question": None,
            "search_terms": terms or msg.split(),
            "negative_terms": negative_terms,
            "gender_target": gender_target,
            "category_hint": category,
            "color": "black" if "black" in msg else ("white" if "white" in msg else ("blue" if "blue" in msg else None)),
            "min_price": None,
            "max_price": max_price,
            "is_gift_query": is_gift,
            "target_item": terms[0] if terms else None,
            "visual_description": None
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
