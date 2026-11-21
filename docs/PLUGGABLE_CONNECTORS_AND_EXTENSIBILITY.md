# RailKavach Open Connector Protocol (ROCP) & Pluggable Product Architecture

> **Platform:** RailKavach AI Ecosystem & RailKavach Copilot  
> **Standard:** RailKavach Open Connector Protocol (ROCP) v1.0  
> **Core Objective:** Zero-code & low-code integration of new railway safety products and data endpoints into RailKavach Copilot.

---

## 1. Architectural Vision: The Universal Railway Intelligence Mesh

RailKavach starts with 3 foundational production products (**WDD** for freight wagons, **Locate** for cabin vision, and **Railcomm** for radio audio). However, Indian Railways continuously deploys new IoT, trackside, signalling, and onboard safety systems:
* **Kavach** (Wheel Impact Load Detector)
* **HABD / HOT BOX** (Hot Axle & Box Hot Detector)
* **OHE Inspection Systems** (Overhead Equipment pantograph/catenary monitoring)
* **Kavach / TCAS** (Train Collision Avoidance System onboard telemetry)
* **Axle Counters & Electronic Interlocking (EI)** signalling event loggers
* **USFD** (Ultrasonic Flaw Detection for rail tracks)
* **CMS / FOIS** (Crew Management System & Freight Operations Information System)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      UNIVERSAL PLUGGABLE PRODUCT ARCHITECTURE                          │
│                                                                                        │
│   Existing Core Products              Future / Third-Party Railway Safety Products    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───┐ │
│  │ WDD      │ │ Locate   │ │ Railcomm │   │ Kavach     │ │ OHE Cam  │ │ Kavach   │ │...│ │
│  │ Gantry   │ │ Cabin CV │ │ Audio DL │   │ Axle Load│ │ Pantogr. │ │ TCAS Log │ │   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘   └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┘ │
│       │            │            │              │            │            │             │
│       ▼            ▼            ▼              ▼            ▼            ▼             │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │           RAILKAVACH OPEN CONNECTOR PROTOCOL (ROCP) ADAPTER LAYER               │   │
│  │    • REST / Webhook / Kafka / SQL Endpoints                                     │   │
│  │    • Canonical Railway Telemetry Envelope (Standard Normalization)              │   │
│  │    • Cryptographic Hash & Verification Binding                                  │   │
│  └──────────────────────────────────────┬──────────────────────────────────────────┘   │
│                                         │                                              │
│                                         ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                      DYNAMIC AGENT SKILL REGISTRY (COPILOT)                     │   │
│  │    • Dynamic Tool Discovery (Scans connectors/ manifests or DB)                 │   │
│  │    • Auto-generates Gemini / Vertex AI FunctionCalling Declarations             │   │
│  │    • Zero Orchestrator Code Modification for New Endpoints                      │   │
│  └──────────────────────────────────────┬──────────────────────────────────────────┘   │
│                                         │                                              │
│                                         ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │              CROSS-MODAL REASONING & POLYMORPHIC EVIDENCE ENGINE                │   │
│  │    • Universal Timeline Fusion across N Modalities                              │   │
│  │    • Polymorphic Evidence Rendering (Audio / Video / Image / Sensor Telemetry)   │   │
│  │    • Unified Bilingual Statutory Inquiries (CRS / DSO)                          │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Rather than hardcoding integrations, RailKavach Copilot is built on an **Open Connector Architecture**. **Connecting any new product requires only a registered endpoint and a lightweight schema manifest.**

---

## 2. The 3 Steps to Connect Any New Railway Product

Connecting a new product to RailKavach Copilot takes less than 15 minutes:

```
┌──────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐
│         STEP 1           │    │         STEP 2           │    │         STEP 3           │
│ Expose REST / JSON Feed  │───>│ Drop Connector Manifest  │───>│ Copilot Auto-Discovers   │
│ on your product server   │    │ in connectors/<name>.yaml│    │ Tool & Queries via LLM   │
└──────────────────────────┘    └──────────────────────────┘    └──────────────────────────┘
```

### Step 1: Expose the Data Endpoint
Your product exposes an internal or secure REST endpoint (e.g. `GET /api/v1/telemetry?train_no=12414&start_time=...`) that outputs events matching the **Canonical Railway Event Schema** (Section 3).

### Step 2: Define the Connector Manifest (`connectors/<product_id>.yaml`)
Create a single YAML configuration file defining how the Copilot should interact with your endpoint:

