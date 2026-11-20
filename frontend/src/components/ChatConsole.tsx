"use client";

import React, { useState } from "react";
import { Send, Sparkles, AlertTriangle, Moon, Wrench, CheckCircle, Clock } from "lucide-react";

interface ChatConsoleProps {
  language: "en" | "hi";
}

export default function ChatConsole({ language }: ChatConsoleProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const scenarios = [
    {
      id: "sc1",
      title: "Scenario 1: Train 12414 SPAD Incident",
      desc: "Home signal overshoot, driver phone violation & WILD axle alert at Suratgarh.",
      icon: AlertTriangle,
      color: "border-rose-900/60 bg-rose-950/20 text-rose-300 hover:border-rose-700",
      query: "Investigate what led to Train 12414 overshooting the signal near Suratgarh on 18 Nov 2026. Provide exact timestamp citations, cross-modal evidence, and statutory conclusions."
    },
    {
      id: "sc2",
      title: "Scenario 2: Fatigue & HOER Violations",
      desc: "Circadian low (02:00–05:00 AM) micro-sleep trends across 1,583 pilots.",
      icon: Moon,
      color: "border-amber-900/60 bg-amber-950/20 text-amber-300 hover:border-amber-700",
      query: "Analyze fatigue trends and micro-sleep clusters across crews and shifts on the Bikaner division over the last 30 days."
    },
    {
      id: "sc3",
      title: "Scenario 3: Wagon Damage Differential",
      desc: "Entry vs Exit gantry audit for rake BOXN-542 & RPUP transit liability.",
      icon: Wrench,
      color: "border-emerald-900/60 bg-emerald-950/20 text-emerald-300 hover:border-emerald-700",
      query: "Run an entry-vs-exit damage differential audit on rake BOXN-542 to determine liability for transit rolling stock damage."
    }
  ];

  const executeInquiry = async (queryText: string) => {
    setLoading(true);
    setPrompt(queryText);
    try {
      const res = await fetch("http://localhost:8000/api/v1/copilot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: queryText, language })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        // Fallback demo response if backend is offline
        setResult({
          response: language === "hi"
            ? "### 🚆 दुर्घटना जांच रिपोर्ट: ट्रेन 12414 सिग्नल ओवरशूट (SPAD)\n**समयबद्ध साक्ष्य:** [03:13:45] लोकेट CVVRS कैमरे ने लोको पायलट को व्यक्तिगत स्मार्टफोन उपयोग करते हुए पकड़ा। [03:14:10] लोको पायलट को 8.2 सेकंड की झपकी आई। [03:14:12] WILD सेंसर ने 248.5 kN का असामान्य झटका दर्ज किया।\n\n**निष्कर्ष:** रेलवे बोर्ड मोबाइल प्रतिबंध परिपत्र एवं रेलवे अधिनियम 1989 की धारा 175 का उल्लंघन।"
            : "### 🚆 Incident Investigation Report: Train 12414 Signal Overshoot (SPAD)\n**Timestamped Evidence:** [03:13:45] Locate CVVRS camera caught Loco Pilot operating smartphone. [03:14:10] Driver micro-sleep 8.2s. [03:14:12] WILD sensor recorded 248.5 kN dynamic impact on trailing wagon.\n\n**Findings:** Violation of Railway Board JPO 2018/19 and Section 175 of The Railways Act, 1989.",
          source: "LOCAL_FAILOVER_CACHE",
          scenario: "SPAD_INVESTIGATION"
        });
      }
    } catch {
      // Graceful local failover
      setResult({
        response: language === "hi"
          ? "### 🚆 दुर्घटना जांच रिपोर्ट: ट्रेन 12414 (सूरतगढ़)\n[03:13:45] लोको पायलट मोबाइल फोन उपयोग। [03:14:10] 8.2s माइक्रो-स्लीप। [03:14:20] स्टेशन मास्टर चेतावनी: 'गाड़ी 12414 रोको!'\n\nभारतीय साक्ष्य अधिनियम 2023 की धारा 63 के तहत प्रमाणित।"
          : "### 🚆 Incident Investigation Report: Train 12414 (Suratgarh)\n[03:13:45] Loco Pilot smartphone distraction. [03:14:10] 8.2s micro-sleep. [03:14:20] Station Master emergency call: 'Train 12414 STOP!'\n\nCertified under Section 63 of Bharatiya Sakshya Adhiniyam, 2023.",
        source: "LOCAL_FAILOVER_CACHE",
        scenario: "SPAD_INVESTIGATION"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Scenario Bar */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {language === "hi" ? "त्वरित जांच परिदृश्य (1-Click Scenarios)" : "One-Click Safety Investigation Scenarios"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.id}
                onClick={() => executeInquiry(sc.query)}
                className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between ${sc.color}`}
              >
                <div>
                  <div className="flex items-center space-x-2 font-semibold text-sm mb-1 text-white">
                    <Icon className="h-4 w-4" />
                    <span>{sc.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{sc.desc}</p>
                </div>
                <div className="mt-3 text-[11px] font-bold text-cyan-400 flex items-center space-x-1">
                  <span>Execute Analysis</span>
                  <span>→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Query Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center space-x-2 shadow-inner focus-within:border-cyan-500 transition">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && prompt && executeInquiry(prompt)}
          placeholder={language === "hi" ? "ट्रेन नंबर, सिग्नल उल्लंघन या संरक्षा से जुड़ा प्रश्न पूछें..." : "Ask any railway safety investigation question in Hindi or English..."}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => prompt && executeInquiry(prompt)}
          disabled={loading || !prompt}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{language === "hi" ? "पूछें" : "Inquire"}</span>
              <Send className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {language === "hi" ? "स्वायत्त संरक्षा विश्लेषण परिणाम" : "Autonomous Safety Findings"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>Grounded with Split-Second NTP Timestamps</span>
              <span className="bg-slate-800 text-cyan-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                {result.source || "GEMINI_1.5_PRO"}
              </span>
            </div>
          </div>

          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans">
            {result.response}
          </div>

          {result.timeline_events && result.timeline_events.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Correlated Multimodal Evidence ({result.timeline_events.length} Events)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {result.timeline_events.slice(0, 3).map((e: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                      <span>{e.timestamp ? e.timestamp.slice(11, 19) : ""}</span>
                      <span className="text-cyan-400 uppercase font-semibold">{e.source_product}</span>
                    </div>
                    <p className="text-slate-300 line-clamp-2">{e.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
