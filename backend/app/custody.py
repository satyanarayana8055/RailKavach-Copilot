"""
Evidence chain of custody (BSA 2023 §63, Part B).

Every Railcomm audio segment, Locate cabin frame and WDD gantry image is registered at ingest with a
SHA-256 digest (`sha256_hash` / `bsa_section_63_sha256` in the datasets). This module:

  * resolves an answer's citations to those registered records (evidence_id),
  * re-hashes the file on demand and compares it to the digest recorded at ingest,
  * drafts the §63 certificate (Part A / Part B) for signature by the authorised officers.

It never invents a digest: a citation that cannot be matched to a registered record stays unregistered,
and a file that is not present on this server is reported as such, not as verified.
"""
from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Optional

from .config import DATA_DIR
from .governance import LOCATE, RAILCOMM, WDD, source_of

_TIME = re.compile(r"(\d{2}:\d{2}:\d{2})")
_WAGON_NO = re.compile(r"(BOXN\w*\s?\d{8,})", re.I)
_WAGON_POS = re.compile(r"(?:wagon|position)\s*#?\s*(\d{1,2})\b", re.I)

# Where each stream's media lives on disk (mirrors the frontend/public symlinks).
_MEDIA_DIRS = {
    RAILCOMM: DATA_DIR / "audio_denoising" / "audio",
    LOCATE: DATA_DIR / "locate_cabin" / "loco_cabin",
    WDD: DATA_DIR / "wdd_images",
}


def _load(name: str) -> list[dict]:
    p = DATA_DIR / name
    if not p.exists():
        return []
    d = json.loads(p.read_text(encoding="utf-8"))
    return d if isinstance(d, list) else next((v for v in d.values() if isinstance(v, list)), [])


class EvidenceRegistry:
    def __init__(self) -> None:
        self.items: dict[str, dict] = {}
        self._by_time: dict[tuple[str, str], list[str]] = {}
        self._by_wagon_no: dict[str, str] = {}
        self._by_wagon_pos: dict[int, str] = {}

        for r in _load("railcomm_transcripts.json"):
            if r.get("audio_file") and r.get("sha256_hash"):
                self._add(r["id"], RAILCOMM, r.get("time_str"), r.get("timestamp"), r["audio_file"], r["sha256_hash"],
                          r.get("audio_url"), {"channel": r.get("channel"), "train_no": r.get("train_no"), "loco_id": r.get("loco_id"),
                                               "station": r.get("station"), "text": r.get("transcript_en")})
        for a in _load("locate_alerts.json"):
            if a.get("image_filename") and a.get("bsa_section_63_sha256"):
                self._add(a["alert_id"], LOCATE, a.get("time_str"), a.get("timestamp"), a["image_filename"], a["bsa_section_63_sha256"],
                          a.get("image_url"), {"loco_id": a.get("loco_id"), "train_no": a.get("train_no"), "violation_type": a.get("violation_type"),
                                               "verification_status": a.get("verification_status"), "gcs_uri": a.get("gcs_uri"),
                                               "size_bytes": a.get("file_size_bytes")})
        for w in _load("wdd_inspections.json"):
            url = w.get("image_url") or ""
            if url and w.get("bsa_section_63_sha256"):
                rel = url.split("/evidence_wdd/", 1)[-1]
                self._add(w["id"], WDD, (w.get("exit_timestamp") or "")[-8:], w.get("exit_timestamp"), rel, w["bsa_section_63_sha256"], url,
                          {"wagon_no": w.get("wagon_no"), "position_in_rake": w.get("position_in_rake"), "train_no": w.get("train_no"),
                           "exit_gantry": w.get("exit_gantry"), "gcs_uri": w.get("gcs_uri")})
                if w.get("wagon_no"):
                    self._by_wagon_no[re.sub(r"\s", "", w["wagon_no"]).upper()] = w["id"]
                if w.get("position_in_rake") is not None:
                    self._by_wagon_pos[int(w["position_in_rake"])] = w["id"]

    def _add(self, eid, kind, time_str, ts, rel, digest, url, meta) -> None:
        self.items[eid] = {"evidence_id": eid, "kind": kind, "time_str": time_str, "timestamp": ts, "file": rel,
                           "sha256": digest.lower(), "media_url": url, "meta": meta}
        if time_str:
            self._by_time.setdefault((kind, time_str), []).append(eid)

    # ---------------------------------------------------------------- resolution
    def resolve(self, source: str, timestamp: Optional[str], description: str = "", evidence_id: Optional[str] = None) -> Optional[dict]:
        if evidence_id and evidence_id in self.items:
            return self.items[evidence_id]
        kind = source_of(source)
        text = f"{timestamp or ''} {description or ''}"
        if kind == WDD:
            m = _WAGON_NO.search(text)
            if m and (eid := self._by_wagon_no.get(re.sub(r"\s", "", m.group(1)).upper())):
                return self.items[eid]
            m = _WAGON_POS.search(text)
            if m and (eid := self._by_wagon_pos.get(int(m.group(1)))):
                return self.items[eid]
            return None
        if kind not in (RAILCOMM, LOCATE):
            return None
        m = _TIME.search(timestamp or "") or _TIME.search(description or "")
        if not m:
            return None
        ids = self._by_time.get((kind, m.group(1)), [])
        if len(ids) > 1 and kind == LOCATE:  # several alerts in the same second: prefer the one the text names
            d = (description or "").upper().replace(" ", "_")
            ids = [i for i in ids if (self.items[i]["meta"].get("violation_type") or "") in d] or ids
        return self.items[ids[0]] if ids else None

    def path_of(self, item: dict) -> Path:
        return _MEDIA_DIRS[item["kind"]] / item["file"]

    # ---------------------------------------------------------------- verification
    def verify(self, eid: str) -> Optional[dict]:
        item = self.items.get(eid)
        if not item:
            return None
        p = self.path_of(item)
        out = {k: item[k] for k in ("evidence_id", "kind", "timestamp", "media_url")}
        out.update(file=Path(item["file"]).name, recorded_sha256=item["sha256"],
                   checked_at=datetime.now(timezone.utc).isoformat(timespec="seconds"), algorithm="SHA-256")
        if p.is_file():
            h = hashlib.sha256()
            with p.open("rb") as f:
                for chunk in iter(lambda: f.read(1 << 20), b""):
                    h.update(chunk)
            computed, size, where = h.hexdigest(), p.stat().st_size, "server disk"
        else:
            # Media lives in Cloud Storage: re-hash the bytes actually stored there (never trust a cached digest).
            data = _fetch_from_storage(item)
            if data is None:
                out.update(status="FILE_UNAVAILABLE", computed_sha256=None, size_bytes=None,
                           detail="The original file is not on this server; the digest recorded at ingest is shown.")
                return out
            computed, size, where = hashlib.sha256(data).hexdigest(), len(data), "Cloud Storage"
        ok = computed == item["sha256"]
        out["source"] = where
        out.update(status="VERIFIED" if ok else "MISMATCH", computed_sha256=computed, size_bytes=size,
                   detail="File is bit-for-bit identical to the one registered at ingest." if ok
                   else "File differs from the one registered at ingest. Do not rely on it.")
        return out


