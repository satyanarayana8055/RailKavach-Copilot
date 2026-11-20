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
}
