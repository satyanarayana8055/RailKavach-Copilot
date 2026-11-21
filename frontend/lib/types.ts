import type { LucideIcon } from "lucide-react";

export interface Citation {
  timestamp: string;
  source: string;
  event_description: string;
  reviewer_status?: string | null;
  /** Registered evidence record this citation resolves to (server-side custody registry). */
  evidence_id?: string | null;
  /** SHA-256 recorded at ingest (BSA 2023 §63 Part B). Absent = not a registered record. */
  sha256?: string | null;
  media_url?: string | null;
}

/** A legal provision named in an answer, checked against the rule library. */
export interface RuleRef {
  id: string;
  act: string;
  ref: string;
  label: string;
  title?: string | null;
  summary?: string | null;
  status: "IN_LIBRARY" | "NOT_IN_LIBRARY";
}

export interface CustodyCheck {
  evidence_id: string;
  kind: string;
  file: string;
  status: "VERIFIED" | "MISMATCH" | "FILE_UNAVAILABLE";
  recorded_sha256: string;
  computed_sha256: string | null;
  size_bytes: number | null;
  checked_at: string;
  detail: string;
  source?: "server disk" | "Cloud Storage";
}

export interface AuditEntry {
  seq: number;
  ts: string;
  request_id: string;
  role: string;
  purpose: string;
  endpoint: string;
  decision: "ALLOWED" | "PARTIAL" | "DENIED";
  sources_required: string[];
  sources_withheld: string[];
  pii_unmasked: boolean;
  citations_returned: number;
  query_masked: string | null;
  query_sha256: string | null;
  prev_hash: string;
  hash: string;
}

export interface AuditLogResponse {
  chain: { intact: boolean; entries: number; head_hash?: string; broken_at_seq?: number };
  entries: AuditEntry[];
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  suggested_actions: string[];
  latency_ms: number;
  token_usage: { total_tokens: number; prompt_tokens?: number; candidates_tokens?: number };
  cached: boolean;
  bilingual_payload?: {
    english_statutory?: string;
    hindi_briefing?: string;
  };
  /** Server-side RBAC/DPDP outcome (absent in offline mode). */
  access?: AccessInfo;
  /** Legal provisions named in the answer, checked against the rule library. */
  rules?: RuleRef[];
  model_engine?: string;
}

export type DataSource = "RAILCOMM" | "LOCATE" | "WDD" | "TELEMETRY";
export type Purpose = "ROUTINE_MONITORING" | "CREW_BRIEFING" | "SAFETY_INQUIRY" | "STATUTORY_INQUIRY";

export interface AccessInfo {
  role: string;
  purpose: Purpose;
  decision: "ALLOWED" | "PARTIAL" | "DENIED";
  sources_in_scope: DataSource[];
  sources_withheld: DataSource[];
  pii_masked: boolean;
  reason?: string | null;
  audit_seq?: number | null;
  audit_hash?: string | null;
}

export type EventSource = "RAILCOMM_AUDIO" | "LOCATE_CABIN_CAM" | "LOCO_TELEMETRY";

export interface TimelineEvent {
  time_str: string;
  source: EventSource;
  speaker: string;
  event: string;
  event_hi?: string;
  clarity?: number;
  fail_open?: boolean;
  reviewer_status?: string;
  severity: "INFO" | "CRITICAL";
  image_url?: string;
  gcs_uri?: string;
  statutory_rule?: string;
}

export interface FileAnalysisResult {
  filename: string;
  category: string;
  summary?: string;
  critical_timestamp?: string;
  defects_detected?: Array<{ class: string; severity: string; detail: string }>;
  violation_detected?: string;
  confidence?: number;
  reviewer_status?: string;
  wagon_number_ocr?: string;
  speed_restriction?: string;
  safety_keywords_detected?: string[];
  key_dialogue?: string;
  transit_delta?: string;
  liability?: string;
  spad_status?: string;
}

export type TabId = "copilot" | "files" | "timeline" | "wdd" | "artifacts";

export type UserRole =
  | "ROLE_SR_DSO"
  | "ROLE_SR_DEE"
  | "ROLE_SR_DME"
  | "ROLE_CREW_CONTROLLER"
  | "ROLE_CRS";

export interface RoleMetadata {
  code: UserRole;
  title: string;
  short: string;
  designation: string;
  division: string;
  icon: LucideIcon;
  allowedTabs: TabId[];
  /** Mirrors backend RoleProfile.data_scopes — the server is the authority; this drives UI + offline mode. */
  dataScopes: DataSource[];
  forceMasking: boolean;
  canSignCRS: boolean;
  canIssueWorkOrder: boolean;
  /** Mirrors RoleProfile.can_view_audit_log (Sr. DSO, CRS). */
  canViewAudit: boolean;
}

export type WagonStatus = "CLEAR" | "PRE_EXISTING" | "NEW_DAMAGE" | "CRITICAL";

export interface Wagon {
  pos: number;
  serial: string;
  entry: string;
  exit: string;
  status: WagonStatus;
  note: string;
  image_url?: string;
  defect_tag?: string;
}