_STORAGE_PREFIX = {RAILCOMM: "audio", LOCATE: "locate", WDD: "wdd"}


def _fetch_from_storage(item: dict) -> Optional[bytes]:
    """Bytes of the evidence file from the GCS pipeline (RAM/SSD cache, then bucket), or None if unreachable."""
    try:
        from .services.gcs_pipeline import gcs_pipeline
        data, *_ = gcs_pipeline.fetch_bytes(f"{_STORAGE_PREFIX[item['kind']]}/{item['file']}")
        return data
    except Exception:
        return None


@lru_cache(maxsize=1)
def registry() -> EvidenceRegistry:
    return EvidenceRegistry()


def certificate_text(v: dict, item: dict, *, officer: str, role_title: str, request_id: str) -> str:
    """Draft BSA 2023 §63(4) certificate, pre-filled from the custody record. Signatures are left blank."""
    m = item["meta"]
    stream = {RAILCOMM: "Railcomm cab radio / VHF audio recorder", LOCATE: "Locate CVVRS in-cab camera (NVR)",
              WDD: "WDD 6-gantry wayside camera"}[item["kind"]]
    ident = " · ".join(f"{k.replace('_', ' ')}: {m[k]}" for k in ("train_no", "loco_id", "wagon_no", "channel", "station", "exit_gantry") if m.get(k))
    status = {"VERIFIED": "MATCHES the digest recorded at ingest",
              "MISMATCH": "DOES NOT MATCH the digest recorded at ingest",
              "FILE_UNAVAILABLE": "could not be recomputed on this server (file not present)"}[v["status"]]
    line = "-" * 78
    return f"""DRAFT — FOR SIGNATURE BY AUTHORISED OFFICERS. NOT VALID UNTIL SIGNED.
CERTIFICATE UNDER SECTION 63(4), BHARATIYA SAKSHYA ADHINIYAM, 2023
{line}
Electronic record
  Evidence ID       : {item['evidence_id']}
  File              : {v['file']}
  Captured at       : {item.get('timestamp') or '—'}
  Source device     : {stream}
  Identifiers       : {ident or '—'}
  Storage reference : {m.get('gcs_uri') or item.get('media_url') or '—'}

PART A — Person in lawful control of the device
  I certify that the electronic record above was produced by the device named, which was
  operated by Indian Railways in the regular course of train operations; that the device
  was operating properly during the period of capture; and that the record is a true
  derivative of the information fed into the device in the ordinary course.

  Name / designation : ______________________________   Date: ____________
  Signature          : ______________________________

PART B — Technical expert
  Hash algorithm     : SHA-256
  Digest at ingest   : {v['recorded_sha256']}
  Digest recomputed  : {v.get('computed_sha256') or 'not recomputed'}
  Result             : {status}
  Checked at (UTC)   : {v['checked_at']}

  I certify that the digest above was computed over the record and that the record has
  not been altered since ingest.

  Name / designation : ______________________________   Date: ____________
  Signature          : ______________________________
{line}
Prepared by RailKavach Copilot for {officer} ({role_title}). Request {request_id}.
This draft and its download are recorded in the RailKavach access audit log.
"""
