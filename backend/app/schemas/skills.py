from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from .evidence import ReviewerStatus, ViolationType, DamageClass

class RailcommSearchInput(BaseModel):
    keyword: Optional[str] = Field(default=None, description="Search term in Hindi, English, or safety vocabulary")
    train_no: Optional[str] = Field(default=None, description="Train number (e.g. 12414, BOXN-542)")
    section: Optional[str] = Field(default=None, description="Railway section (e.g. Bikaner-Suratgarh)")
    start_time: Optional[str] = Field(default=None, description="Start time filter (HH:MM:SS)")
    end_time: Optional[str] = Field(default=None, description="End time filter (HH:MM:SS)")

class LocateViolationsInput(BaseModel):
    loco_id: Optional[str] = Field(default=None, description="Locomotive identifier (e.g. WAP-7 30452)")
    train_no: Optional[str] = Field(default=None, description="Train number")
    violation_type: ViolationType = Field(default=ViolationType.ALL, description="Safety violation filter")
    verification_status: ReviewerStatus = Field(default=ReviewerStatus.ALL, description="Human reviewer verification status")
    time_window: Optional[str] = Field(default=None, description="Target time range (HH:MM:SS - HH:MM:SS)")

class WddDamagesInput(BaseModel):
    train_no: Optional[str] = Field(default=None, description="Train or rake number")
    wagon_no: Optional[str] = Field(default=None, description="Specific wagon serial extracted via PaddleOCR")
    damage_class: DamageClass = Field(default=DamageClass.ALL, description="Class of rolling stock defect")
    new_damage_only: bool = Field(default=False, description="Filter for newly sustained transit damage between entry and exit gantries")

class TimelineSyncInput(BaseModel):
    incident_id: Optional[str] = Field(default="INC-12414-20261118", description="Incident identifier")
    train_no: Optional[str] = Field(default="12414", description="Train number")
    window_minutes_before: int = Field(default=15, description="Minutes before critical event")
    window_minutes_after: int = Field(default=5, description="Minutes after critical event")

class ReportGenInput(BaseModel):
    incident_id: str = Field(default="INC-12414-20261118", description="Incident reference")
    format: str = Field(default="ALL", description="STATUTORY_INQUIRY_REPORT, CREW_LOBBY_BRIEFING, or ALL")
    language: str = Field(default="BILINGUAL_HI_EN", description="BILINGUAL_HI_EN, HINDI, or ENGLISH")

class PatternAnomalyInput(BaseModel):
    group_by: str = Field(default="TIME_OF_DAY", description="TIME_OF_DAY, CREW, or SECTION")
    min_occurrences: int = Field(default=2, description="Minimum count to flag as recurring cluster")
