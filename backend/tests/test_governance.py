"""Server-side RBAC + DPDP rules (see app/governance.py)."""
import json

from fastapi.testclient import TestClient

from app.governance import PIIMasker, masker, required_sources
from app.main import app

client = TestClient(app)
SPAD = "Investigate safety events for Train 12414 near Suratgarh on 2026-11-18."
WAGON = "Audit entry-versus-exit wagon damage for freight rake BOXN-542."
SIGNAL = "Show all signal-related miscommunications, emergency callouts, and caution order exchanges on the Bikaner division during the shift on 18 Nov 2026."


def ask(query, role=None, purpose=None):
    h = {}
    if role:
        h["X-RailKavach-Role"] = role
    if purpose:
        h["X-RailKavach-Purpose"] = purpose
    return client.post("/api/chat", json={"query": query, "language": "en"}, headers=h)


# ---- identity ---------------------------------------------------------------------------
def test_chat_requires_a_role():
    r = ask(SPAD)
    assert r.status_code == 401


def test_unknown_role_and_purpose_rejected():
    assert ask(SPAD, role="ROLE_ADMIN").status_code == 403
    assert ask(SPAD, role="ROLE_SR_DSO", purpose="CURIOSITY").status_code == 400


def test_public_endpoints_stay_open():
    assert client.get("/api/health").status_code == 200
    assert client.get("/api/scenarios").status_code == 200
    assert client.get("/api/rbac/roles").status_code == 200


def test_data_endpoints_require_a_role():
    for path, body in [("/api/timeline", {"train_no": "12414"}), ("/api/skills/wdd", {}), ("/api/skills/railcomm", {}), ("/api/skills/locate", {})]:
        assert client.post(path, json=body).status_code == 401, path


# ---- scope (RBAC) ---------------------------------------------------------------------------
def test_wagon_engineer_cannot_open_crew_incident():
    data = ask(SPAD, role="ROLE_SR_DME").json()
    assert data["access"]["decision"] == "DENIED"
    assert set(data["access"]["sources_withheld"]) >= {"RAILCOMM", "LOCATE"}
    assert data["citations"] == []
    assert "not authorised" in data["answer"]


def test_wagon_engineer_can_audit_wagons():
    data = ask(WAGON, role="ROLE_SR_DME").json()
    assert data["access"]["decision"] == "ALLOWED"
    assert data["citations"] and all("WDD" in c["source"] for c in data["citations"])


def test_crew_controller_cannot_audit_wagons():
    assert ask(WAGON, role="ROLE_CREW_CONTROLLER").json()["access"]["decision"] == "DENIED"


def test_skill_endpoints_enforce_scope():
    h = {"X-RailKavach-Role": "ROLE_SR_DME"}
    assert client.post("/api/skills/wdd", json={}, headers=h).status_code == 200
    assert client.post("/api/skills/railcomm", json={}, headers=h).status_code == 403
    assert client.post("/api/skills/locate", json={}, headers=h).status_code == 403
    assert client.post("/api/timeline", json={"train_no": "12414"}, headers=h).status_code == 403


def test_file_inspector_scoped_by_file_type():
    h = {"X-RailKavach-Role": "ROLE_SR_DME"}
    assert client.post("/api/files/analyze", data={"filename": "g.jpg", "file_type": "jpg"}, headers=h).status_code == 200
    assert client.post("/api/files/analyze", data={"filename": "c.wav", "file_type": "wav"}, headers=h).status_code == 403
    crew = {"X-RailKavach-Role": "ROLE_CREW_CONTROLLER"}  # no 'files' tab at all
    assert client.post("/api/files/analyze", data={"filename": "c.wav", "file_type": "wav"}, headers=crew).status_code == 403


def test_only_verifiers_record_incidents():
    r = client.post("/api/incidents", json={"incident_id": "X"}, headers={"X-RailKavach-Role": "ROLE_CREW_CONTROLLER"})
    assert r.status_code == 403


# ---- DPDP masking ---------------------------------------------------------------------------
def _text(data):
    return json.dumps({k: data[k] for k in ("answer", "citations", "suggested_actions", "bilingual_payload")}, ensure_ascii=False)


def test_identities_masked_by_default_even_for_sr_dso():
    data = ask(SPAD, role="ROLE_SR_DSO").json()
    assert data["access"]["pii_masked"] is True
    text = _text(data)
    assert "Amit Singh" not in text and "Rajesh Kumar" not in text
    assert "[Crew-" in text


def test_authorised_role_with_inquiry_purpose_sees_identities():
    data = ask(SPAD, role="ROLE_SR_DSO", purpose="SAFETY_INQUIRY").json()
    assert data["access"]["pii_masked"] is False
    assert "Amit Singh" in _text(data)


