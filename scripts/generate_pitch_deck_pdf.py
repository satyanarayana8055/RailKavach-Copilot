#!/usr/bin/env python3
"""
RailKavach Copilot — Official Pitch Deck Generator (PDF Export)
Strictly adheres to the Startup Buildathon India 2026 (Hack2skill) template structure:
1. Cover / Title
2. Team Name & Problem Statement
3. Brief about the idea
4. Opportunities, Differentiation & USP
5. List of features offered
6. Process flow / Use-case diagram
7. Wireframes / Mock diagrams
8. Architecture diagram
9. Technologies used
10. Estimated implementation cost
11. Snapshots of the prototype
12. Performance report / Benchmarking
13. Additional details / Future development
"""

import os
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_HTML = REPO_ROOT / "docs" / "RailKavach_Pitch_Deck.html"
OUTPUT_PDF = REPO_ROOT / "RailKavach_Pitch_Deck.pdf"

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>RailKavach Copilot — Pitch Deck</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

  @page {
    size: 16in 9in;
    margin: 0;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #0b0f19;
    color: #f1f5f9;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .slide {
    width: 16in;
    height: 9in;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    padding: 0.7in 0.9in;
    background: radial-gradient(circle at 90% 10%, rgba(30, 58, 138, 0.25) 0%, rgba(11, 15, 25, 1) 60%);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid rgba(59, 130, 246, 0.2);
    padding-bottom: 0.25in;
    margin-bottom: 0.35in;
  }

  .title-group h2 {
    font-size: 28pt;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .title-group p {
    font-size: 12pt;
    color: #94a3b8;
    margin-top: 4px;
    font-weight: 500;
  }

  .badge-tag {
    background: rgba(30, 58, 138, 0.4);
    border: 1px solid #3b82f6;
    color: #60a5fa;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 10pt;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 0.18in;
    font-size: 9pt;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }

  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* Grid Layouts */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4in;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.35in;
  }

  .grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.25in;
  }

  /* Cards */
  .card {
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(148, 163, 184, 0.15);
    border-radius: 14px;
    padding: 0.28in;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  }

  .card-highlight {
    background: linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%);
    border: 1px solid rgba(59, 130, 246, 0.35);
  }

  .card-title {
    font-size: 14pt;
    font-weight: 700;
    color: #38bdf8;
    margin-bottom: 0.12in;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-body {
    font-size: 11pt;
    color: #cbd5e1;
    line-height: 1.55;
  }

  .card-body ul {
    list-style: none;
  }

  .card-body ul li {
    position: relative;
    padding-left: 18px;
    margin-bottom: 8px;
  }

  .card-body ul li::before {
    content: "•";
    color: #f97316;
    font-size: 16pt;
    position: absolute;
    left: 0;
    top: -4px;
  }

  .stat-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 32pt;
    font-weight: 800;
    color: #38bdf8;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 10pt;
    color: #94a3b8;
    text-transform: uppercase;
    font-weight: 600;
  }

  .pill {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 8.5pt;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
  }
  .pill-green { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
  .pill-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
  .pill-orange { background: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.3); }
  .pill-blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }

  /* Diagram boxes */
  .diagram-flow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    width: 100%;
  }

  .flow-box {
    flex: 1;
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(59, 130, 246, 0.25);
    border-radius: 12px;
    padding: 0.22in;
    text-align: center;
  }

  .flow-arrow {
    font-size: 20pt;
    color: #f97316;
    font-weight: bold;
  }

  /* Table styling */
  table.bench-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10.5pt;
  }
  table.bench-table th {
    background: rgba(30, 58, 138, 0.35);
    color: #38bdf8;
    text-align: left;
    padding: 10px 14px;
    border-bottom: 2px solid rgba(59, 130, 246, 0.4);
    font-weight: 600;
  }
  table.bench-table td {
    padding: 10px 14px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    color: #cbd5e1;
  }
</style>
</head>
<body>

<!-- SLIDE 1: COVER -->
<section class="slide" style="background: radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.35) 0%, rgba(11, 15, 25, 1) 75%); justify-content: center; align-items: center; text-align: center;">
  <div style="max-width: 12in;">
    <div style="display: inline-block; margin-bottom: 0.3in;">
      <span class="badge-tag">Startup Buildathon India 2026 • Google DeepMind × Google Cloud × Hack2skill</span>
    </div>
    <h1 style="font-size: 46pt; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 0.15in; background: linear-gradient(135deg, #ffffff 10%, #60a5fa 60%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
      RailKavach Copilot 🚆🛡️
    </h1>
    <h2 style="font-size: 20pt; font-weight: 500; color: #94a3b8; max-width: 10.5in; margin: 0 auto 0.4in; line-height: 1.45;">
      Autonomous Multimodal Operational Intelligence & Voice Safety Assistant for Indian Railways
    </h2>
    <div style="display: flex; justify-content: center; gap: 0.3in; margin-top: 0.2in;">
      <div class="card" style="padding: 12px 24px; border-color: rgba(59,130,246,0.3);">
        <p style="font-size: 9pt; color: #64748b; text-transform: uppercase; font-weight: 700;">Developed By</p>
        <p style="font-size: 13pt; font-weight: 700; color: #38bdf8;">AiSPRY Technologies</p>
      </div>
      <div class="card" style="padding: 12px 24px; border-color: rgba(16,185,129,0.3);">
        <p style="font-size: 9pt; color: #64748b; text-transform: uppercase; font-weight: 700;">Partner & Deployment</p>
        <p style="font-size: 13pt; font-weight: 700; color: #34d399;">North Western Railway (NWR)</p>
      </div>
      <div class="card" style="padding: 12px 24px; border-color: rgba(249,115,22,0.3);">
        <p style="font-size: 9pt; color: #64748b; text-transform: uppercase; font-weight: 700;">Core Google Tech</p>
        <p style="font-size: 13pt; font-weight: 700; color: #fb923c;">Gemini Flash • Gemma Edge • Sovereign GCS</p>
      </div>
    </div>
  </div>
  <div class="footer" style="position: absolute; bottom: 0.4in; left: 0.9in; right: 0.9in;">
    <span>Track: Enterprise AI & Indian Railways Modernization</span>
    <span>Slide 1 / 13</span>
  </div>
