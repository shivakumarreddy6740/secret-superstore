import base64
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ..lib.auth import get_current_user
from ..lib.encryption import encrypt, decrypt
from ..lib.db import get_supabase_client

router = APIRouter()

class PasswordCreate(BaseModel):
    org_name: str
    password: str

class PasswordResponse(BaseModel):
    id: str
    org_name: str
    created_at: str

class PasswordRevealResponse(BaseModel):
    id: str
    org_name: str
    password: str

@router.post("/passwords", response_model=PasswordResponse)
def create_password(pwd: PasswordCreate, user_id: str = Depends(get_current_user)):
    ciphertext, nonce = encrypt(pwd.password)
    
    # Prefix with \x to ensure PostgREST treats it as hex-encoded bytea
    data = {
        "user_id": user_id,
        "org_name": pwd.org_name,
        "encrypted_password": r"\x" + ciphertext.hex(),
        "nonce": r"\x" + nonce.hex()
    }
    
    supabase = get_supabase_client()
    response = supabase.table("org_passwords").insert(data).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create password entry")
        
    return response.data[0]

@router.get("/passwords", response_model=List[PasswordResponse])
def list_passwords(user_id: str = Depends(get_current_user)):
    supabase = get_supabase_client()
    response = supabase.table("org_passwords").select("id, org_name, created_at").eq("user_id", user_id).execute()
    return response.data

@router.get("/passwords/{id}/reveal", response_model=PasswordRevealResponse)
def reveal_password(id: str, user_id: str = Depends(get_current_user)):
    supabase = get_supabase_client()
    response = supabase.table("org_passwords").select("*").eq("id", id).eq("user_id", user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Password not found")
        
    row = response.data[0]
    
    # Decrypt
    try:
        # Postgres bytea output might start with \x
        encrypted_hex = row["encrypted_password"]
        nonce_hex = row["nonce"]
        
        if encrypted_hex.startswith(r"\x"):
            encrypted_hex = encrypted_hex[2:]
            
        if nonce_hex.startswith(r"\x"):
            nonce_hex = nonce_hex[2:]
            
        ciphertext = bytes.fromhex(encrypted_hex)
        nonce = bytes.fromhex(nonce_hex)
        
        # Handle "Double Hex" legacy data
        # If the DB stored the hex string as bytes, we need to decode again.
        # Nonce is 12 bytes. If we have 24 bytes, it's likely double encoded.
        if len(nonce) == 24:
            try:
                decoded_nonce = bytes.fromhex(nonce.decode('utf-8'))
                nonce = decoded_nonce
            except Exception:
                pass
                
        # Try to decode ciphertext if it looks like hex
        try:
            decoded_ciphertext = bytes.fromhex(ciphertext.decode('utf-8'))
            # If successful, use it (heuristic: if it was double encoded, this works)
            ciphertext = decoded_ciphertext
        except Exception:
            pass
        
        plaintext = decrypt(ciphertext, nonce)
    except Exception as e:
        print(f"DEBUG: Error={e}")
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")
        
    return {
        "id": row["id"],
        "org_name": row["org_name"],
        "password": plaintext
    }

@router.delete("/passwords/{id}")
def delete_password(id: str, user_id: str = Depends(get_current_user)):
    supabase = get_supabase_client()
    # Verify ownership before delete (or let filter handle it)
    response = supabase.table("org_passwords").delete().eq("id", id).eq("user_id", user_id).execute()
    
    # response.data will contain deleted rows
    if not response.data:
        raise HTTPException(status_code=404, detail="Password not found or not authorized")
        
    return {"message": "Password deleted"}
