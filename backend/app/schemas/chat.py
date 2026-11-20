from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from .evidence import Citation

class ChatQueryRequest(BaseModel):
    query: str = Field(..., description="Conversational inquiry from safety officer")
    language: str = Field(default="en", description="Preferred output language: 'en' (English) or 'hi' (Devanagari Hindi)")
    incident_id: Optional[str] = Field(default=None, description="Optional incident scope")

class ChatQueryResponse(BaseModel):
    answer: str = Field(..., description="Grounded, timestamp-cited response")
    citations: List[Citation] = Field(default_factory=list, description="Explicit source evidence citations")
    suggested_actions: List[str] = Field(default_factory=list, description="Recommended operational follow-ups")
    latency_ms: int = Field(default=0, description="Response computation duration in milliseconds")
    token_usage: Dict[str, int] = Field(default_factory=dict, description="Input, output, and total token count")
    cached: bool = Field(default=False, description="Whether response was served from zero-latency fail-safe cache")
    bilingual_payload: Optional[Dict[str, str]] = Field(default=None, description="Devanagari Hindi and English paired content")
