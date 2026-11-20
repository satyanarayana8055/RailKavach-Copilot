"use client";

import React from "react";
import { Shield, Radio, Sparkles, Globe } from "lucide-react";

interface NavbarProps {
  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;
  backendOnline: boolean;
}

export default function Navbar({ language, setLanguage, backendOnline }: NavbarProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">RailKavach</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-extrabold text-sm uppercase tracking-wider">Copilot</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-semibold">AI Ecosystem</span>
            </div>
            <p className="text-xs text-slate-400">North Western Railway (NWR) Safety Division • AiSPRY Technologies</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <span className={`h-2 w-2 rounded-full ${backendOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
            <span className="text-slate-300 font-medium">{backendOnline ? "FastAPI & GCS Online" : "Local Vault Mode"}</span>
          </div>

          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 transition"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span>{language === "en" ? "हिन्दी (Devanagari)" : "English"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
