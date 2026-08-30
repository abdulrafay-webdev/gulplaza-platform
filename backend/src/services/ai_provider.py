import os
import re
import json
import time
import random
import base64
import logging
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
import httpx

logger = logging.getLogger(__name__)

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
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = model
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    def _fetch_image_base64(self, image_url: str) -> Optional[Tuple[str, str]]:
        """Extract image base64 data and mime type from Data URI or HTTP URL."""
        if not image_url:
            return None

        if image_url.startswith("data:"):
            try:
                header, b64_data = image_url.split(",", 1)
                mime = header.split(";")[0].replace("data:", "")
                return b64_data, mime
            except Exception as e:
                logger.warning(f"Failed to parse base64 data URI: {e}")
                return None

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

    def _post_with_retry(self, payload: Dict[str, Any], max_retries: int = 2) -> Optional[Dict[str, Any]]:
        """Execute Gemini API request with separate budgets for rate limits and server errors.

        - 429 (rate limit): up to 4 retries, respects Retry-After header, exponential backoff
        - 500/502/503/504: up to max_retries (default 2), short linear backoff
        - Transport errors: counted against the server error budget
        """
        if not self.api_key:
            return None

        rate_limit_remaining = 4
        server_remaining = max_retries
        total_attempts = max_retries + 4 + 1  # server + rate limit + initial

        for attempt in range(1, total_attempts + 1):
            try:
                with httpx.Client(timeout=15.0) as client:
                    res = client.post(
                        self.base_url,
                        json=payload,
                        headers={
                            "Content-Type": "application/json",
                            "x-goog-api-key": self.api_key,
                        },
                    )
                    if res.status_code == 200:
                        return res.json()

                    if res.status_code == 429:
                        if rate_limit_remaining <= 0:
                            logger.error("Gemini 429 rate limit exhausted all 4 retries.")
                            return None
                        rate_limit_remaining -= 1
                        retry_after = res.headers.get("Retry-After")
                        if retry_after:
                            try:
                                sleep_time = min(float(retry_after), 30.0)
                            except (ValueError, TypeError):
                                sleep_time = min(5.0 * (2 ** (3 - rate_limit_remaining)), 30.0)
                        else:
                            sleep_time = min(5.0 * (2 ** (3 - rate_limit_remaining)), 30.0)
                        sleep_time += random.uniform(0, 0.5)
                        logger.warning(
                            f"Gemini 429 rate limit (retry-after={retry_after}s, "
                            f"waiting {sleep_time:.1f}s, {rate_limit_remaining} rate retries left)"
                        )
                        time.sleep(sleep_time)

                    elif res.status_code in (500, 502, 503, 504):
                        if server_remaining <= 0:
                            logger.error(f"Gemini server error {res.status_code} exhausted retries.")
                            return None
                        server_remaining -= 1
                        sleep_time = 0.6 * (max_retries - server_remaining) + random.uniform(0, 0.3)
                        logger.warning(
                            f"Gemini transient {res.status_code} (attempt {attempt}); "
                            f"retrying in {sleep_time:.2f}s, {server_remaining} server retries left"
                        )
                        time.sleep(sleep_time)

                    else:
                        logger.error(f"Gemini API error {res.status_code}: {res.text[:500]}")
                        return None

            except (httpx.TimeoutException, httpx.TransportError) as e:
                if server_remaining <= 0:
                    logger.error(f"Gemini transport failure exhausted retries: {e}")
                    return None
                server_remaining -= 1
                sleep_time = 0.6 * (max_retries - server_remaining) + random.uniform(0, 0.3)
                logger.warning(f"Gemini transport error: {e}; retrying in {sleep_time:.2f}s, {server_remaining} server retries left")
                time.sleep(sleep_time)
            except Exception as e:
                logger.error(f"Unexpected error in Gemini API call: {e}")
                return None
        return None

    @staticmethod
    def _extract_text(data: Dict[str, Any]) -> Optional[str]:
        """Robustly extract model text from a Gemini response, tolerating
        safety blocks, missing parts, and thinking-only parts."""
        candidates = data.get("candidates") or []
        if not candidates:
            fb = (data.get("promptFeedback") or {}).get("blockReason")
            if fb:
                logger.warning(f"Gemini blocked the prompt: {fb}")
            return None

        cand = candidates[0]
        finish = cand.get("finishReason")
        parts = ((cand.get("content") or {}).get("parts")) or []

        chunks = []
        for p in parts:
            if p.get("thought"):
                continue
            t = p.get("text")
            if isinstance(t, str) and t.strip():
                chunks.append(t)

        if not chunks:
            logger.warning(f"Gemini returned no usable text (finishReason={finish}).")
            return None
        if finish not in (None, "STOP"):
            logger.warning(f"Gemini finished with reason={finish}; using partial text.")
        return "".join(chunks)

    def process_conversational_turn(
        self,
        user_message: str,
        catalog_products: List[Dict[str, Any]],
        image_url: Optional[str] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Unified single-pass shopping intelligence engine."""
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
            "   - Understand context from previous messages (e.g., if the user mentioned owning a red shirt and asks 'iske saath konsi pant achi lagegi?', recommend colour-appropriate matching items chosen ONLY from available_marketplace_products).\n"
            "   - If user says 'ye pasand nahi aya' / 'nhi shoes nhi', strictly exclude rejected items and suggest alternative categories available in the marketplace.\n"
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
                img_ctx = " [Image attached]" if h.get("image_url") else ""
                entry = f"{role_label}: {content_text}{img_ctx}"
                if prods_context:
                    entry += f"\n  -> {prods_context}"
                formatted_history.append(entry)
            parts.append({"text": "Recent Chat History:\n" + "\n".join(formatted_history)})

        # Image: only re-attach if current turn has one, or user references the image,
        # or the immediately preceding user turn had an image.
        _IMAGE_REF_TOKENS = (
            "image", "picture", "photo", "tasveer", "tasweer", "pic",
            "is dress", "isi", "same", "yeh wali", "ye wali", "upar",
        )
        active_img_url = image_url
        if not active_img_url and history:
            msg_l = (user_message or "").lower()
            references_image = any(tok in msg_l for tok in _IMAGE_REF_TOKENS)
            last_user = next((h for h in reversed(history) if h.get("role") == "user"), None)
            if references_image or (last_user and last_user.get("image_url")):
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
                parts.append({"text": "Attached/Reference Image uploaded in this chat."})

        # Compact Product Catalog
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
            "text": "Context & Available Marketplace Products:\n"
                    + json.dumps(prompt_context, separators=(",", ":"))
                    + "\n\nGenerate your response and select matching product IDs strictly from the available marketplace products."
        })

        payload = {
            "contents": [{"parts": parts}],
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "generation_config": {
                "response_mime_type": "application/json",
                "temperature": 0.2,
                "thinkingConfig": {"thinkingBudget": 0},
            },
        }

        data = self._post_with_retry(payload)
        if data:
            raw_text = self._extract_text(data)
            if raw_text:
                try:
                    parsed = json.loads(raw_text)
                    valid_ids = {p["id"] for p in catalog_products}
                    final_ids = []
                    for i in parsed.get("recommended_product_ids") or []:
                        try:
                            pid = int(i)
                        except (TypeError, ValueError):
                            logger.warning(f"Model returned non-numeric product id: {i!r}")
                            continue
                        if pid in valid_ids and pid not in final_ids:
                            final_ids.append(pid)
                    return {
                        "message": parsed.get("message") or "Aapke liye ye behtareen options hain:",
                        "recommended_product_ids": final_ids,
                        "demand_keyword": parsed.get("demand_keyword"),
                        "category_hint": parsed.get("category_hint"),
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
        """Rule-based fallback response when Gemini API is unavailable."""
        msg = (user_message or "").lower()
        tokens = set(re.findall(r"[a-z]+", msg))

        # Greetings (word-boundary matching to avoid false positives)
        if tokens & {"salam", "assalam", "hello", "hi", "hey", "asalam", "aoa"}:
            return {
                "message": "Walaikum Assalam! Main AI Plaza ka Shopping Assistant hoon. Aaj main aapki shopping mein kya madad kar sakta hoon?",
                "recommended_product_ids": [],
                "demand_keyword": None,
                "category_hint": None
            }

        # Small talk / thanks
        if tokens & {"shukriya", "thanks", "thank", "theek", "ok", "okay", "acha"}:
            return {
                "message": "Bohat shukriya! Agar mazeed koi product dekhna ho ya order place karna ho toh zaroor batayein.",
                "recommended_product_ids": [],
                "demand_keyword": None,
                "category_hint": None
            }

        # Order guidance (generic, no hardcoded products)
        if tokens & {"order", "buy", "khareed", "kharid", "purchase", "cart", "checkout"}:
            ids = [
                p["id"] for p in catalog_products
                if any(w in p["name"].lower() for w in tokens if len(w) > 3)
            ]
            return {
                "message": (
                    "Ji bilkul! Order karne ke liye product card par 'Add Cart' button dabayein "
                    "aur checkout proceed karein — delivery 3-5 din mein Pakistan bhar."
                    if ids else
                    "Ji bilkul! Bataiye kaunsa product order karna hai, main aap ko wo dikha deta hoon."
                ),
                "recommended_product_ids": ids[:3],
                "demand_keyword": None,
                "category_hint": None,
            }

        # Keyword match against catalog
        matching_ids = []
        for p in catalog_products:
            p_name = p["name"].lower()
            if any(word in p_name for word in tokens if len(word) > 3):
                matching_ids.append(p["id"])

        if matching_ids:
            return {
                "message": "Aapki request ke mutabiq ye behtareen options marketplace mein available hain:",
                "recommended_product_ids": matching_ids[:3],
                "demand_keyword": None,
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
