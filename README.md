# RailKavach Copilot 🚆🛡️
> **Gemini-Powered Safety Investigation Copilot for Indian Railways**  
> *Developed for Startup Buildathon India 2026 (Google DeepMind × Google Cloud × Hack2skill)*

---

## 📌 Fast Navigation
* **[EVALUATION_GUIDE.md](file:///c:/Users/satya/OneDrive/Documents/Google-Buildathon/EVALUATION_GUIDE.md)**: Official evaluation matrix (30% Functional, 20% Architecture, 20% Google AI Depth) and scoring blueprint.
* **[skills.md](file:///c:/Users/satya/OneDrive/Documents/Google-Buildathon/skills.md)**: Agent Skills specification (Tool calling, Gemini function signatures, and prompts).
* **[initial.md](file:///c:/Users/satya/OneDrive/Documents/Google-Buildathon/initial.md)**: Original shortlist briefing, schedule, and team communications.

---

## 🎯 What is RailKavach Copilot?
Indian Railways safety officers (Sr DEE/TRO, crew controllers, zonal safety cells) currently inspect millions of lines of transcripts and hours of cab video manually to investigate near-misses and accidents.
At North Western Railway (NWR) alone, RailKavach currently processes **11,354 audio files**, **3.68M transcript lines**, and tracks **1,583 loco pilots**.

**RailKavach Copilot** adds an autonomous conversational intelligence layer on top:
1. **Multi-Source Evidence Grounding:** Correlates cab radio voice logs (Hindi/English), driver monitoring AI alerts (phone, drowsiness), and wagon defect sensors.
2. **Timestamp Citations:** Exact split-second references (`[03:14:15]`) for inquiry integrity.
3. **Bilingual Artifact Generation:** Instant drafting of statutory investigation reports and Hindi crew lobby sign-on briefings.
4. **Pattern & Fatigue Analytics:** Detects systemic risk clusters (e.g. 02:00–05:00 AM micro-sleep incidents on specific divisions).

---

## 🛠️ Google Tech Stack
* **Google Gemini API:** Long-context multimodal reasoning, bilingual summarization, and function calling.
* **Gemma:** On-premise, edge-compatible locomotive cab model for disconnected operations.
* **Google Agent Skills:** Modular skill architecture for transcript search, alert correlation, and report drafting.
* **Google Cloud:** Vertex AI, Cloud Run, BigQuery Vector Search, and Cloud Storage.