```yaml
# connectors/kavach_axle_detector.yaml
product_id: "kavach_axle_detector"
display_name: "Kavach-TCAS Train Protection"
version: "1.0.0"
category: "TRACKSIDE_SAFETY_SENSOR"
modality: "SENSOR_TELEMETRY"   # Options: VIDEO | AUDIO | IMAGE | SENSOR_TELEMETRY | SIGNALLING

endpoint:
  url: "${Kavach_API_ENDPOINT:-http://kavach-service.railway.internal/v1/events}"
  auth_type: "bearer"          # Options: none | bearer | api_key | basic
  token_env_var: "Kavach_API_TOKEN"
  timeout_seconds: 5
  retry_count: 2

query_capabilities:
  can_filter_by_train: true
  can_filter_by_wagon: true
  can_filter_by_time_window: true
  can_filter_by_section: true

# Google AI Agent Tool Definition (Automatically converted into Gemini FunctionDeclaration)
gemini_tool_definition:
  name: "query_kavach_wheel_impact_data"
  description: "Queries Kavach-TCAS Train Protection telemetry. Returns axle load, dynamic wheel impact forces (in kN), and defect classifications (e.g., flat tyre, unbalanced loading)."
  parameters:
    type: "object"
    properties:
      train_no:
        type: "string"
        description: "Train number or rake ID (e.g., '12414', 'BOXN-542')"
      wagon_no:
        type: "string"
        description: "Optional specific wagon serial number"
      min_impact_kn:
        type: "number"
        description: "Minimum impact force threshold in kN to filter severe defects (e.g. > 200 kN)"
      start_time:
        type: "string"
        description: "Start timestamp in ISO 8601 or HH:MM:SS"
      end_time:
        type: "string"
        description: "End timestamp in ISO 8601 or HH:MM:SS"
    required: ["train_no"]

# UI Rendering Configuration
ui_rendering:
  badge_color: "#E65100"      # Orange badge for trackside wheel impact
  icon: "disc"                # Feather / Lucide icon
  primary_metric_field: "impact_kn"
  metric_unit: "kN"
  threshold_alert: 200.0
```

### Step 3: Zero-Code Auto-Discovery
Upon startup (or via hot-reload `POST /api/v1/connectors/reload`), the Copilot Orchestrator:
1. Loads all YAML manifests from `connectors/`,
2. Dynamically generates Google Gemini `FunctionDeclaration` objects,
3. Binds an asynchronous HTTP executor to each function call.

**Gemini immediately gains the ability to query your new product during live safety inquiries!**

---

## 3. The Canonical Railway Telemetry Envelope (Contract)

To enable seamless cross-modal correlation, every connector normalizes incoming data into the **Canonical Railway Event Schema**:

```json
{
  "event_id": "EVT-Kavach-20261118-031412-042",
  "source_product": "kavach_axle_detector",
  "modality": "SENSOR_TELEMETRY",
  "timestamp": "2026-11-18T03:14:12.450Z",
  "train_no": "12414",
  "loco_id": "WAP-7 30452",
  "vehicle_id": "BOXN-54210984712",
  "vehicle_type": "WAGON",
  "section": "Suratgarh-Bikaner",
  "location_marker": "KM 142/18",
  "event_type": "HIGH_WHEEL_IMPACT",
  "severity": "CRITICAL",
  "verification_status": "PENDING_VERIFICATION",
  "summary": "Axle 4 registered abnormal dynamic impact force of 248.5 kN exceeding safety threshold (200.0 kN).",
  "metrics": {
    "impact_kn": 248.5,
    "static_load_tonnes": 21.4,
    "impact_factor": 1.82,
    "speed_kmph": 68.2
  },
  "evidence": {
    "raw_payload_uri": "minio://telemetry/kavach/20261118/12414_axle4.json",
    "preview_uri": "https://storage.railkavach.ai/previews/kavach_12414_axle4.png",
    "mime_type": "image/png",
    "sha256_hash": "a4f89d3421e90b8c9f01e523412356ab7890cd12345678ef0123456789abcdef"
  }
}
```

### Mandatory Universal Anchors for Cross-Modal Fusion
For the Copilot's `multimodal_timeline_synchronizer` to merge any new product's events, the data must supply at least two of these four anchors:
1. **`timestamp`** (ISO 8601 with millisecond precision, NTP synchronized).
2. **`train_no`** or **`loco_id`** or **`vehicle_id`** (Wagon/Coach Number).
3. **`section`** or **`location_marker`** (e.g. `KM 142/18` or `Suratgarh Outer`).
4. **`event_type`** & **`severity`** (`CRITICAL`, `WARNING`, `INFO`).

---

## 4. How the Dynamic Connector Registry Works in Code