</section>

<!-- SLIDE 2: TEAM & PROBLEM STATEMENT -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>Team & Problem Statement</h2>
      <p>Manual Safety Review Bottleneck & Forensic Fragmentation across Indian Railways</p>
    </div>
    <span class="badge-tag">Context & Mandate</span>
  </div>
  <div class="content-area">
    <div class="grid-2">
      <div class="card card-highlight">
        <h3 class="card-title">👥 Team Information</h3>
        <div class="card-body">
          <p style="margin-bottom: 12px;"><strong style="color: #fff;">Team Name:</strong> AiSPRY Technologies</p>
          <p style="margin-bottom: 12px;"><strong style="color: #fff;">Team Size:</strong> 4 Core Engineers & Domain Researchers</p>
          <p style="margin-bottom: 12px;"><strong style="color: #fff;">Domain Expertise:</strong> Railway Safety Systems, Real-Time Edge Video/Audio AI, Bharatiya Sakshya Adhiniyam Legal Informatics</p>
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="font-size: 10pt; color: #94a3b8;"><strong style="color: #38bdf8;">Real-World Footprint:</strong> Operating live pilots across NWR Bikaner division processing 11,354 audio files, 3.68M lines, and 1,583 loco pilots.</p>
          </div>
        </div>
      </div>
      <div class="card">
        <h3 class="card-title" style="color: #f87171;">⚠️ Problem Statement: Disconnected Data Silos</h3>
        <div class="card-body">
          <ul>
            <li><strong>The 3-to-5 Day Forensic Lag:</strong> When near-SPADs or derailments occur, safety officers (Sr. DSO, Sr. DEE/TRO) spend days manually cross-referencing disconnected cab tapes, SD-card video, and depot logs.</li>
            <li><strong>Zero Cross-Modal Synchronization:</strong> Cab VHF radio noise, in-cab vigilance cameras, and wagon damage inspections run on unlinked standalone systems.</li>
            <li><strong>Section 63 BSA 2023 Evidence Inadmissibility:</strong> Under India's new evidentiary code, raw digital logs without cryptographic hash custody are thrown out of statutory Commission of Railway Safety (CRS) inquiries.</li>
            <li><strong>DPDP Act 2023 Risk:</strong> Unencrypted local storage of driver voice/video creates immediate non-compliance liability.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 2 / 13</span>
  </div>
</section>

<!-- SLIDE 3: BRIEF ABOUT THE IDEA -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>Brief About the Idea</h2>
      <p>Autonomous Conversational Multimodal Intelligence Layer with Zero New Hardware</p>
    </div>
    <span class="badge-tag">Core Solution Concept</span>
  </div>
  <div class="content-area">
    <div class="grid-3">
      <div class="card">
        <div class="pill pill-blue" style="margin-bottom: 8px;">PILLAR 01: HEARD</div>
        <h3 class="card-title">Railcomm Audio Analytics</h3>
        <div class="card-body">
          <ul>
            <li>Real-time deep learning denoising suppressing <strong>9+ industrial noise classes</strong> (horns, engine, rail rattle).</li>
            <li>Bilingual Hindi/English speech-to-text with safety keyword detection (<em>Caution, Red, Loop Line</em>).</li>
            <li>Strict <strong>Fail-Open</strong> architecture: audio is never blocked during model degradation.</li>
          </ul>
        </div>
      </div>
      <div class="card">
        <div class="pill pill-amber" style="margin-bottom: 8px;">PILLAR 02: SEEN</div>
        <h3 class="card-title">Locate Cabin CVVRS Vision</h3>
        <div class="card-body">
          <ul>
            <li>24×7 Edge CVVRS AI classifying <strong>5 critical safety violations</strong> (mobile phone, micro-sleep, fatigue).</li>
            <li>Explicitly recognizes <strong>3 compliant operational duties</strong> (walkie-talkie, memo checking, throttle control).</li>
            <li>Prevents false alarm fatigue among Loco Pilots.</li>
          </ul>
        </div>
      </div>
      <div class="card">
        <div class="pill pill-green" style="margin-bottom: 8px;">PILLAR 03: SENSED</div>
        <h3 class="card-title">WDD & Rolling Stock Scans</h3>
        <div class="card-body">
          <ul>
            <li>Trackside 6-gantry optical & laser scanning across <strong>8 rolling stock damage classes</strong>.</li>
            <li>PaddleOCR automatic wagon numbering + <strong>entry vs exit condition differential</strong>.</li>
            <li>Slashes full 58-wagon rake inspection turnaround from <strong>8 hours down to 2 hours</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="card card-highlight" style="margin-top: 0.3in; padding: 0.18in 0.3in;">
      <p style="font-size: 11pt; color: #f1f5f9; line-height: 1.5;">
        <strong style="color: #38bdf8;">The Intelligence Glue:</strong> RailKavach Copilot sits on top of all 3 existing sensor networks with <strong>zero hardware footprint</strong>, unifying them into a scrubbable 90-second incident reconstruction window powered by Google Gemini and local edge Gemma.
      </p>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 3 / 13</span>
  </div>
