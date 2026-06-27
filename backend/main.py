import os
import json
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional

from backend.database import engine, get_db, Base
from backend.models import User, WeakTopic, VaultFile, ChatHistory
from backend.auth import get_password_hash, verify_password, create_access_token, get_current_user
from backend.ai_engine import query_llm_chain

# Automatically create database tables
Base.metadata.create_all(bind=engine)

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

# ==========================================
# Authentication Endpoints
# ==========================================
@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    user_exists = db.query(User).filter(User.username == user_in.username).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    email_exists = db.query(User).filter(User.email == user_in.email).first()
    if email_exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pw,
        xp=0,
        coins=100,
        streak=0,
        level=1,
        rank="Beginner"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

@app.post("/api/auth/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.username)
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================
# User Profile Endpoints
# ==========================================
@app.get("/api/user/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    weak_topics = [
        {"name": t.name, "retention": t.retention, "level": t.level}
        for t in current_user.weak_topics
    ]
    return {
        "username": current_user.username,
        "email": current_user.email,
        "xp": current_user.xp,
        "coins": current_user.coins,
        "streak": current_user.streak,
        "level": current_user.level,
        "rank": current_user.rank,
        "weakTopics": weak_topics
    }

@app.put("/api/user/profile")
def update_profile(
    profile: UserProfileUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if profile.xp is not None:
        current_user.xp = profile.xp
    if profile.coins is not None:
        current_user.coins = profile.coins
    if profile.streak is not None:
        current_user.streak = profile.streak
    if profile.level is not None:
        current_user.level = profile.level
    if profile.rank is not None:
        current_user.rank = profile.rank
        
    if profile.weak_topics is not None:
        # Clear existing weak topics
        db.query(WeakTopic).filter(WeakTopic.user_id == current_user.id).delete()
        for t in profile.weak_topics:
            new_t = WeakTopic(
                name=t.name,
                retention=t.retention,
                level=t.level,
                user_id=current_user.id
            )
            db.add(new_t)

    db.commit()
    db.refresh(current_user)
    return {"status": "success"}

# ==========================================
# Tutor Studio Endpoints
# ==========================================
@app.post("/api/tutor/generate")
async def generate_lesson(
    req: TutorGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Query LLM chain from ai_engine
    client_keys = req.keys or {}
    response = await query_llm_chain(req.topic, req.mode, client_keys)
    
    # Save generated lesson notes into the Vault Database for this user
    import datetime
    file_name = f"{req.topic.capitalize()} Notes"
    
    # Remove existing notes for the same topic to avoid duplicate clutter
    db.query(VaultFile).filter(
        VaultFile.user_id == current_user.id, 
        VaultFile.name == file_name
    ).delete()

    new_file = VaultFile(
        name=file_name,
        file_type="notes",
        created=datetime.datetime.now().strftime("%Y-%m-%d"),
        size=f"{(len(response['markdown']) / 1024):.1f} KB",
        data=json.dumps(response),
        user_id=current_user.id
    )
    db.add(new_file)
    db.commit()
    
    return response

@app.post("/api/tutor/chat")
def chatbot_reply(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import datetime
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    
    # Save student message
    student_chat = ChatHistory(
        topic=req.topic,
        sender="student",
        message=req.message,
        timestamp=timestamp,
        user_id=current_user.id
    )
    db.add(student_chat)
    
    # Generate simple simulated teacher follow-up context response
    tutor_reply_text = f"That is an interesting query regarding {req.topic}. Let's remember that edge cases are critical. Make sure you review your roadmap notes or complete the final Quiz Assessment!"
    
    tutor_chat = ChatHistory(
        topic=req.topic,
        sender="tutor",
        message=tutor_reply_text,
        timestamp=timestamp,
        user_id=current_user.id
    )
    db.add(tutor_chat)
    db.commit()
    
    return {
        "sender": "tutor",
        "message": tutor_reply_text,
        "timestamp": timestamp
    }

# ==========================================
# Vault & Files Endpoints
# ==========================================
@app.get("/api/vault")
def get_vault(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    files = db.query(VaultFile).filter(VaultFile.user_id == current_user.id).all()
    return [
        {
            "id": f.id,
            "name": f.name,
            "type": f.file_type,
            "created": f.created,
            "size": f.size
        } for f in files
    ]

@app.get("/api/vault/{file_id}")
def get_vault_file(file_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    file = db.query(VaultFile).filter(VaultFile.id == file_id, VaultFile.user_id == current_user.id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    parsed_data = json.loads(file.data)
    return {
        "id": file.id,
        "name": file.name,
        "type": file.file_type,
        "created": file.created,
        "size": file.size,
        "data": parsed_data.get("markdown", ""),
        "slides": parsed_data.get("slides", []),
        "quiz": parsed_data.get("quiz", [])
    }

@app.post("/api/vault/sync")
def sync_drive(filename: str = Body(..., embed=True)):
    # Simulate Drive upload
    return {"status": "success", "synced_file": filename}


# Serve static web files from frontend directory
frontend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    print(f"Warning: Static frontend directory not found at {frontend_path}")
