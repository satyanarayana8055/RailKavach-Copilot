# RailKavach Documentation Index 📚
> **Platform:** RailKavach AI Ecosystem & RailKavach Copilot  
> **Organization:** AiSPRY Technologies • Indian Railways  

All core documentation, specifications, and planning guides have been organized in this directory:

---

### 📑 Document Catalog

| Document | Description | Key Focus Areas |
| :--- | :--- | :--- |
| **[ENTERPRISE_SCALE_BEYOND_CLOUD_RUN.md](ENTERPRISE_SCALE_BEYOND_CLOUD_RUN.md)** | **Enterprise Scale Beyond Cloud Run** | Why Cloud Run alone is not enough for railway scale; 3-tier hybrid edge-core grid, GKE Enterprise with dedicated NVIDIA L4/A100 GPUs, Apache Kafka (500k events/sec), 10 Gbps Google Cloud Interconnect, and on-prem Ceph/MinIO NVMe grids. |
| **[HIGH_CONCURRENCY_ZERO_FAILURE_GUIDE.md](HIGH_CONCURRENCY_ZERO_FAILURE_GUIDE.md)** | **High-Concurrency & Zero-Failure Guide** | Blueprint for handling 10,000+ concurrent users with zero downtime without Docker, Kubernetes, or cloud dependencies using FastAPI asyncio, multi-worker process pools, Nginx static RAM caching, SQLite WAL mode, and systemd self-healing. |
| **[MASTER_STRATEGIC_DOSSIER.md](MASTER_STRATEGIC_DOSSIER.md)** | **Master Strategic, Technical & Presentation Dossier** | Comprehensive executive archive of the winning pitch narrative ("The Paradox of Success"), full Google Cloud backend suite, legal governance (DPDP/Railways/BSA 2023), ROCP extensibility protocol, and operational implementation. |
| **[GOOGLE_CLOUD_ENTERPRISE_ARCHITECTURE.md](GOOGLE_CLOUD_ENTERPRISE_ARCHITECTURE.md)** | **Google Cloud Enterprise Backend Architecture** | National scale architecture spanning Cloud Run, AlloyDB for PostgreSQL, Firebase Firestore, BigQuery & Vector Search, Google Cloud Storage (WORM Object Lock), Cloud Pub/Sub, Dataflow, Vertex AI (Gemini 1.5 Pro & Gemma 2), Model Context Protocol (MCP), and Cloud KMS/DLP. |
| **[GOOGLE_AI_STUDIO_GUIDE.md](GOOGLE_AI_STUDIO_GUIDE.md)** | **Google AI Studio Demo & Prompt Guide** | System instructions, 3 golden demo questions, and function-calling schemas for running the copilot directly inside Google AI Studio. |
| **[HACK2SKILL_SUBMISSION_TEMPLATE.md](HACK2SKILL_SUBMISSION_TEMPLATE.md)** | **Hack2skill Official Submission Guide** | Ready-to-paste answers for Problem Statement, Proposed Solution, Architecture, Google AI Tools/Models, and pitch deck criteria. |
| **[PLUGGABLE_CONNECTORS_AND_EXTENSIBILITY.md](PLUGGABLE_CONNECTORS_AND_EXTENSIBILITY.md)** | **RailKavach Open Connector Protocol (ROCP)** | Universal plug-and-play architecture for connecting any future railway product (Kavach, OHE, Kavach, Axle Counters, CMS) via simple YAML manifests, canonical event schemas, dynamic Gemini tool registry, and polymorphic UI rendering. |
| **[STATUTORY_AND_LEGAL_COMPLIANCE.md](STATUTORY_AND_LEGAL_COMPLIANCE.md)** | **Statutory, Legal & Regulatory Compliance Framework** | Exhaustive legal governance across DPDP Act 2023 (Sec 7(i) legitimate uses), The Railways Act 1989 & G&SR rules, RDSO CVVRS specs, Bharatiya Sakshya Adhiniyam 2023 (Sec 63 electronic evidence certificates), RPF/RPUP Acts, CERT-In 2022 directives, HOER fatigue regulations, and Puttaswamy workplace privacy doctrine. |
| **[MASTER_ENGINEERING_PROMPT.md](MASTER_ENGINEERING_PROMPT.md)** | **Master Engineering Prompt** | The governing build standard for this repo: research, architecture, UI/UX and branding, security/DevSecOps, testing, traceability, cost optimization, deployment, and Definition of Done. |
| **[ARCHITECTURE_AND_PLAN.md](ARCHITECTURE_AND_PLAN.md)** | **Master System Architecture & Plan of Action** | 5-stage architecture (Capture ➔ Infer ➔ Attribute ➔ Surface ➔ Evidence), 3 production platforms (WDD, Locate, Railcomm), cloud-agnostic pluggable backend adapters, fail-open audio safety, and hour-by-hour Buildathon execution plan. |
| **[SKILLS.md](../SKILLS.md)** | **Google Agent Skills Specification** | Detailed tool signatures and parameters for the 6 specialized skills: Railcomm audio transcript retrieval, Locate cabin violation detection, WDD wagon damage queries, multimodal timeline synchronization, and bilingual statutory report generation. |
| **[EVALUATION_GUIDE.md](EVALUATION_GUIDE.md)** | **Buildathon Evaluation Matrix & Winning Strategy** | Analysis of the 6 jury scoring parameters (focusing on the 70% kill-factor: Functional Demo 30%, Architecture 20%, Google AI Depth 20%), plus the strict 3-minute winning demo pitch script. |
| **[initial.md](initial.md)** | **Original Shortlist Briefing & Event Guidelines** | The original team briefing email, event logistics (GNITS Hyderabad, 20–21 Nov 2026), schedule, submission requirements, and team contacts. |

---

### 🖼️ Visual Architecture Diagrams
* **Infographic Slide Image (16:9 JPG):** **[../assets/railkavach_architecture.jpg](../assets/railkavach_architecture.jpg)**
* **Scalable Vector Graphic (SVG):** **[../assets/architecture_diagram.svg](../assets/architecture_diagram.svg)**
* **Interactive Web View (HTML):** **[../assets/architecture_visual.html](../assets/architecture_visual.html)**
