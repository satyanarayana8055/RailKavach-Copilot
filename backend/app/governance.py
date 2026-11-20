"""
Server-side governance for RailKavach Copilot: who may see what, and how personal data is handled.

1. Identity   — every data endpoint needs a role (`X-RailKavach-Role`). DEMO: the header is trusted.
                Production replaces `get_principal` with a verified token from the railway IdP.
2. Scope (RBAC) — each role has explicit data sources (RoleProfile.data_scopes). A query that needs
                a source outside the role's scope is refused with a reason; out-of-scope citations are
                stripped even from allowed answers (defence in depth).
3. DPDP Act 2023 —
   * Data minimisation by default: personal data is pseudonymised for EVERY role.
   * Purpose limitation: unmasking needs a role with `can_view_unmasked_pii` AND a declared inquiry
     purpose (`X-RailKavach-Purpose`). Anything else stays masked.
   * Consistent pseudonyms (keyed HMAC): the same crew member is the same token across answers, so
     patterns stay analysable without exposing identity.
4. Accountability — every decision is written to a hash-chained, append-only audit log
   (tampering with any past entry breaks the chain; see `AuditLog.verify`).
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Optional

from fastapi import Header, HTTPException

from .config import DATA_DIR
from .schemas.rbac import ROLE_REGISTRY, RoleProfile, UserRole

# --------------------------------------------------------------------------------------------
# Data sources and purposes
# --------------------------------------------------------------------------------------------
RAILCOMM, LOCATE, WDD, WILD, TELEMETRY = "RAILCOMM", "LOCATE", "WDD", "WILD", "TELEMETRY"
SOURCE_LABELS = {RAILCOMM: "Railcomm audio", LOCATE: "Locate cabin video", WDD: "Wagon Damage Detection", WILD: "WILD wheel sensors", TELEMETRY: "Loco telemetry"}


class Purpose:
    ROUTINE_MONITORING = "ROUTINE_MONITORING"   # default: masked
    CREW_BRIEFING = "CREW_BRIEFING"             # masked
    SAFETY_INQUIRY = "SAFETY_INQUIRY"           # may unmask (authorised roles)
    STATUTORY_INQUIRY = "STATUTORY_INQUIRY"     # may unmask (authorised roles), e.g. CRS u/s 113–121 Railways Act

    ALL = {ROUTINE_MONITORING, CREW_BRIEFING, SAFETY_INQUIRY, STATUTORY_INQUIRY}
    UNMASKING = {SAFETY_INQUIRY, STATUTORY_INQUIRY}


# Query → sources it needs. Incident reconstruction (12414 / SPAD) is inherently cross-modal.
_SOURCE_KEYWORDS: dict[str, Iterable[str]] = {
    WDD: ("wagon", "wdd", "boxn", "rake", "gantry", "sick line", "sick-line", "shunting", "dent", "bulge", "वैगन", "डिब्बा"),
    WILD: ("wild", "wheel impact", "wheel load", "axle load"),
    LOCATE: ("phone", "mobile", "cabin", "cvvrs", "fatigue", "alertness", "drowsy", "sleep", "footplate", "violation", "camera", "थकान", "फोन"),
    RAILCOMM: ("radio", "vhf", "callout", "call-out", "caution order", "miscommunication", "transcript", "audio", "intercom", "exchange", "signal", "सिग्नल", "रेडियो"),
}
_INCIDENT_KEYWORDS = ("12414", "12403", "suratgarh", "spad", "near-spad", "incident", "investigate", "inquiry", "जांच")


def required_sources(query: str) -> set[str]:
    q = query.lower()
    need = {src for src, kws in _SOURCE_KEYWORDS.items() if any(k in q for k in kws)}
    if any(k in q for k in _INCIDENT_KEYWORDS):
        need |= {RAILCOMM, LOCATE, TELEMETRY}
    return need


def source_of(label: str) -> Optional[str]:
    """Map a citation's free-text source ("Railcomm VHF Ch 02", "WDD 6-Gantry Exit Scan"…) to a scope."""
    s = (label or "").lower()
    if any(k in s for k in ("railcomm", "vhf", "intercom", "radio", "audio")):
        return RAILCOMM
    if any(k in s for k in ("locate", "cvvrs", "cabin")):
        return LOCATE
    if any(k in s for k in ("wdd", "gantry", "wagon")):
        return WDD
    if "wild" in s:
        return WILD
    if any(k in s for k in ("telemetry", "brake", "bp ", "speed", "loco")):
        return TELEMETRY
    return None


