# Secret Superstore

A secure, self-hosted password manager built with React, FastAPI, and Supabase.

## Features
- **Secure Encryption**: Passwords are encrypted server-side using AES-256-GCM.
- **Authentication**: Secure login and registration via Supabase Auth.
- **Row Level Security**: Data is protected at the database level.
- **Modern UI**: Built with React and Tailwind CSS.

## Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- Supabase Project

## Setup

### 1. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor and run the contents of `scripts/init-supabase.sql`.
3. Get your project URL and Anon Key from Project Settings > API.
4. Get your Service Role Key from Project Settings > API (keep this secret!).
5. Get your JWT Secret from Project Settings > API > JWT Settings.

### 2. Environment Variables
Copy `.env.example` to `.env` in the root directory and fill in the values:
```bash
cp .env.example .env
```
- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key.
- `SUPABASE_JWT_SECRET`: Your Supabase JWT Secret.
- `ENCRYPTION_KEY`: A 32-byte hex or base64 string.

**Generating an Encryption Key:**
You can generate a secure key using Python:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
Or OpenSSL:
```bash
openssl rand -hex 32
```

### 3. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
pip install -r requirements.txt
```

Run the server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup
Navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Security Notes
- **Never commit your `.env` file.**
- Rotate your `ENCRYPTION_KEY` and Supabase keys periodically.
- Use a Key Management Service (KMS) for production key storage.
- The `reveal` endpoint is rate-limited (implementation suggested for production).

## Testing
Run backend tests:
```bash
cd backend
python -m pytest app/tests
```
