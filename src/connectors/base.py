import json
import os
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class CanonicalRailwayEvent(BaseModel):
    """Canonical representation of any safety or operational event across all railway products."""
    event_id: str
    source_product: str
    modality: str  # AUDIO, VIDEO, IMAGE, SENSOR_TELEMETRY, SIGNALLING
    timestamp: str
    train_no: str
    loco_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    section: Optional[str] = None
    location_marker: Optional[str] = None
    event_type: str
    severity: str = "INFO"  # CRITICAL, WARNING, INFO
    verification_status: str = "PENDING_VERIFICATION"  # CONFIRMED, PENDING_VERIFICATION, REJECTED
    summary: str
    metrics: Dict[str, Any] = Field(default_factory=dict)
    evidence: Dict[str, Any] = Field(default_factory=dict)

class BaseProductConnector(ABC):
    """Abstract Base Class for RailKavach Open Connector Protocol (ROCP)."""
    
    def __init__(self, manifest: Dict[str, Any]):
        self.manifest = manifest
        self.product_id = manifest["product_id"]
        self.display_name = manifest.get("display_name", self.product_id)
        self.modality = manifest.get("modality", "SENSOR_TELEMETRY")
        self.endpoint_cfg = manifest.get("endpoint", {})
        self.tool_def = manifest.get("gemini_tool_definition", {})

    @abstractmethod
    def query(self, **kwargs) -> List[CanonicalRailwayEvent]:
        """Fetch and return normalized CanonicalRailwayEvents."""
        pass

    def get_tool_declaration(self) -> Dict[str, Any]:
        """Returns the Gemini FunctionDeclaration dict for dynamic LLM registration."""
        return self.tool_def
