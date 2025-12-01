import os
import pytest
from ..lib.encryption import encrypt, decrypt

# Mock the key for testing
os.environ["ENCRYPTION_KEY"] = "0000000000000000000000000000000000000000000000000000000000000000"

def test_encryption_roundtrip():
    plaintext = "super_secret_password"
    ciphertext, nonce = encrypt(plaintext)
    
    assert ciphertext != plaintext.encode()
    
    decrypted = decrypt(ciphertext, nonce)
    assert decrypted == plaintext

def test_encryption_randomness():
    plaintext = "same_password"
    c1, n1 = encrypt(plaintext)
    c2, n2 = encrypt(plaintext)
    
    # Nonces should be different
    assert n1 != n2
    # Ciphertexts should be different because of different nonces
    assert c1 != c2

def test_invalid_key_length():
    original_key = os.environ["ENCRYPTION_KEY"]
    os.environ["ENCRYPTION_KEY"] = "short_key"
    
    try:
        with pytest.raises(ValueError, match="ENCRYPTION_KEY must be a valid base64 or hex string"):
            encrypt("test")
    finally:
        os.environ["ENCRYPTION_KEY"] = original_key