</section>

<!-- SLIDE 4: OPPORTUNITIES, DIFFERENTIATION & USP -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>Opportunities, Differentiation & USP</h2>
      <p>Transforming Reactive Railway Forensics into Proactive, Legally Admissible Safety</p>
    </div>
    <span class="badge-tag">Market & Competitive Edge</span>
  </div>
  <div class="content-area">
    <div class="grid-3">
      <div class="card">
        <h3 class="card-title" style="color: #34d399;">📈 Massive Opportunity</h3>
        <div class="card-body">
          <ul>
            <li><strong>Scale:</strong> 13,000+ passenger trains, 9,000+ freight rakes, 68,000 route kilometers.</li>
            <li><strong>Economic Loss Prevention:</strong> Over <strong>$100M+ annually</strong> in rolling stock damages, siding disputes, and derailment liability.</li>
            <li><strong>Zero Capex:</strong> Deploys as a sovereign software layer over existing loco CVVRS and trackside gantries.</li>
          </ul>
        </div>
      </div>
      <div class="card">
        <h3 class="card-title" style="color: #fb923c;">⚡ How We Differ</h3>
        <div class="card-body">
          <ul>
            <li><strong>Unified vs Isolated:</strong> Existing vendors sell standalone black boxes; RailKavach correlates audio + video + brake pressure in one timeline.</li>
            <li><strong>Zero-Local DPDP Storage:</strong> Unlike raw SD-card recording, assets stream dynamically from Delhi sovereign GCS (`ASIA-SOUTH2`).</li>
            <li><strong>Sub-Millisecond Edge Cache:</strong> 3-tier caching (L1 RAM &lt;0.5ms, L2 SSD &lt;2ms) guarantees instant UI responsiveness.</li>
          </ul>
        </div>
      </div>
      <div class="card card-highlight">
        <h3 class="card-title" style="color: #38bdf8;">🏆 Core USP</h3>
        <div class="card-body">
          <ul>
            <li><strong>Tri-Stream Synchronization:</strong> Cross-checks VHF callout + In-Cab posture + Brake Pipe exhaust (5.0 → 0 kg/cm²).</li>
            <li><strong>Section 63 BSA 2023 Admissibility:</strong> Built-in SHA-256 cryptographic chain of custody with 1-click statutory CRS certificate export.</li>
            <li><strong>Hybrid Dual AI:</strong> Cloud Gemini 1.5/2.0 Flash + Offline Cab Gemma 2 (9B) for 100% fail-safe operation in tunnels.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 4 / 13</span>
  </div>
</section>

<!-- SLIDE 5: LIST OF FEATURES OFFERED -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>List of Features Offered by the Solution</h2>
      <p>Comprehensive 8-Pillar Multimodal Enterprise Capability Suite</p>
    </div>
    <span class="badge-tag">Feature Inventory</span>
  </div>
  <div class="content-area">
    <div class="grid-4">
      <div class="card">
        <div class="stat-val" style="font-size: 20pt; color: #38bdf8;">01. Railcomm</div>
        <p style="font-size: 10pt; font-weight: 700; color: #fff; margin-bottom: 6px;">Deep Audio Denoising</p>
        <p style="font-size: 9.5pt; color: #94a3b8;">Filters 9+ industrial noise classes; +18.2 dB SNR gain; fails open to guarantee cab audio safety.</p>
      </div>
      <div class="card">
        <div class="stat-val" style="font-size: 20pt; color: #38bdf8;">02. Locate</div>
        <p style="font-size: 10pt; font-weight: 700; color: #fff; margin-bottom: 6px;">In-Cab Edge CVVRS</p>
        <p style="font-size: 9.5pt; color: #94a3b8;">YOLOv8 edge inference tracking 5 violations (phone, drowsiness) vs 3 compliant acts (walkie-talkie).</p>
      </div>
      <div class="card">
        <div class="stat-val" style="font-size: 20pt; color: #38bdf8;">03. WDD</div>
        <p style="font-size: 20pt; color: #38bdf8;">6-Gantry Rake Scans</p>
        <p style="font-size: 10pt; font-weight: 700; color: #fff; margin-bottom: 6px;">Automated Damage Delta</p>
        <p style="font-size: 9.5pt; color: #94a3b8;">PaddleOCR + YOLOv8 detects broken springs & hanging flaps; 1-click sick-line work orders.</p>
      </div>
      <div class="card">
        <div class="stat-val" style="font-size: 20pt; color: #38bdf8;">04. Tri-Stream</div>
        <p style="font-size: 10pt; font-weight: 700; color: #fff; margin-bottom: 6px;">Incident Timeline</p>
        <p style="font-size: 9.5pt; color: #94a3b8;">Millisecond-synchronized scrub across cab audio, CVVRS video frame, and brake pressure curve.</p>
      </div>
      <div class="card">
        <div class="stat-val" style="font-size: 20pt; color: #34d399;">05. Bilingual</div>
        <p style="font-size: 10pt; font-weight: 700; color: #fff; margin-bottom: 6px;">Voice Copilot</p>
        <p style="font-size: 9.5pt; color: #94a3b8;">Natural voice Q&A in Hindi & English grounded in Railway G&SR (General & Subsidiary Rules).</p>
      </div>
      <div class="card">
        <div class="stat-val" style="font-size: 20pt; color: #34d399;">06. Section 63</div>
        <p style="font-size: 10pt; font-weight: 700; color: #fff; margin-bottom: 6px;">BSA 2023 Custody</p>
        <p style="font-size: 9.5pt; color: #94a3b8;">Cryptographic SHA-256 chain of custody with instant statutory certificate generation for CRS.</p>
      </div>
      <div class="card">
        <div class="stat-val" style="font-size: 20pt; color: #34d399;">07. DPDP 2023</div>
        <p style="font-size: 10pt; font-weight: 700; color: #fff; margin-bottom: 6px;">Zero-Local & RBAC</p>
        <p style="font-size: 9.5pt; color: #94a3b8;">Sovereign GCS ASIA-SOUTH2 vaulting + automatic PII masking across 5 operational railway roles.</p>
      </div>
      <div class="card">
        <div class="stat-val" style="font-size: 20pt; color: #34d399;">08. Edge Gemma</div>
        <p style="font-size: 10pt; font-weight: 700; color: #fff; margin-bottom: 6px;">Air-Gapped Offline</p>
        <p style="font-size: 9.5pt; color: #94a3b8;">Local Gemma 2 (9B) failover for zero-connectivity desert/mountain tunnels with 0 cloud dependency.</p>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 5 / 13</span>
  </div>
