"use client";

import { AlertTriangle, Camera, CloudOff, Lock, MessageSquarePlus, Radio, ShieldCheck, Train } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { DataSource, RoleMetadata } from "@/lib/types";
import type { CabinAlert, DashboardData, RadioRow } from "./useDashboardData";

interface View {
  id: string;
  label: string;
  node: ReactNode;
}

interface Props {
  role: RoleMetadata;
  data: DashboardData;
  mask: (t: string) => string;
  lang: "en" | "hi";
  onAsk: (q: string) => void;
  /** Overview sections that reuse existing panels (timeline, rake map). */
  timeline?: ReactNode;
  rake?: ReactNode;
  /** Secondary views (reports, file inspector) — only those the role may open. */
  views: View[];
  /** Chat is widened: less room, so stack sections. */
  compact?: boolean;
}

/** Every exchange carries routine tags; a "callout" is anything beyond them. */
const ROUTINE_TAGS = new Set(["Line Clear", "Signal Status Normal"]);
const isCallout = (r: RadioRow) => r.safety_keywords.some((k) => !ROUTINE_TAGS.has(k));
const SEV_RANK: Record<string, number> = { CRITICAL: 0, HIGH: 1, WARNING: 2, INFO: 3 };

const pretty = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

/* ---------- small building blocks ---------- */

function Kpi({ label, value, sub, tone = "ink" }: { label: string; value: ReactNode; sub?: string; tone?: "ink" | "danger" | "amber" | "ok" }) {
  const color = { ink: "text-ink-950", danger: "text-danger-ink", amber: "text-amber-ink", ok: "text-ok-ink" }[tone];
  return (
    <div className="min-w-0">
      <p className="truncate text-[12px] font-medium text-ink-500">{label}</p>
      <p className={`mt-1 font-mono text-[26px] font-semibold leading-none tabular-nums ${color}`}>{value}</p>
      {sub && <p className="mt-1.5 truncate font-mono text-[11px] text-ink-500">{sub}</p>}
    </div>
  );
}

