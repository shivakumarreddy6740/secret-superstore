import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def get_key() -> bytes:
    key_str = os.getenv("ENCRYPTION_KEY")
    if not key_str:
        raise ValueError("ENCRYPTION_KEY environment variable is not set")
    
    # Try decoding from base64
    try:
        decoded = base64.b64decode(key_str)
        if len(decoded) == 32:
            return decoded
    except Exception:
        pass
    
    # Try decoding from hex
    try:
        decoded = bytes.fromhex(key_str)
        if len(decoded) == 32:
            return decoded
    except Exception:
        pass
        
    raise ValueError("ENCRYPTION_KEY must be a valid base64 or hex string")

def encrypt(plaintext: str) -> tuple[bytes, bytes]:
    """
    Encrypts plaintext using AES-256-GCM.
    Returns (ciphertext, nonce).
    """
    key = get_key()
    if len(key) != 32:
        raise ValueError(f"ENCRYPTION_KEY must be 32 bytes, got {len(key)}")
        
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
    return ciphertext, nonce

def decrypt(ciphertext: bytes, nonce: bytes) -> str:
    """
    Decrypts ciphertext using AES-256-GCM.
    Returns plaintext string.
    """
    key = get_key()
    if len(key) != 32:
        raise ValueError(f"ENCRYPTION_KEY must be 32 bytes, got {len(key)}")
        
    aesgcm = AESGCM(key)
    plaintext_bytes = aesgcm.decrypt(nonce, ciphertext, None)
    return plaintext_bytes.decode('utf-8')