def test_inquiry_purpose_does_not_unmask_unauthorised_role():
    data = ask(SIGNAL, role="ROLE_CREW_CONTROLLER", purpose="SAFETY_INQUIRY").json()
    assert data["access"]["decision"] == "ALLOWED"
    assert data["access"]["pii_masked"] is True


def test_skill_endpoint_output_is_masked():
    r = client.post("/api/skills/railcomm", json={}, headers={"X-RailKavach-Role": "ROLE_SR_DEE"})
    assert r.status_code == 200
    assert "Rajesh Kumar" not in r.text and "Amit Singh" not in r.text


def test_masker_is_consistent_and_covers_scripts_ids_and_contacts():
    m = PIIMasker(["Rajesh Kumar"], b"k")
    a, b = m.mask_text("LP Rajesh Kumar"), m.mask_text("Rajesh Kumar again")
    assert a.split()[1] == b.split()[0]  # same person → same pseudonym
    assert m.mask_text("राजेश बोल रहा हूँ").startswith("[कर्मी-")
    assert m.mask_text("राजेश कुमार")[len("[कर्मी-"):][:4] == m.token("Rajesh Kumar")  # Hindi ↔ English agree
    out = m.mask_text("LP-4412 call 9876543210 or lp@nwr.in, Aadhaar 1234 5678 9012")
    assert "4412" not in out and "9876543210" not in out and "lp@nwr.in" not in out and "1234 5678" not in out
    assert m.mask_text("Wagon BOXNHL 22011940001 at 03:14:15") == "Wagon BOXNHL 22011940001 at 03:14:15"


def test_dataset_speakers_are_known_to_masker():
    assert "V. Joshi" not in masker.mask_text("LP V. Joshi acknowledged")


# ---- accountability -------------------------------------------------------------------------
def test_every_decision_is_audited_and_chain_verifies(isolated_audit_log):
    ask(SPAD, role="ROLE_SR_DME")                               # denied
    ask(SPAD, role="ROLE_SR_DSO", purpose="SAFETY_INQUIRY")     # allowed, unmasked
    rows = isolated_audit_log.entries()
    assert [r["decision"] for r in rows[::-1]] == ["DENIED", "ALLOWED"]
    assert rows[0]["pii_unmasked"] is True and rows[0]["purpose"] == "SAFETY_INQUIRY"
    assert isolated_audit_log.verify()["intact"] is True


def test_audit_log_stores_masked_queries():
    ask("What did Rajesh Kumar say on VHF?", role="ROLE_SR_DEE")
    r = client.get("/api/audit", headers={"X-RailKavach-Role": "ROLE_CRS"}).json()
    assert "Rajesh Kumar" not in r["entries"][0]["query_masked"]


def test_tampering_breaks_the_chain(isolated_audit_log):
    ask(WAGON, role="ROLE_SR_DME")
    ask(WAGON, role="ROLE_SR_DME")
    lines = isolated_audit_log.path.read_text().splitlines()
    first = json.loads(lines[0]); first["decision"] = "DENIED"
    isolated_audit_log.path.write_text("\n".join([json.dumps(first)] + lines[1:]) + "\n")
    assert isolated_audit_log.verify() == {"intact": False, "entries": 0, "broken_at_seq": 1}


def test_audit_log_restricted_to_dso_and_crs():
    assert client.get("/api/audit", headers={"X-RailKavach-Role": "ROLE_CREW_CONTROLLER"}).status_code == 403
    assert client.get("/api/audit", headers={"X-RailKavach-Role": "ROLE_CRS"}).status_code == 200


def test_required_sources_classifier():
    assert required_sources(WAGON) == {"WDD"}
    assert {"RAILCOMM", "LOCATE"} <= required_sources(SPAD)
    assert "LOCATE" in required_sources("show fatigue trends")


# ---- public demo requests (consent) ----------------------------------------------------------
def test_demo_request_requires_consent_and_records_it(tmp_path, monkeypatch):
    import app.main
    monkeypatch.setattr(app.main, "_DEMO_LOG", tmp_path / "demo.jsonl")
    body = {"name": "Test", "organisation": "NWR", "email": "a@b.in", "interests": ["Locate"], "consent": False}
    assert client.post("/api/demo-requests", json=body).status_code == 400
    assert client.post("/api/demo-requests", json={**body, "consent": True, "email": "bad"}).status_code == 400
    r = client.post("/api/demo-requests", json={**body, "consent": True})
    assert r.status_code == 200 and r.json()["reference"].startswith("RK-")
    rec = json.loads((tmp_path / "demo.jsonl").read_text())
    assert rec["consent"]["given"] is True and rec["consent"]["version"] == "v1"
