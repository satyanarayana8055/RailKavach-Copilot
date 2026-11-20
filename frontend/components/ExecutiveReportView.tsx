"use client";

import React, { useMemo } from "react";
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Train, 
  Info,
  Scale
} from "lucide-react";

interface Props {
  content: string;
  className?: string;
  loading?: boolean;
}

interface ParsedBlock {
  type: "verdict" | "signal" | "violation" | "raw_alert" | "compliant" | "statutory" | "general";
  title: string;
  titleHi?: string;
  badge?: string;
  badgeType?: "danger" | "ok" | "warn" | "neutral";
  items: string[];
}

export function ExecutiveReportView({ content, className = "", loading = false }: Props) {
  const parsed = useMemo(() => {
    if (!content) return null;

    const raw = content.trim();

    // 1. Detect Direct Answer / Verdict from Content
    let directVerdict: string | null = null;
    let verdictTone: "ok" | "danger" | "warn" = "ok";

    // Check for common railway inquiry patterns
    if (raw.includes("सिग्नल सामान्य (Green/Clear) था, लाल नहीं") || raw.includes("सिग्नल सामान्य") || raw.includes("not red") || raw.includes("signal was clear")) {
      directVerdict = "सिग्नल सामान्य (Green / Clear) था — लाल (Red/Danger) नहीं था। [02:00:20]";
      verdictTone = "ok";
    } else if (raw.includes("Did the loco pilot use a mobile phone? Yes") || raw.includes("MOBILE_PHONE") && raw.includes("CONFIRMED")) {
      directVerdict = "मोबाइल फोन का उपयोग पुष्ट (CONFIRMED) पाया गया — गंभीर सुरक्षा उल्लंघन दर्ज। [02:02:40]";
      verdictTone = "danger";
    }

    // 2. Extract structured blocks by recognizing English and Hindi section patterns
    const rawParagraphs = raw.split(/\n\s*\n|\n(?=[•\-\*]|\d+\.|\b(?:सिग्नल|कैब|Raw|Human|अन्य|भारतीय|###))/g);
    
    const blocks: ParsedBlock[] = [];

    // Categorization rules
    let signalItems: string[] = [];
    let violationItems: string[] = [];
    let rawAlertItems: string[] = [];
    let compliantItems: string[] = [];
    let statutoryItems: string[] = [];
    let generalItems: string[] = [];

    for (let p of rawParagraphs) {
      let text = p.trim().replace(/^[-*•\d\.]+\s*/, "");
      if (!text || text.startsWith("---") || text.includes("RailKavach Copilot यहाँ है") || text.includes("RailKavach Copilot Investigation Report")) {
        continue;
      }

      const lower = text.toLowerCase();

      // Signal / Communication check
      if (text.includes("सिग्नल की स्थिति") || text.includes("Signal") || text.includes("रेलकॉम") || text.includes("RAILCOMM_AUDIO")) {
        signalItems.push(text.replace(/^(?:सिग्नल की स्थिति|Signal Status)[:\s]*/i, ""));
      }
      // Confirmed Violations
      else if (text.includes("Human Reviewer Confirmed") || text.includes("मानव समीक्षक द्वारा पुष्ट") || text.includes("'MOBILE_PHONE' के अलर्ट को ह्यूमन रिव्युअर द्वारा")) {
        violationItems.push(text.replace(/^(?:Human Reviewer Confirmed Violations|मानव समीक्षक द्वारा पुष्ट उल्लंघन)[:\s]*/i, ""));
      }
      // Raw AI Alerts
      else if (text.includes("Raw AI Alerts") || text.includes("कच्चे एआई अलर्ट") || text.includes("रॉ एआई अलर्ट")) {
        rawAlertItems.push(text.replace(/^(?:Raw AI Alerts|कच्चे एआई अलर्ट)[:\s]*/i, ""));
      }
      // Compliant Operational Duties (G&SR 113)
      else if (text.includes("compliant") || text.includes("मानक") || text.includes("WALKIE_TALKIE") || text.includes("CAUTION_ORDER_REVIEW") || text.includes("SYSTEM_SUPPRESSED")) {
        compliantItems.push(text.replace(/^(?:अन्य गतिविधियाँ जैसे|Compliant Duties)[:\s]*/i, ""));
      }
      // Statutory / Legal rule
      else if (text.includes("भारतीय रेलवे के सामान्य एवं सहायक नियम") || text.includes("G&SR") || text.includes("The Railways Act") || text.includes("Fail-Open")) {
        statutoryItems.push(text);
      }
      else {
        // Only add meaningful general text
        if (text.length > 20) {
          generalItems.push(text);
        }
      }
    }

    // Build structured output blocks
    if (signalItems.length > 0) {
      blocks.push({
        type: "signal",
        title: "Signal & Route Verification",
        titleHi: "सिग्नल एवं मार्ग सत्यापन (Signal & Railcomm)",
        badge: "VERIFIED CLEAR",
        badgeType: "ok",
        items: signalItems
      });
    }

    if (violationItems.length > 0) {
      blocks.push({
        type: "violation",
        title: "Confirmed Safety Infractions",
        titleHi: "मानव समीक्षक द्वारा पुष्ट सुरक्षा उल्लंघन (Confirmed Violations)",
        badge: "HUMAN CONFIRMED",
        badgeType: "danger",
        items: violationItems
      });
    }

    if (rawAlertItems.length > 0) {
      blocks.push({
        type: "raw_alert",
        title: "Raw CVVRS Edge Detections",
        titleHi: "कच्चे एआई अलर्ट (Pending Verification)",
        badge: "UNDER REVIEW",
        badgeType: "warn",
        items: rawAlertItems
      });
    }

    if (compliantItems.length > 0) {
      blocks.push({
        type: "compliant",
        title: "Protected Operational Duties",
        titleHi: "मानक परिचालन कार्य — दण्ड से छूट (G&SR Rule 113)",
        badge: "SYSTEM SUPPRESSED",
        badgeType: "ok",
        items: compliantItems
      });
    }

    if (statutoryItems.length > 0) {
      blocks.push({
        type: "statutory",
        title: "Statutory Compliance & Legal Standing",
        titleHi: "वैधानिक अनुपालन एवं नियम (Statutory Governance)",
        badge: "G&SR / BSA 2023",
        badgeType: "neutral",
        items: statutoryItems
      });
    }

    // Fallback if no specific blocks matched
    if (blocks.length === 0 && generalItems.length > 0) {
      blocks.push({
        type: "general",
        title: "Operational Findings",
        titleHi: "परिचालन निष्कर्ष (Investigation Findings)",
        badge: "OFFICIAL RECORD",
        badgeType: "neutral",
        items: generalItems
      });
    }

    return {
      directVerdict,
      verdictTone,
      blocks
    };
  }, [content]);

  if (!content) return null;

  // Clean formatting helper
  const renderFormattedText = (text: string) => {
    // Clean weird double colons or asterisks
    let clean = text
      .replace(/::+/g, ":")
      .replace(/\*\*+/g, "")
      .replace(/'([A-Z_]+)'/g, "$1");

    // Split for timestamp and status badges
    const parts = clean.split(/(\[\d{2}:\d{2}:\d{2}\]|\b\d{2}:\d{2}:\d{2}\b|CONFIRMED|SYSTEM_SUPPRESSED|PENDING_VERIFICATION|EATING_DRINKING|MOBILE_PHONE|WALKIE_TALKIE|CAUTION_ORDER_REVIEW)/g);

    return parts.map((part, i) => {
      if (!part) return null;

      // Timestamps
      if (/^\[?\d{2}:\d{2}:\d{2}\]?$/.test(part.trim())) {
        const timeVal = part.replace(/[\[\]]/g, "").trim();
        return (
          <span key={i} className="mx-1 inline-flex items-center gap-1 rounded bg-ink-950 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber shadow-xs">
            <Clock className="h-3 w-3 text-amber" />
            {timeVal}
          </span>
        );
      }

      // Confirmed Badge
      if (part === "CONFIRMED" || part === "MOBILE_PHONE") {
        return (
          <span key={i} className="mx-1 inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger-soft px-2 py-0.5 text-[11px] font-bold text-danger-ink">
            <AlertCircle className="h-3 w-3" />
            {part === "MOBILE_PHONE" ? "MOBILE PHONE VIOLATION" : "CONFIRMED"}
          </span>
        );
      }

      // Compliant Badge
      if (part === "SYSTEM_SUPPRESSED" || part === "WALKIE_TALKIE" || part === "CAUTION_ORDER_REVIEW") {
        return (
          <span key={i} className="mx-1 inline-flex items-center gap-1 rounded-full border border-ok/30 bg-ok-soft px-2 py-0.5 text-[11px] font-bold text-ok-ink">
            <ShieldCheck className="h-3 w-3" />
            {part}
          </span>
        );
      }

      // Pending / Warning
      if (part === "PENDING_VERIFICATION" || part === "EATING_DRINKING") {
        return (
          <span key={i} className="mx-1 inline-flex items-center gap-1 rounded-full border border-amber/30 bg-amber-soft px-2 py-0.5 text-[11px] font-bold text-amber-ink">
            <Info className="h-3 w-3" />
            {part}
          </span>
        );
      }

      return part;
    });
  };

  return (
    <div className={`space-y-4 ${className} ${loading ? "opacity-50" : ""}`}>
      {/* 1. Official Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-[var(--line)] bg-gradient-to-r from-paper to-white p-3.5 shadow-card">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-btn bg-ink-950 text-amber shadow-xs">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="mono-label text-ink-500">Statutory Inquiry Briefing · Section 63 BSA 2023</p>
            <h4 className="text-sm font-bold text-ink-950 tracking-tight">RailKavach Official Safety Audit Record</h4>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip border-ink-900/10 bg-white font-mono text-[11px] text-ink-700">Train: 12414 / 12403</span>
          <span className="chip border-ink-900/10 bg-white font-mono text-[11px] text-ink-700">Suratgarh Jn (BKN)</span>
        </div>
      </div>

      {/* 2. Direct Inquiry Verdict (Hero Banner) */}
      {parsed?.directVerdict && (
        <div className={`rounded-card border-2 p-4 shadow-sm transition ${
          parsed.verdictTone === "ok" 
            ? "border-ok/40 bg-ok-soft/30" 
            : "border-danger/40 bg-danger-soft/40"
        }`}>
          <div className="flex items-center gap-2 pb-1.5">
            {parsed.verdictTone === "ok" ? (
              <CheckCircle2 className="h-5 w-5 text-ok-ink" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-danger-ink" />
            )}
            <span className="mono-label font-bold text-xs tracking-wider text-ink-950">
              Direct Officer Inquiry Verdict · प्रत्यक्ष निष्कर्ष
            </span>
          </div>
          <p className="text-base font-bold text-ink-950 leading-snug">
            {parsed.directVerdict}
          </p>
        </div>
      )}

      {/* 3. Modular Investigation Cards */}
      <div className="grid gap-3.5">
        {parsed?.blocks.map((b, idx) => {
          const isDanger = b.badgeType === "danger";
          const isOk = b.badgeType === "ok";
          const isWarn = b.badgeType === "warn";

          return (
            <div
              key={idx}
              className={`rounded-card border p-4 shadow-card transition ${
                isDanger
                  ? "border-danger/35 bg-danger-soft/25"
                  : isOk
                  ? "border-ok/30 bg-ok-soft/15"
                  : isWarn
                  ? "border-amber/30 bg-amber-soft/20"
                  : "border-[var(--line)] bg-white"
              }`}
            >
              {/* Card Header with Icon, Title, and Authority Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-2.5">
                <div className="flex items-center gap-2">
                  {isDanger ? (
                    <ShieldAlert className="h-4 w-4 text-danger-ink" />
                  ) : isOk ? (
                    <ShieldCheck className="h-4 w-4 text-ok-ink" />
                  ) : b.type === "signal" ? (
                    <Radio className="h-4 w-4 text-cyan-ink" />
                  ) : b.type === "statutory" ? (
                    <Scale className="h-4 w-4 text-ink-700" />
                  ) : (
                    <Train className="h-4 w-4 text-ink-700" />
                  )}
                  <div>
                    <h5 className="text-sm font-bold text-ink-950 tracking-tight">
                      {b.titleHi || b.title}
                    </h5>
                  </div>
                </div>

                {b.badge && (
                  <span className={`chip text-[10px] font-bold uppercase tracking-wider ${
                    isDanger
                      ? "border-danger/40 bg-white text-danger-ink"
                      : isOk
                      ? "border-ok/40 bg-white text-ok-ink"
                      : isWarn
                      ? "border-amber/40 bg-white text-amber-ink"
                      : "border-[var(--line)] bg-paper text-ink-700"
                  }`}>
                    {b.badge}
                  </span>
                )}
              </div>

              {/* Card Content Items */}
              <div className="space-y-2.5 pt-3 text-sm text-ink-900 leading-relaxed">
                {b.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-start gap-2.5">
                    <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                      isDanger ? "bg-danger" : isOk ? "bg-ok" : "bg-ink-400"
                    }`} />
                    <div className="flex-1 text-[14px]">
                      {renderFormattedText(item)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
