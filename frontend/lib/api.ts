import type { ChatResponse, FileAnalysisResult } from "./types";

/**
 * Browser-reachable backend origin. Override with NEXT_PUBLIC_API_URL
 * (must be reachable from the user's browser, not a Docker-internal hostname).
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export async function postChat(query: string, language: "en" | "hi"): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, language }),
  });
  if (!res.ok) throw new Error(`chat ${res.status}`);
  return res.json();
}

export async function analyzeFile(filename: string, fileType: string): Promise<FileAnalysisResult> {
  const form = new FormData();
  form.append("filename", filename);
  form.append("file_type", fileType);
  const res = await fetch(`${API_BASE}/api/files/analyze`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`analyze ${res.status}`);
  return res.json();
}
