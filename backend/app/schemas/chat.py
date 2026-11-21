from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from .evidence import Citation

class ChatQueryRequest(BaseModel):
    query: str = Field(..., description="Conversational inquiry from safety officer")
    language: str = Field(default="en", description="Answer language: 'en' (English), 'hi' (Devanagari Hindi) or 'mixed' (Hinglish, Roman script)")
    incident_id: Optional[str] = Field(default=None, description="Optional incident scope")
    model_engine: Optional[str] = Field(default="gemini", description="Inference engine: 'gemini' (Gemini Cloud) or 'gemma' (Gemma Local Edge)")

class AccessInfo(BaseModel):
    """Server-side governance outcome for this answer (RBAC scope + DPDP handling)."""
    role: str
    purpose: str
    decision: str = Field(description="ALLOWED | PARTIAL (some evidence withheld) | DENIED")
    sources_in_scope: List[str] = Field(default_factory=list)
    sources_withheld: List[str] = Field(default_factory=list)
    pii_masked: bool = True
    reason: Optional[str] = None
    audit_seq: Optional[int] = None
    audit_hash: Optional[str] = None

class RuleRef(BaseModel):
    """A legal provision named in the answer, checked against the rule library (data/statutes.json)."""
    id: str
    act: str
    ref: str
    label: str
    title: Optional[str] = None
    summary: Optional[str] = None
    status: str = Field(description="IN_LIBRARY | NOT_IN_LIBRARY (named by the answer; check manually)")

class ChatQueryResponse(BaseModel):
    answer: str = Field(..., description="Grounded, timestamp-cited response")
    citations: List[Citation] = Field(default_factory=list, description="Explicit source evidence citations")
    suggested_actions: List[str] = Field(default_factory=list, description="Recommended operational follow-ups")
    latency_ms: int = Field(default=0, description="Response computation duration in milliseconds")
    token_usage: Dict[str, int] = Field(default_factory=dict, description="Input, output, and total token count")
    cached: bool = Field(default=False, description="Whether response was served from zero-latency fail-safe cache")
    bilingual_payload: Optional[Dict[str, str]] = Field(default=None, description="Devanagari Hindi and English paired content")
    access: Optional[AccessInfo] = Field(default=None, description="RBAC/DPDP governance applied to this answer")
    rules: List[RuleRef] = Field(default_factory=list, description="Legal provisions named in the answer, checked against the rule library")
    model_engine: Optional[str] = Field(default="gemini-3.5-flash-lite", description="Model engine that produced the answer")