</section>

<!-- SLIDE 6: PROCESS FLOW DIAGRAM / USE-CASE DIAGRAM -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>Process Flow & Use-Case Diagram</h2>
      <p>End-to-End Operational Journey from Edge Capture to Regulatory Sign-Off</p>
    </div>
    <span class="badge-tag">Workflow Architecture</span>
  </div>
  <div class="content-area">
    <div class="diagram-flow" style="margin-bottom: 0.35in;">
      <div class="flow-box">
        <div style="font-size: 20pt; margin-bottom: 4px;">📡</div>
        <p style="font-size: 11pt; font-weight: 700; color: #38bdf8;">1. Edge Sensors</p>
        <p style="font-size: 9pt; color: #94a3b8; margin-top: 4px;">VHF Cab Radio • CVVRS In-Cab Cam • 6 Gantry Optical/Laser • Loco BP Pressure</p>
      </div>
      <div class="flow-arrow">➔</div>
      <div class="flow-box">
        <div style="font-size: 20pt; margin-bottom: 4px;">⚙️</div>
        <p style="font-size: 11pt; font-weight: 700; color: #38bdf8;">2. Edge Inferencing</p>
        <p style="font-size: 9pt; color: #94a3b8; margin-top: 4px;">Deep Denoising • YOLOv8 Vigilance • PaddleOCR • Fail-Open Gate</p>
      </div>
      <div class="flow-arrow">➔</div>
      <div class="flow-box">
        <div style="font-size: 20pt; margin-bottom: 4px;">☁️</div>
        <p style="font-size: 11pt; font-weight: 700; color: #38bdf8;">3. Sovereign GCS & AlloyDB</p>
        <p style="font-size: 9pt; color: #94a3b8; margin-top: 4px;">ASIA-SOUTH2 Delhi Vault • SHA-256 Custody Hash • 3-Tier Edge Cache</p>
      </div>
      <div class="flow-arrow">➔</div>
      <div class="flow-box" style="border-color: #f97316;">
        <div style="font-size: 20pt; margin-bottom: 4px;">🧠</div>
        <p style="font-size: 11pt; font-weight: 700; color: #fb923c;">4. Dual AI Reasoning</p>
        <p style="font-size: 9pt; color: #94a3b8; margin-top: 4px;">Google Gemini Flash Cloud • Gemma 2 Edge • Railway G&SR Rules Grounding</p>
      </div>
      <div class="flow-arrow">➔</div>
      <div class="flow-box">
        <div style="font-size: 20pt; margin-bottom: 4px;">🛡️</div>
        <p style="font-size: 11pt; font-weight: 700; color: #34d399;">5. Action & Evidence</p>
        <p style="font-size: 9pt; color: #94a3b8; margin-top: 4px;">Section 63 BSA Certificate • Sick-Line Order • Bilingual Crew Slip</p>
      </div>
    </div>
    <div class="grid-3">
      <div class="card" style="padding: 14px 20px;">
        <p style="font-size: 10pt; font-weight: 700; color: #38bdf8;">Use-Case A: Near-SPAD Incident</p>
        <p style="font-size: 9pt; color: #cbd5e1; margin-top: 4px;">Correlates ALP Hindi danger shout with pilot phone distraction and 03:14:24 BP pressure drop to prove train halted 60m before red signal.</p>
      </div>
      <div class="card" style="padding: 14px 20px;">
        <p style="font-size: 10pt; font-weight: 700; color: #38bdf8;">Use-Case B: Night Shift Fatigue Clustering</p>
        <p style="font-size: 9pt; color: #cbd5e1; margin-top: 4px;">Aggregates 02:00–05:00 AM micro-sleep alerts across freight corridors to identify fatigue hotspots and adjust roster schedules.</p>
      </div>
      <div class="card" style="padding: 14px 20px;">
        <p style="font-size: 10pt; font-weight: 700; color: #38bdf8;">Use-Case C: Transit Damage Recovery</p>
        <p style="font-size: 9pt; color: #cbd5e1; margin-top: 4px;">Compares Suratgarh entry vs Lalgarh exit scans, automatically pinning Wagon #14 coil spring fracture on private siding handling.</p>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 6 / 13</span>
  </div>
</section>

