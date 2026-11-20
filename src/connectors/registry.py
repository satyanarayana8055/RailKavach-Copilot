import os
import glob
import json
import yaml
from typing import Dict, Any, List, Optional
from src.connectors.base import BaseProductConnector, CanonicalRailwayEvent

class UniversalFileOrHttpConnector(BaseProductConnector):
    """
    Unified ROCP connector supporting both local JSON feeds and remote HTTP/REST endpoints.
    Allows zero-code connection of new railway product data endpoints.
    """
    
    def _load_local_data(self) -> List[Dict[str, Any]]:
        raw_url = self.endpoint_cfg.get("url", "")
        if raw_url.startswith("local://"):
            filepath = raw_url.replace("local://", "")
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            full_path = os.path.join(base_dir, filepath)
            if os.path.exists(full_path):
                with open(full_path, "r", encoding="utf-8") as f:
                    return json.load(f)
        return []

    def query(self, **kwargs) -> List[CanonicalRailwayEvent]:
        # If it's a remote HTTP endpoint in production:
        url = self.endpoint_cfg.get("url", "")
        if url.startswith("http://") or url.startswith("https://"):
            try:
                import httpx
                headers = {}
                if self.endpoint_cfg.get("auth_type") == "bearer":
                    token = os.getenv(self.endpoint_cfg.get("token_env_var", ""), "")
                    headers["Authorization"] = f"Bearer {token}"
                with httpx.Client(timeout=self.endpoint_cfg.get("timeout_seconds", 5)) as client:
                    resp = client.get(url, params=kwargs, headers=headers)
                    resp.raise_for_status()
                    data = resp.json()
                    events = []
                    for item in (data.get("events", data) if isinstance(data, dict) else data):
                        events.append(self._normalize(item))
                    return events
            except Exception as e:
                print(f"[ROCP Connector Warning] Failed remote query to {url}: {e}")

        # Local or fallback data:
        items = self._load_local_data()
        results = []
        for item in items:
            if self._matches(item, kwargs):
                results.append(self._normalize(item))
        return results

    def _matches(self, item: Dict[str, Any], filters: Dict[str, Any]) -> bool:
        train_filter = filters.get("train_no")
        if train_filter and item.get("train_no") and train_filter.lower() not in item.get("train_no", "").lower():
            return False

        loco_filter = filters.get("loco_id")
        if loco_filter and item.get("loco_id") and loco_filter.lower() not in item.get("loco_id", "").lower():
            return False

        wagon_filter = filters.get("wagon_no")
        if wagon_filter and item.get("wagon_no") and wagon_filter.lower() not in item.get("wagon_no", "").lower():
            return False

        keyword = filters.get("keyword")
        if keyword:
            haystack = (item.get("raw_transcript", "") + " " +
                        item.get("english_translation", "") + " " +
                        " ".join(item.get("safety_keywords", []))).lower()
            if keyword.lower() not in haystack:
                return False

        violation_type = filters.get("violation_type")
        if violation_type and violation_type != "ALL":
            if item.get("violation_type") != violation_type:
                return False

        verif_status = filters.get("verification_status")
        if verif_status == "CONFIRMED_ONLY" and item.get("verification_status") != "CONFIRMED":
            return False
        if verif_status == "PENDING_ONLY" and item.get("verification_status") != "PENDING_VERIFICATION":
            return False

        min_impact = filters.get("min_impact_kn")
        if min_impact is not None and item.get("metrics", {}).get("impact_kn", 0) < min_impact:
            return False

        return True

    def _normalize(self, item: Dict[str, Any]) -> CanonicalRailwayEvent:
        event_id = item.get("event_id") or item.get("transcript_id") or item.get("alert_id") or item.get("inspection_id") or "EVT-UNKNOWN"
        summary = item.get("summary") or item.get("defect_description") or item.get("reviewer_remarks") or item.get("english_translation") or ""
        event_type = item.get("event_type") or item.get("violation_type") or item.get("damage_class") or "OPERATIONAL_TELEMETRY"
        
        severity = item.get("severity") or item.get("damage_severity") or "INFO"
        if item.get("is_violation"):
            severity = "CRITICAL" if event_type in ["MOBILE_PHONE", "SLEEPING"] else "WARNING"

        return CanonicalRailwayEvent(
            event_id=event_id,
            source_product=self.product_id,
            modality=self.modality,
            timestamp=item.get("timestamp") or item.get("inspection_timestamp") or "2026-11-18T00:00:00.000Z",
            train_no=item.get("train_no", "UNKNOWN"),
            loco_id=item.get("loco_id"),
            vehicle_id=item.get("wagon_no") or item.get("vehicle_id"),
            section=item.get("section") or item.get("gantry_location"),
            location_marker=item.get("location_marker") or item.get("location"),
            event_type=event_type,
            severity=severity,
            verification_status=item.get("verification_status", "PENDING_VERIFICATION"),
            summary=summary,
            metrics=item.get("metrics", {}),
            evidence={
                "clip_uri": item.get("evidence_clip_uri"),
                "audio_uri": item.get("audio_clip_uri"),
                "image_uri": item.get("image_uri"),
                "sha256_hash": item.get("sha256_hash", "")
            }
        )

class ConnectorRegistry:
    """Dynamic registry that auto-discovers all product connectors and builds tool declarations."""
    
    def __init__(self, connectors_dir: Optional[str] = None):
        if connectors_dir is None:
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            connectors_dir = os.path.join(base_dir, "connectors")
        self.connectors_dir = connectors_dir
        self.connectors: Dict[str, BaseProductConnector] = {}
        self.tool_to_connector: Dict[str, BaseProductConnector] = {}
        self.reload()

    def reload(self):
        """Scans connectors directory and registers all active products."""
        self.connectors.clear()
        self.tool_to_connector.clear()
        
        if not os.path.exists(self.connectors_dir):
            return

        yaml_files = glob.glob(os.path.join(self.connectors_dir, "*.yaml"))
        for yf in yaml_files:
            try:
                with open(yf, "r", encoding="utf-8") as f:
                    manifest = yaml.safe_load(f)
                    if manifest and "product_id" in manifest:
                        connector = UniversalFileOrHttpConnector(manifest)
                        pid = manifest["product_id"]
                        self.connectors[pid] = connector
                        tool_name = manifest.get("gemini_tool_definition", {}).get("name")
                        if tool_name:
                            self.tool_to_connector[tool_name] = connector
            except Exception as e:
                print(f"[Registry Error] Failed loading {yf}: {e}")

    def list_connectors(self) -> List[Dict[str, Any]]:
        return [
            {
                "product_id": c.product_id,
                "display_name": c.display_name,
                "modality": c.modality,
                "tool_name": c.tool_def.get("name"),
                "category": c.manifest.get("category", "GENERAL")
            }
            for c in self.connectors.values()
        ]

    def get_all_tool_declarations(self) -> List[Dict[str, Any]]:
        """Returns the function declarations for Google Gemini function calling."""
        return [c.get_tool_declaration() for c in self.connectors.values() if c.tool_def]

    def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Executes a dynamic tool call and returns serialized canonical events."""
        connector = self.tool_to_connector.get(tool_name)
        if not connector:
            raise ValueError(f"No active connector registered for tool: {tool_name}")
        events = connector.query(**arguments)
        return [e.model_dump() for e in events]
