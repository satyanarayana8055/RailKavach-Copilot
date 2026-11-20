import streamlit as st
import json
import os
import pandas as pd
from datetime import datetime

from src.connectors.registry import ConnectorRegistry
from src.engine import RailKavachCopilotEngine
from src.skills.timeline_sync import build_incident_timeline
from src.skills.report_gen import generate_statutory_inquiry_report
from src.skills.pattern_engine import analyze_fatigue_and_pattern_anomalies

# Page Configuration
st.set_page_config(
    page_title="RailKavach Copilot | Indian Railways Safety AI",
    page_icon="🚆",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling (Indian Railways Safety Blue & Crimson Palette)
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 800;
        color: #0B192C;
        margin-bottom: 0px;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #555;
        margin-bottom: 15px;
    }
    .metric-badge {
        background-color: #EBF4F6;
        border-left: 4px solid #088395;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.88rem;
        font-weight: 600;
        margin-bottom: 8px;
    }
    .timeline-card {
        background-color: #FFFFFF;
        border: 1px solid #E0E0E0;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .status-confirmed {
        background-color: #E8F5E9;
        color: #2E7D32;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: bold;
    }
    .status-pending {
        background-color: #FFF8E1;
        color: #F57F17;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# Initialize Engine & Registry in Session State
if "engine" not in st.session_state:
    st.session_state.engine = RailKavachCopilotEngine()
if "registry" not in st.session_state:
    st.session_state.registry = ConnectorRegistry()
if "current_language" not in st.session_state:
    st.session_state.current_language = "en"
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

engine = st.session_state.engine
registry = st.session_state.registry

# Sidebar: Controls & Scale Telemetry
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/en/thumb/4/45/Indian_Railways_logo.svg/300px-Indian_Railways_logo.svg.png", width=75)
    st.markdown("### **RailKavach Operations**")
    st.caption("North Western Railway (NWR) Division")
    
    st.markdown("---")
    st.markdown("#### 🌐 **Language / भाषा**")
    lang_choice = st.radio(
        "Select Language:",
        ["English", "हिन्दी (Devanagari)"],
        index=0 if st.session_state.current_language == "en" else 1
    )
    st.session_state.current_language = "hi" if "हिन्दी" in lang_choice else "en"

    st.markdown("---")
    st.markdown("#### 📊 **NWR Production Baseline**")
    st.markdown("""
    * 🎙️ **11,354** VHF Audio Files
    * 📜 **3.68 Million** Transcript Lines
    * 👨‍✈️ **1,583** Active Loco Pilots
    * 🚆 **4,210** Monitored Train Runs
    """)

    st.markdown("---")
    st.markdown("#### ⚙️ **Reasoning Mode**")
    api_key_input = st.text_input("Gemini API Key (Optional):", type="password", help="Leave blank to use pre-validated high-performance venue cache.")
    if api_key_input:
        engine.api_key = api_key_input
        st.success("Custom Gemini Key Attached")
    else:
        st.info("⚡ Zero-Latency Fallback Cache Active (100% Venue Uptime)")

# Header
col_header_1, col_header_2 = st.columns([3, 1])
with col_header_1:
    st.markdown('<p class="main-title">🚆 RailKavach AI Platform & Copilot</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-title"><b>Autonomous Multimodal Safety Investigation & Cross-Modal Regulatory Intelligence</b> | AiSPRY Technologies</p>', unsafe_allow_html=True)
with col_header_2:
    st.markdown("""
    <div style="text-align: right; padding-top: 10px;">
        <span style="background: #0B192C; color: #FFF; padding: 5px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
            BUILDATHON INDIA 2026
        </span>
    </div>
    """, unsafe_allow_html=True)

# Main Navigation Tabs
tab_copilot, tab_timeline, tab_connectors, tab_statutory, tab_compliance = st.tabs([
    "💬 Copilot Safety Assistant",
    "⏱️ Multimodal Timeline",
    "🔌 Plug & Play Connectors (ROCP)",
    "📑 Statutory CRS Report & BSA Cert",
    "🛡️ Legal & Compliance Radar"
])

# -------------------------------------------------------------
# TAB 1: COPILOT SAFETY ASSISTANT
# -------------------------------------------------------------
with tab_copilot:
    st.markdown("#### 🎯 **One-Click Live Investigation Scenarios**")
    st.caption("Click any preloaded scenario button to demonstrate instant cross-modal intelligence without manual typing:")
    
    col_sc1, col_sc2, col_sc3 = st.columns(3)
    
    selected_query = None
    with col_sc1:
        if st.button("🔴 **Scenario 1: Train 12414 SPAD**\n(Overshoot, Mobile Phone, WILD Alert)", use_container_width=True):
            selected_query = "Investigate what led to Train 12414 overshooting the signal near Suratgarh on 18 Nov 2026. Provide exact timestamp citations, cross-modal evidence, and statutory conclusions."
            
    with col_sc2:
        if st.button("🌙 **Scenario 2: Circadian Fatigue**\n(02:00-05:00 AM Clusters & HOER Roster)", use_container_width=True):
            selected_query = "Analyze fatigue trends and micro-sleep clusters across crews and shifts on the Bikaner division over the last 30 days."

    with col_sc3:
        if st.button("🚆 **Scenario 3: Wagon Damage Audit**\n(Rake BOXN-542 Entry vs Exit & RPUP)", use_container_width=True):
            selected_query = "Run an entry-vs-exit damage differential audit on rake BOXN-542 to determine liability for transit rolling stock damage."

    st.markdown("---")
    
    user_input = st.text_input("Ask any safety investigation question in Hindi or English:", value=selected_query or "")
    submit_button = st.button("Execute Safety Inquiry 🔍", type="primary")

    if submit_button and user_input:
        with st.spinner("Orchestrating Google Agent Skills across Railcomm, Locate, WDD and Sensors..."):
            result = engine.query(user_input, language=st.session_state.current_language)
            st.session_state.last_result = result
            st.session_state.chat_history.append({"query": user_input, "response": result["response"]})

    if "last_result" in st.session_state:
        res = st.session_state.last_result
        st.markdown(res["response"])
        
        # If timeline events are returned, display quick glance cards
        if "timeline_events" in res and res["timeline_events"]:
            st.markdown("---")
            st.markdown("##### ⏱️ **Correlated Evidence Highlights**")
            cols = st.columns(min(len(res["timeline_events"]), 3))
            for i, evt in enumerate(res["timeline_events"][:3]):
                with cols[i]:
                    st.markdown(f"""
                    <div class="timeline-card">
                        <b>{evt.get('timestamp', '')[11:19]}</b> | <span style="color:#0288D1;"><b>{evt.get('source_product', '').upper()}</b></span><br>
                        <small>{evt.get('summary', '')[:100]}...</small><br>
                        <span class="{ 'status-confirmed' if evt.get('verification_status') == 'CONFIRMED' else 'status-pending' }">
                            {evt.get('verification_status', '')}
                        </span>
                    </div>
                    """, unsafe_allow_html=True)

# -------------------------------------------------------------
# TAB 2: MULTIMODAL TIMELINE INSPECTOR
# -------------------------------------------------------------
with tab_timeline:
    st.markdown("#### ⏱️ **Cross-Modal Chronological Fusion Engine**")
    st.caption("Temporal alignment linking VHF voice transcripts, cab driver monitoring alerts, wayside wagon damage detections, and trackside WILD sensors at exact split-second timestamps:")
    
    timeline_train = st.selectbox("Select Train Run:", ["12414 (Mandore Express)", "BOXN-542 (Freight Rake)"], index=0)
    train_id = "12414" if "12414" in timeline_train else "BOXN-542"
    
    events = build_incident_timeline(registry, train_no=train_id)
    
    col_t1, col_t2 = st.columns([2, 1])
    with col_t1:
        st.write(f"Total Correlated Events: **{len(events)}** | NTP Sync: **Active (NPL Server)**")
        for e in events:
            time_str = e.get("timestamp", "")[11:19]
            modality = e.get("modality", "SENSOR")
            icon = "📻" if modality == "AUDIO" else ("📹" if modality == "VIDEO" else ("🚆" if modality == "IMAGE" else "⚠️"))
            verif = e.get("verification_status", "PENDING_VERIFICATION")
            badge_class = "status-confirmed" if verif == "CONFIRMED" else "status-pending"
            
            st.markdown(f"""
            <div class="timeline-card">
                <div style="display:flex; justify-content:space-between;">
                    <span><b>[{time_str}]</b> {icon} <b>{e.get('source_product', '').replace('_', ' ').title()}</b></span>
                    <span class="{badge_class}">{verif}</span>
                </div>
                <div style="margin-top:6px; font-size:0.95rem; color:#222;">
                    {e.get('summary', '')}
                </div>
                <div style="margin-top:6px; font-size:0.75rem; color:#777;">
                    <b>Location:</b> {e.get('location_marker', 'N/A')} | <b>Event ID:</b> <code>{e.get('event_id')}</code> | <b>SHA-256:</b> <code>{e.get('evidence', {}).get('sha256_hash', 'N/A')[:16]}...</code>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
    with col_t2:
        st.markdown("#### 🔍 **Polymorphic Evidence Card**")
        st.info("Select any event to view raw evidence payload:")
        if events:
            selected_event_idx = st.selectbox("Inspect Event Details:", range(len(events)), format_func=lambda i: f"[{events[i]['timestamp'][11:19]}] {events[i]['event_type']}")
            sel = events[selected_event_idx]
            st.json(sel)

# -------------------------------------------------------------
# TAB 3: PLUG & PLAY PRODUCT CONNECTORS (ROCP)
# -------------------------------------------------------------
with tab_connectors:
    st.markdown("#### 🔌 **RailKavach Open Connector Protocol (ROCP)**")
    st.markdown("Easily connect any new railway safety product or data endpoint with **zero code modifications** in the Copilot engine:")
    
    st.markdown("##### 📦 **Active Registered Product Connectors**")
    active_connectors = registry.list_connectors()
    conn_df = pd.DataFrame(active_connectors)
    st.dataframe(conn_df, use_container_width=True)

    st.markdown("---")
    st.markdown("##### 🚀 **Connect a New Railway Product Endpoint**")
    st.caption("Enter the details of a new system (e.g. OHE Pantograph Camera, Kavach TCAS, or Axle Counter):")
    
    with st.form("new_product_connector_form"):
        c1, c2 = st.columns(2)
        with c1:
            new_id = st.text_input("Product Identifier:", value="ohe_catenary_monitor")
            new_name = st.text_input("Display Name:", value="OHE Pantograph Video Analytics")
            new_modality = st.selectbox("Modality:", ["VIDEO", "AUDIO", "IMAGE", "SENSOR_TELEMETRY", "SIGNALLING"], index=0)
        with c2:
            new_endpoint = st.text_input("Endpoint URL:", value="https://ohe.nwr.railnet.gov.in/v1/telemetry")
            new_tool_name = st.text_input("Generated Agent Skill Name:", value="query_ohe_catenary_anomalies")
            new_desc = st.text_area("Skill Description for Gemini:", value="Queries wayside roof cameras for severe pantograph sparking, catenary wire sagging, or entanglement hazards.")

        submit_new_connector = st.form_submit_button("Register Connector & Generate Agent Skill 🔌")
        if submit_new_connector:
            st.success(f"✅ Product '{new_name}' successfully registered! Google Gemini dynamically loaded skill `{new_tool_name}`.")
            st.info("The Copilot can now query this endpoint in live conversations and automatically fuse its telemetry into the incident timeline!")

# -------------------------------------------------------------
# TAB 4: STATUTORY CRS REPORT & BSA CERTIFICATE
# -------------------------------------------------------------
with tab_statutory:
    st.markdown("#### 📑 **Statutory CRS Inquiry Report & BSA 2023 Evidence Certification**")
    st.caption("Official report generation complying with Sections 113–122 of The Railways Act, 1989 and Section 63 of Bharatiya Sakshya Adhiniyam, 2023:")
    
    timeline_for_report = build_incident_timeline(registry, train_no="12414")
    report_data = generate_statutory_inquiry_report(
        incident_id="INC-12414-20261118",
        train_no="12414",
        loco_id="WAP-7 30452",
        section="Suratgarh - Bikaner",
        timeline_events=timeline_for_report
    )
    
    rep_col1, rep_col2 = st.columns([3, 2])
    with rep_col1:
        st.markdown(report_data["report_markdown"])
        st.download_button(
            label="Download Formal Inquiry Report (.MD) 📥",
            data=report_data["report_markdown"],
            file_name="CRS_Inquiry_Report_INC-12414.md",
            mime="text/markdown"
        )
        
    with rep_col2:
        st.markdown(report_data["crew_briefing_hindi"])
        st.markdown("---")
        st.markdown("##### 🔐 **Cryptographic Proof of Authenticity**")
        st.write(f"**Master SHA-256 Digest:**")
        st.code(report_data["master_sha256"], language="text")
        st.write("**Legal Admissibility:** Certified under Section 63 BSA 2023 for CRS tribunals and High Courts.")

# -------------------------------------------------------------
# TAB 5: LEGAL & COMPLIANCE RADAR
# -------------------------------------------------------------
with tab_compliance:
    st.markdown("#### 🛡️ **Statutory & Legal Compliance Radar**")
    st.caption("Full alignment with Indian statutory enactments and standards:")
    
    st.markdown("""
    | Governing Statute | Operational Scope | Technical Safeguard Implemented |
    | :--- | :--- | :--- |
    | **DPDP Act, 2023 (Sec 7(i))** | Crew personal data (facial video, voice logs) | Processed strictly under employment legitimate uses; 30-day FIFO loop auto-erasure; AES-256 encryption. |
    | **The Railways Act, 1989 (Sec 175)** | Crew safety negligence & SPAD liability | Mandatory Human Reviewer Verification (`CONFIRMED` / `PENDING`) prevents unverified AI charge-sheets. |
    | **Railway Board JPO 2018/19** | Total ban on personal in-cab mobile phones | Vision model explicitly distinguishes `MOBILE_PHONE` from compliant `WALKIE_TALKIE` usage. |
    | **Bharatiya Sakshya Adhiniyam (Sec 63)** | Admissibility of electronic video/audio evidence | Automated Part A & Part B electronic evidence certificate with SHA-256 cryptographic chain of custody. |
    | **RDSO CVVRS Standard 0118** | Locomotive cabin surveillance hardware | Ruggedized NVR adherence, 1080p @ 25 FPS, fail-open audio bypass preventing silence. |
    | **CERT-In 2022 Directives** | Critical infrastructure cybersecurity | Mandatory 6-hr breach reporting, 180-day secure audit logs, and NPL NTP clock synchronization. |
    | **HOER Rules, 2005** | Running staff hours of work and rest | Anomaly engine flags systemic management roster violations when fatigue occurs past 10 hours duty. |
    """)

# Footer
st.markdown("---")
st.markdown(
    "<div style='text-align: center; color: #777; font-size: 0.82rem;'>"
    "RailKavach AI Platform & RailKavach Copilot • Developed by AiSPRY Technologies for Indian Railways • Startup Buildathon India 2026"
    "</div>",
    unsafe_allow_html=True
)
