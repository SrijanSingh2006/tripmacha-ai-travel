from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str
    text: str

class UserChatRequest(BaseModel):
    prompt: str
    history: List[ChatMessage] = []