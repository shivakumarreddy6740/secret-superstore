import os
from supabase import create_client, Client

def get_supabase_client() -> Client:
    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        raise ValueError("Supabase URL and Service Role Key must be set")
        
    return create_client(url, key)
