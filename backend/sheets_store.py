import os
import json
import httpx
from typing import Dict, Any, Optional, List

GOOGLE_SHEET_URL = os.getenv(
    "GOOGLE_SHEET_URL",
    "https://script.google.com/macros/s/AKfycbyYazUwkFmGI53XpkasbAdnbcwN-e3GiZ2DGJUjMYyEJG0aeAWzJSdqF9Adxk9yhahTRQ/exec"
)

def _call_sheet_api(payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        with httpx.Client(follow_redirects=True, timeout=15.0) as client:
            r = client.post(GOOGLE_SHEET_URL, json=payload)
            if r.status_code == 200:
                return r.json()
            else:
                print(f"[SheetsStore] Error status: {r.status_code}, response: {r.text}")
                return {"status": "error", "message": f"HTTP status {r.status_code}"}
    except Exception as e:
        print(f"[SheetsStore] Exception calling Apps Script: {e}")
        return {"status": "error", "message": str(e)}

def db_register_user(username: str, password_hash: str, email: str) -> bool:
    # 1. Register base user
    res = _call_sheet_api({
        "action": "register",
        "username": username,
        "password_hash": password_hash
    })
    if res.get("status") == "success":
        # 2. Store default profile key
        default_profile = {
            "email": email,
            "xp": 0,
            "coins": 100,
            "streak": 0,
            "level": 1,
            "rank": "Beginner",
            "weak_topics": []
        }
        db_save_profile(username, default_profile)
        return True
    return False

def db_get_user_hash(username: str) -> Optional[str]:
    res = _call_sheet_api({
        "action": "login",
        "username": username
    })
    if res.get("status") == "success":
        return res.get("password_hash")
    return None

def db_get_profile(username: str) -> Dict[str, Any]:
    res = _call_sheet_api({
        "action": "get_roadmap",
        "username": username,
        "topic": "profile"
    })
    if res.get("status") == "success":
        return res.get("roadmap_data") or {}
    return {}

def db_save_profile(username: str, profile_data: Dict[str, Any]) -> bool:
    res = _call_sheet_api({
        "action": "save_roadmap",
        "username": username,
        "topic": "profile",
        "roadmap_data": profile_data
    })
    return res.get("status") == "success"

def db_get_roadmap(username: str, topic: str) -> Optional[List[Dict[str, Any]]]:
    res = _call_sheet_api({
        "action": "get_roadmap",
        "username": username,
        "topic": f"roadmap:{topic.lower()}"
    })
    if res.get("status") == "success":
        return res.get("roadmap_data")
    return None

def db_save_roadmap(username: str, topic: str, roadmap_data: List[Dict[str, Any]]) -> bool:
    res = _call_sheet_api({
        "action": "save_roadmap",
        "username": username,
        "topic": f"roadmap:{topic.lower()}",
        "roadmap_data": roadmap_data
    })
    return res.get("status") == "success"

def db_get_vault_files(username: str) -> List[Dict[str, Any]]:
    res = _call_sheet_api({
        "action": "get_roadmap",
        "username": username,
        "topic": "vault_files"
    })
    if res.get("status") == "success":
        return res.get("roadmap_data") or []
    return []

def db_save_vault_files(username: str, files: List[Dict[str, Any]]) -> bool:
    res = _call_sheet_api({
        "action": "save_roadmap",
        "username": username,
        "topic": "vault_files",
        "roadmap_data": files
    })
    return res.get("status") == "success"

def db_get_chat_history(username: str, topic: str) -> List[Dict[str, Any]]:
    res = _call_sheet_api({
        "action": "get_roadmap",
        "username": username,
        "topic": f"chats:{topic.lower()}"
    })
    if res.get("status") == "success":
        return res.get("roadmap_data") or []
    return []

def db_save_chat_history(username: str, topic: str, messages: List[Dict[str, Any]]) -> bool:
    res = _call_sheet_api({
        "action": "save_roadmap",
        "username": username,
        "topic": f"chats:{topic.lower()}",
        "roadmap_data": messages
    })
    return res.get("status") == "success"

def db_upload_to_drive(filename: str, base64_content: str, mime_type: str) -> Optional[str]:
    res = _call_sheet_api({
        "action": "upload_file",
        "filename": filename,
        "file_content_base64": base64_content,
        "mime_type": mime_type
    })
    if res.get("status") == "success":
        return res.get("url")
    return None
