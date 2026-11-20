"use client";

import { ArrowRight, Eye, EyeOff, FileSignature, ShieldCheck } from "lucide-react";
import { TAB_META } from "@/components/workspace/Tabs";
import { ROLES } from "@/lib/data";
import type { UserRole } from "@/lib/types";

/**
 * Access screen for the authorised workspace. Each role card shows exactly what that official
 * can open and whether personal data is masked for them (DPDP data minimisation).
 * Demo stand-in: in production the role comes from the railway identity provider, not a picker.
 */
export function RoleGate({ onEnter }: { onEnter: (r: UserRole) => void }) {
  return (
    <main id="copilot" className="relative isolate min-h-[calc(100vh-var(--nav-h))]">
      <div className="bg-grid-light mask-fade-b absolute inset-x-0 top-0 -z-10 h-[420px]" aria-hidden />
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:py-20">
        <p className="eyebrow eyebrow-light">RailKavach Copilot · Authorised access</p>
        <h1 className="h-display h-display-light mt-4 text-[36px] text-ink-950 sm:text-[52px]">
          Your role. <em>Your evidence.</em>
        </h1>
        <p className="mt-4 flex items-center gap-2 font-mono text-[12px] text-ink-500">
          <ShieldCheck className="h-4 w-4 text-ok" aria-hidden />
          Demo sign-in · production uses the railway identity provider
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(ROLES).map((r, i) => (
            <li key={r.code} className="reveal" data-on="true" style={{ "--d": `${i * 0.06}s` } as React.CSSProperties}>
              <button
                type="button"
                onClick={() => onEnter(r.code)}
                className="card card-hover group flex h-full w-full flex-col p-5 text-left focus-visible:outline-offset-4"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-btn bg-orange-soft text-orange-ink">
                    <r.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink-950">{r.designation}</span>
                    <span className="block font-mono text-[11px] text-ink-500">{r.division}</span>
                  </span>
                </span>

                <span className="mt-4 flex flex-wrap gap-1.5" aria-label="Can open">
                  {r.allowedTabs.map((t) => {
                    const M = TAB_META[t];
                    return (
                      <span key={t} className="chip border-[var(--line)] bg-paper font-medium text-ink-700">
                        <M.icon className="h-3 w-3" aria-hidden /> {M.label}
                      </span>
                    );
                  })}
                </span>

                <span className="mt-auto flex items-center justify-between gap-2 pt-5">
                  <span className="flex flex-wrap gap-1.5">
                    <span className={`chip ${r.forceMasking ? "border-amber/40 bg-amber/10 text-[#92400e]" : "border-ok/30 bg-ok/10 text-[#047857]"}`}>
                      {r.forceMasking ? <EyeOff className="h-3 w-3" aria-hidden /> : <Eye className="h-3 w-3" aria-hidden />}
                      {r.forceMasking ? "PII masked" : "PII on need"}
                    </span>
                    {r.canSignCRS && (
                      <span className="chip border-blue/30 bg-blue/10 text-blue">
                        <FileSignature className="h-3 w-3" aria-hidden /> Signs CRS
                      </span>
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-orange-ink transition group-hover:translate-x-1" aria-hidden />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
