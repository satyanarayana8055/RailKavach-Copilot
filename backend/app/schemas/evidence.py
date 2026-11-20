from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class ReviewerStatus(str, Enum):
    ALL = "ALL"
    CONFIRMED = "CONFIRMED"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    REJECTED = "REJECTED"
    SYSTEM_SUPPRESSED = "SYSTEM_SUPPRESSED"

class ViolationType(str, Enum):
    ALL = "ALL"
    MOBILE_PHONE = "MOBILE_PHONE"
    SLEEPING = "SLEEPING"
    EATING_DRINKING = "EATING_DRINKING"
    HAND_SIGNAL_NOT_RETURNED = "HAND_SIGNAL_NOT_RETURNED"
    UNAUTHORIZED_PERSON = "UNAUTHORIZED_PERSON"

class DamageClass(str, Enum):
    ALL = "ALL"
    BODY_PANEL = "BODY_PANEL"
    DOOR_DEFECT = "DOOR_DEFECT"
    BOGIE_CRACK = "BOGIE_CRACK"
    COUPLER_DAMAGE = "COUPLER_DAMAGE"
    HANDRAIL_BROKEN = "HANDRAIL_BROKEN"
    BRAKE_BEAM_DEFECT = "BRAKE_BEAM_DEFECT"
    SPRING_BROKEN = "SPRING_BROKEN"
    LADDER_DAMAGE = "LADDER_DAMAGE"

class Citation(BaseModel):
    timestamp: str = Field(description="Exact timestamp formatted as HH:MM:SS or YYYY-MM-DD HH:MM:SS")
    source: str = Field(description="Originating sensor or stream: Railcomm VHF, Locate Cabin Cam, or WDD Gantry")
    event_description: str = Field(description="Summary of the evidenced event")
    reviewer_status: Optional[str] = Field(default=None, description="Human reviewer verification status if applicable")
    evidence_id: Optional[str] = Field(default=None, description="Record identifier")