<!-- SLIDE 7: WIREFRAMES / MOCK DIAGRAMS -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>Wireframes & Mock Diagrams of Proposed Solution</h2>
      <p>High-Density Operational Cockpit Designed for Rapid Human-in-the-Loop Decision Making</p>
    </div>
    <span class="badge-tag">UI & Interaction Schema</span>
  </div>
  <div class="content-area">
    <div class="grid-2">
      <div class="card">
        <h3 class="card-title">🖥️ Main Executive Cockpit Layout</h3>
        <div style="background: rgba(0,0,0,0.5); border: 1px dashed rgba(59,130,246,0.3); border-radius: 8px; padding: 14px; font-family: 'JetBrains Mono', monospace; font-size: 8.5pt; color: #94a3b8; line-height: 1.5;">
          +-----------------------------------------------------------------------------------------+<br>
          | [Role: Sr. DSO] [DPDP: Masked/Active] [Lang: HI/EN]               [Search / Ask Copilot] |<br>
          +-----------------------------------------------------------------------------------------+<br>
          | KPI: SPAD Margin: 60m | Denoise: +18dB | Critical Defect: W#14 | Audit Ledger: Verified |<br>
          +-----------------------------------------------------+-----------------------------------+<br>
          | 📻 FLAGGED RADIO EXCHANGES (Zero-Local Streaming)   | 🚆 58-WAGON RAKE TOPOLOGY         |<br>
          |  [03:14:15] ALP: "सर सामने सिग्नल लाल है!" [AUDIO]  |  [01][02]...[14: CRITICAL]...[58]  |<br>
          |  - SHA-256: 8e58dffb... (Section 63 BSA Verified)   |  - Gantry Scan: Bogie #2 Spring   |<br>
          |                                                     |  - [Issue Sick-Line Work Order]   |<br>
          +-----------------------------------------------------+-----------------------------------+<br>
          | ⏱️ MULTIMODAL TIMELINE (Scrubbable 3-Lane Sync)                                         |<br>
          |  Lane 1: Railcomm Audio | 03:14:15 Caution Order Received                               |<br>
          |  Lane 2: CVVRS In-Cab   | 03:14:02 Mobile Phone Violation Detected (0.94 conf)          |<br>
          |  Lane 3: Telemetry      | 03:14:24 BP Pressure Drop 5.0 -> 0.0 kg/cm2 (Emergency RS)    |<br>
          +-----------------------------------------------------------------------------------------+
        </div>
      </div>
      <div class="card card-highlight">
        <h3 class="card-title">💬 Conversational AI Drawer with Statutory Rule Citations</h3>
        <div class="card-body">
          <p style="margin-bottom: 10px;"><strong style="color: #38bdf8;">1. Natural Voice / Text Prompt:</strong> <em>"What caused the emergency brake application on Train 12414 near Suratgarh?"</em></p>
          <p style="margin-bottom: 10px;"><strong style="color: #34d399;">2. Structured Multimodal Grounding:</strong> The engine queries audio transcripts, video vigilance bounding boxes, and brake pipe sensors simultaneously.</p>
          <p style="margin-bottom: 10px;"><strong style="color: #fb923c;">3. Statutory Rule Citations:</strong> Automatically highlights relevant provisions: <em>G&SR General Rules 3.38 (Loop Line signals) & 4.19 (Crew vigilance).</em></p>
          <div style="background: rgba(0,0,0,0.4); padding: 10px; border-radius: 6px; border-left: 3px solid #10b981; margin-top: 10px;">
            <p style="font-size: 9.5pt; color: #a7f3d0; font-family: 'JetBrains Mono', monospace;">
              📄 Auto-Generated Output:<br>
              • Section 63(4) BSA 2023 Digital Evidence Certificate (SHA-256 Validated)<br>
              • Bilingual Crew Lobby Sign-On Slip (Devanagari Hindi)
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 7 / 13</span>
  </div>
</section>

