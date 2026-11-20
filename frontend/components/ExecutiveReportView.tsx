"use client";

import React, { useMemo } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, FileText, Info, ShieldCheck, Train } from "lucide-react";

interface Props {
  content: string;
  className?: string;
  loading?: boolean;
}

interface MetaItem {
  label: string;
  value: string;
}

interface ReportSection {
  title: string;
  type: "findings" | "violations" | "compliant" | "conclusion" | "general";
  items: string[];
}

export function ExecutiveReportView({ content, className = "", loading = false }: Props) {
  const parsed = useMemo(() => {
    if (!content) return null;

    // Clean up content
    let raw = content.trim();

    // 1. Extract Header & Metadata (Train, Date, Location)
    const meta: MetaItem[] = [];
    const trainMatch = raw.match(/\bTrain:?\s*([A-Za-z0-9\-]+)/i);
    if (trainMatch) meta.push({ label: "Train", value: trainMatch[1] });

    const locMatch = raw.match(/\bLocation:?\s*([^#\*\n]+)/i);
    if (locMatch) meta.push({ label: "Location", value: locMatch[1].trim() });

    const dateMatch = raw.match(/\bDate:?\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
    if (dateMatch) meta.push({ label: "Date", value: dateMatch[1] });

    // 2. Identify sections
    // Split on headers (###, ##, or numbered bold headers like 1. **Header**)
    const sections: ReportSection[] = [];
    let conclusionText: string | null = null;

    // Check for Conclusion & Summary
    const conclusionRegex = /(?:###\s*)?(?:\*\*Conclusion\s*(?:&|and)\s*Summary\*\*|###\s*Conclusion)[^\n]*\n([\s\S]+)$/i;
    const concMatch = raw.match(conclusionRegex);
    if (concMatch) {
      conclusionText = concMatch[1].trim();
      raw = raw.replace(conclusionRegex, "").trim();
    }

    // Split remaining content by lines or section blocks
    const lines = raw.split("\n");
    let currentSection: ReportSection = {
      title: "Operational Overview",
      type: "general",
      items: []
    };

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith("---") || line.startsWith("***")) continue;

      // Skip document title headers already represented in the banner
      if (line.includes("RailKavach Copilot Investigation Report") || line.includes("AiSPRY Technologies")) {
        continue;
      }

      // Check if line is a section header (e.g. ### Investigation Findings or 1. **Communication**)
      const sectionHeaderMatch = line.match(/^(?:###\s*|\d+\.\s*)?\*\*([^*:]+)\*\*:?(.*)$/);
      const isExplicitHeader = line.startsWith("###") || (sectionHeaderMatch && sectionHeaderMatch[1].length < 50 && !line.includes("["));

      if (isExplicitHeader && sectionHeaderMatch) {
        if (currentSection.items.length > 0) {
          sections.push(currentSection);
        }
        const titleText = sectionHeaderMatch[1].trim();
        const remainder = sectionHeaderMatch[2]?.trim();

        let sType: ReportSection["type"] = "general";
        const tLower = titleText.toLowerCase();
        if (tLower.includes("violation") || tLower.includes("spad") || tLower.includes("phone")) {
          sType = "violations";
        } else if (tLower.includes("compliant") || tLower.includes("suppression")) {
          sType = "compliant";
        } else if (tLower.includes("finding") || tLower.includes("communication")) {
          sType = "findings";
        }

        currentSection = {
          title: titleText,
          type: sType,
          items: remainder ? [remainder] : []
        };
      } else {
        // Clean line of leading bullet symbols
        const cleanLine = line.replace(/^[-*•]\s+/, "");
        if (cleanLine) {
          currentSection.items.push(cleanLine);
        }
      }
    }

    if (currentSection.items.length > 0) {
      sections.push(currentSection);
    }

    return {
      meta,
      sections,
      conclusion: conclusionText
    };
  }, [content]);

  if (!content) return null;

  // Helper to format inline tags, timestamps, and bolding without raw asterisks
  const renderFormattedText = (text: string) => {
    // Strip redundant markdown asterisks around headers
    let clean = text.replace(/^\*\*([^*]+)\*\*:?/, "$1:");

    // Highlight timestamps like [02:02:40] or [03:14:15]
    const timestampRegex = /\[(\d{2}:\d{2}:\d{2})\]/g;

    // Highlight statuses like CONFIRMED, SYSTEM_SUPPRESSED, PENDING_VERIFICATION
    const parts = clean.split(/(\[\d{2}:\d{2}:\d{2}\]|'CONFIRMED'|\*\*CONFIRMED\*\*|'SYSTEM_SUPPRESSED'|\*\*SYSTEM_SUPPRESSED\*\*|'PENDING_VERIFICATION'|\*\*PENDING_VERIFICATION\*\*|\*\*[^*]+\*\*)/g);

    return parts.map((part, i) => {
      if (!part) return null;

      // Timestamps
      if (/^\[\d{2}:\d{2}:\d{2}\]$/.test(part)) {
        return (
          <span key={i} className="mx-1 inline-flex items-center gap-1 rounded bg-ink-950 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber shadow-xs">
            <Clock className="h-2.5 w-2.5" />
            {part.slice(1, -1)}
          </span>
        );
      }

      // Confirmed status
      if (part.includes("CONFIRMED")) {
        return (
          <span key={i} className="mx-1 inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger-soft px-2 py-0.5 text-[11px] font-bold text-danger-ink">
            <AlertCircle className="h-3 w-3" />
            HUMAN REVIEWER CONFIRMED
          </span>
        );
      }

      // System Suppressed status
      if (part.includes("SYSTEM_SUPPRESSED")) {
        return (
          <span key={i} className="mx-1 inline-flex items-center gap-1 rounded-full border border-ok/30 bg-ok-soft px-2 py-0.5 text-[11px] font-bold text-ok-ink">
            <ShieldCheck className="h-3 w-3" />
            G&SR 113 PROTECTED (SUPPRESSED)
          </span>
        );
      }

      // Pending Verification
      if (part.includes("PENDING_VERIFICATION")) {
        return (
          <span key={i} className="mx-1 inline-flex items-center gap-1 rounded-full border border-amber/30 bg-amber-soft px-2 py-0.5 text-[11px] font-bold text-amber-ink">
            <Info className="h-3 w-3" />
            PENDING VERIFICATION
          </span>
        );
      }

      // Bold text
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-ink-950">
            {part.slice(2, -2)}
          </strong>
        );
      }

      return part;
    });
  };

  return (
    <div className={`space-y-4 ${className} ${loading ? "opacity-50" : ""}`}>
      {/* Official Executive Header Banner */}
      <div className="rounded-card border border-[var(--line)] bg-gradient-to-r from-paper to-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-btn bg-ink-950 text-amber">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="mono-label text-ink-500">Statutory Operational Inquiry Briefing</p>
              <h4 className="text-base font-bold text-ink-950">RailKavach Safety & Evidence Ledger</h4>
            </div>
          </div>
          {parsed?.meta && parsed.meta.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {parsed.meta.map((m, idx) => (
                <div key={idx} className="flex items-center gap-1.5 rounded-btn border border-[var(--line)] bg-white px-2.5 py-1 text-xs">
                  <span className="font-mono text-ink-500">{m.label}:</span>
                  <span className="font-semibold text-ink-900">{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Structured Investigation Findings Cards */}
      <div className="grid gap-3">
        {parsed?.sections.map((sec, idx) => {
          const isViolation = sec.type === "violations";
          const isCompliant = sec.type === "compliant";

          return (
            <div
              key={idx}
              className={`rounded-card border p-4 transition ${
                isViolation
                  ? "border-danger/30 bg-danger-soft/30"
                  : isCompliant
                  ? "border-ok/30 bg-ok-soft/20"
                  : "border-[var(--line)] bg-white"
              }`}
            >
              <div className="flex items-center gap-2 pb-2">
                {isViolation ? (
                  <AlertTriangle className="h-4 w-4 text-danger-ink" />
                ) : isCompliant ? (
                  <ShieldCheck className="h-4 w-4 text-ok-ink" />
                ) : (
                  <Train className="h-4 w-4 text-ink-600" />
                )}
                <h5 className="font-semibold text-sm text-ink-950 uppercase tracking-wide">
                  {sec.title}
                </h5>
              </div>

              <div className="space-y-2 pt-1 text-sm text-ink-800 leading-relaxed">
                {sec.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
                    <p className="flex-1">{renderFormattedText(item)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Executive Conclusion & Ruling Box */}
      {parsed?.conclusion && (
        <div className="rounded-card border-2 border-amber/40 bg-amber-soft/30 p-4 shadow-sm">
          <div className="flex items-center gap-2 pb-1.5">
            <CheckCircle2 className="h-4 w-4 text-amber-ink" />
            <h5 className="text-sm font-bold text-ink-950 uppercase tracking-wide">
              Executive Conclusion & Safety Ruling
            </h5>
          </div>
          <div className="text-sm font-medium text-ink-900 leading-relaxed">
            {renderFormattedText(parsed.conclusion)}
          </div>
        </div>
      )}
    </div>
  );
}
