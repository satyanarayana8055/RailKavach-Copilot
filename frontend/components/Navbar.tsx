"use client";

import { ArrowRight, Check, ChevronDown, Languages, Lock, Unlock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ROLES } from "@/lib/data";
import { ScrollProgress } from "./ScrollProgress";
import type { UserRole } from "@/lib/types";

interface WorkspaceControls {
  role: UserRole;
  onRole: (r: UserRole) => void;
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
    <header className="sticky top-0 z-50 h-[var(--nav-h)] border-b border-white/30 bg-orange shadow-nav">
      <span className="nav-glow" aria-hidden />
      <ScrollProgress />
      <div className="relative mx-auto flex h-full max-w-[1300px] items-center gap-2 px-4 sm:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <a href="https://aispry.ai" target="_blank" rel="noopener noreferrer" aria-label="AiSPRY — opens aispry.ai in a new tab">
            {/* aispry.ai renders this logo at 120 × 64 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand/aispry-logo.png" alt="AiSPRY" className="h-12 w-auto sm:h-16" width={120} height={64} />
          </a>
          <span className="hidden h-7 w-px bg-white/40 sm:block" aria-hidden />
          <a href="/" className="hidden text-[15px] font-semibold tracking-[0.02em] text-white transition hover:text-white/80 sm:inline">
            RailKavach
          </a>
        </div>

        <nav aria-label="Sections" className="ml-6 hidden items-center gap-1 lg:flex">
          {LINKS.map(([href, label, page]) => (
            <a
              key={href}
              href={href}
              aria-current={page === current ? "page" : undefined}
              className={`nav-link ${page === current ? "bg-white/20" : ""}`}
            >
              {label}
            </a>
          ))}
        </nav>

        {controls ? <Controls {...controls} /> : (
          <a href="/#demo" className="nav-pill ml-auto">
            Request a demo <ArrowRight className="h-4 w-4 text-orange-ink" aria-hidden />
          </a>
        )}
      </div>
    </header>
  );
}

function Controls({ role, onRole }: WorkspaceControls) {
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
          <div ref={wrap} className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={open}
              className="nav-pill"
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