function SourceCard({ icon: Icon, title, tint, children, wide }: { icon: typeof Radio; title: string; tint: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className="card p-5" aria-label={title}>
      <header className="flex items-center gap-2.5">
        <span className={`grid h-8 w-8 place-items-center rounded-btn ${tint}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h3 className="text-sm font-semibold text-ink-950">{title}</h3>
      </header>
      <div className={`mt-5 grid grid-cols-2 gap-x-5 gap-y-5 ${wide ? "sm:grid-cols-4" : ""}`}>{children}</div>
    </section>
  );
}

function Panel({ title, meta, action, children }: { title: string; meta?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="card overflow-hidden" aria-label={title}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--line)] px-5 py-3.5">
        <h3 className="text-sm font-semibold text-ink-950">{title}</h3>
        {meta && <span className="font-mono text-[11px] text-ink-500">{meta}</span>}
        {action && <span className="ml-auto">{action}</span>}
      </header>
      {children}
    </section>
  );
}

function AskButton({ onClick, label = "Ask" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[12px] font-semibold text-orange-ink transition hover:bg-orange-soft"
    >
      <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden /> {label}
    </button>
  );
}

/* ---------- night-shift chart: violations per 15 min (single series → one hue, no legend) ---------- */

function NightChart({ alerts }: { alerts: CabinAlert[] }) {
  const buckets = useMemo(() => {
    const b = Array.from({ length: 16 }, (_, i) => ({ h: 2 + Math.floor(i / 4), m: (i % 4) * 15, n: 0 }));
    for (const a of alerts) {
      if (a.is_compliant_activity) continue;
      const [h, m] = a.time_str.split(":").map(Number);
      const i = (h - 2) * 4 + Math.floor(m / 15);
      if (i >= 0 && i < 16) b[i].n++;
    }
    return b;
  }, [alerts]);
  const max = Math.max(1, ...buckets.map((b) => b.n));
  const peak = buckets.reduce((p, b) => (b.n > p.n ? b : p), buckets[0]);
  const [hover, setHover] = useState<number | null>(null);
  const t = (b: (typeof buckets)[number]) => `${String(b.h).padStart(2, "0")}:${String(b.m).padStart(2, "0")}`;

  return (
    <div className="px-5 pb-4 pt-5">
      <div className="relative">
        {/* recessive gridlines */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-px bg-ink-100" />
          ))}
        </div>
        <ul className="relative flex h-36 items-end gap-[2px]" aria-label={`Cabin violations per 15 minutes, 02:00 to 06:00. Peak ${peak.n} at ${t(peak)}.`}>
          {buckets.map((b, i) => (
            <li
              key={i}
              className="group relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              tabIndex={0}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              aria-label={`${t(b)}: ${b.n} violations`}
            >
              <span
                className={`block w-full rounded-t-[4px] transition-colors ${hover === i ? "bg-orange-ink" : b === peak ? "bg-orange" : "bg-orange/55"}`}
                style={{ height: `${Math.max(2, (b.n / max) * 100)}%` }}
              />
              {hover === i && (
                <span className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-btn bg-ink-950 px-2 py-1 font-mono text-[11px] text-white shadow-lift">
                  {t(b)} · {b.n} violations
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-500" aria-hidden>
        <span>02:00</span>
        <span>03:00</span>
        <span>04:00</span>
        <span>05:00</span>
        <span>06:00</span>
      </div>
    </div>
  );
}

/* ---------- lists ---------- */

const SEV_TONE: Record<string, string> = {
  CRITICAL: "border-danger/30 bg-danger-soft text-danger-ink",
  HIGH: "border-danger/30 bg-danger-soft text-danger-ink",
  WARNING: "border-amber/40 bg-amber-soft text-amber-ink",
  INFO: "border-[var(--line)] bg-paper text-ink-600",
};

// Row questions name only the row's own source (alert id, loco, channel, time). Train numbers,
// stations and rakes widen server-side routing to other sources and get refused for scoped roles.
function ReviewQueue({ alerts, mask, onAsk }: { alerts: CabinAlert[]; mask: (t: string) => string; onAsk: (q: string) => void }) {
  const rows = useMemo(
    () =>
      alerts
        .filter((a) => !a.is_compliant_activity && a.verification_status === "PENDING_VERIFICATION")
        .sort((a, b) => (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9) || a.time_str.localeCompare(b.time_str))
        .slice(0, 6),
    [alerts]
  );
  return (
    <ul className="divide-y divide-[var(--line)]">
      {rows.map((a) => (
        <li key={a.alert_id} className="flex items-center gap-3 px-5 py-3">
          <span className="w-[62px] shrink-0 font-mono text-[12px] text-ink-500">{a.time_str}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink-900">{pretty(a.violation_type)}</span>
            <span className="block truncate font-mono text-[11px] text-ink-500">
              {a.train_no} · {mask(a.loco_id)}
            </span>
          </span>
          <span className={`chip shrink-0 ${SEV_TONE[a.severity] ?? SEV_TONE.INFO}`}>{pretty(a.severity)}</span>
          <AskButton onClick={() => onAsk(`Explain cabin alert ${a.alert_id} (${pretty(a.violation_type)}) on loco ${mask(a.loco_id)} at ${a.time_str} and whether it needs action.`)} />
        </li>
      ))}
      {!rows.length && <li className="px-5 py-6 text-sm text-ink-500">Nothing pending review.</li>}
    </ul>
  );
}

function RadioList({ rows, mask, lang, onAsk }: { rows: RadioRow[]; mask: (t: string) => string; lang: "en" | "hi"; onAsk: (q: string) => void }) {
  const picked = useMemo(() => rows.filter((r) => r.fail_open_bypassed || isCallout(r)).slice(0, 5), [rows]);
  return (
    <ul className="divide-y divide-[var(--line)]">
      {picked.map((r) => (
        <li key={r.id} className="flex items-start gap-3 px-5 py-3">
          <span className="w-[62px] shrink-0 pt-0.5 font-mono text-[12px] text-ink-500">{r.time_str}</span>
          <span className="min-w-0 flex-1">
            <span className={`line-clamp-2 text-sm text-ink-900 ${lang === "hi" ? "hi" : ""}`}>“{mask(lang === "hi" ? r.transcript_hi : r.transcript_en)}”</span>
            <span className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[11px] text-ink-500">
                {r.channel} · {r.station}
              </span>
              {r.fail_open_bypassed && <span className="chip border-danger/30 bg-danger-soft text-danger-ink">Fail-open bypass</span>}
            </span>
          </span>
          <AskButton onClick={() => onAsk(`Summarise the radio exchange at ${r.time_str} on ${r.channel} and flag any callout protocol issue.`)} />
        </li>
      ))}
    </ul>
  );
}

/* ---------- dashboard ---------- */

export function Dashboard({ role, data, mask, lang, onAsk, timeline, rake, views, compact = false }: Props) {
  const [view, setView] = useState("overview");
  const has = (s: DataSource) => role.dataScopes.includes(s) && !data.denied.includes(s);
  const L = data.locate ?? [];
  const R = data.railcomm ?? [];
  const W = data.wdd ?? [];
  const violations = L.filter((a) => !a.is_compliant_activity);
  const pending = violations.filter((a) => a.verification_status === "PENDING_VERIFICATION").length;
  const transit = W.filter((w) => w.delta_transit_damage).length;
  const criticalWagons = W.filter((w) => w.exit_defects.some((d) => d.severity === "CRITICAL" || d.severity === "HIGH")).length;
  const avgClarity = R.length ? Math.round((R.reduce((s, r) => s + r.clarity_score, 0) / R.length) * 100) : 0;
  const SOURCES: Array<[DataSource, string]> = [["RAILCOMM", "Railcomm · radio"], ["LOCATE", "Locate · cabin video"], ["WDD", "WDD · wagons"]];
  const inScope = SOURCES.filter(([s]) => has(s));
  const locked = SOURCES.filter(([s]) => !has(s)).map(([, l]) => l);
  const tabs = [{ id: "overview", label: "Overview" }, ...views.map(({ id, label }) => ({ id, label }))];
  // "—" while loading or when a source failed to load: never render a misleading 0.
  const n = (v: number, src?: unknown[]) => (data.loading || !src ? "—" : v.toLocaleString("en-IN"));

  return (
    <div className="min-w-0">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
            {role.division} · Night shift · 18 Nov 2026
          </p>
          <h1 className="mt-1.5 font-display text-[28px] font-semibold leading-tight text-ink-950 sm:text-[32px]">Operations overview</h1>
        </div>
        <div className="flex items-center gap-3">
          {data.offline && (
            <span className="chip border-amber/40 bg-amber-soft text-amber-ink">
              <CloudOff className="h-3 w-3" aria-hidden /> Offline data
            </span>
          )}
          {tabs.length > 1 && (
            <div role="tablist" aria-label="Dashboard views" className="flex rounded-btn border border-[var(--line)] bg-white p-0.5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={view === t.id}
                  onClick={() => setView(t.id)}
                  className={`rounded-[5px] px-3 py-1.5 text-[13px] font-semibold transition ${view === t.id ? "bg-ink-950 text-white" : "text-ink-600 hover:text-ink-950"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {view !== "overview" ? (
        <div className="mt-6" role="tabpanel">
          {views.find((v) => v.id === view)?.node}
        </div>
      ) : (
        <div className="mt-6 space-y-5" role="tabpanel">
          {/* KPIs by source — product order: Railcomm, Locate, WDD */}
          <div className={`grid gap-4 ${compact ? "" : inScope.length === 3 ? "lg:grid-cols-3" : inScope.length === 2 ? "md:grid-cols-2" : "md:max-w-xl"}`}>
            {has("RAILCOMM") && <SourceCard icon={Radio} title="Railcomm · radio" tint="bg-cyan-soft text-cyan-ink" wide={compact}>
              <Kpi label="Exchanges" value={n(R.length, data.railcomm)} sub="VHF + intercom" />
              <Kpi label="Avg clarity" value={data.loading || !data.railcomm ? "—" : `${avgClarity}%`} sub="after denoise" tone="ok" />
              <Kpi label="Safety callouts" value={n(R.filter(isCallout).length, data.railcomm)} />
              <Kpi label="Fail-open bypass" value={n(R.filter((r) => r.fail_open_bypassed).length, data.railcomm)} tone={R.some((r) => r.fail_open_bypassed) ? "danger" : "ink"} />
            </SourceCard>}
            {has("LOCATE") && <SourceCard icon={Camera} title="Locate · cabin video" tint="bg-orange-soft text-orange-ink" wide={compact}>
              <Kpi label="Violations" value={n(violations.length, data.locate)} sub={`of ${n(L.length, data.locate)} alerts`} tone="danger" />
              <Kpi label="Pending review" value={n(pending, data.locate)} tone={pending ? "amber" : "ink"} />
              <Kpi label="Confirmed" value={n(violations.filter((a) => a.verification_status === "CONFIRMED").length, data.locate)} />
              <Kpi label="Auto-suppressed" value={n(L.length - violations.length, data.locate)} sub="routine duties" tone="ok" />
            </SourceCard>}
            {has("WDD") && <SourceCard icon={Train} title="WDD · wagons" tint="bg-amber-soft text-amber-ink" wide={compact}>
              <Kpi label="Wagons scanned" value={n(W.length, data.wdd)} sub="rake BOXN-542" />
              <Kpi label="Transit damage" value={n(transit, data.wdd)} tone={transit ? "danger" : "ink"} />
              <Kpi label="High / critical" value={n(criticalWagons, data.wdd)} tone={criticalWagons ? "danger" : "ink"} />
              <Kpi label="Clear" value={n(W.filter((w) => w.exit_damage_status === "CLEAR").length, data.wdd)} tone="ok" />
            </SourceCard>}
          </div>
          {locked.length > 0 && (
            <p className="-mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-500">
              <Lock className="h-3 w-3" aria-hidden /> Not in your scope:
              {locked.map((l) => (
                <span key={l} className="rounded-full border border-[var(--line)] bg-white px-2 py-0.5 text-ink-600">
                  {l}
                </span>
              ))}
            </p>
          )}

          {has("LOCATE") && (
            <div className={`grid gap-5 ${compact ? "" : "xl:grid-cols-[1.15fr_1fr]"}`}>
              <Panel
                title="Cabin violations · night shift"
                meta="per 15 min"
                action={<AskButton label="Ask why" onClick={() => onAsk("Show driver alertness and fatigue trends between 02:00 and 05:00 AM on Bikaner Division.")} />}
              >
                <NightChart alerts={L} />
              </Panel>
              <Panel title="Needs review" meta={`${n(pending, data.locate)} pending`}>
                <ReviewQueue alerts={L} mask={mask} onAsk={onAsk} />
              </Panel>
            </div>
          )}

          {has("RAILCOMM") && R.length > 0 && (
            <Panel
              title="Flagged radio exchanges"
              meta="safety callouts · fail-open"
              action={<AskButton label="Audit callouts" onClick={() => onAsk("Show all signal-related miscommunications, emergency callouts, and caution order exchanges on the Bikaner division during the shift on 18 Nov 2026.")} />}
            >
              <RadioList rows={R} mask={mask} lang={lang} onAsk={onAsk} />
            </Panel>
          )}

          {timeline && (
            <Panel
              title="Incident 12414 · Suratgarh"
              meta="near-SPAD · synced timeline"
              action={<AskButton label="Investigate" onClick={() => onAsk("Investigate safety events for Train 12414 near Suratgarh on 2026-11-18.")} />}
            >
              <div className="p-4 sm:p-5">{timeline}</div>
            </Panel>
          )}

          {rake && (
            <Panel
              title="Rake BOXN-542 · entry vs exit"
              meta={`${n(transit, data.wdd)} wagons with new damage`}
              action={<AskButton label="Audit rake" onClick={() => onAsk("Audit entry-versus-exit wagon damage for freight rake BOXN-542.")} />}
            >
              <div className="p-4 sm:p-5">{rake}</div>
            </Panel>
          )}

          {!has("LOCATE") && !has("RAILCOMM") && !has("WDD") && (
            <div className="card flex items-center gap-3 p-5 text-sm text-ink-600">
              <AlertTriangle className="h-4 w-4 text-amber-ink" aria-hidden /> No data sources are in your scope.
            </div>
          )}

          <p className="flex items-center gap-1.5 font-mono text-[11px] text-ink-500">
            <ShieldCheck className="h-3.5 w-3.5 text-ok-ink" aria-hidden /> Showing only your role&apos;s sources · identities pseudonymised unless an inquiry purpose is declared
          </p>
        </div>
      )}
    </div>
  );
}
