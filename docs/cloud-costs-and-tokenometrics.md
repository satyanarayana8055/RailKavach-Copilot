# Tokenometrics & Cloud Cost Optimization — RailKavach Copilot

## 1. Executive Summary & Objective
In compliance with **Section 9 of the Master Engineering Prompt**, this document details the mathematical framework, architectural mechanisms, and cost models that govern token usage in **RailKavach Copilot**. 

Our engineering objective is to eliminate redundant token consumption, enforce bounded context windows, leverage hierarchical model routing, and maintain a zero-token fallback cache for a **> 98% reduction in token consumption and API operational expenditure**.

---

## 2. Mathematical Token Budget & Comparison Model

### Baseline (Naive Retrieval / Context Stuffing)
When investigating an operational incident across 8-hour shifts without tool-augmented slicing:
* **Audio Transcripts**: 8 hours $\times$ 1,200 lines/hr $\times$ ~15 tokens/line $\approx 144,000$ tokens.
* **Cabin Video Alerts**: 24 hours of CVVRS detection logs $\approx 45,000$ tokens.
* **Wagon Gantry Inspections**: 58-wagon rake inspection records $\approx 18,000$ tokens.
* **System Prompt & Historical Chat**: $\approx 4,000$ tokens.
$$\text{Total Input Tokens per Query} \approx 211,000 \text{ tokens}$$
$$\text{Cost per Query (Gemini 1.5 Pro @ \$1.25 / 1M tokens)} = 211,000 \times \$0.00000125 \approx \mathbf{\$0.2638}$$
$$\text{Cost for 10,000 inquiries/month} \approx \mathbf{\$2,638.00}$$

### RailKavach Optimized Pipeline (Agentic Skills + Bounded Horizons)
Under RailKavach Copilot's skill-based architecture:
* **Targeted Skill Call**: Retrieves only matching records within bounded window $\Delta t = [-15\text{m}, +5\text{m}]$.
* **Injected Context**:
  - Filtered Transcripts (15 relevant calls): $\approx 350$ tokens.
  - Correlated Video Alerts (3 records): $\approx 180$ tokens.
  - Correlated Wagon Defects (2 records): $\approx 120$ tokens.
  - System Instructions & Tool Definitions: $\approx 950$ tokens.
$$\text{Total Input Tokens per Query} \approx 1,600 \text{ tokens}$$
$$\text{Cost per Query (Gemini 1.5 Flash @ \$0.075 / 1M tokens)} = 1,600 \times \$0.000000075 \approx \mathbf{\$0.00012}$$
$$\text{Cost for 10,000 inquiries/month} \approx \mathbf{\$1.20}$$

$$\mathbf{\text{Net Cost Reduction}} = \frac{\$2,638.00 - \$1.20}{\$2,638.00} \times 100\% = \mathbf{99.95\%}$$

---

## 3. The 4 Token Reduction Architectural Pillars

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HIERARCHICAL MODEL ROUTER                       │
│                                                                        │
│   Incoming Query                                                       │
│         │                                                              │
│         ▼                                                              │
│   [Exact Hash Match?] ── YES ──> Zero-Latency Cache (0 Tokens, ~2ms)   │
│         │ NO                                                           │
│         ▼                                                              │
│   [Agent Skill Filter] ──> Extracts bounded context window (<1,600 tok)│
│         │                                                              │
│         ▼                                                              │
│   [Task Type?]                                                         │
│     ├── Interactive Chat / Timeline ──> Gemini 1.5 Flash ($0.075/1M)   │
│     ├── On-Premises Air-Gapped Cab  ──> Local Gemma 2B (0 Cloud Cost)  │
│     └── Formal Multi-Page CRS Doc   ──> Gemini 1.5 Pro ($1.25/1M)      │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Deterministic Fallback Cache (`cached_demo_responses.json`)
* Caches pre-validated inquiry responses, timeline synchronizations, and statutory reports for top recurring scenarios (e.g. Near-SPAD Suratgarh, 02:00–05:00 AM fatigue trend, Boxn wagon differential).
* **Token Cost**: 0 tokens.
* **Latency**: < 5ms.
* **Reliability**: 100% demo resilience even during conference Wi-Fi disconnection.

### 2. Bounded Temporal Windowing
* Inquiries calculate a strict temporal delta:
  $$t_{\text{incident}} - 15 \text{ minutes} \le t \le t_{\text{incident}} + 5 \text{ minutes}$$
* Transcripts and sensor feeds outside this window are pruned server-side before prompting the model.

### 3. Agent Tool Call Slicing
* Instead of letting the model read raw files, specialized Pydantic-validated skills fetch structured arrays directly from indexed JSON/PostgreSQL.
* Skills return compact JSON objects stripped of internal metadata.

### 4. Output Token Clamping
* Chat responses are clamped to `max_output_tokens: 1024` with strict prompt instructions:
  - Concise bullet points.
  - Compulsory timestamp formatting `[HH:MM:SS]`.
  - Zero polite conversational filler ("Certainly! I'd be happy to...").
* Statutory inquiry reports allow up to `max_output_tokens: 2048` only when specifically requested.

---

## 4. Operational Budget & Monitoring
* **Token Usage Metric**: Tracked per request (`prompt_tokens`, `candidates_tokens`, `total_tokens`).
* **Session Threshold**: An alert is logged if any single inquiry exceeds 4,000 total tokens.
* **Monthly Cap Simulation**: 50,000 automated investigations on Gemini 1.5 Flash consume under \$10.00/month.
