"use client";

import React, { useState, useEffect } from "react";
import { Download, Copy, Check, ShieldAlert, Award } from "lucide-react";

export default function ReportViewer() {
  const [reportData, setReportData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/reports/crs/12414");
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch {
      // Local fallback
      setReportData({
        report_markdown: `# COMMISSION OF RAILWAY SAFETY (CRS) / SENIOR DIVISIONAL SAFETY OFFICER
## STATUTORY JOINT INQUIRY REPORT — PROVISIONAL FINDINGS
**Incident Identification Number:** INC-12414-20261118  
**Railway Zone / Division:** North Western Railway (NWR) / Bikaner Division  
**Date of Occurrence:** 18 November 2026 | **Time:** 03:14:45 IST  
**Location:** Section Suratgarh - Bikaner (Suratgarh Outer Approach, KM 142/22)  
**Train Particulars:** Train No. 12414 (Express) hauled by Locomotive WAP-7 30452  
**Statutory Classification:** Signal Passed at Danger (SPAD) / Hazardous Inattention  

---

### 1. RECONSTRUCTED MULTIMODAL TIMELINE
* **[03:10:15] 📻 RAILCOMM:** Distant signal called out at Yellow by ALP.
* **[03:11:40] 📻 RAILCOMM:** Station Master instructs Home Signal is RED, route via Loop 2.
* **[03:13:45] 📹 LOCATE:** Loco Pilot observed operating personal smartphone (38.5s).
* **[03:14:10] 📹 LOCATE:** Driver micro-sleep 8.2s (PERCLOS eyelid closure >80%).
* **[03:14:12] ⚠️ WILD:** Wheel Impact Load Detector registered 248.5 kN dynamic impact on trailing wagon.
* **[03:14:20] 📻 RAILCOMM:** SM Suratgarh emergency callout: 'गाड़ी 12414 रोको! लाल सिग्नल है!'
* **[03:14:45] 🚆 SPAD:** Train came to a dead halt 60 meters past Home Signal.

---

### 2. PRIMARY CAUSE & STATUTORY FINDINGS
* **Primary Operational Breach:** Violation of Railway Board JPO Circular 2018/Safety(A&R)/19/19 (Mobile Phone in Cab).
* **Offense Under The Railways Act, 1989:** Section 175 (Endangering passenger safety).

---

### 3. STATUTORY CERTIFICATE UNDER SECTION 63 BHARATIYA SAKSHYA ADHINIYAM, 2023 (BSA 2023)
* **Master Cryptographic Digest:** SHA-256 Verified
* **Part A:** Certified by R. K. Sharma (Sr. DSO Bikaner).
* **Part B:** Certified by Forensic & System Safety Expert. Zero digital tampering.`,
        crew_briefing_hindi: `### 🛡️ चालक दल लॉबी संरक्षा चेतावनी पर्ची (Crew Lobby Warning Slip)
**मंडल:** बीकानेर मंडल (उत्तर पश्चिम रेलवे) | **तारीख:** 18 नवम्बर 2026

**सभी लोको पायलट एवं सहायक लोको पायलट कृपया ध्यान दें:**
1. **मोबाइल फोन पूर्णतः प्रतिबंधित:** ट्रेन संचालन के दौरान व्यक्तिगत मोबाइल फोन स्विच ऑफ कर बैग में रखें। इसका उल्लंघन रेलवे अधिनियम की धारा 175 के तहत दंडनीय है।
2. **सिग्नल कॉलिंग आउट अनिवार्य:** अग्रिम व होम सिग्नल के हर पहलू को जोर से पुकारें और हाथ से इशारा करें (G&SR 4.40 नियम)।
3. **भोर की सतर्कता (02:00 - 05:00 AM):** नींद या झपकी आने पर तुरंत सहायक चालक को सतर्क करें।`,
        master_sha256: "a2858d230cfbbd931c2d9a58dcaab74ceee0c10e3bf29711525e2861e7910df7"
      });
    }
  };

  const copyToClipboard = () => {
    if (reportData?.report_markdown) {
      navigator.clipboard.writeText(reportData.report_markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Statutory Inquiry Report & BSA 2023 Evidence Certificate</h3>
          <p className="text-xs text-slate-400">Formal Inquiry Documentation Complying with The Railways Act 1989 and Section 63 BSA 2023</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy Report"}</span>
          </button>
          <a
            href={`data:text/markdown;charset=utf-8,${encodeURIComponent(reportData?.report_markdown || "")}`}
            download="CRS_Inquiry_Report_12414.md"
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Report (.MD)</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line overflow-y-auto max-h-[600px]">
          {reportData?.report_markdown}
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Award className="h-5 w-5" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Section 63 BSA 2023 Seal</h4>
            </div>
            <p className="text-xs text-slate-400">Admissibility of electronic video, radio voice, and sensor records in High Courts & CRS tribunals.</p>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Master SHA-256 Digest:</span>
              <code className="text-[11px] text-emerald-400 break-all">{reportData?.master_sha256}</code>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>✓ Part A: Signed by Sr. DSO Bikaner</div>
              <div>✓ Part B: Technical Hash Certified</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">Devanagari Crew Briefing Note</h4>
            <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans bg-slate-950 p-3 rounded-lg border border-slate-800">
              {reportData?.crew_briefing_hindi}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
