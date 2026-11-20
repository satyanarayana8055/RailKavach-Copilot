import pytest
from app.skills.railcomm_search import search_railcomm_transcripts
from app.skills.locate_violations import get_locate_cabin_violations
from app.skills.wdd_damage import get_wdd_wagon_damages
from app.skills.timeline_sync import build_incident_timeline
from app.skills.report_gen import generate_safety_artifacts
from app.skills.pattern_anomaly import analyze_safety_patterns
from app.schemas.skills import (
    RailcommSearchInput, LocateViolationsInput, WddDamagesInput,
    TimelineSyncInput, ReportGenInput, PatternAnomalyInput
)
from app.schemas.evidence import ViolationType, ReviewerStatus

def test_railcomm_search_by_keyword():
    results = search_railcomm_transcripts(RailcommSearchInput(keyword="लाल सिग्नल"))
    assert len(results) >= 1
    assert any("लाल सिग्नल" in r["transcript_hi"] for r in results)

def test_railcomm_search_by_train():
    results = search_railcomm_transcripts(RailcommSearchInput(train_no="12414"))
    assert len(results) >= 5
    # Verify fail-open field exists on all records
    assert all("fail_open_bypassed" in r for r in results)

def test_locate_violations_filtering():
    # Only mobile phone violations
    results = get_locate_cabin_violations(LocateViolationsInput(
        violation_type=ViolationType.MOBILE_PHONE
    ))
    assert len(results) >= 1
    assert all(r["violation_type"] == "MOBILE_PHONE" for r in results)

def test_locate_compliant_suppression():
    # Verify compliant activities are recorded with proper flag
    all_alerts = get_locate_cabin_violations(LocateViolationsInput())
    compliant = [a for a in all_alerts if a.get("is_compliant_activity")]
    assert len(compliant) >= 2
    assert any(c["violation_type"] == "WALKIE_TALKIE" for c in compliant)

def test_wdd_wagon_damage_transit_delta():
    # Only wagons with newly sustained transit damage
    results = get_wdd_wagon_damages(WddDamagesInput(new_damage_only=True))
    assert len(results) >= 2
    assert all(r["delta_transit_damage"] is True for r in results)

def test_timeline_synchronization():
    timeline = build_incident_timeline(TimelineSyncInput(train_no="12414"))
    assert len(timeline) >= 5
    # Must include both audio and video sources
    sources = set(e["source"] for e in timeline)
    assert "RAILCOMM_AUDIO" in sources
    assert "LOCATE_CABIN_CAM" in sources

def test_report_generation():
    report = generate_safety_artifacts(ReportGenInput(incident_id="INC-12414-20261118"))
    assert "statutory_inquiry_report" in report
    assert "hindi_crew_lobby_briefing" in report
    assert "03:14:15" in report["statutory_inquiry_report"]
    assert "सूरतगढ़" in report["hindi_crew_lobby_briefing"]

def test_pattern_anomaly():
    analytics = analyze_safety_patterns(PatternAnomalyInput())
    assert "night_shift_fatigue_cluster" in analytics
    assert analytics["night_shift_fatigue_cluster"]["window"] == "02:00 - 05:00 AM"