<!-- SLIDE 8: ARCHITECTURE DIAGRAM -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>Architecture Diagram of the Proposed Solution</h2>
      <p>5-Stage Enterprise Cloud-Agnostic Core with Pluggable Edge/Cloud Adapters</p>
    </div>
    <span class="badge-tag">System Blueprint</span>
  </div>
  <div class="content-area">
    <div class="card card-highlight" style="padding: 0.3in;">
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; text-align: center;">
        <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 16px;">
          <div class="pill pill-blue" style="margin-bottom: 8px;">STAGE 01</div>
          <p style="font-size: 11pt; font-weight: 700; color: #fff;">CAPTURE</p>
          <p style="font-size: 8.5pt; color: #94a3b8; margin-top: 6px;">CVVRS Cabin Cam, VHF Wireless, Wayside 6-Gantry Optical & Laser Feeds, NTP Clock Sync</p>
        </div>
        <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 16px;">
          <div class="pill pill-amber" style="margin-bottom: 8px;">STAGE 02</div>
          <p style="font-size: 11pt; font-weight: 700; color: #fff;">INFER</p>
          <p style="font-size: 8.5pt; color: #94a3b8; margin-top: 6px;">YOLOv8 Edge Vigilance, PaddleOCR Wagon Serial, Deep Audio Denoising, Fail-Open Gating</p>
        </div>
        <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 16px;">
          <div class="pill pill-orange" style="margin-bottom: 8px;">STAGE 03</div>
          <p style="font-size: 11pt; font-weight: 700; color: #fff;">ATTRIBUTE</p>
          <p style="font-size: 8.5pt; color: #94a3b8; margin-top: 6px;">RailKavach Open Connector Protocol (ROCP), Canonical Event Envelopes, DPDP PII Anonymizer</p>
        </div>
        <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 16px;">
          <div class="pill pill-green" style="margin-bottom: 8px;">STAGE 04</div>
          <p style="font-size: 11pt; font-weight: 700; color: #fff;">ORCHESTRATE</p>
          <p style="font-size: 8.5pt; color: #94a3b8; margin-top: 6px;">Google Gemini 1.5/2.0 Flash + Offline Gemma 2 (9B), 5 Agent Skills, Dynamic Tool Calling</p>
        </div>
        <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 16px;">
          <div class="pill pill-blue" style="margin-bottom: 8px;">STAGE 05</div>
          <p style="font-size: 11pt; font-weight: 700; color: #fff;">GOVERNANCE</p>
          <p style="font-size: 8.5pt; color: #94a3b8; margin-top: 6px;">Section 63 BSA 2023 Digital Certificate, SHA-256 Immutable Audit Ledger, HITL Review Token</p>
        </div>
      </div>
      <div style="margin-top: 20px; padding: 12px 18px; background: rgba(30, 58, 138, 0.25); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 10pt; font-weight: 700; color: #38bdf8;">⚡ Low-Latency 3-Tier Storage Hierarchy:</span>
        <span style="font-size: 9.5pt; color: #cbd5e1;"><strong style="color: #34d399;">Tier 1:</strong> In-Memory LRU Cache (&lt;0.5ms) &nbsp;|&nbsp; <strong style="color: #34d399;">Tier 2:</strong> Persistent Edge SSD Cache (&lt;2ms) &nbsp;|&nbsp; <strong style="color: #34d399;">Tier 3:</strong> Sovereign GCS Vault (ASIA-SOUTH2 Delhi)</span>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 8 / 13</span>
  </div>
</section>

<!-- SLIDE 9: TECHNOLOGIES TO BE USED IN THE SOLUTION -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>Technologies Used in the Solution</h2>
      <p>Best-in-Class Google AI Ecosystem Coupled with High-Throughput Edge Frameworks</p>
    </div>
    <span class="badge-tag">Tech Stack</span>
  </div>
  <div class="content-area">
    <div class="grid-3">
      <div class="card">
        <h3 class="card-title" style="color: #38bdf8;">🧠 Google AI & Models</h3>
        <div class="card-body">
          <ul>
            <li><strong>Google Gemini 1.5/2.0 Flash:</strong> Long-context multimodal reasoning engine across audio transcripts, vision labels, and telemetry.</li>
            <li><strong>Google Gemma 2 (9B):</strong> On-premise air-gapped deployment for 100% offline edge privacy inside locomotives.</li>
            <li><strong>Google Agent Skills:</strong> 5 Pydantic tool contracts for deterministic railway data retrieval.</li>
          </ul>
        </div>
      </div>
      <div class="card">
        <div class="card-title" style="color: #34d399;">☁️ Google Cloud Infrastructure</div>
        <div class="card-body">
          <ul>
            <li><strong>Sovereign Cloud Storage (GCS):</strong> Hosted in <code>ASIA-SOUTH2</code> (Delhi) for DPDP Act 2023 legal data sovereignty.</li>
            <li><strong>AlloyDB for PostgreSQL:</strong> Sub-second hybrid search combining relational safety logs and vector embeddings.</li>
            <li><strong>Google Cloud Run & Artifact Registry:</strong> Serverless container deployment with auto-scaling down to zero.</li>
          </ul>
        </div>
      </div>
      <div class="card">
        <h3 class="card-title" style="color: #fb923c;">⚡ Vision, Audio & Frameworks</h3>
        <div class="card-body">
          <ul>
            <li><strong>YOLOv8 & PaddleOCR:</strong> 24×7 edge cabin vigilance and trackside wagon serial number extraction.</li>
            <li><strong>Next.js 14 & Tailwind CSS:</strong> High-performance TypeScript frontend with Web Audio streaming.</li>
            <li><strong>Langfuse & SHA-256 Engine:</strong> End-to-end LLM observability, trace latency monitoring, and statutory chain-of-custody.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 9 / 13</span>
  </div>
</section>

<!-- SLIDE 10: ESTIMATED IMPLEMENTATION COST -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>Estimated Implementation Cost & Tokenometrics</h2>
      <p>Cost Optimization via Temporal Window Clamping & High-Return Investment Model</p>
    </div>
    <span class="badge-tag">Economics & ROI</span>
  </div>
  <div class="content-area">
    <div class="grid-2">
      <div class="card card-highlight">
        <h3 class="card-title">💰 Operational Cost Model (Per Railway Division / Month)</h3>
        <table class="bench-table" style="margin-top: 8px;">
          <tr>
            <th>Component</th>
            <th>Monthly Cost</th>
            <th>Optimization Mechanism</th>
          </tr>
          <tr>
            <td>Google Gemini AI API</td>
            <td style="font-family: 'JetBrains Mono'; color: #34d399;">$45 / mo</td>
            <td>Temporal clamping (±15 min around incident) saves &gt;99.5% tokens</td>
          </tr>
          <tr>
            <td>Sovereign GCS Vault (Delhi)</td>
            <td style="font-family: 'JetBrains Mono'; color: #34d399;">$35 / mo</td>
            <td>3-tier caching serves 92% requests from L1/L2 edge cache</td>
          </tr>
          <tr>
            <td>AlloyDB / Cloud Run Core</td>
            <td style="font-family: 'JetBrains Mono'; color: #34d399;">$120 / mo</td>
            <td>Auto-scaling and query caching on read-heavy safety queries</td>
          </tr>
          <tr style="font-weight: 700; background: rgba(59,130,246,0.15);">
            <td>Total Cloud Opex</td>
            <td style="font-family: 'JetBrains Mono'; color: #38bdf8;">~$200 / month</td>
            <td>Per operating division (e.g., NWR Bikaner)</td>
          </tr>
        </table>
      </div>
      <div class="card">
        <h3 class="card-title" style="color: #34d399;">📈 Compounding Safety & Labor ROI</h3>
        <div class="card-body">
          <ul>
            <li><strong>75% Rake Inspection Labor Savings:</strong> Reduces 58-wagon freight rake examination from 8 hours to &lt;2 hours, saving <strong>₹1.4 Cr annually per depot</strong> in turnaround delays.</li>
            <li><strong>SPAD Accident Avoidance:</strong> Preventing a single SPAD or side-collision saves upwards of <strong>₹15–50 Cr ($2M–$6M)</strong> in rolling stock destruction, track downtime, and litigation.</li>
            <li><strong>Section 63 Evidence Recovery:</strong> Disputed freight siding damage claims resolved in seconds with incontrovertible gantry laser delta proof.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 10 / 13</span>
  </div>
