"use client";

import { Download, Lock, ScrollText, Volume2 } from "lucide-react";
import { HINDI_BRIEFING, INQUIRY_REPORT } from "@/lib/data";

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  canSign: boolean;
  mask: (t: string) => string;
  onDone: (m: string) => void;
}

export function ArtifactsPanel({ canSign, mask, onDone }: Props) {
  const report = mask(INQUIRY_REPORT);
  const briefing = mask(HINDI_BRIEFING);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <article className="card flex flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-card bg-blue-soft text-blue-ink">
              <ScrollText className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="mono-label text-ink-500">Rule 113 G&amp;SR</p>
              <h3 className="text-[15px] font-semibold text-ink-950">Statutory inquiry report</h3>
            </div>
          </div>
          {canSign ? (
            <button
              type="button"
              className="btn-ink"
              onClick={() => {
                download("INC-12414-20261118_inquiry.txt", report);
                onDone("Inquiry report downloaded");
              }}
            >
              <Download className="h-4 w-4" aria-hidden /> Download
            </button>
          ) : (
            <span className="chip border-[var(--line)] bg-paper text-ink-700">
              <Lock className="h-3 w-3" aria-hidden /> Sr. DSO / CRS only
            </span>
          )}
        </header>
        <pre className="max-h-[420px] flex-1 overflow-auto whitespace-pre-wrap bg-ink-950 p-5 font-mono text-[12.5px] leading-relaxed text-ink-100">{report}</pre>
      </article>

      <article className="card flex flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-card bg-orange-soft text-orange-ink">
              <Volume2 className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="mono-label text-ink-500">Crew lobby · Hindi</p>
              <h3 className="hi text-[15px] font-semibold text-ink-950">संरक्षा निर्देश</h3>
            </div>
          </div>
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              download("INC-12414-20261118_lobby_briefing_hi.txt", briefing);
              onDone("Lobby briefing downloaded");
            }}
          >
            <Download className="h-4 w-4" aria-hidden /> Download
          </button>
        </header>
        <div lang="hi" className="hi max-h-[420px] flex-1 overflow-auto whitespace-pre-wrap border-t border-amber/20 bg-[#fffaf0] p-5 text-[15px] leading-loose text-ink-900">
          {briefing}
        </div>
      </article>
    </div>
  );
}
