import type { ChatResponse, FileAnalysisResult, Purpose, UserRole } from "./types";

/**
 * Browser-reachable backend origin. Override with NEXT_PUBLIC_API_URL
 * (must be reachable from the user's browser, not a Docker-internal hostname).
 */
/**
 * Production (static export served by FastAPI on Cloud Run) calls the same origin.
 * Dev (next dev on :3000) calls the local backend on :8000. NEXT_PUBLIC_API_URL overrides both.
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:8000")).replace(/\/$/, "");

/** Who is asking and why. The server enforces scope and DPDP masking from these. */
export interface Session {
  role: UserRole;
  purpose: Purpose;
}

/** The backend answered but refused (401/403/400). Never fall back to cached data on this. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const sessionHeaders = (s: Session) => ({ "X-RailKavach-Role": s.role, "X-RailKavach-Purpose": s.purpose });

async function parse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();
  let detail = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    if (typeof body.detail === "string") detail = body.detail;
  } catch {}
  throw new ApiError(res.status, detail);
}

export async function postChat(query: string, language: "en" | "hi", session: Session): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...sessionHeaders(session) },
    body: JSON.stringify({ query, language }),
  });
  return parse(res);
}

export async function analyzeFile(filename: string, fileType: string, session: Session): Promise<FileAnalysisResult> {
  const form = new FormData();
  form.append("filename", filename);
  form.append("file_type", fileType);
  const res = await fetch(`${API_BASE}/api/files/analyze`, { method: "POST", body: form, headers: sessionHeaders(session) });
  return parse(res);
}

export interface DemoRequest {
  name: string;
  organisation: string;
  email: string;
  interests: string[];
  consent: boolean;
}

export async function postDemoRequest(req: DemoRequest): Promise<{ reference: string }> {
  const res = await fetch(`${API_BASE}/api/demo-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return parse(res);
}

/** POST a governed data endpoint (skills/timeline). Server applies scope + DPDP masking. */
export async function fetchScoped<T>(path: string, body: object, session: Session): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...sessionHeaders(session) },
    body: JSON.stringify(body),
  });
  return parse(res);
}
