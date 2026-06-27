import os
import json
import base64
import time
import datetime
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional

from backend.auth import get_password_hash, verify_password, create_access_token, get_current_user, UserSession
from backend.ai_engine import query_llm_chain

app = FastAPI(title="MentorAI API Server")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Pydantic Schemas
# ==========================================
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TopicPill(BaseModel):
    name: str
    retention: int
    level: str

class UserProfileUpdate(BaseModel):
    xp: Optional[int] = None
    coins: Optional[int] = None
    streak: Optional[int] = None
    level: Optional[int] = None
    rank: Optional[str] = None
    weak_topics: Optional[List[TopicPill]] = None

class TutorGenerateRequest(BaseModel):
    topic: str
    mode: str
    keys: Optional[Dict[str, str]] = None

class ChatRequest(BaseModel):
    topic: str
    message: str

class SyncRequest(BaseModel):
    filename: str

# ==========================================
# Authentication Endpoints
# ==========================================
@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister):
    from backend.sheets_store import db_register_user, db_get_user_hash
    # Check if user already exists
    if db_get_user_hash(user_in.username) is not None:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_pw = get_password_hash(user_in.password)
    success = db_register_user(user_in.username, hashed_pw, user_in.email)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to register user in Google Sheets")
    return {"message": "User registered successfully"}

@app.post("/api/auth/login", response_model=Token)
def login(user_in: UserLogin):
    from backend.sheets_store import db_get_user_hash
    hashed_pw = db_get_user_hash(user_in.username)
    if not hashed_pw or not verify_password(user_in.password, hashed_pw):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user_in.username)
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================
# User Profile Endpoints
# ==========================================
@app.get("/api/user/profile")
def get_profile(current_user: UserSession = Depends(get_current_user)):
    from backend.sheets_store import db_get_profile
    profile = db_get_profile(current_user.username)
    if not profile:
        return {
            "username": current_user.username,
            "email": "",
            "xp": 0,
            "coins": 100,
            "streak": 0,
            "level": 1,
            "rank": "Beginner",
            "weakTopics": []
        }
    return {
        "username": current_user.username,
        "email": profile.get("email", ""),
        "xp": profile.get("xp", 0),
        "coins": profile.get("coins", 100),
        "streak": profile.get("streak", 0),
        "level": profile.get("level", 1),
        "rank": profile.get("rank", "Beginner"),
        "weakTopics": profile.get("weak_topics") or []
    }

@app.put("/api/user/profile")
def update_profile(
    profile: UserProfileUpdate, 
    current_user: UserSession = Depends(get_current_user)
):
    from backend.sheets_store import db_get_profile, db_save_profile
    curr = db_get_profile(current_user.username)
    if not curr:
        curr = {
            "email": "",
            "xp": 0,
            "coins": 100,
            "streak": 0,
            "level": 1,
            "rank": "Beginner",
            "weak_topics": []
        }
    if profile.xp is not None:
        curr["xp"] = profile.xp
    if profile.coins is not None:
        curr["coins"] = profile.coins
    if profile.streak is not None:
        curr["streak"] = profile.streak
    if profile.level is not None:
        curr["level"] = profile.level
    if profile.rank is not None:
        curr["rank"] = profile.rank
        
    if profile.weak_topics is not None:
        curr["weak_topics"] = [
            {"name": t.name, "retention": t.retention, "level": t.level}
            for t in profile.weak_topics
        ]

    db_save_profile(current_user.username, curr)
    return {"status": "success"}

# ==========================================
# Tutor Studio Endpoints
# ==========================================
@app.post("/api/tutor/generate")
async def generate_lesson(
    req: TutorGenerateRequest,
    current_user: UserSession = Depends(get_current_user)
):
    client_keys = req.keys or {}
    response = await query_llm_chain(req.topic, req.mode, client_keys)
    
    from backend.sheets_store import db_get_vault_files, db_save_vault_files
    file_name = f"{req.topic.capitalize()} Notes"
    
    files = db_get_vault_files(current_user.username)
    # Remove existing notes for the same topic
    files = [f for f in files if f.get("name") != file_name]
    
    file_id = int(time.time() * 1000)
    new_file = {
        "id": file_id,
        "name": file_name,
        "file_type": "notes",
        "created": datetime.datetime.now().strftime("%Y-%m-%d"),
        "size": f"{(len(response['markdown']) / 1024):.1f} KB",
        "data": json.dumps(response)
    }
    files.append(new_file)
    db_save_vault_files(current_user.username, files)
    
    return response

@app.post("/api/tutor/chat")
def chatbot_reply(
    req: ChatRequest,
    current_user: UserSession = Depends(get_current_user)
):
    from backend.sheets_store import db_get_chat_history, db_save_chat_history
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    
    chats = db_get_chat_history(current_user.username, req.topic)
    
    chats.append({
        "topic": req.topic,
        "sender": "student",
        "message": req.message,
        "timestamp": timestamp
    })
    
    tutor_reply_text = f"That is an interesting query regarding {req.topic}. Let's remember that edge cases are critical. Make sure you review your roadmap notes or complete the final Quiz Assessment!"
    
    chats.append({
        "topic": req.topic,
        "sender": "tutor",
        "message": tutor_reply_text,
        "timestamp": timestamp
    })
    
    db_save_chat_history(current_user.username, req.topic, chats)
    
    return {
        "sender": "tutor",
        "message": tutor_reply_text,
        "timestamp": timestamp
    }

# ==========================================
# Vault & Files Endpoints
# ==========================================
@app.get("/api/vault")
def get_vault(current_user: UserSession = Depends(get_current_user)):
    from backend.sheets_store import db_get_vault_files
    files = db_get_vault_files(current_user.username)
    return [
        {
            "id": f.get("id"),
            "name": f.get("name"),
            "type": f.get("file_type"),
            "created": f.get("created"),
            "size": f.get("size")
        } for f in files
    ]

@app.get("/api/vault/{file_id}")
def get_vault_file(file_id: int, current_user: UserSession = Depends(get_current_user)):
    from backend.sheets_store import db_get_vault_files
    files = db_get_vault_files(current_user.username)
    file = next((f for f in files if f.get("id") == file_id), None)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    parsed_data = json.loads(file["data"])
    return {
        "id": file["id"],
        "name": file["name"],
        "type": file["file_type"],
        "created": file["created"],
        "size": file["size"],
        "data": parsed_data.get("markdown", ""),
        "slides": parsed_data.get("slides", []),
        "quiz": parsed_data.get("quiz", [])
    }

@app.post("/api/vault/sync")
def sync_drive(
    req: SyncRequest,
    current_user: UserSession = Depends(get_current_user)
):
    from backend.sheets_store import db_get_vault_files, db_upload_to_drive
    
    files = db_get_vault_files(current_user.username)
    file = next((f for f in files if f.get("name") == req.filename), None)
    if not file:
        raise HTTPException(status_code=404, detail="File not found in vault")
    
    try:
        parsed_data = json.loads(file["data"])
        content = parsed_data.get("markdown", "")
    except Exception:
        content = file["data"]
        
    base64_content = base64.b64encode(content.encode("utf-8")).decode("utf-8")
    
    drive_url = db_upload_to_drive(
        filename=f"{req.filename}.md",
        base64_content=base64_content,
        mime_type="text/markdown"
    )
    
    if not drive_url:
        raise HTTPException(status_code=500, detail="Failed to upload file to Google Drive")
        
    return {"status": "success", "synced_file": req.filename, "url": drive_url}


# Serve static web files from frontend directory
frontend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    print(f"Warning: Static frontend directory not found at {frontend_path}")
