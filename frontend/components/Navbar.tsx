"use client";

import { ArrowRight, Check, ChevronDown, Languages, Lock, Unlock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ROLES } from "@/lib/data";
import { ScrollProgress } from "./ScrollProgress";
import type { UserRole } from "@/lib/types";

interface WorkspaceControls {
  role: UserRole;
  onRole: (r: UserRole) => void;
  masked: boolean;
  maskForced: boolean;
  onToggleMask: () => void;
  lang: "en" | "hi";
  onToggleLang: () => void;
}

/** Omit `controls` on pages without the workspace: shows a "Request a demo" CTA instead. */
interface NavbarProps {
  controls?: WorkspaceControls;
  current?: "home" | "architecture" | "copilot";
}

const LINKS: Array<[string, string, NavbarProps["current"] | null]> = [
  ["/#suite", "Platforms", null],
  ["/architecture/", "Architecture", "architecture"],
  ["/copilot/", "Copilot", "copilot"],
];

/** AiSPRY header: brand gradient bar; all text sits on white/ink pills for AA contrast. */
export function Navbar({ controls, current = "home" }: NavbarProps) {

  return (
    <header className="sticky top-0 z-50 h-[var(--nav-h)] border-b border-white/25 bg-brand-x shadow-nav">
      <ScrollProgress />
      <div className="mx-auto flex h-full max-w-[1280px] items-center gap-3 px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-3">
          <a href="https://aispry.ai" target="_blank" rel="noopener noreferrer" aria-label="AiSPRY — opens aispry.ai in a new tab">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand/aispry-logo.png" alt="AiSPRY" className="h-8 w-auto" width={60} height={32} />
          </a>
          <a
            href="/"
            className="hidden rounded-full bg-ink-950/80 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-ink-950 sm:inline"
          >
            RailKavach
          </a>
        </div>

        <nav aria-label="Sections" className="ml-4 hidden items-center gap-1 rounded-full bg-ink-950/45 p-1 lg:flex">
          {LINKS.map(([href, label, page]) => (
            <a
              key={href}
              href={href}
              aria-current={page === current ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${page === current ? "bg-white text-ink-950" : "text-white hover:bg-white/15"}`}
            >
              {label}
            </a>
          ))}
        </nav>

        {controls ? <Controls {...controls} /> : (
          <a href="/#demo" className="btn-pill-white ml-auto">
            Request a demo <ArrowRight className="h-4 w-4 text-orange-ink" aria-hidden />
          </a>
        )}
      </div>
    </header>
  );
}

function Controls({ role, onRole, masked, maskForced, onToggleMask, lang, onToggleLang }: WorkspaceControls) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const roleMeta = ROLES[role];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button type="button" onClick={onToggleLang} className="btn-pill-white" aria-label={lang === "en" ? "Switch to Hindi" : "Switch to English"}>
            <Languages className="h-4 w-4 text-blue" aria-hidden />
            <span className={lang === "en" ? "hi" : ""}>
              {lang === "en" ? (<><span className="sm:hidden">हि</span><span className="hidden sm:inline">हिन्दी</span></>) : "EN"}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleMask}
            aria-pressed={masked}
            disabled={maskForced}
            title={maskForced ? "Masking enforced for this role (DPDP Act 2023)" : "Toggle DPDP PII masking"}
            className={`btn-pill-white disabled:cursor-not-allowed ${masked ? "!bg-violet-soft !text-violet-ink" : ""}`}
          >
            {masked ? <Lock className="h-4 w-4" aria-hidden /> : <Unlock className="h-4 w-4 text-ink-500" aria-hidden />}
            <span className="hidden sm:inline">DPDP</span>
          </button>

          <div ref={wrap} className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={open}
              className="btn-pill-white"
            >
              <roleMeta.icon className="h-4 w-4 text-orange-ink" aria-hidden />
              <span className="sm:hidden">{roleMeta.short}</span>
              <span className="hidden sm:inline">{roleMeta.title}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-ink-500 transition ${open ? "rotate-180" : ""}`} aria-hidden />
            </button>

            {open && (
              <ul
                role="listbox"
                aria-label="Switch role"
                className="absolute right-0 mt-2 w-72 animate-fade-up overflow-hidden rounded-card border border-[var(--line)] bg-white p-1.5 shadow-lift"
              >
                <li className="mono-label px-3 pb-1.5 pt-2 text-ink-500">Role · RBAC</li>
                {Object.values(ROLES).map((r) => {
                  const active = r.code === role;
                  return (
                    <li key={r.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          onRole(r.code);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left transition ${active ? "bg-orange-soft" : "hover:bg-paper"}`}
                      >
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-btn ${active ? "bg-orange text-white" : "bg-paper-2 text-ink-700"}`}>
                          <r.icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink-950">{r.title}</span>
                          <span className="block text-xs text-ink-500">{r.division}</span>
                        </span>
                        {active && <Check className="h-4 w-4 text-orange-ink" aria-hidden />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
  );
}
