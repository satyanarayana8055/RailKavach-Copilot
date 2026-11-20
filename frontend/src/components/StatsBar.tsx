import React from "react";
import { Mic, FileText, Users, Train } from "lucide-react";

export default function StatsBar() {
  const stats = [
    { label: "VHF Radio Records", value: "11,354", sub: "Fail-Open Verified", icon: Mic, color: "text-sky-400" },
    { label: "Transcript Lines", value: "3.68M", sub: "Hindi & English", icon: FileText, color: "text-cyan-400" },
    { label: "Loco Pilots Monitored", value: "1,583", sub: "Vigilance & Rest", icon: Users, color: "text-amber-400" },
    { label: "Train Runs Audited", value: "4,210", sub: "Zero-Hardware Footprint", icon: Train, color: "text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center space-x-4 shadow-sm hover:border-slate-700 transition">
            <div className={`p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 ${s.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white tracking-tight">{s.value}</div>
              <div className="text-xs font-semibold text-slate-300">{s.label}</div>
              <div className="text-[10px] text-slate-500">{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
