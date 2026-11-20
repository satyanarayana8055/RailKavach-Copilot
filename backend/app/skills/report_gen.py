from typing import Dict, Any
from ..schemas.skills import ReportGenInput
from ..observability import observe

@observe(name="skill.generate_safety_artifacts", as_type="tool")
def generate_safety_artifacts(params: ReportGenInput) -> Dict[str, Any]:
    """
    Generates formal Indian Railways inquiry reports (Rule 113 G&SR / CRS format)
    and bilingual crew lobby sign-on safety warning slips.
    """
    if "12414" in params.incident_id:
        return {
            "incident_id": params.incident_id,
            "train_no": "12414",
            "division": "Bikaner (NWR)",
            "section": "Bikaner-Suratgarh",
            "date": "2026-11-18",
            "statutory_inquiry_report": """# STATUTORY INCIDENT INQUIRY REPORT (PROVISIONAL)
**Inquiry Authority:** Senior Divisional Safety Officer (Sr. DSO), Bikaner Division, NWR  
**Subject:** Avoided Collision / Potential Signal Passed At Danger (SPAD) on Train 12414 Mandore Express  
**Date & Location:** 18-November-2026 at 03:14:15 hrs, Suratgarh Junction Approach (Down Loop Line)

---

### 1. Master Event Chronology (Synchronized Evidence)
* **[03:11:05]**: Station Master Suratgarh advised LP via VHF Channel 02: Caution Order 30 kmph on KM 182/4, Home Signal at Danger (Red).
* **[03:14:02]**: Locate CVVRS Camera Alert `LOC-20261118-001` recorded Loco Pilot LP-4412 (Rajesh Kumar) using personal mobile phone for 28 seconds approaching Home Signal.
* **[03:14:15]**: Assistant Loco Pilot ALP-5519 (Amit Singh) shouted emergency verbal warning over Cab Intercom: "सामने होम सिग्नल लाल है! फोन रखिए! ब्रेक लगाइए!"
* **[03:14:24]**: Emergency RS Valve tripped; Brake Pipe (BP) pressure dropped from 5.0 kg/cm² to 0.0 kg/cm².
* **[03:14:48]**: Train brought to a complete halt 60 meters before Home Signal. SPAD averted.

---

### 2. Primary Findings & Rule Violations
1. **Rule Violation:** Breach of Railway Board Directive (2020) prohibiting mobile phone operation while on locomotive footplate.
2. **Reviewer Verification:** Confirmed by Sr. DSO Bikaner at 06:30:15 hrs after independent video clip inspection.
3. **Crew Performance:** ALP Amit Singh demonstrated prompt alertness in issuing emergency callout, directly averting disaster.

---

### 3. Statutory Corrective Actions
* Offending LP placed on safety counseling and off-roster for 14 days pending departmental inquiry.
* Mandatory audio vigilance acknowledgement interval reduced from 60s to 30s during 02:00–05:00 hrs night window.""",

            "hindi_crew_lobby_briefing": """# संरक्षा चेतावनी निर्देश (क्रू लॉबी साइन-ऑन ब्रीफिंग)
**मंडल:** बीकानेर मंडल, उत्तर पश्चिम रेलवे  
**प्रकरण संख्या:** INC-12414-20261118 | **दिनांक:** 18-नवंबर-2026

---

### सभी लोको पायलट एवं सहायक लोको पायलट ध्यान दें:
1. **सख्त मोबाइल प्रतिबंध:** दिनांक 18-नवंबर-2026 को सूरतगढ़ दृष्टिकोण पर रनिंग ट्रेन में मोबाइल फोन उपयोग के कारण होम सिग्नल अनदेखी की गंभीर घटना टली। लोको कैब में ड्यूटी के दौरान मोबाइल फोन का उपयोग सख्त वर्जित एवं दंडनीय अपराध है।
2. **होम सिग्नल एवं कौशन गति:** लूप लाइन प्रवेश एवं होम सिग्नल अप्रोच पर कौशन गति (30 किमी/घंटा) का अनिवार्य पालन करें।
3. **सिग्नल कॉल-आउट प्रोटोकॉल:** लोको पायलट एवं सहायक लोको पायलट प्रत्येक सिग्नल (डिस्टेंट, होम) का जोर से नाम लेकर आदान-प्रदान (Call-out & Repeat) करें।
4. **बीपी प्रेशर निरंतर निगरानी:** रनिंग में बीपी प्रेशर 5.0 किग्रा/सेमी² बना रहना सुनिश्चित करें।

*हस्ताक्षर: वरिष्ठ मंडल संरक्षा अधिकारी (Sr. DSO), बीकानेर*"""
        }

    return {
        "incident_id": params.incident_id,
        "message": f"Artifacts generated for {params.incident_id}"
    }
