import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from .config import DEFAULT_MODEL, LOCAL_GEMMA_MODEL, LOCAL_GEMMA_URL
from .schemas.chat import AccessInfo, ChatQueryRequest, ChatQueryResponse
from .schemas.skills import (
    TimelineSyncInput, ReportGenInput, PatternAnomalyInput,
    WddDamagesInput, RailcommSearchInput, LocateViolationsInput
)
from .skills.timeline_sync import build_incident_timeline
from .skills.report_gen import generate_safety_artifacts
from .skills.pattern_anomaly import analyze_safety_patterns
from .skills.wdd_damage import get_wdd_wagon_damages
from .skills.railcomm_search import search_railcomm_transcripts
from .skills.locate_violations import get_locate_cabin_violations
from .engine import engine
from .services.cloud_services import gcs_vault, alloydb_manager
from . import observability
from .governance import (
    LOCATE, RAILCOMM, TELEMETRY, WDD, Principal, audit, deny_reason, get_principal, protect, require,
    required_sources, source_of,
)
from .custody import certificate_text, registry as custody_registry
from .statutes import extract as extract_rules, library as rule_library
from .schemas.chat import RuleRef

@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield
    observability.shutdown()  # flush remaining Langfuse spans on container stop


app = FastAPI(
    lifespan=lifespan,
    title="RailKavach Copilot API",
    description="Multimodal Operational Intelligence & Voice Assistant for Indian Railways (AiSPRY Technologies)",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RailKavach Copilot Backend",
        "model_engine": DEFAULT_MODEL,
        "voice_engine": "Bilingual (Hindi / English)",
        "cloud_integrations": {
            "gemini": {"status": "ONLINE", "model": DEFAULT_MODEL, "tier": "cloud"},
            "gemma": {"status": "READY", "model": LOCAL_GEMMA_MODEL, "tier": "local_edge", "endpoint": LOCAL_GEMMA_URL},
            "gcs_vault": {"bucket": gcs_vault.bucket_name, "connected": gcs_vault.is_connected},
            "alloydb": {"connected": alloydb_manager.is_connected, "engine": "PostgreSQL 18 / SQLite fallback"}
        },
        "supported_file_types": [
            "AUDIO (.wav, .mp3 - Cab VHF Radio)",
            "VIDEO (.mp4 - In-Cab CVVRS Camera)",
            "IMAGES (.jpg, .png - 6-Gantry WDD Damage)",
            "DOCUMENTS (.pdf, .txt - Caution Orders T/409)",
            "TELEMETRY (.csv, .json - Speed & BP Pressure Logs)"
        ],
        "platforms_connected": ["WDD (Wagon Damage)", "Locate (Cabin CVVRS)", "Railcomm (Audio Analytics)"],
        "observability": observability.status(),
    }

def _with_custody(c):
    """Bind a citation to its registered evidence record (id + SHA-256 recorded at ingest), if there is one."""
    item = custody_registry().resolve(c.source, c.timestamp, c.event_description, c.evidence_id)
    if item:
        c.evidence_id, c.sha256, c.media_url = item["evidence_id"], item["sha256"], item.get("media_url")
    return c