# --------------------------------------------------------------------------------------------
# Principal (who is asking)
# --------------------------------------------------------------------------------------------
@dataclass
class Principal:
    role: RoleProfile
    purpose: str
    request_id: str = field(default_factory=lambda: uuid.uuid4().hex[:12])

    @property
    def scope(self) -> set[str]:
        return set(self.role.data_scopes)

    @property
    def unmasked(self) -> bool:
        return self.role.can_view_unmasked_pii and self.purpose in Purpose.UNMASKING


def get_principal(
    x_railkavach_role: Optional[str] = Header(default=None),
    x_railkavach_purpose: Optional[str] = Header(default=None),
) -> Principal:
    """FastAPI dependency. DEMO identity: trusts the role header. Swap for IdP token verification in production."""
    if not x_railkavach_role:
        raise HTTPException(status_code=401, detail="Sign in with a RailKavach role (X-RailKavach-Role header) to access railway data.")
    try:
        role = ROLE_REGISTRY[UserRole(x_railkavach_role)]
    except ValueError:
        raise HTTPException(status_code=403, detail=f"Unknown role '{x_railkavach_role}'.")
    purpose = (x_railkavach_purpose or Purpose.ROUTINE_MONITORING).upper()
    if purpose not in Purpose.ALL:
        raise HTTPException(status_code=400, detail=f"Unknown purpose '{purpose}'. Use one of: {', '.join(sorted(Purpose.ALL))}.")
    return Principal(role=role, purpose=purpose)


def require(principal: Principal, sources: set[str], endpoint: str) -> None:
    """Endpoint guard: refuse (403) and audit if the role lacks any required source."""
    missing = sources - principal.scope
    if missing:
        audit.record(principal, endpoint=endpoint, decision="DENIED", required=sources, withheld=missing, query=None)
        raise HTTPException(status_code=403, detail=deny_reason(principal, missing))


def deny_reason(principal: Principal, missing: set[str]) -> str:
    names = ", ".join(SOURCE_LABELS.get(m, m) for m in sorted(missing))
    return f"{principal.role.title} is not authorised to access {names}. Request it through the Sr. DSO or CRS."


# --------------------------------------------------------------------------------------------
# DPDP pseudonymisation
# --------------------------------------------------------------------------------------------
_ROLE_PREFIX = r"(?:LP|ALP|Sr\.?\s*LP|Guard|Gd\.?|SM|TM|Loco Pilot|Assistant Loco Pilot)"
# Devanagari forms → canonical Latin name, so both scripts map to the same pseudonym.
_DEVANAGARI_ALIASES = {"राजेश कुमार": "Rajesh Kumar", "राजेश": "Rajesh Kumar", "अमित सिंह": "Amit Singh", "अमित": "Amit Singh", "शर्मा": "S. Sharma", "जोशी": "V. Joshi"}
_KNOWN_NAMES = {"Rajesh Kumar", "Amit Singh", "S. Sharma", "M. K. Verma", "V. Joshi"}


def _harvest_names() -> set[str]:
    """Crew names that appear as radio speakers ("LP Rajesh Kumar") in the Railcomm dataset."""
    names = set(_KNOWN_NAMES)
    try:
        data = json.loads((DATA_DIR / "railcomm_transcripts.json").read_text(encoding="utf-8"))
        rows = data if isinstance(data, list) else next((v for v in data.values() if isinstance(v, list)), [])
        for r in rows:
            m = re.match(rf"^{_ROLE_PREFIX}\s+([A-Z][\w.]*(?:\s+[A-Z][\w.]*)+)$", str(r.get("speaker", "")))
            if m:
                names.add(m.group(1))
    except Exception:
        pass
    return names


