import type { ChatResponse, DataSource, RoleMetadata } from "./types";

/**
 * Offline-mode mirror of backend/app/governance.py. The server is the authority; this only keeps
 * the no-backend demo honest (same scope refusals, always masked). Keep keyword lists in sync.
 */
const RULES: Array<[RegExp, string]> = [
  [/\b(Rajesh Kumar|Amit Singh|S\. Sharma|M\. K\. Verma|V\. Joshi)\b/g, "[Crew masked]"],
  [/\b(A?LP|GD|SM|TM|CC)-\d{3,6}\b/g, "$1-[masked]"],
  [/(राजेश कुमार|अमित सिंह|राजेश|अमित)/g, "[कर्मी]"],
  [/(?<!\d)(?:\+91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g, "[phone masked]"],
];

export function maskPII(text: string, enabled: boolean): string {
  if (!enabled) return text;
  return RULES.reduce((t, [re, rep]) => t.replace(re, rep), text);
}

const KEYWORDS: Record<Exclude<DataSource, "TELEMETRY">, string[]> = {
  WDD: ["wagon", "wdd", "boxn", "rake", "gantry", "sick line", "sick-line", "shunting", "dent", "bulge", "वैगन", "डिब्बा"],
  WILD: ["wild", "wheel impact", "wheel load", "axle load"],
  LOCATE: ["phone", "mobile", "cabin", "cvvrs", "fatigue", "alertness", "drowsy", "sleep", "footplate", "violation", "camera", "थकान", "फोन"],
  RAILCOMM: ["radio", "vhf", "callout", "call-out", "caution order", "miscommunication", "transcript", "audio", "intercom", "exchange", "signal", "सिग्नल", "रेडियो"],
};
const INCIDENT = ["12414", "12403", "suratgarh", "spad", "near-spad", "incident", "investigate", "inquiry", "जांच"];

export function requiredSources(query: string): Set<DataSource> {
  const q = query.toLowerCase();
  const need = new Set<DataSource>();
  (Object.keys(KEYWORDS) as Array<keyof typeof KEYWORDS>).forEach((s) => KEYWORDS[s].some((k) => q.includes(k)) && need.add(s));
  if (INCIDENT.some((k) => q.includes(k))) ["RAILCOMM", "LOCATE", "TELEMETRY"].forEach((s) => need.add(s as DataSource));
  return need;
}

const LABEL: Record<DataSource, string> = { RAILCOMM: "Railcomm audio", LOCATE: "Locate cabin video", WDD: "Wagon Damage Detection", WILD: "WILD wheel sensors", TELEMETRY: "Loco telemetry" };

/** Offline answers: refuse out-of-scope queries exactly like the server, and always mask identities. */
export function governOffline(query: string, role: RoleMetadata, answer: () => ChatResponse): ChatResponse {
  const missing = Array.from(requiredSources(query)).filter((s) => !role.dataScopes.includes(s));
  const base = { role: role.code, purpose: "ROUTINE_MONITORING" as const, sources_in_scope: role.dataScopes, pii_masked: true };
  if (missing.length) {
    const reason = `${role.title} is not authorised to access ${missing.map((m) => LABEL[m]).join(", ")}. Request it through the Sr. DSO or CRS.`;
    return {
      answer: `Access restricted. ${reason}`,
      citations: [],
      suggested_actions: ["Request access via the Sr. DSO"],
      latency_ms: 0,
      token_usage: { total_tokens: 0 },
      cached: true,
      access: { ...base, decision: "DENIED", sources_withheld: missing, reason },
    };
  }
  const r = answer();
  return {
    ...r,
    answer: maskPII(r.answer, true),
    citations: r.citations.map((c) => ({ ...c, event_description: maskPII(c.event_description, true) })),
    access: { ...base, decision: "ALLOWED", sources_withheld: [] },
  };
}

/** "03:14:15" -> seconds since midnight */
export function toSeconds(hms: string): number {
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600 + m * 60 + (s || 0);
}
