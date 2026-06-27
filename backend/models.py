from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    xp = Column(Integer, default=0)
    coins = Column(Integer, default=100)
    streak = Column(Integer, default=0)
    level = Column(Integer, default=1)
    rank = Column(String, default="Beginner")
    last_active = Column(String, nullable=True)

    weak_topics = relationship("WeakTopic", back_populates="user", cascade="all, delete-orphan")
    vault_files = relationship("VaultFile", back_populates="user", cascade="all, delete-orphan")
    chats = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")


class WeakTopic(Base):
    __tablename__ = "weak_topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    retention = Column(Integer, default=100)
    level = Column(String, default="high")  # low, medium, high
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="weak_topics")


class VaultFile(Base):
    __tablename__ = "vault_files"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # "notes" or "slides"
    created = Column(String, nullable=False)
    size = Column(String, nullable=False)
    data = Column(Text, nullable=False)  # JSON or markdown text
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="vault_files")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, nullable=False)
    sender = Column(String, nullable=False)  # "student" or "tutor"
    message = Column(Text, nullable=False)
    timestamp = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="chats")