class PIIMasker:
    def __init__(self, names: Iterable[str], key: bytes):
        self.key = key
        latin = sorted(set(names), key=len, reverse=True)  # longest first: "M. K. Verma" before "Verma"
        self._latin = re.compile(r"\b(" + "|".join(re.escape(n) for n in latin) + r")\b") if latin else None
        dev = sorted(_DEVANAGARI_ALIASES, key=len, reverse=True)
        self._dev = re.compile("(" + "|".join(re.escape(n) for n in dev) + ")")
        self._crew_id = re.compile(r"\b(A?LP|GD|SM|TM|CC)-(\d{3,6})\b")
        self._phone = re.compile(r"(?<!\d)(?:\+91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}(?!\d)")
        self._email = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")
        self._aadhaar = re.compile(r"(?<!\d)\d{4}[\s-]\d{4}[\s-]\d{4}(?!\d)")

    def token(self, canonical: str) -> str:
        return hmac.new(self.key, canonical.lower().encode(), hashlib.sha256).hexdigest()[:4].upper()

    def mask_text(self, text: str) -> str:
        if not text:
            return text
        if self._latin:
            text = self._latin.sub(lambda m: f"[Crew-{self.token(m.group(1))}]", text)
        text = self._dev.sub(lambda m: f"[कर्मी-{self.token(_DEVANAGARI_ALIASES[m.group(1)])}]", text)
        text = self._crew_id.sub(lambda m: f"{m.group(1)}-[{self.token(m.group(0))}]", text)
        text = self._email.sub("[email masked]", text)
        text = self._aadhaar.sub("[ID masked]", text)
        text = self._phone.sub("[phone masked]", text)
        return text

    def mask(self, obj: Any) -> Any:
        if isinstance(obj, str):
            return self.mask_text(obj)
        if isinstance(obj, dict):
            return {k: self.mask(v) for k, v in obj.items()}
        if isinstance(obj, (list, tuple)):
            return [self.mask(v) for v in obj]
        return obj


_KEY = os.getenv("PII_PSEUDONYM_KEY", "railkavach-dev-pseudonym-key").encode()
masker = PIIMasker(_harvest_names(), _KEY)


def protect(principal: Principal, payload: Any) -> Any:
    """Apply DPDP masking to any response payload unless this principal may see identities."""
    return payload if principal.unmasked else masker.mask(payload)


# --------------------------------------------------------------------------------------------
# Hash-chained audit log
# --------------------------------------------------------------------------------------------
class AuditLog:
    """Append-only JSONL; each entry carries the previous entry's hash, so edits/deletions are detectable."""

    GENESIS = "0" * 64

    def __init__(self, path: Path):
        self.path = path
        self._lock = threading.Lock()

    @staticmethod
    def _digest(entry: dict) -> str:
        body = {k: v for k, v in entry.items() if k != "hash"}
        return hashlib.sha256(json.dumps(body, sort_keys=True, ensure_ascii=False).encode()).hexdigest()

    def _tail(self) -> tuple[int, str]:
        if not self.path.exists():
            return 0, self.GENESIS
        last = None
        with self.path.open(encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    last = line
        if not last:
            return 0, self.GENESIS
        e = json.loads(last)
        return e["seq"], e["hash"]

    def record(self, principal: Principal, *, endpoint: str, decision: str, required: set[str], withheld: set[str],
               query: Optional[str], citations: int = 0) -> dict:
        with self._lock:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            seq, prev = self._tail()
            entry = {
                "seq": seq + 1,
                "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "request_id": principal.request_id,
                "role": principal.role.role.value,
                "purpose": principal.purpose,
                "endpoint": endpoint,
                "decision": decision,
                "sources_required": sorted(required),
                "sources_withheld": sorted(withheld),
                "pii_unmasked": principal.unmasked and decision != "DENIED",
                "citations_returned": citations,
                # The log itself is DPDP-minimised: queries are stored masked, plus a hash for integrity.
                "query_masked": masker.mask_text(query) if query else None,
                "query_sha256": hashlib.sha256(query.encode()).hexdigest() if query else None,
                "prev_hash": prev,
            }
            entry["hash"] = self._digest(entry)
            with self.path.open("a", encoding="utf-8") as f:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
            return entry

    def entries(self, limit: int = 100) -> list[dict]:
        if not self.path.exists():
            return []
        rows = [json.loads(l) for l in self.path.read_text(encoding="utf-8").splitlines() if l.strip()]
        return rows[-limit:][::-1]

    def verify(self) -> dict:
        prev, n = self.GENESIS, 0
        if self.path.exists():
            for i, line in enumerate(self.path.read_text(encoding="utf-8").splitlines(), 1):
                if not line.strip():
                    continue
                e = json.loads(line)
                if e.get("prev_hash") != prev or self._digest(e) != e.get("hash"):
                    return {"intact": False, "entries": n, "broken_at_seq": e.get("seq", i)}
                prev, n = e["hash"], n + 1
        return {"intact": True, "entries": n, "head_hash": prev}


audit = AuditLog(Path(os.getenv("AUDIT_LOG_PATH", str(DATA_DIR / "audit" / "access_log.jsonl"))))