</section>

<!-- SLIDE 11: SNAPSHOTS OF THE PROTOTYPE -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>Snapshots of the Working Prototype</h2>
      <p>Fully Built, Containerized, and Validated across Real Railway Datasets</p>
    </div>
    <span class="badge-tag">Prototype Verification</span>
  </div>
  <div class="content-area">
    <div class="grid-2">
      <div class="card">
        <h4 style="font-size: 11pt; color: #38bdf8; margin-bottom: 6px;">Snapshot A: Flagged Radio Audio Playback & Custody Hash</h4>
        <div style="background: rgba(0,0,0,0.6); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 9pt; color: #cbd5e1;">
          <span style="color: #60a5fa;">[03:14:15]</span> <span style="color: #f97316;">VHF CH-02 (SOG-BKN):</span> "सर ध्यान दीजिए! सामने होम सिग्नल लाल है!"<br>
          <span class="pill pill-green">Denoised: 94%</span> <span class="pill pill-blue">+18.2 dB Gain</span> <span class="pill pill-amber">Fail-Open: OK</span><br>
          <span style="color: #94a3b8; font-size: 8pt;">SHA-256: 8e58dffb68581365... • Stored: gs://railkavach/audio/ • Source: L2_SSD_CACHE (1.8ms)</span>
        </div>
        <h4 style="font-size: 11pt; color: #38bdf8; margin-top: 14px; margin-bottom: 6px;">Snapshot B: Synchronized Multimodal Incident Timeline</h4>
        <div style="background: rgba(0,0,0,0.6); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 9pt; color: #cbd5e1;">
          03:14:02 ➔ Locate Cam: MOBILE_PHONE (0.94 conf, 28 sec duration)<br>
          03:14:15 ➔ Railcomm VHF: Emergency Callout by Assistant Loco Pilot<br>
          03:14:24 ➔ Telemetry: RS Valve Tripped • BP: 5.0 ➔ 0.0 kg/cm² • Train Halted 60m Prior
        </div>
      </div>
      <div class="card">
        <h4 style="font-size: 11pt; color: #38bdf8; margin-bottom: 6px;">Snapshot C: WDD Gantry Scan & 1-Click Sick-Line Order</h4>
        <div style="background: rgba(0,0,0,0.6); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 9pt; color: #cbd5e1;">
          Wagon Serial: <strong style="color: #fff;">BOXNHL 22011945123</strong> (Wagon #14)<br>
          Defects Detected: <span style="color: #f87171;">CRITICAL: Inner coil spring fractured on Bogie #2</span><br>
          Transit Delta: <span style="color: #fb923c;">NEW DAMAGE sustained between Suratgarh and Lalgarh</span><br>
          Action: <span class="pill pill-green">Sick-line order issued • Routed to Bikaner Workshop</span>
        </div>
        <h4 style="font-size: 11pt; color: #38bdf8; margin-top: 14px; margin-bottom: 6px;">Snapshot D: Section 63 BSA 2023 Digital Certificate</h4>
        <div style="background: rgba(0,0,0,0.6); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 9pt; color: #34d399;">
          CERTIFICATE UNDER SECTION 63(4), BHARATIYA SAKSHYA ADHINIYAM, 2023<br>
          Electronic Record: LOCATE_CABIN_031402.png (SHA-256: 4a2bb23c91...)<br>
          Custody Status: Verified • Device: CVVRS Edge Unit #NWR-BKN-089 • Token: VALID
        </div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 11 / 13</span>
  </div>
</section>

<!-- SLIDE 12: PROTOTYPE PERFORMANCE REPORT & BENCHMARKING -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>Prototype Performance Report & Benchmarking</h2>
      <p>Rigorous Engineering Metrics, Byte-Parity Audits, and Latency Profiling</p>
    </div>
    <span class="badge-tag">Engineering Rigor</span>
  </div>
  <div class="content-area">
    <table class="bench-table" style="margin-bottom: 0.3in;">
      <tr>
        <th>Performance Dimension</th>
        <th>Industry Baseline</th>
        <th>RailKavach Benchmark</th>
        <th>Verification Standard</th>
      </tr>
      <tr>
        <td><strong>Radio Denoising Gain</strong></td>
        <td>+6 to +8 dB SNR</td>
        <td style="color: #34d399; font-weight: 700;">+18.2 dB SNR gain</td>
        <td>PESQ / STOI acoustic speech clarity metrics</td>
      </tr>
      <tr>
        <td><strong>L1/L2 Edge Audio Latency</strong></td>
        <td>400ms – 1,200ms</td>
        <td style="color: #34d399; font-weight: 700;">&lt;0.5ms (L1) / &lt;2ms (L2)</td>
        <td>In-Memory LRU + NVMe SSD edge caching hierarchy</td>
      </tr>
      <tr>
        <td><strong>Wagon OCR Accuracy</strong></td>
        <td>88.0% – 91.5%</td>
        <td style="color: #34d399; font-weight: 700;">98.4% Confidence</td>
        <td>PaddleOCR + Contrast-Adaptive Gantry Enhancer</td>
      </tr>
      <tr>
        <td><strong>GCS Cloud Integrity</strong></td>
        <td>Partial cloud sync</td>
        <td style="color: #34d399; font-weight: 700;">100% Byte Parity</td>
        <td>2,942 / 2,942 files verified (Audio, Cabin, WDD)</td>
      </tr>
      <tr>
        <td><strong>Test Suite Reliability</strong></td>
        <td>Manual test runs</td>
        <td style="color: #34d399; font-weight: 700;">70 / 70 Pytest Passing</td>
        <td>Automated unit, custody, voice, and API test suite</td>
      </tr>
    </table>
    <div class="grid-3">
      <div class="card" style="text-align: center; padding: 14px;">
        <div class="stat-val" style="color: #34d399;">100%</div>
        <div class="stat-label">Byte-Level Parity on GCS</div>
      </div>
      <div class="card" style="text-align: center; padding: 14px;">
        <div class="stat-val" style="color: #38bdf8;">0.4 ms</div>
        <div class="stat-label">Average L1 Cache Latency</div>
      </div>
      <div class="card" style="text-align: center; padding: 14px;">
        <div class="stat-val" style="color: #fb923c;">70 / 70</div>
        <div class="stat-label">Automated Tests Passing</div>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 12 / 13</span>
  </div>
</section>

<!-- SLIDE 13: ADDITIONAL DETAILS & FUTURE DEVELOPMENT -->
<section class="slide">
  <div class="header">
    <div class="title-group">
      <h2>Additional Details & Future Development</h2>
      <p>Strategic Roadmap for Pan-India Zonal Railway Modernization</p>
    </div>
    <span class="badge-tag">Roadmap 2026–2027</span>
  </div>
  <div class="content-area">
    <div class="grid-3">
      <div class="card card-highlight">
        <div class="pill pill-green" style="margin-bottom: 8px;">PHASE 1 (CURRENT)</div>
        <h3 class="card-title">Divisional Pilot (NWR)</h3>
        <div class="card-body">
          <ul>
            <li>Active deployment across North Western Railway Bikaner Division.</li>
            <li>Operationalizing 3-pillar data ingestion (Railcomm, Locate, WDD).</li>
            <li>Zero-Local DPDP compliance and Section 63 BSA legal certification active.</li>
          </ul>
        </div>
      </div>
      <div class="card">
        <div class="pill pill-blue" style="margin-bottom: 8px;">PHASE 2 (Q3-Q4 2026)</div>
        <h3 class="card-title">Zonal ERP & FOIS Integration</h3>
        <div class="card-body">
          <ul>
            <li>Direct API connectors into Indian Railways FOIS (Freight Operations Information System) and ICMS.</li>
            <li>Automated sick-line scheduling in workshop management systems.</li>
            <li>Rollout across Northern (NR) and Western (WR) railway zones.</li>
          </ul>
        </div>
      </div>
      <div class="card">
        <div class="pill pill-orange" style="margin-bottom: 8px;">PHASE 3 (2027+)</div>
        <h3 class="card-title">Kavach TCAS Cross-Coupling</h3>
        <div class="card-body">
          <ul>
            <li>Bi-directional telemetric link with India's indigenous Kavach TCAS (Train Collision Avoidance System).</li>
            <li>Multi-modal cabin fatigue detection can trigger automated brake pipe exhaust override if pilot is incapacitated.</li>
            <li>Pan-India sovereign safety cloud architecture.</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top: 0.3in; padding: 16px 24px; text-align: center;">
      <p style="font-size: 12pt; font-weight: 700; color: #f1f5f9;">
        Ready to deploy. Proven on real railway data. Legally admissible under Indian law.
      </p>
      <p style="font-size: 10pt; color: #94a3b8; margin-top: 4px;">
        AiSPRY Technologies • Contact: contact@aispry.com • Buildathon India 2026
      </p>
    </div>
  </div>
  <div class="footer">
    <span>AiSPRY Technologies • RailKavach Copilot</span>
    <span>Slide 13 / 13</span>
  </div>
</section>

</body>
</html>
"""

def generate():
    OUTPUT_HTML.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_HTML.write_text(HTML_CONTENT, encoding="utf-8")
    print(f"HTML presentation written to: {OUTPUT_HTML}")

    chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if not os.path.exists(chrome_bin):
        print("Chrome binary not found at default path. PDF cannot be rendered directly.")
        return

    cmd = [
        chrome_bin,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={OUTPUT_PDF}",
        str(OUTPUT_HTML)
    ]
    print("Compiling PDF via headless Chrome...")
    subprocess.run(cmd, check=True)
    size_kb = OUTPUT_PDF.stat().st_size / 1024
    print(f"PDF successfully generated: {OUTPUT_PDF} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    generate()