### 4.1 Base Connector Protocol (`src/connectors/base.py`)
```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from pydantic import BaseModel

class CanonicalRailwayEvent(BaseModel):
    event_id: str
    source_product: str
    modality: str  # AUDIO, VIDEO, IMAGE, SENSOR_TELEMETRY, SIGNALLING
    timestamp: str
    train_no: str
    loco_id: str | None = None
    vehicle_id: str | None = None
    section: str | None = None
    event_type: str
    severity: str  # CRITICAL, WARNING, INFO
    verification_status: str = "PENDING_VERIFICATION"
    summary: str
    metrics: Dict[str, Any] = {}
    evidence: Dict[str, Any] = {}

class BaseProductConnector(ABC):
    """Abstract base class that all RailKavach product connectors implement."""
    
    def __init__(self, manifest: Dict[str, Any]):
        self.manifest = manifest
        self.product_id = manifest["product_id"]
        self.tool_def = manifest["gemini_tool_definition"]
        
    @abstractmethod
    async def query(self, **kwargs) -> List[CanonicalRailwayEvent]:
        """Executes a query against the product endpoint and returns canonical events."""
        pass
        
    def get_tool_declaration(self) -> Dict[str, Any]:
        """Returns the Gemini FunctionDeclaration dictionary."""
        return self.tool_def
```

### 4.2 Generic HTTP REST Connector (`src/connectors/http_connector.py`)
For any external product that exposes a REST API, no Python code is required at all! The generic `HttpProductConnector` reads the manifest, calls the external API, and wraps responses:

```python
import httpx
from typing import Dict, Any, List
from src.connectors.base import BaseProductConnector, CanonicalRailwayEvent

class HttpProductConnector(BaseProductConnector):
    """Generic connector that calls external product REST endpoints via HTTP."""
    
    async def query(self, **kwargs) -> List[CanonicalRailwayEvent]:
        endpoint_cfg = self.manifest["endpoint"]
        url = endpoint_cfg["url"]
        headers = {}
        
        # Authenticate if configured
        if endpoint_cfg.get("auth_type") == "bearer":
            import os
            token = os.getenv(endpoint_cfg.get("token_env_var", ""), "")
            headers["Authorization"] = f"Bearer {token}"
            
        async with httpx.AsyncClient(timeout=endpoint_cfg.get("timeout_seconds", 5)) as client:
            # Query the external product endpoint
            response = await client.get(url, params=kwargs, headers=headers)
            response.raise_for_status()
            raw_data = response.json()
            
            # Map into Canonical Railway Events
            events = [CanonicalRailwayEvent(**item) for item in raw_data.get("events", raw_data)]
            return events
```

### 4.3 Dynamic Skill Registry (`src/connectors/registry.py`)
The registry manages all active connectors and dynamically exposes them to Gemini:

```python
import yaml
import glob
from typing import Dict, Any, List
from src.connectors.http_connector import HttpProductConnector

class ConnectorRegistry:
    def __init__(self, manifests_dir: str = "connectors"):
        self.manifests_dir = manifests_dir
        self.connectors: Dict[str, Any] = {}
        self.load_all_connectors()
        
    def load_all_connectors(self):
        """Scans connectors/*.yaml and registers every product dynamically."""
        yaml_files = glob.glob(f"{self.manifests_dir}/*.yaml")
        for file_path in yaml_files:
            with open(file_path, "r") as f:
                manifest = yaml.safe_load(f)
                connector = HttpProductConnector(manifest)
                self.connectors[manifest["product_id"]] = connector
                
    def get_all_gemini_tools(self) -> List[Dict[str, Any]]:
        """Returns all registered tool declarations to feed into Gemini API."""
        return [c.get_tool_declaration() for c in self.connectors.values()]
        
    async def dispatch_tool_call(self, tool_name: str, arguments: Dict[str, Any]):
        """Dispatches an LLM tool call to the corresponding product endpoint."""
        for connector in self.connectors.values():
            if connector.tool_def["name"] == tool_name:
                return await connector.query(**arguments)
        raise ValueError(f"No registered connector found for tool '{tool_name}'")
```

---

## 5. Examples: Ready-to-Use Manifests for New Railway Products

### Example 1: Kavach-TCAS Train Protection
```yaml
# connectors/kavach.yaml
product_id: "kavach_axle_detector"
display_name: "Kavach-TCAS Train Protection"
modality: "SENSOR_TELEMETRY"
endpoint:
  url: "https://api.railways.gov.in/v1/kavach/measurements"
  auth_type: "bearer"
  token_env_var: "Kavach_API_KEY"
gemini_tool_definition:
  name: "query_kavach_impact_data"
  description: "Queries trackside Kavach sensors for abnormal wheel impacts (>200 kN) or unbalanced axle loads."
  parameters:
    type: "object"
    properties:
      train_no: { type: "string" }
      min_impact_kn: { type: "number", default: 200 }
    required: ["train_no"]
```