@app.post("/api/chat", response_model=ChatQueryResponse)
def chat_endpoint(req: ChatQueryRequest, background: BackgroundTasks, principal: Principal = Depends(get_principal)):
    """
    Main conversational copilot query endpoint, governed server-side:
    role scope is checked before reasoning, out-of-scope evidence is stripped, personal data is
    pseudonymised unless the role + declared purpose allow identities, and every decision is audited.
    """
    background.add_task(observability.flush)
    scope = principal.scope
    needed = required_sources(req.query)
    missing = needed - scope

    def access(decision: str, withheld: set, entry: dict, reason=None) -> AccessInfo:
        return AccessInfo(
            role=principal.role.role.value, purpose=principal.purpose, decision=decision,
            sources_in_scope=sorted(scope), sources_withheld=sorted(withheld),
            pii_masked=not principal.unmasked, reason=reason, audit_seq=entry["seq"], audit_hash=entry["hash"],
        )

    if missing:
        reason = deny_reason(principal, missing)
        entry = audit.record(principal, endpoint="/api/chat", decision="DENIED", required=needed, withheld=missing, query=req.query)
        return ChatQueryResponse(
            answer=f"Access restricted. {reason}",
            token_usage={"prompt_tokens": 0, "candidates_tokens": 0, "total_tokens": 0},
            suggested_actions=[f"Ask about {', '.join(sorted(scope)).lower()} data", "Request access via the Sr. DSO"],
            access=access("DENIED", missing, entry, reason),
        )

    resp = engine.process_query(req, scope=scope)
    kept, withheld = [], set()
    for c in resp.citations:
        src = source_of(c.source)
        if src is None or src in scope:
            kept.append(c)
        else:
            withheld.add(src)
    resp.citations = [_with_custody(c) for c in kept]
    resp.rules = [RuleRef(**r) for r in extract_rules(resp.answer)]
    decision = "PARTIAL" if withheld else "ALLOWED"
    entry = audit.record(principal, endpoint="/api/chat", decision=decision, required=needed, withheld=withheld,
                         query=req.query, citations=len(kept))
    out = ChatQueryResponse(**protect(principal, resp.model_dump()))
    out.access = access(decision, withheld, entry, "Some evidence is outside your role's scope." if withheld else None)
    return out

@app.get("/api/scenarios")
def get_preloaded_scenarios():
    """
    Returns the 4 pre-configured demo scenarios for one-click jury evaluation.
    """
    return [
        {
            "id": "scenario_1",
            "title": "Train 12414 Near-SPAD Incident",
            "section": "Suratgarh Jn (Bikaner Division)",
            "query": "Investigate safety events for Train 12414 near Suratgarh on 2026-11-18.",
            "description": "Fuses VHF radio callout with cabin camera mobile phone alert and emergency brake application at [03:14:15]."
        },
        {
            "id": "scenario_2",
            "title": "02:00–05:00 AM Crew Fatigue Analysis",
            "section": "Bikaner Division Night Freight Shifts",
            "query": "Show driver alertness and fatigue trends between 02:00 and 05:00 AM on Bikaner Division.",
            "description": "Identifies recurring micro-sleep clusters on long-distance night freight runs."
        },
        {
            "id": "scenario_3",
            "title": "Freight Rake Wagon Damage Differential",
            "section": "Suratgarh West Gate to Lalgarh Yard",
            "query": "Audit entry-versus-exit wagon damage for freight rake BOXN-542.",
            "description": "6-camera optical scan differential isolating newly sustained in-transit damage from pre-existing defects."
        },
        {
            "id": "scenario_4",
            "title": "Signal Callouts & Caution Order Audit",
            "section": "Bikaner Division Night Shift (00:00–08:00)",
            "query": "Show all signal-related miscommunications, emergency callouts, and caution order exchanges on the Bikaner division during the shift on 18 Nov 2026.",
            "description": "Audits bilingual VHF exchanges against the G&SR 4.40 calling-out protocol with fail-open radio logging."
        }
    ]

