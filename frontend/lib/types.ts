import type { LucideIcon } from "lucide-react";

export interface Citation {
  timestamp: string;
  source: string;
  event_description: string;
  reviewer_status?: string | null;
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
}

export type DataSource = "RAILCOMM" | "LOCATE" | "WDD" | "WILD" | "TELEMETRY";
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
