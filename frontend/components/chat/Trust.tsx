"use client";

import { CircleAlert, CircleCheck, CircleHelp, CloudOff, FileSignature, Loader2, Scale, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ApiError, downloadCertificate, verifyEvidence, type Session } from "@/lib/api";
import type { Citation, CustodyCheck, RuleRef } from "@/lib/types";

const short = (h: string) => `${h.slice(0, 8)}…${h.slice(-6)}`;

/* ---------------------------------------------------------------- evidence custody */

const STATE = {
  VERIFIED: { icon: CircleCheck, text: "Verified · unchanged since ingest", cls: "text-ok-ink" },
  MISMATCH: { icon: CircleAlert, text: "Hash mismatch · do not rely on this file", cls: "text-danger-ink" },
  FILE_UNAVAILABLE: { icon: CloudOff, text: "Original not on this server · recorded hash shown", cls: "text-amber-ink" },
} as const;

/** SHA-256 + Verify (+ §63 draft) under one evidence line. Online answers only. */
export function CustodyRow({ c, session, canCertify }: { c: Citation; session: Session; canCertify: boolean }) {
  const [check, setCheck] = useState<CustodyCheck | null>(null);
  const [busy, setBusy] = useState<"verify" | "cert" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!c.sha256 || !c.evidence_id)
    return (
      <span className="mt-1 flex items-center gap-1 font-mono text-[10.5px] text-ink-400" title="This citation does not match a registered evidence file, so it has no recorded hash to verify.">
        <CircleHelp className="h-3 w-3" aria-hidden /> Not in evidence registry
      </span>
    );

  const id = c.evidence_id;
  const run = async (what: "verify" | "cert") => {
    setBusy(what);
    setError(null);
    try {
      if (what === "verify") setCheck(await verifyEvidence(id, session));
      else await downloadCertificate(id, session);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Server unreachable");
    } finally {
      setBusy(null);
    }
  };
  const s = check ? STATE[check.status] : null;

  return (
    <span className="mt-1 block">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] text-ink-500">
        <span title={`SHA-256 recorded at ingest: ${c.sha256}`} className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-ink-400" aria-hidden /> SHA-256 {short(c.sha256)}
        </span>
        <button
          type="button"
          onClick={() => run("verify")}
          disabled={busy !== null}
          className="rounded border border-[var(--line)] bg-white px-1.5 py-px font-sans text-[11px] font-semibold text-ink-700 transition hover:border-ok-ink hover:text-ok-ink disabled:opacity-60"
          aria-label={`Verify evidence ${id}`}
        >
          {busy === "verify" ? <Loader2 className="inline h-3 w-3 animate-spin" aria-hidden /> : "Verify"}
        </button>
        {canCertify && (
          <button
            type="button"
            onClick={() => run("cert")}
            disabled={busy !== null}
            title="Download a draft certificate under Section 63(4), Bharatiya Sakshya Adhiniyam 2023, for signature"
            className="inline-flex items-center gap-1 rounded border border-[var(--line)] bg-white px-1.5 py-px font-sans text-[11px] font-semibold text-ink-700 transition hover:border-blue-ink hover:text-blue-ink disabled:opacity-60"
          >
            {busy === "cert" ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <FileSignature className="h-3 w-3" aria-hidden />} §63 draft
          </button>
        )}
      </span>
      {s && check && (
        <span role="status" className={`mt-1 flex items-start gap-1 font-sans text-[11.5px] font-semibold ${s.cls}`}>
          <s.icon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            {s.text}
            <span className="block font-mono text-[10px] font-normal text-ink-500">
              {check.file} · {check.computed_sha256 ? `recomputed ${short(check.computed_sha256)}` : `recorded ${short(check.recorded_sha256)}`}
              {check.source ? ` from ${check.source}` : ""} ·{" "}
              {new Date(check.checked_at).toLocaleTimeString("en-IN")}
            </span>
          </span>
        </span>
      )}
      {error && <span className="mt-1 block font-sans text-[11.5px] text-danger-ink">{error}</span>}
    </span>
  );
}

/* ---------------------------------------------------------------- rule chips */

/** Legal provisions named in the answer. Known rules open their summary; unknown ones are flagged for a manual check. */
export function RuleChips({ rules }: { rules?: RuleRef[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!rules?.length) return null;
  const active = rules.find((r) => r.id === open);
  const unknown = rules.filter((r) => r.status === "NOT_IN_LIBRARY").length;

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Rules cited">
        <Scale className="h-3.5 w-3.5 text-ink-400" aria-hidden />
        {rules.map((r) => {
          const known = r.status === "IN_LIBRARY";
          return (
            <button
              key={r.id}
              type="button"
              aria-expanded={open === r.id}
              onClick={() => setOpen(open === r.id ? null : r.id)}
              title={known ? r.title ?? r.ref : "Named in the answer but not in the rule library: check the official text"}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold transition ${
                known
                  ? `border border-blue-ink/25 bg-blue-soft text-blue-ink hover:border-blue-ink ${open === r.id ? "ring-2 ring-blue-ink/20" : ""}`
                  : `border border-dashed border-ink-300 bg-white text-ink-500 hover:border-ink-500 ${open === r.id ? "ring-2 ring-ink-200" : ""}`
              }`}
            >
              {known ? <CircleCheck className="h-3 w-3" aria-hidden /> : <CircleHelp className="h-3 w-3" aria-hidden />}
              {r.label}
            </button>
          );
        })}
      </div>
      {active && (
        <div className="mt-2 rounded-card border border-[var(--line)] bg-paper p-3 text-[13px] leading-relaxed">
          {active.status === "IN_LIBRARY" ? (
            <>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500">
                {active.act} · {active.ref}
              </p>
              <p className="mt-1 font-semibold text-ink-950">{active.title}</p>
              <p className="mt-1 text-ink-700">{active.summary}</p>
              <p className="mt-2 font-mono text-[10.5px] text-ink-500">Summary from the RailKavach rule library · verify against the gazetted text before relying on it</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-ink-950">{active.label} isn&apos;t in the rule library</p>
              <p className="mt-1 text-ink-700">The answer names this provision, but it doesn&apos;t match a rule RailKavach has on file. Check it against the official text before citing it.</p>
            </>
          )}
        </div>
      )}
      {unknown > 0 && !active && (
        <p className="mt-1 font-mono text-[10.5px] text-ink-500">
          {unknown} reference{unknown > 1 ? "s" : ""} not in the rule library · check manually
        </p>
      )}
    </div>
  );
}