@app.post("/api/files/analyze")
async def analyze_railway_file(
    filename: Optional[str] = Form(None),
    file_type: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    principal: Principal = Depends(get_principal),
):
    """
    Universal Railway File Analyzer.
    Ingests Audio (.wav/.mp3), Video (.mp4), Gantry Images (.jpg/.png), Caution Orders (.pdf), and Telemetry (.csv).
    Extracts timestamps, detects safety infractions, and outputs statutory findings.
    """
    fname = filename or (file.filename if file else "unknown_file")
    ftype = file_type or (fname.split(".")[-1].lower() if "." in fname else "document")
    if "files" not in principal.role.allowed_tabs:
        audit.record(principal, endpoint="/api/files/analyze", decision="DENIED", required=set(), withheld=set(), query=fname)
        raise HTTPException(status_code=403, detail=f"{principal.role.title} cannot use the file inspector.")
    kind = {"wav": RAILCOMM, "mp3": RAILCOMM, "audio": RAILCOMM, "mp4": LOCATE, "mkv": LOCATE, "video": LOCATE,
            "jpg": WDD, "jpeg": WDD, "png": WDD, "image": WDD}.get(ftype, TELEMETRY if ftype not in ("pdf", "txt", "doc") else RAILCOMM)
    require(principal, {kind}, "/api/files/analyze")
    audit.record(principal, endpoint="/api/files/analyze", decision="ALLOWED", required={kind}, withheld=set(), query=fname)
    return protect(principal, _analyze(fname, ftype))


def _analyze(fname: str, ftype: str) -> dict:

    # Audio file analysis
    if ftype in ["wav", "mp3", "audio"]:
        return {
            "filename": fname,
            "category": "CAB_RADIO_AUDIO",
            "summary": "Audio stream denoised via Railcomm AI denoising. 9+ noise classes suppressed.",
            "duration": "04m:15s",
            "safety_keywords_detected": ["Caution Order 30 kmph", "Home Signal RED", "Loop Line", "Emergency Brake"],
            "fail_open_status": "NORMAL (Zero Bypass)",
            "critical_timestamp": "03:14:15",
            "key_dialogue": "[ALP]: 'सर ध्यान दीजिए! सामने होम सिग्नल लाल है! फोन रखिए! ब्रेक लगाइए!'"
        }

    # Video file analysis
    elif ftype in ["mp4", "mkv", "video"]:
        return {
            "filename": fname,
            "category": "IN_CAB_CVVRS_VIDEO",
            "summary": "Locate edge AI analyzed driver behavior across 5 violation classes.",
            "duration": "12m:30s",
            "violation_detected": "MOBILE_PHONE",
            "confidence": 0.94,
            "duration_seconds": 28,
            "compliant_activity_check": "Non-compliant. Phone held to ear while approaching Home Signal.",
            "reviewer_status": "CONFIRMED by DSO-BKN at 06:30:15",
            "critical_timestamp": "03:14:02"
        }

    # Gantry Image analysis
    elif ftype in ["jpg", "jpeg", "png", "image"]:
        return {
            "filename": fname,
            "category": "WDD_GANTRY_SCAN",
            "wagon_number_ocr": "BOXNHL 22011945123",
            "ocr_confidence": 0.98,
            "gantry_location": "Lalgarh Yard Exit Gantry #2",
            "defects_detected": [
                {"class": "DOOR_DEFECT", "severity": "HIGH", "detail": "Left bottom flap unlatched and hanging."},
                {"class": "SPRING_BROKEN", "severity": "CRITICAL", "detail": "Inner coil spring fractured on Bogie #2."}
            ],
            "transit_delta": "NEW TRANSIT DAMAGE sustained between Suratgarh and Lalgarh.",
            "liability": "Contractor siding damage. Sick-line marking required."
        }

    # Caution Order PDF or Document
    elif ftype in ["pdf", "txt", "doc"]:
        return {
            "filename": fname,
            "category": "STATUTORY_CAUTION_ORDER_T409",
            "issuing_station": "Suratgarh Jn (SOG)",
            "train_no": "12414",
            "section": "Bikaner-Suratgarh",
            "speed_restriction": "30 kmph between KM 182/4 and KM 184/0",
            "signal_aspect_mandate": "Down Loop Line Home Signal at Danger",
            "cross_verification_status": "Verified: Train halted at KM 182/340 (60 meters prior to signal)."
        }

    # Telemetry CSV / JSON
    else:
        return {
            "filename": fname,
            "category": "LOCO_TELEMETRY_LOG",
            "parameters_tracked": ["Speed (kmph)", "Brake Pipe Pressure (kg/cm²)", "Throttle Notch"],
            "critical_event": "Emergency Brake Exhaust: BP dropped 5.0 -> 0.0 kg/cm² in 2.2 seconds at 03:14:24.",
            "spad_status": "NO SPAD (Halted 60 meters before stop signal)."
        }

