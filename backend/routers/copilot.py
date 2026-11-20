from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from services.gemini_service import gemini_service

router = APIRouter(prefix="/copilot", tags=["Copilot"])

class QueryRequest(BaseModel):
    prompt: str
    language: Optional[str] = "en"

class QueryResponse(BaseModel):
    response: str
    timeline_events: Optional[List[Dict[str, Any]]] = []
    scenario: Optional[str] = "GENERAL"
    source: str

@router.post("/query", response_model=QueryResponse)
async def execute_query(req: QueryRequest):
    """
    Executes a multimodal safety inquiry via Google Gemini & Google Agent Skills.
    Falls back gracefully to high-performance venue cache if API key or network is offline.
    """
    try:
        result = gemini_service.query(req.prompt, language=req.language)
        return QueryResponse(
            response=result.get("response", ""),
            timeline_events=result.get("timeline_events", []),
            scenario=result.get("scenario", "GENERAL"),
            source=result.get("source", "REASONING_ENGINE")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
