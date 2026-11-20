# Security Architecture, Threat Modeling & DevSecOps — RailKavach Copilot

## 1. Security Philosophy: Critical Infrastructure & Air-Gapped Readiness
Indian Railways operates critical national infrastructure subject to strict data sovereignty, confidentiality, and physical isolation directives (CERT-In and Railway Board guidelines).

RailKavach Copilot enforces **Defense-in-Depth** across all operational platform stages:
* In-transit encryption using TLS 1.3.
* Data-at-rest encryption using AES-256 (GCM).
* Strict Role-Based Access Control (RBAC) scoped by Railway Zone and Division.
* Cryptographic tamper-evidence for inquiry records.

---

## 2. Threat Modeling (STRIDE Analysis)

| Threat Category | Potential Attack / Vulnerability | RailKavach Mitigation Control |
| :--- | :--- | :--- |
| **Spoofing** | Unauthorized operator forging Station Master or Loco Pilot credentials to fabricate evidence. | Strict JWT bearer token authentication, HMAC-SHA256 request signatures, and division-scoped RBAC. |
| **Tampering** | Malicious alteration of CVVRS video clips or VHF transcripts to hide safety violations. | Cryptographic hash chaining (SHA-256) on raw media ingest; immutable PostgreSQL audit logs. |
| **Repudiation** | An officer denying they reviewed or cleared an alert (`CONFIRMED` vs `REJECTED`). | Immutable Reviewer Audit Trail logging Reviewer ID, Designation, Timestamp, and Decision Justification. |
| **Information Disclosure** | Leakage of locomotive movement logs or sensitive freight rake manifests. | Strict tenant data isolation per railway division; PII anonymization on crew identity outside authorized inquiry boards. |
| **Denial of Service** | Flooding API with high-token queries or synthetic audio streams. | Rate-limiting (FastAPI middleware), bounded context clamping (< 2,500 tokens), and asynchronous Celery/Redis task queues. |
| **Elevation of Privilege** | Crew controller attempting to modify statutory CRS inquiry findings. | Multi-tier RBAC: `ROLE_VIEWER`, `ROLE_REVIEWER`, `ROLE_SAFETY_OFFICER`, `ROLE_CRS_ADMIN`. |

---

## 3. OWASP Top 10 & API Security Compliance

1. **Broken Object Level Authorization (BOLA / IDOR)**: All endpoints (`/api/timeline`, `/api/report`, `/api/skills/*`) enforce division-level authorization checks. A user in Jaipur Division cannot inspect Bikaner Division cab footage without elevated zonal permissions.
2. **Broken Authentication**: Session tokens use secure, HTTP-only, SameSite cookies with automatic expiration.
3. **Prompt Injection & Model Manipulation**:
   - System prompts are strictly separated from user query context.
   - Pydantic models validate and sanitize all user query inputs before passing to LLM engine.
   - Output parser enforces structured JSON or markdown with strict timestamp validation regex (`^\[\d{2}:\d{2}:\d{2}\]`).
4. **Security Misconfiguration & Secrets**:
   - Zero hardcoded secrets in source code.
   - `.env` files are strictly git-ignored.
   - Production secrets managed via Google Cloud Secret Manager or HashiCorp Vault.

---

## 4. Cryptographic Chain of Custody
All video clips and audio streams ingested into RailKavach generate a cryptographic fingerprint at capture:
$$\text{Evidence Hash} = \text{HMAC-SHA256}(\text{Raw Media Bytes}, K_{\text{division}}) \parallel \text{Timestamp}$$
When an inquiry report is generated, this hash is embedded into the preliminary report to ensure evidentiary admissibility before the **Commissioner of Railway Safety (CRS)**.