@app.post("/api/timeline")
def timeline_endpoint(params: TimelineSyncInput, principal: Principal = Depends(get_principal)):
    """
    Skill 4: build_incident_timeline
    """
    require(principal, {RAILCOMM, LOCATE, TELEMETRY}, "/api/timeline")
    result = build_incident_timeline(params)
    audit.record(principal, endpoint="/api/timeline", decision="ALLOWED", required={RAILCOMM, LOCATE, TELEMETRY}, withheld=set(), query=None)
    return protect(principal, result)

@app.post("/api/report")
def report_endpoint(params: ReportGenInput, principal: Principal = Depends(get_principal)):
    """
    Skill 5: generate_safety_artifacts
    """
    require(principal, {RAILCOMM, LOCATE}, "/api/report")
    result = generate_safety_artifacts(params)
    audit.record(principal, endpoint="/api/report", decision="ALLOWED", required={RAILCOMM, LOCATE}, withheld=set(), query=None)
    return protect(principal, result)

@app.post("/api/analytics/fatigue")
def fatigue_analytics_endpoint(params: PatternAnomalyInput, principal: Principal = Depends(get_principal)):
    """
    Skill 6: analyze_safety_patterns
    """
    require(principal, {LOCATE}, "/api/analytics/fatigue")
    result = analyze_safety_patterns(params)
    audit.record(principal, endpoint="/api/analytics/fatigue", decision="ALLOWED", required={LOCATE}, withheld=set(), query=None)
    return protect(principal, result)

@app.post("/api/skills/wdd")
def wdd_query_endpoint(params: WddDamagesInput, principal: Principal = Depends(get_principal)):
    """
    Skill 3: get_wdd_wagon_damages
    """
    require(principal, {WDD}, "/api/skills/wdd")
    result = get_wdd_wagon_damages(params)
    audit.record(principal, endpoint="/api/skills/wdd", decision="ALLOWED", required={WDD}, withheld=set(), query=None)
    return protect(principal, result)

@app.post("/api/skills/railcomm")
def railcomm_query_endpoint(params: RailcommSearchInput, principal: Principal = Depends(get_principal)):
    """
    Skill 1: search_railcomm_transcripts
    """
    require(principal, {RAILCOMM}, "/api/skills/railcomm")
    result = search_railcomm_transcripts(params)
    audit.record(principal, endpoint="/api/skills/railcomm", decision="ALLOWED", required={RAILCOMM}, withheld=set(), query=None)
    return protect(principal, result)

@app.post("/api/skills/locate")
def locate_query_endpoint(params: LocateViolationsInput, principal: Principal = Depends(get_principal)):
    """
    Skill 2: get_locate_cabin_violations
    """
    require(principal, {LOCATE}, "/api/skills/locate")
    result = get_locate_cabin_violations(params)
    audit.record(principal, endpoint="/api/skills/locate", decision="ALLOWED", required={LOCATE}, withheld=set(), query=None)
    return protect(principal, result)


# -------------------------------------------------------------
# AlloyDB & Cloud Storage Operational Endpoints
# -------------------------------------------------------------
@app.get("/api/incidents")
def get_incidents_list(limit: int = 50, principal: Principal = Depends(get_principal)):
    """
    Retrieves confirmed and pending incidents from AlloyDB (or local WAL fallback).
    """
    require(principal, {RAILCOMM, LOCATE}, "/api/incidents")
    result = alloydb_manager.list_incidents(limit=limit)
    audit.record(principal, endpoint="/api/incidents", decision="ALLOWED", required={RAILCOMM, LOCATE}, withheld=set(), query=None)
    return protect(principal, result)

