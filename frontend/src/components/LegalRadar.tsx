import React from "react";
import { Shield, Lock, Scale, FileCheck, AlertOctagon } from "lucide-react";

export default function LegalRadar() {
  const laws = [
    {
      title: "Digital Personal Data Protection Act, 2023 (DPDP Act)",
      section: "Section 7(i) & Section 8",
      scope: "Locomotive pilot in-cab video, facial telemetry, and voice logs.",
      solution: "Processed lawfully under 'Employment & Loss/Liability Prevention' without requiring revocable driver consent. Enforces 30-day FIFO auto-purge loop and AES-256 encryption at rest."
    },
    {
      title: "The Railways Act, 1989",
      section: "Sections 113–122 & Section 175",
      scope: "Statutory accident inquiries & criminal liability for rash/negligent driving.",
      solution: "Copilot drafts formal Commission of Railway Safety (CRS) inquiry reports. Enforces mandatory Human Reviewer Verification so unverified AI cannot trigger disciplinary actions."
    },
    {
      title: "Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)",
      section: "Section 63 (Replacing Sec 65B IEA)",
      scope: "Legal admissibility of digital video, radio transcripts, and sensor telemetry.",
      solution: "Generates statutory Part A (Custody Certificate) and Part B (Technical Hash Certificate) with SHA-256 digests ensuring zero digital tampering in court."
    },
    {
      title: "Railway Board In-Cab Mobile JPO",
      section: "Circular 2018/Safety(A&R)/19/19",
      scope: "Total ban on personal smartphones and social media reels while train is in motion.",
      solution: "Vision model explicitly distinguishes illegal MOBILE_PHONE use from compliant WALKIE_TALKIE and CAUTION ORDER reading, preventing wrongful crew penalties."
    },
    {
      title: "Hours of Employment Regulations (HOER Rules, 2005)",
      section: "Continuous Duty Limits (HOER 2005)",
      scope: "Loco running staff fatigue and continuous running duty ceilings (9-10h).",
      solution: "Fatigue anomaly engine identifies micro-sleep clusters (02:00–05:00 AM) and correlates them with CMS roster hours to expose management systemic duty over-scheduling."
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Statutory & Regulatory Legal Compliance Radar</h3>
        <p className="text-xs text-slate-400">Architectural safeguards fulfilling Central Acts, Railway Safety circulars, and constitutional privacy mandates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {laws.map((l, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-sm text-white tracking-tight">{l.title}</h4>
                <span className="text-[11px] font-mono font-semibold text-cyan-400">{l.section}</span>
              </div>
              <Shield className="h-5 w-5 text-emerald-400 mt-0.5" />
            </div>
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Operational Scope: </span>
              {l.scope}
            </div>
            <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
              <span className="font-semibold text-cyan-400">Technical Safeguard: </span>
              {l.solution}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
