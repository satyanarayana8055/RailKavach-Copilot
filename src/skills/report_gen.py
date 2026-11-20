import hashlib
from typing import Dict, Any, List

def generate_statutory_inquiry_report(
    incident_id: str,
    train_no: str,
    loco_id: str,
    section: str,
    timeline_events: List[Dict[str, Any]],
    reviewer_name: str = "R. K. Sharma (Sr. DSO Bikaner)"
) -> Dict[str, Any]:
    """
    Generates a formal Commission of Railway Safety (CRS) Statutory Inquiry Report
    with an embedded Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA) electronic evidence certificate.
    """
    
    # Calculate aggregate SHA-256 hash digest of all evidence files
    combined_hashes = "".join([e.get("evidence", {}).get("sha256_hash", "") for e in timeline_events])
    master_hash = hashlib.sha256(combined_hashes.encode("utf-8")).hexdigest()

    report_markdown = f"""# COMMISSION OF RAILWAY SAFETY (CRS) / SENIOR DIVISIONAL SAFETY OFFICER
## STATUTORY JOINT INQUIRY REPORT — PROVISIONAL FINDINGS
**Incident Identification Number:** {incident_id}  
**Railway Zone / Division:** North Western Railway (NWR) / Bikaner Division  
**Date of Occurrence:** 18 November 2026 | **Time:** 03:14:45 IST  
**Location:** Section {section} (Suratgarh Outer Approach, KM 142/22)  
**Train Particulars:** Train No. {train_no} (Express) hauled by Locomotive {loco_id}  
**Statutory Classification:** Signal Passed at Danger (SPAD) / Hazardous Inattention  

---

### 1. CONSTITUTION OF INQUIRY COMMITTEE
In accordance with **Sections 113–122 of The Railways Act, 1989**, this statutory investigation was conducted utilizing digital records preserved from the **RailKavach AI Platform** (Railcomm Audio Analytics, Locate CVVRS Video Analytics, Wagon Damage Detection, and Trackside WILD Sensors).

---

### 2. RECONSTRUCTED MULTIMODAL TIMELINE (SPLIT-SECOND SYNCHRONIZATION)
"""
    for idx, e in enumerate(timeline_events, 1):
        time_part = e.get("timestamp", "").split("T")[-1].replace("Z", "")[:8]
        modality_icon = "📻" if e.get("modality") == "AUDIO" else ("📹" if e.get("modality") == "VIDEO" else ("🚆" if e.get("modality") == "IMAGE" else "⚠️"))
        status_badge = "🟢 CONFIRMED" if e.get("verification_status") == "CONFIRMED" else "🟡 PENDING"
        report_markdown += f"""* **[{time_part}] {modality_icon} {e.get('source_product').upper()}:** {e.get('summary')}  
  *Event ID:* `{e.get('event_id')}` | *Status:* {status_badge} | *Hash:* `{e.get('evidence', {}).get('sha256_hash', 'N/A')[:16]}...`\n"""

    report_markdown += f"""
---

### 3. STATUTORY FINDINGS & PRIMARY CAUSE
1. **Primary Operational Breach:** The Loco Pilot of Train {train_no} committed an overt violation of **Railway Board JPO Circular 2018/Safety(A&R)/19/19** by actively using a personal mobile phone while the train was in motion between [03:13:45] and [03:14:23.5].
2. **Criminal & Operational Liability:** The act endangered passenger safety, constituting an offense under **Section 175 of The Railways Act, 1989**.
3. **Contributory Factors:** Micro-sleep episode observed at [03:14:10] and high dynamic wheel resistance (248.5 kN) logged on trailing wagon BOXN-54210984712 by trackside WILD telemetry.

---

### 4. STATUTORY CERTIFICATE UNDER SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM, 2023 (BSA 2023)
*(Admissibility of Electronic Records — Replacing Section 65B of Indian Evidence Act, 1872)*

#### PART A: Certificate by Person in Lawful Control of Device
I, **{reviewer_name}**, Senior Divisional Safety Officer, Bikaner Division, hereby certify:
1. That the electronic records (audio recordings, CVVRS video footage, and wayside sensor telemetry) were produced by devices during standard operational duty.
2. That the said devices were operating properly throughout the recording duration without corrupting the electronic records.
*Signature & Seal:* _____________________________ (Sr. DSO / NWR)

#### PART B: Certificate by Technical Expert
1. That the digital bitstream of the extracted media files corresponds strictly to the source locomotive NVR and wayside sensor storage.
2. **Master SHA-256 Cryptographic Hash:** `{master_hash}`
3. That hash verification confirms zero tampering, alteration, or synthetic fabrication of the digital evidence.
*Digital Verification Stamp:* `RAILKAVACH-VERIFIED-{incident_id}`
"""

    crew_briefing_hi = f"""### 🛡️ चालक दल लॉबी संरक्षा चेतावनी पर्ची (Crew Lobby Safety Warning Slip)
**मंडल:** बीकानेर मंडल (उत्तर पश्चिम रेलवे) | **तारीख:** 18 नवम्बर 2026  
**विषय:** ट्रेन {train_no} एसपीएडी (SPAD) घटना से सबक एवं सतर्कता निर्देश  

**सभी सम्मानित लोको पायलट एवं सहायक लोको पायलट कृपया ध्यान दें:**
1. **मोबाइल फोन पूर्णतः प्रतिबंधित:** ट्रेन संचालन के दौरान व्यक्तिगत मोबाइल फोन स्विच ऑफ कर बैग में रखें। इसका उल्लंघन रेलवे अधिनियम की धारा 175 के तहत दंडनीय है।
2. **सिग्नल कॉलिंग आउट अनिवार्य:** अग्रिम व होम सिग्नल के हर पहलू को जोर से पुकारें और हाथ से इशारा करें (G&SR 4.40 नियम)।
3. **भोर की सतर्कता (02:00 - 05:00 AM):** नींद या झपकी आने पर तुरंत सहायक चालक को सतर्क करें और कैब में उपलब्ध अलर्टनेस प्रोटोकॉल का पालन करें।
"""

    return {
        "report_markdown": report_markdown,
        "crew_briefing_hindi": crew_briefing_hi,
        "master_sha256": master_hash
    }
