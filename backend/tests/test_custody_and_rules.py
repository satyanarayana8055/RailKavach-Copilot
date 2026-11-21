"""Evidence custody (BSA §63), rule citations, and the audit view they feed."""
import pytest
from fastapi.testclient import TestClient

from app.custody import registry
from app.main import app
from app.statutes import extract

client = TestClient(app)
DSO = {"X-RailKavach-Role": "ROLE_SR_DSO"}
DME = {"X-RailKavach-Role": "ROLE_SR_DME"}
CREW = {"X-RailKavach-Role": "ROLE_CREW_CONTROLLER"}
CRS = {"X-RailKavach-Role": "ROLE_CRS"}


def _first(kind):
    return next(i for i in registry().items.values() if i["kind"] == kind)


# ---------------------------------------------------------------- custody

def test_registry_holds_all_three_streams():
    kinds = {i["kind"] for i in registry().items.values()}
    assert {"RAILCOMM", "LOCATE", "WDD"} <= kinds
    assert all(len(i["sha256"]) == 64 for i in registry().items.values())


def test_verify_recomputes_the_digest():
    item = _first("RAILCOMM")
    r = client.get(f"/api/evidence/{item['evidence_id']}/verify", headers=DSO)
    assert r.status_code == 200
    v = r.json()
    assert v["recorded_sha256"] == item["sha256"]
    if registry().path_of(item).is_file():
        assert v["status"] == "VERIFIED" and v["computed_sha256"] == item["sha256"]
    else:
        assert v["status"] == "FILE_UNAVAILABLE" and v["computed_sha256"] is None


def test_tampered_file_is_reported(tmp_path, monkeypatch):
    item = _first("LOCATE")
    fake = tmp_path / item["file"]
    fake.write_bytes(b"not the original frame")
    monkeypatch.setattr(type(registry()), "path_of", lambda self, it: fake)
    v = registry().verify(item["evidence_id"])
    assert v["status"] == "MISMATCH" and v["computed_sha256"] != item["sha256"]


def test_verify_respects_role_scope(isolated_audit_log):
    item = _first("RAILCOMM")
    assert client.get(f"/api/evidence/{item['evidence_id']}/verify", headers=DME).status_code == 403
    assert isolated_audit_log.entries(1)[0]["decision"] == "DENIED"


def test_unknown_evidence_is_404():
    assert client.get("/api/evidence/NOPE-1/verify", headers=DSO).status_code == 404


def test_certificate_is_a_signable_draft(isolated_audit_log):
    item = _first("WDD")
    r = client.get(f"/api/evidence/{item['evidence_id']}/certificate", headers=CRS)
    assert r.status_code == 200
    assert "attachment" in r.headers["content-disposition"]
    text = r.text
    assert "SECTION 63(4), BHARATIYA SAKSHYA ADHINIYAM, 2023" in text
    assert "PART A" in text and "PART B" in text and item["sha256"] in text
    assert text.startswith("DRAFT")
    assert isolated_audit_log.entries(1)[0]["endpoint"] == "/api/evidence/certificate"


def test_certificate_needs_a_signing_role():
    item = _first("LOCATE")
    assert client.get(f"/api/evidence/{item['evidence_id']}/certificate", headers=CREW).status_code == 403


def test_chat_citations_carry_custody_when_registered():
    r = client.post("/api/chat", json={"query": "Investigate safety events for Train 12414 near Suratgarh on 2026-11-18.", "language": "en"},
                    headers=DSO).json()
    bound = [c for c in r["citations"] if c.get("sha256")]
    assert bound, "expected at least one citation bound to a registered record"
    for c in bound:
        assert registry().items[c["evidence_id"]]["sha256"] == c["sha256"]
    # Citations that match nothing registered stay unbound: no invented digests.
    assert all(c.get("sha256") is None for c in r["citations"] if not c.get("evidence_id"))


# ---------------------------------------------------------------- rule citations

@pytest.mark.parametrize("text,expected", [
    ("Passing a signal at danger breaches G&SR 3.78 and Section 175 of the Railways Act.",
     {("G&SR 3.78/9.02", "IN_LIBRARY"), ("Railways Act s.175", "IN_LIBRARY")}),
    ("**The Railways Act, 1989 (Section 184):** endangering safety.", {("Railways Act s.184", "NOT_IN_LIBRARY")}),
    ("Calling out under G&SR 4.40/4.41; caution order per G&SR Rule 4.09.",
     {("G&SR 4.40/4.41", "IN_LIBRARY"), ("G&SR 4.09", "IN_LIBRARY")}),
    ("Per Safety Circular No. 2018/Safety(A&R)/19/19 phones must be off.", {("RB circular · in-cab phones", "IN_LIBRARY")}),
    ("Admissible under BSA Section 63; masked under Section 8 of the DPDP Act, 2023.",
     {("BSA s.63", "IN_LIBRARY"), ("DPDP s.8", "IN_LIBRARY")}),
    ("Train 12414 stopped at 03:14:48, 60 m before the Home Signal.", set()),
])
def test_rule_extraction(text, expected):
    assert {(r["label"], r["status"]) for r in extract(text)} == expected


def test_chat_returns_rules():
    r = client.post("/api/chat", json={"query": "Investigate safety events for Train 12414 near Suratgarh on 2026-11-18.", "language": "en"},
                    headers=DSO).json()
    assert isinstance(r["rules"], list)
    assert all(x["status"] in ("IN_LIBRARY", "NOT_IN_LIBRARY") for x in r["rules"])


def test_denied_answer_has_no_rules_or_custody():
    r = client.post("/api/chat", json={"query": "Audit entry-versus-exit wagon damage for freight rake BOXN-542.", "language": "en"},
                    headers=CREW).json()
    assert r["access"]["decision"] == "DENIED" and r["rules"] == [] and r["citations"] == []


def test_rule_library_endpoint():
    r = client.get("/api/rules", headers=CREW)
    assert r.status_code == 200 and len(r.json()["rules"]) >= 10
    assert client.get("/api/rules").status_code == 401


# ---------------------------------------------------------------- audit view

def test_audit_view_shows_chain_and_entries():
    client.post("/api/chat", json={"query": "Audit entry-versus-exit wagon damage for freight rake BOXN-542.", "language": "en"}, headers=CREW)
    r = client.get("/api/audit?limit=10", headers=DSO).json()
    assert r["chain"]["intact"] is True and r["chain"]["entries"] >= 1
    assert r["entries"][0]["decision"] == "DENIED"
    assert client.get("/api/audit", headers=CREW).status_code == 403
