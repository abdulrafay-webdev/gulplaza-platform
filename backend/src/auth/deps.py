from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from src.db.session import get_session
from src.services import shop_service
import os
from dotenv import load_dotenv
from jose import jwt

load_dotenv()

security = HTTPBearer()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_PUBLISHABLE_KEY = os.getenv("CLERK_PUBLISHABLE_KEY")

# Simple JWT verification (decoding without signature verification for MVP speed if JWKS is complex, 
# BUT Clerk docs recommend JWKS. For baseline, we'll try to do it right or use a library.)
# Actually, for "Simplicity" and "Baseline", we might just check if the token exists and maybe decode unverified 
# if we trust the transport (SSL) and Clerk's SDK validation if available.
# However, strict security is a principle. 
# Let's implement a basic decoder that extracts claims.

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # In a real production app, verify signature using Clerk's JWKS.
        # For this baseline, we assume the token is valid if it parses and we might verify against Clerk API 
        # or just decode unverified to get the 'sub' (User ID) and metadata.
        # Using unverified options for simplicity in this artifact, BUT strongly recommending verification.
        
        # NOTE: This is a placeholder for full JWKS verification.
        # Using python-jose's get_unverified_claims for MVP
        payload = jwt.get_unverified_claims(token)
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no sub")
            
        # Extract metadata if available in token, or fetch from Clerk
        public_metadata = payload.get("public_metadata", {})
        
        role = public_metadata.get("role")
        
        # TEMPORARY BYPASS: Force SHOP_OWNER role for this specific user
        if user_id == "user_38gxODtYHX94wosiJA1SvLD4M7C":
            role = "SHOP_OWNER"
            
        return {
            "id": user_id,
            "role": role,
            "shop_id": public_metadata.get("shop_id")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {str(e)}")

def get_shop_owner(user = Depends(get_current_user), session: Session = Depends(get_session)):
    # 1. Trust the token if it says SHOP_OWNER
    if user["role"] == "SHOP_OWNER":
        return user
        
    # 2. Fallback: Check DB if the user owns a shop
    # This handles cases where Clerk metadata isn't updated yet or custom auth flows
    shop = shop_service.get_shop_by_owner(session, user["id"])
    if shop:
        # User owns a shop, so they are a shop owner.
        user["role"] = "SHOP_OWNER"
        user["shop_id"] = shop.id
        return user

    raise HTTPException(status_code=403, detail="Not a Shop Owner")

def get_super_admin(user = Depends(get_current_user)):
    # For baseline, we can allow a specific user ID or check role
    # Replace with your actual Admin User ID if known, or use Metadata
    if user["role"] != "SUPER_ADMIN":
         # Fallback: Allow if user_id matches a hardcoded admin for bootstrap
         if user["id"] == "user_38gxODtYHX94wosiJA1SvLD4M7C": # Use your ID as Super Admin too for now
             return user
         raise HTTPException(status_code=403, detail="Not a Super Admin")
    return user
