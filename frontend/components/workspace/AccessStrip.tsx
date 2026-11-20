import { Eye, EyeOff, Fingerprint, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import type { AccessInfo, DataSource } from "@/lib/types";

const LABEL: Record<DataSource, string> = { RAILCOMM: "Railcomm", LOCATE: "Locate", WDD: "WDD", WILD: "WILD", TELEMETRY: "Telemetry" };

/** What the server decided for this answer: scope, withheld sources, DPDP masking, audit entry. */
export function AccessStrip({ access }: { access?: AccessInfo }) {
  if (!access) return null;
  const denied = access.decision === "DENIED";
  const tone = denied ? "border-danger/30 bg-danger-soft text-danger-ink" : access.decision === "PARTIAL" ? "border-amber/40 bg-amber/10 text-amber-ink" : "border-ok/30 bg-ok-soft text-ok-ink";
  const Icon = denied ? ShieldAlert : ShieldCheck;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-btn border border-[var(--line)] bg-paper px-3 py-2" role="group" aria-label="Access decision">
      <span className={`chip ${tone}`}>
        <Icon className="h-3 w-3" aria-hidden /> {access.decision === "PARTIAL" ? "Partly withheld" : denied ? "Access restricted" : "In scope"}
      </span>
      {access.sources_in_scope.map((s) => (
        <span key={s} className="chip border-[var(--line)] bg-white font-medium text-ink-700">
          {LABEL[s]}
        </span>
      ))}
      {access.sources_withheld.map((s) => (
        <span key={s} className="chip border-danger/25 bg-white font-medium text-danger-ink line-through decoration-1">
          <Lock className="h-3 w-3" aria-hidden /> {LABEL[s]}
        </span>
      ))}
      <span className={`chip ${access.pii_masked ? "border-amber/40 bg-amber/10 text-amber-ink" : "border-blue/30 bg-blue-soft text-blue-ink"}`}>
        {access.pii_masked ? <EyeOff className="h-3 w-3" aria-hidden /> : <Eye className="h-3 w-3" aria-hidden />}
        {access.pii_masked ? "Identities masked · DPDP" : `Identities visible · ${access.purpose.replace("_", " ").toLowerCase()}`}
      </span>
      {access.audit_seq != null && (
        <span className="ml-auto flex items-center gap-1 font-mono text-[11px] text-ink-500" title={access.audit_hash ?? undefined}>
          <Fingerprint className="h-3 w-3" aria-hidden /> Audit #{access.audit_seq} · {access.audit_hash?.slice(0, 8)}
        </span>
      )}
      {access.audit_seq == null && <span className="ml-auto font-mono text-[11px] text-ink-500">Offline demo · not audited</span>}
    </div>
  );
}