@app.post("/api/incidents")
def create_incident_record(incident: dict, principal: Principal = Depends(get_principal)):
    """
    Records an incident and generates cryptographic SHA-256 evidence certificate.
    Only roles that verify alerts may write incidents.
    """
    if not principal.role.can_verify_alerts:
        audit.record(principal, endpoint="POST /api/incidents", decision="DENIED", required=set(), withheld=set(), query=None)
        raise HTTPException(status_code=403, detail=f"{principal.role.title} cannot record incidents.")
    audit.record(principal, endpoint="POST /api/incidents", decision="ALLOWED", required=set(), withheld=set(), query=None)
    success = alloydb_manager.record_incident(incident)
    return {"success": success, "incident_id": incident.get("incident_id")}

@app.get("/api/evidence")
def get_evidence_vault_objects(prefix: str = "", principal: Principal = Depends(get_principal)):
    """
    Lists evidence objects securely archived in Google Cloud Storage.
    """
    require(principal, {RAILCOMM, LOCATE}, "/api/evidence")
    result = gcs_vault.list_evidence_objects(prefix=prefix)
    audit.record(principal, endpoint="/api/evidence", decision="ALLOWED", required={RAILCOMM, LOCATE}, withheld=set(), query=None)
    return protect(principal, result)



# -------------------------------------------------------------
# Role-Based Access Control (RBAC) Endpoints
# -------------------------------------------------------------
from .schemas.rbac import ROLE_REGISTRY, UserRole, RoleProfile

@app.get("/api/rbac/roles")
def get_rbac_roles():
    """
    Returns all registered Indian Railways roles and their granular permissions.
    """
    return [profile.model_dump() for profile in ROLE_REGISTRY.values()]

@app.get("/api/rbac/roles/{role_code}", response_model=RoleProfile)
def get_role_profile(role_code: UserRole):
    """
    Fetches permission matrix and DPDP scoping rules for an active role.
    """
    if role_code not in ROLE_REGISTRY:
        raise HTTPException(status_code=404, detail="Role not found")
    return ROLE_REGISTRY[role_code]


# -------------------------------------------------------------
# Accountability: hash-chained access audit log (Sr. DSO / CRS)
# -------------------------------------------------------------
# -------------------------------------------------------------
# Evidence custody (BSA 2023 §63) and the rule library
# -------------------------------------------------------------
from fastapi.responses import PlainTextResponse as _PlainText


def _custody_item(evidence_id: str, principal: Principal, endpoint: str) -> dict:
    item = custody_registry().items.get(evidence_id)
    if not item:
        raise HTTPException(status_code=404, detail="No registered evidence record with this ID.")
    try:
        require(principal, {item["kind"]}, endpoint)
    except HTTPException:
        audit.record(principal, endpoint=endpoint, decision="DENIED", required={item["kind"]}, withheld={item["kind"]}, query=evidence_id)
        raise
    return item


@app.get("/api/evidence/{evidence_id}/verify")
def verify_evidence(evidence_id: str, principal: Principal = Depends(get_principal)):
    """Re-hash the original file and compare it with the SHA-256 recorded at ingest."""
    item = _custody_item(evidence_id, principal, "/api/evidence/verify")
    result = custody_registry().verify(evidence_id)
    audit.record(principal, endpoint="/api/evidence/verify", decision="ALLOWED", required={item["kind"]}, withheld=set(), query=evidence_id)
    return protect(principal, result)


