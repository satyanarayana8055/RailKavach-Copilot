"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import ChatConsole from "@/components/ChatConsole";
import TimelineViewer from "@/components/TimelineViewer";
import ConnectorManager from "@/components/ConnectorManager";
import ReportViewer from "@/components/ReportViewer";
import LegalRadar from "@/components/LegalRadar";
import { MessageSquare, Clock, Plug, FileText, Shield } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "timeline" | "connectors" | "reports" | "compliance">("chat");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkBackend = async () => {
    try {
      const res = await fetch("http://localhost:8000/health");
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  };

  const tabs = [
    { id: "chat", label: language === "hi" ? "संरक्षा सहायक (Copilot)" : "Safety Copilot", icon: MessageSquare },
    { id: "timeline", label: language === "hi" ? "बहु-मॉडल समयरेखा (Timeline)" : "Multimodal Timeline", icon: Clock },
    { id: "connectors", label: language === "hi" ? "प्लग-एंड-प्ले कनेक्टर्स (ROCP)" : "ROCP Connectors", icon: Plug },
    { id: "reports", label: language === "hi" ? "वैधानिक रिपोर्ट व साक्ष्य" : "Statutory CRS & BSA Cert", icon: FileText },
    { id: "compliance", label: language === "hi" ? "कानूनी अनुपालन रडार" : "Legal Compliance Radar", icon: Shield },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar language={language} setLanguage={setLanguage} backendOnline={backendOnline} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <StatsBar />

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-b border-slate-800 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <div className="transition-all duration-200">
          {activeTab === "chat" && <ChatConsole language={language} />}
          {activeTab === "timeline" && <TimelineViewer />}
          {activeTab === "connectors" && <ConnectorManager />}
          {activeTab === "reports" && <ReportViewer />}
          {activeTab === "compliance" && <LegalRadar />}
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        RailKavach AI Platform & Copilot • Startup Buildathon India 2026 • Google DeepMind × Google Cloud × AiSPRY Technologies
      </footer>
    </div>
  );
}
