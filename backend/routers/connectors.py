from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import sys
import os
import yaml

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from services.gemini_service import gemini_service

router = APIRouter(prefix="/connectors", tags=["ROCP Connectors"])

class NewConnectorRequest(BaseModel):
    product_id: str
    display_name: str
    modality: str  # VIDEO, AUDIO, IMAGE, SENSOR_TELEMETRY, SIGNALLING
    endpoint_url: str
    tool_name: str
    description: str

@router.get("/")
async def list_connectors():
    """Lists all active ROCP product connectors."""
    return {
        "active_connectors": gemini_service.engine.registry.list_connectors()
    }

@router.post("/register")
async def register_connector(req: NewConnectorRequest):
    """
    Registers a new railway safety product endpoint.
    Saves the YAML manifest into connectors/ and triggers hot-reload.
    """
    connectors_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "connectors"))
    file_path = os.path.join(connectors_dir, f"{req.product_id}.yaml")
    
    manifest = {
        "product_id": req.product_id,
        "display_name": req.display_name,
        "modality": req.modality,
        "category": "DYNAMIC_REGISTERED_PRODUCT",
        "endpoint": {
            "url": req.endpoint_url,
            "auth_type": "none",
            "timeout_seconds": 5
        },
        "gemini_tool_definition": {
            "name": req.tool_name,
            "description": req.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "train_no": {"type": "string", "description": "Train number or rake ID"}
                },
                "required": ["train_no"]
            }
        }
    }
    
    with open(file_path, "w", encoding="utf-8") as f:
        yaml.dump(manifest, f)
        
    gemini_service.engine.registry.reload()
    return {
        "status": "SUCCESS",
        "message": f"Successfully registered connector '{req.display_name}'. Google Gemini loaded skill '{req.tool_name}'.",
        "manifest_path": file_path
    }

@router.post("/reload")
async def reload_connectors():
    """Hot-reloads connector directory."""
    gemini_service.engine.registry.reload()
    return {"status": "SUCCESS", "loaded_count": len(gemini_service.engine.registry.connectors)}
