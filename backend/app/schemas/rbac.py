from enum import Enum
from pydantic import BaseModel
from typing import List, Optional

class UserRole(str, Enum):
    ROLE_SR_DSO = "ROLE_SR_DSO"                      # Senior Divisional Safety Officer
    ROLE_SR_DEE = "ROLE_SR_DEE"                      # Senior Divisional Electrical Engineer (TRO)
    ROLE_SR_DME = "ROLE_SR_DME"                      # Senior Divisional Mechanical Engineer (C&W)
    ROLE_CREW_CONTROLLER = "ROLE_CREW_CONTROLLER"    # Lobby In-Charge
    ROLE_CRS = "ROLE_CRS"                            # Commissioner of Railway Safety (Statutory)

class RoleProfile(BaseModel):
    role: UserRole
    title: str
    designation: str
    division: str
    allowed_tabs: List[str]
    data_scopes: List[str]          # RAILCOMM | LOCATE | WDD | WILD | TELEMETRY — enforced server-side
    can_view_audit_log: bool = False
    can_verify_alerts: bool
    can_view_unmasked_pii: bool
    can_sign_crs_report: bool
    can_issue_sickline_orders: bool
    description: str

ROLE_REGISTRY = {
    UserRole.ROLE_SR_DSO: RoleProfile(
        role=UserRole.ROLE_SR_DSO,
        title="Sr. DSO (Divisional Safety Officer)",
        designation="Sr. Divisional Safety Officer, Bikaner Division",
        division="Bikaner (NWR)",
        allowed_tabs=["copilot", "files", "timeline", "wdd", "artifacts"],
        data_scopes=["RAILCOMM", "LOCATE", "WDD", "WILD", "TELEMETRY"],
        can_view_audit_log=True,
        can_verify_alerts=True,
        can_view_unmasked_pii=True,
        can_sign_crs_report=True,
        can_issue_sickline_orders=False,
        description="Full investigatory authority for SPADs, avoided collisions, and statutory preliminary inquiry reports."
    ),
    UserRole.ROLE_SR_DEE: RoleProfile(
        role=UserRole.ROLE_SR_DEE,
        title="Sr. DEE/TRO (Loco Operations)",
        designation="Sr. Divisional Electrical Engineer (TRO), Bikaner",
        division="Bikaner (NWR)",
        allowed_tabs=["copilot", "files", "timeline", "artifacts"],
        data_scopes=["RAILCOMM", "LOCATE", "TELEMETRY"],
        can_verify_alerts=True,
        can_view_unmasked_pii=True,
        can_sign_crs_report=False,
        can_issue_sickline_orders=False,
        description="Oversees locomotive footplate discipline, mobile phone infraction counseling, and night-shift fatigue clusters."
    ),
    UserRole.ROLE_SR_DME: RoleProfile(
        role=UserRole.ROLE_SR_DME,
        title="Sr. DME/C&W (Rolling Stock & Wagons)",
        designation="Sr. Divisional Mechanical Engineer (C&W), Lalgarh Yard",
        division="Bikaner (NWR)",
        allowed_tabs=["wdd", "files", "copilot"],
        data_scopes=["WDD", "WILD"],
        can_verify_alerts=False,
        can_view_unmasked_pii=False,
        can_sign_crs_report=False,
        can_issue_sickline_orders=True,
        description="Analyzes 6-gantry wagon damage differentials, PaddleOCR serials, and issues sick-line shunting repair orders."
    ),
    UserRole.ROLE_CREW_CONTROLLER: RoleProfile(
        role=UserRole.ROLE_CREW_CONTROLLER,
        title="Crew Controller (Lobby In-Charge)",
        designation="Crew Controller, Suratgarh Junction Lobby",
        division="Suratgarh Lobby",
        allowed_tabs=["artifacts", "copilot"],
        data_scopes=["RAILCOMM", "LOCATE"],
        can_verify_alerts=False,
        can_view_unmasked_pii=False,
        can_sign_crs_report=False,
        can_issue_sickline_orders=False,
        description="Administers biometric sign-ons and generates spoken pre-trip safety briefs in Devanagari Hindi. DPDP masked."
    ),
    UserRole.ROLE_CRS: RoleProfile(
        role=UserRole.ROLE_CRS,
        title="CRS (Commissioner of Railway Safety)",
        designation="Commissioner of Railway Safety, Northern Circle",
        division="All Zones (Statutory Independent)",
        allowed_tabs=["copilot", "files", "timeline", "wdd", "artifacts"],
        data_scopes=["RAILCOMM", "LOCATE", "WDD", "WILD", "TELEMETRY"],
        can_view_audit_log=True,
        can_verify_alerts=True,
        can_view_unmasked_pii=True,
        can_sign_crs_report=True,
        can_issue_sickline_orders=False,
        description="Independent statutory inquiry authority under Sections 113-121 of Railways Act, 1989."
    )
}
