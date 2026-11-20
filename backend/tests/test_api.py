import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "WDD (Wagon Damage)" in data["platforms_connected"]

def test_preloaded_scenarios():
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) == 3
    assert scenarios[0]["id"] == "scenario_1"

def test_chat_cached_spad_scenario():
    response = client.post("/api/chat", json={
        "query": "Investigate safety events for Train 12414 near Suratgarh on 2026-11-18.",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["cached"] is True
    assert data["token_usage"]["total_tokens"] == 0
    assert len(data["citations"]) >= 4
    # Verify timestamp citation
    timestamps = [c["timestamp"] for c in data["citations"]]
    assert "03:14:15" in timestamps
    assert data["bilingual_payload"] is not None

def test_chat_fatigue_scenario():
    response = client.post("/api/chat", json={
        "query": "Show driver alertness and fatigue trends between 02:00 and 05:00 AM on Bikaner Division.",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["cached"] is True
    assert "micro-sleep" in data["answer"].lower()

def test_chat_signal_miscommunication_scenario():
    response = client.post("/api/chat", json={
        "query": "Show all signal-related miscommunications, emergency callouts, and caution order exchanges on the Bikaner division during the shift on 18 Nov 2026.",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["cached"] is True
    assert "caution order" in data["answer"].lower()
    assert len(data["citations"]) >= 4
    timestamps = [c["timestamp"] for c in data["citations"]]
    assert "03:11:05" in timestamps

def test_timeline_endpoint():
    response = client.post("/api/timeline", json={
        "train_no": "12414",
        "incident_id": "INC-12414-20261118"
    })
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 5

def test_report_endpoint():
    response = client.post("/api/report", json={
        "incident_id": "INC-12414-20261118",
        "format": "ALL",
        "language": "BILINGUAL_HI_EN"
    })
    assert response.status_code == 200
    data = response.json()
    assert "statutory_inquiry_report" in data
    assert "hindi_crew_lobby_briefing" in data


def test_file_analyzer_audio():
    response = client.post("/api/files/analyze", data={
        "filename": "cab_radio_suratgarh_031415.wav",
        "file_type": "wav"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "CAB_RADIO_AUDIO"
    assert data["critical_timestamp"] == "03:14:15"
    assert "Home Signal RED" in data["safety_keywords_detected"]

def test_file_analyzer_video():
    response = client.post("/api/files/analyze", data={
        "filename": "cvvrs_cab_driver_phone.mp4",
        "file_type": "mp4"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "IN_CAB_CVVRS_VIDEO"
    assert data["violation_detected"] == "MOBILE_PHONE"

def test_file_analyzer_gantry_image():
    response = client.post("/api/files/analyze", data={
        "filename": "wdd_gantry_fractured_spring.jpg",
        "file_type": "jpg"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "WDD_GANTRY_SCAN"
    assert "BOXNHL" in data["wagon_number_ocr"]


def test_rbac_roles_endpoint():
    response = client.get("/api/rbac/roles")
    assert response.status_code == 200
    roles = response.json()
    assert len(roles) == 5
    role_codes = [r["role"] for r in roles]
    assert "ROLE_SR_DSO" in role_codes
    assert "ROLE_CREW_CONTROLLER" in role_codes

def test_rbac_single_role():
    response = client.get("/api/rbac/roles/ROLE_SR_DSO")
    assert response.status_code == 200
    data = response.json()
    assert data["can_verify_alerts"] is True
    assert data["can_sign_crs_report"] is True
