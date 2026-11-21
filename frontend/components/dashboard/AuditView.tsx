"use client";

import { Ban, CircleCheck, Eye, Link2, Loader2, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, fetchAuditLog, type Session } from "@/lib/api";
import { ROLES } from "@/lib/data";
import type { AuditEntry, AuditLogResponse, UserRole } from "@/lib/types";

type Filter = "all" | "denied" | "unmasked" | "evidence";
const FILTERS: Array<{ id: Filter; label: string; test: (e: AuditEntry) => boolean }> = [
  { id: "all", label: "All", test: () => true },
  { id: "denied", label: "Refused", test: (e) => e.decision === "DENIED" },
  { id: "unmasked", label: "Identities shown", test: (e) => e.pii_unmasked },
  { id: "evidence", label: "Evidence & §63", test: (e) => e.endpoint.startsWith("/api/evidence") },
];

const DECISION = {
  ALLOWED: "border-ok/30 bg-ok-soft text-ok-ink",
  PARTIAL: "border-amber/40 bg-amber-soft text-amber-ink",
  DENIED: "border-danger/30 bg-danger-soft text-danger-ink",
} as const;

const ENDPOINT: Record<string, string> = {
  "/api/chat": "Question",
  "/api/evidence/verify": "Verify evidence",
  "/api/evidence/certificate": "§63 draft",
  "/api/evidence": "Evidence vault",
  "/api/timeline": "Timeline",
  "/api/report": "Report",
  "/api/files/analyze": "File inspector",
};
const label = (ep: string) => ENDPOINT[ep] ?? (ep.startsWith("/api/skills/") ? `Data · ${ep.split("/").pop()}` : ep.replace("/api/", ""));
const roleShort = (r: string) => ROLES[r as UserRole]?.short ?? r.replace("ROLE_", "");
const h = (x: string) => `${x.slice(0, 6)}…${x.slice(-4)}`;

export function AuditView({ session }: { session: Session }) {
  const [data, setData] = useState<AuditLogResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAuditLog(session, 200));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Audit log needs the server. It isn't available offline.");
    } finally {
      setLoading(false);
    }
  }, [session]);
  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => (data?.entries ?? []).filter(FILTERS.find((f) => f.id === filter)!.test), [data, filter]);
  const counts = useMemo(() => {
    const e = data?.entries ?? [];
    return { denied: e.filter((x) => x.decision === "DENIED").length, unmasked: e.filter((x) => x.pii_unmasked).length };
  }, [data]);
  const chain = data?.chain;

  return (
    <div className="space-y-4">
      {/* chain status */}
      <section
        aria-label="Audit chain status"
        className={`card flex flex-wrap items-center gap-4 p-5 ${chain && !chain.intact ? "border-danger/40 bg-danger-soft" : ""}`}
      >
        <span className={`grid h-11 w-11 place-items-center rounded-card ${chain?.intact === false ? "bg-danger text-white" : "bg-ok-soft text-ok-ink"}`}>
          {chain?.intact === false ? <ShieldAlert className="h-5 w-5" aria-hidden /> : <ShieldCheck className="h-5 w-5" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-ink-950">
            {loading && !data ? "Verifying chain…" : !chain ? "Audit log unavailable" : chain.intact ? "Chain verified · no entry edited or removed" : `Chain broken at entry #${chain.broken_at_seq}`}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-500">
            {chain
              ? `${chain.entries.toLocaleString("en-IN")} entries · every entry carries the SHA-256 of the one before${chain.head_hash ? ` · head ${h(chain.head_hash)}` : ""}`
              : error}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="font-mono text-[22px] font-semibold leading-none text-danger-ink tabular-nums">{data ? counts.denied : "—"}</p>
            <p className="mt-1 text-[11px] text-ink-500">refused</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[22px] font-semibold leading-none text-blue-ink tabular-nums">{data ? counts.unmasked : "—"}</p>
            <p className="mt-1 text-[11px] text-ink-500">identities shown</p>
          </div>
          <button type="button" onClick={load} disabled={loading} className="btn-pill-white h-9 px-3 text-[13px]" aria-label="Re-verify chain">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />} Re-verify
          </button>
        </div>
      </section>

      {/* entries */}
      <section className="card overflow-hidden" aria-label="Access log">
        <header className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-5 py-3">
          <h3 className="mr-2 text-sm font-semibold text-ink-950">Who asked what, and what they were shown</h3>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-2.5 py-0.5 text-[12px] font-semibold transition ${
                filter === f.id ? "border-ink-950 bg-ink-950 text-white" : "border-[var(--line)] bg-white text-ink-600 hover:border-ink-300"
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto font-mono text-[11px] text-ink-500">queries stored masked · newest first</span>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead className="bg-paper font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-500">
              <tr>
                <th scope="col" className="px-5 py-2 font-medium">#</th>
                <th scope="col" className="px-3 py-2 font-medium">Time</th>
                <th scope="col" className="px-3 py-2 font-medium">Role · purpose</th>
                <th scope="col" className="px-3 py-2 font-medium">Action</th>
                <th scope="col" className="px-3 py-2 font-medium">Decision</th>
                <th scope="col" className="px-3 py-2 font-medium">Query (masked)</th>
                <th scope="col" className="px-5 py-2 font-medium">Hash ← previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {rows.map((e) => (
                <tr key={e.seq} className="align-top hover:bg-paper/60">
                  <td className="px-5 py-2.5 font-mono text-[12px] font-semibold text-ink-900">{e.seq}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[12px] text-ink-600">
                    {new Date(e.ts).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-semibold text-ink-900">{roleShort(e.role)}</span>
                    <span className="block font-mono text-[10.5px] text-ink-500">{e.purpose.replace(/_/g, " ").toLowerCase()}</span>
                  </td>
                  <td className="px-3 py-2.5 text-ink-700">
                    {label(e.endpoint)}
                    {e.sources_withheld.length > 0 && <span className="block font-mono text-[10.5px] text-ink-500">withheld {e.sources_withheld.join(", ").toLowerCase()}</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`chip ${DECISION[e.decision]}`}>
                      {e.decision === "DENIED" ? <Ban className="h-3 w-3" aria-hidden /> : <CircleCheck className="h-3 w-3" aria-hidden />}
                      {e.decision.toLowerCase()}
                    </span>
                    {e.pii_unmasked && (
                      <span className="mt-1 flex items-center gap-1 font-mono text-[10.5px] text-blue-ink">
                        <Eye className="h-3 w-3" aria-hidden /> identities shown
                      </span>
                    )}
                  </td>
                  <td className="max-w-[260px] px-3 py-2.5 text-ink-700">
                    <span className="line-clamp-2" title={e.query_masked ?? undefined}>
                      {e.query_masked ?? "—"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-2.5 font-mono text-[11px] text-ink-500" title={`hash ${e.hash}\nprev ${e.prev_hash}`}>
                    <span className="text-ink-900">{h(e.hash)}</span>
                    <span className="flex items-center gap-1">
                      <Link2 className="h-3 w-3" aria-hidden /> {h(e.prev_hash)}
                    </span>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-ink-500">
                    {loading ? "Loading…" : error ?? "No entries for this filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
