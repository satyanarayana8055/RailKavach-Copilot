"use client";

import { Clock, FileText, MessagesSquare, ScanLine, Train } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";
import type { TabId } from "@/lib/types";

export const TAB_META: Record<TabId, { label: string; icon: typeof Clock }> = {
  copilot: { label: "Copilot", icon: MessagesSquare },
  files: { label: "File inspector", icon: ScanLine },
  timeline: { label: "Timeline", icon: Clock },
  wdd: { label: "WDD rake", icon: Train },
  artifacts: { label: "Reports", icon: FileText },
};

const ORDER: TabId[] = ["copilot", "files", "timeline", "wdd", "artifacts"];

export function Tabs({ allowed, active, onChange }: { allowed: TabId[]; active: TabId; onChange: (t: TabId) => void }) {
  const tabs = ORDER.filter((t) => allowed.includes(t));
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: KeyboardEvent) => {
    const i = tabs.indexOf(active);
    const next = e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length] : e.key === "ArrowLeft" ? tabs[(i - 1 + tabs.length) % tabs.length] : null;
    if (next) {
      e.preventDefault();
      onChange(next);
      refs.current[next]?.focus();
    }
  };

  return (
    <div role="tablist" aria-label="Workspace" onKeyDown={onKey} className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-[var(--line)] px-4 sm:mx-0 sm:px-0">
      {tabs.map((t) => {
        const { label, icon: Icon } = TAB_META[t];
        const on = t === active;
        return (
          <button
            key={t}
            ref={(el) => {
              refs.current[t] = el;
            }}
            role="tab"
            id={`tab-${t}`}
            aria-selected={on}
            aria-controls={`panel-${t}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t)}
            className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
              on ? "text-ink-950" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            <Icon className={`h-4 w-4 ${on ? "text-orange-ink" : ""}`} aria-hidden />
            {label}
            <span className={`absolute inset-x-3 -bottom-px h-[2px] rounded-full transition ${on ? "bg-orange" : "bg-transparent"}`} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