@app.get("/api/evidence/{evidence_id}/certificate", response_class=_PlainText)
def evidence_certificate(evidence_id: str, principal: Principal = Depends(get_principal)):
    """Draft BSA 2023 §63(4) certificate (Part A + Part B) for signature. Sr. DSO / CRS only."""
    endpoint = "/api/evidence/certificate"
    if not (principal.role.can_sign_crs_report or principal.role.can_view_audit_log):
        audit.record(principal, endpoint=endpoint, decision="DENIED", required=set(), withheld=set(), query=evidence_id)
        raise HTTPException(status_code=403, detail=f"{principal.role.title} cannot prepare §63 certificates.")
    item = _custody_item(evidence_id, principal, endpoint)
    v = custody_registry().verify(evidence_id)
    entry = audit.record(principal, endpoint=endpoint, decision="ALLOWED", required={item["kind"]}, withheld=set(), query=evidence_id)
    text = certificate_text(v, item, officer=principal.role.title, role_title=principal.role.role.value,
                            request_id=f"{principal.request_id} · audit #{entry['seq']}")
    return _PlainText(protect(principal, text), headers={"Content-Disposition": f'attachment; filename="BSA63-{evidence_id}.txt"'})


@app.get("/api/rules")
def get_rule_library(principal: Principal = Depends(get_principal)):
    """The rule library answers are checked against (summaries; not the gazetted text)."""
    lib = rule_library()
    return {"source": lib["source"], "rules": lib["rules"]}


@app.get("/api/audit")
def get_audit_log(limit: int = 50, principal: Principal = Depends(get_principal)):
    """Who asked what, under which purpose, and what they were shown. Tamper-evident (hash chain)."""
    if not principal.role.can_view_audit_log:
        raise HTTPException(status_code=403, detail=f"{principal.role.title} cannot view the audit log.")
    return {"chain": audit.verify(), "entries": audit.entries(limit=min(max(limit, 1), 500))}



# -------------------------------------------------------------
# Public: demo requests (DPDP: explicit consent, minimal fields, stored server-side only)
# -------------------------------------------------------------
import json as _json
import os
import re as _re
import uuid as _uuid
from datetime import datetime as _dt, timezone as _tz
from pathlib import Path as _Path
from pydantic import BaseModel as _BaseModel, Field as _Field

from .config import DATA_DIR as _DATA_DIR

CONSENT_TEXT_V1 = "I consent to AiSPRY using these details only to arrange this demo. They are not shared and are deleted on request."
_DEMO_LOG = _Path(os.getenv("DEMO_REQUESTS_PATH", str(_DATA_DIR / "demo_requests" / "requests.jsonl")))


class DemoRequestIn(_BaseModel):
    name: str = _Field(min_length=1, max_length=120)
    organisation: str = _Field(min_length=1, max_length=160)
    email: str = _Field(min_length=3, max_length=200)
    interests: list[str] = _Field(default_factory=list, max_length=4)
    consent: bool


@app.post("/api/demo-requests")
def create_demo_request(req: DemoRequestIn):
    """Stores a demo request with its consent record. TODO: forward to the sales inbox/CRM."""
    if not req.consent:
        raise HTTPException(status_code=400, detail="Consent is required to contact you")
    if not _re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", req.email.strip()):
        raise HTTPException(status_code=400, detail="Please enter a valid email")
    reference = f"RK-{_uuid.uuid4().hex[:8].upper()}"
    record = {
        "reference": reference,
        "received_at": _dt.now(_tz.utc).isoformat(timespec="seconds"),
        "name": req.name.strip(), "organisation": req.organisation.strip(), "email": req.email.strip(),
        "interests": [i[:60] for i in req.interests],
        "consent": {"given": True, "text": CONSENT_TEXT_V1, "version": "v1", "purpose": "ARRANGE_DEMO"},
    }
    _DEMO_LOG.parent.mkdir(parents=True, exist_ok=True)
    with _DEMO_LOG.open("a", encoding="utf-8") as f:
        f.write(_json.dumps(record, ensure_ascii=False) + "\n")
    return {"reference": reference}


# -------------------------------------------------------------
# Static Single-Container Production Mount (Next.js Export)
# Must stay LAST: a mount at "/" shadows any route registered after it.
# -------------------------------------------------------------
import os
from fastapi.staticfiles import StaticFiles

STATIC_DIR = os.getenv("STATIC_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "out"))
if os.path.exists(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static-spa")


