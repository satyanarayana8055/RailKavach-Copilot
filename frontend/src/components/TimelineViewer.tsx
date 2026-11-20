"use client";

import React, { useState, useEffect } from "react";
import { Mic, Video, Camera, Activity, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";

export default function TimelineViewer() {
  const [trainNo, setTrainNo] = useState("12414");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimeline(trainNo);
  }, [trainNo]);

  const fetchTimeline = async (tno: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/timeline/${tno}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
      // Offline fallback
      setEvents([
        {
          timestamp: "2026-11-18T03:10:15.000Z",
          source_product: "railcomm_audio_analytics",
          modality: "AUDIO",
          event_type: "CALLING_OUT_SIGNAL",
          summary: "ALP called out Distant Signal at Yellow... control speed to 50 km/h.",
          verification_status: "CONFIRMED",
          evidence: { sha256_hash: "c8f2a1b7e456d987f0123456789abcdef0123456789abcdef0123456789abcde" }
        },
        {
          timestamp: "2026-11-18T03:13:45.000Z",
          source_product: "locate_cabin_video",
          modality: "VIDEO",
          event_type: "MOBILE_PHONE",
          summary: "Loco Pilot observed operating personal smartphone in left hand while operating master controller.",
          verification_status: "CONFIRMED",
          evidence: { sha256_hash: "99887766554433221100fedcba9876543210fedcba9876543210fedcba987654" }
        },
        {
          timestamp: "2026-11-18T03:14:12.450Z",
          source_product: "wild_wheel_impact_detector",
          modality: "SENSOR_TELEMETRY",
          event_type: "HIGH_WHEEL_IMPACT",
          summary: "Trackside sensor at KM 142/18 detected dynamic wheel impact of 248.5 kN on Axle 4 of trailing wagon BOXN-54210984712.",
          verification_status: "CONFIRMED",
          evidence: { sha256_hash: "cc33dd44ee55ff6677889900aa11bb22cc33dd44ee55ff6677889900aa11bb22" }
        },
        {
          timestamp: "2026-11-18T03:14:20.000Z",
          source_product: "railcomm_audio_analytics",
          modality: "AUDIO",
          event_type: "EMERGENCY_BROADCAST",
          summary: "SM Suratgarh shouted on VHF CH-14: 'गाड़ी 12414 रोको! लाल सिग्नल है! Emergency brake lagao!'",
          verification_status: "CONFIRMED",
          evidence: { sha256_hash: "778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566" }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getModalityIcon = (m: string) => {
    switch (m) {
      case "AUDIO": return <Mic className="h-4 w-4 text-sky-400" />;
      case "VIDEO": return <Video className="h-4 w-4 text-rose-400" />;
      case "IMAGE": return <Camera className="h-4 w-4 text-emerald-400" />;
      default: return <Activity className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Multimodal Chronological Timeline</h3>
          <p className="text-xs text-slate-400">Microsecond NTP alignment across Voice, Cabin Video, Wayside Gantries, and Trackside Sensors</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400 font-medium">Select Train Run:</label>
          <select
            value={trainNo}
            onChange={(e) => setTrainNo(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-semibold"
          >
            <option value="12414">Train 12414 (Mandore Express)</option>
            <option value="BOXN-542">Rake BOXN-542 (Freight)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((e, idx) => {
          const time = e.timestamp ? e.timestamp.slice(11, 19) : "00:00:00";
          const isConfirmed = e.verification_status === "CONFIRMED";
          return (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 mt-0.5">
                  {getModalityIcon(e.modality)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">[{time}]</span>
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                      {e.source_product?.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-500">• {e.event_type}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">{e.summary}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end md:self-center">
                <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${isConfirmed ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800" : "bg-amber-950/60 text-amber-400 border border-amber-800"}`}>
                  {isConfirmed ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  <span>{e.verification_status}</span>
                </div>
                <div className="hidden lg:flex items-center space-x-1 text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  <ShieldCheck className="h-3 w-3 text-slate-400" />
                  <span>SHA-256: {e.evidence?.sha256_hash?.slice(0, 10)}...</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