### Example 2: Overhead Equipment (OHE) Pantograph Camera
```yaml
# connectors/ohe_inspection.yaml
product_id: "ohe_catenary_monitor"
display_name: "OHE & Pantograph Video Analytics"
modality: "VIDEO"
endpoint:
  url: "https://ohe.nwr.railnet.gov.in/api/v2/sparks"
  auth_type: "api_key"
  token_env_var: "OHE_TOKEN"
gemini_tool_definition:
  name: "query_ohe_catenary_anomalies"
  description: "Queries wayside roof-camera alerts for severe pantograph sparking, OHE contact wire sagging, or entanglement risks."
  parameters:
    type: "object"
    properties:
      loco_id: { type: "string" }
      section: { type: "string" }
    required: ["section"]
```

### Example 3: Kavach (TCAS) Telemetry Logger
```yaml
# connectors/kavach_tcas.yaml
product_id: "kavach_telemetry"
display_name: "Kavach (TCAS) Signal & Brake Log"
modality: "SIGNALLING"
endpoint:
  url: "https://kavach-gateway.railways.gov.in/v1/events"
  auth_type: "none"
gemini_tool_definition:
  name: "query_kavach_telemetry"
  description: "Queries Kavach automatic braking activations, Movement Authority (MA) limits, and RFID balise transponder strikes."
  parameters:
    type: "object"
    properties:
      loco_id: { type: "string" }
      time_window: { type: "string" }
    required: ["loco_id"]
```

---

## 6. How the Multimodal Engine Handles New Modalities

When Gemini receives a query:
> *"Did Train 12414 have any mechanical or wheel impact issues before overshooting the signal?"*

1. **Autonomous Tool Routing:** Gemini inspects all dynamically registered tools and identifies that `query_kavach_impact_data` and `get_wdd_wagon_damages` are relevant.
2. **Parallel Fetching:** The orchestrator queries both endpoints concurrently.
3. **Canonical Fusion:** The `multimodal_timeline_synchronizer` sorts the responses along with Railcomm radio audio and Locate video alerts:

```
[03:13:50] 🚆 WDD Gantry: Wagon BOXN-542 brake beam hanging defect detected.
[03:14:12] ⚠️ Kavach Sensor (KM 142/18): Wheel 4 impact surge 248.5 kN (Abnormal).
[03:14:15] 🔴 Locate Cab Cam: Loco Pilot looking down at mobile phone.
[03:14:20] 📻 Railcomm Audio: Station Master shouts "लाल सिग्नल... रोको रोको!"
[03:14:35] 🚨 Kavach TCAS: Auto-emergency brake application initiated (Brake Pipe drops to 0).
```

---

## 7. Polymorphic UI: Auto-Rendering New Product Evidence

The RailKavach frontend does not need custom UI code for each new product. It renders **Polymorphic Evidence Cards** based on `modality`:

| Modality | UI Component Rendered | Interactive Features |
| :--- | :--- | :--- |
| **`AUDIO`** | Audio Waveform Card | Play/Pause, 0.5x–2x speed, synchronized Hindi/English transcript highlighting. |
| **`VIDEO`** | Video Player Card | Scrubbable clip with bounding box overlays and timestamp badge. |
| **`IMAGE`** | High-Res Image Viewer | Deep zoom, bounding boxes, before-and-after entry/exit comparison slider. |
| **`SENSOR_TELEMETRY`** | Telemetry Metric Gauge | Key-value cards, threshold alerts (🟢/🟡/🔴), sparkline charts of values over time. |
| **`SIGNALLING`** | Signal Aspect Diagram | Visual signal aspect (Red/Yellow/Green), distance-to-signal meter, RFID balise tags. |

---

## 8. Summary of Benefits for Indian Railways

1. **Future-Proof Investment:** Indian Railways can procure specialized AI cameras or track sensors from any vendor; RailKavach Copilot connects to them via standard ROCP manifests without rewriting code.
2. **True Enterprise Interoperability:** Breaks down proprietary data silos across Mechanical (C&W), Electrical (TRS), Signalling & Telecommunication (S&T), and Operating branches.
3. **Instant Value Unlocking:** Any new sensor deployed on the railway network becomes instantly searchable in plain Hindi and English on day one.