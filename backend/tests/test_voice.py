"""Voice input endpoint: governed, validated, and fails over cleanly so the browser can use its own recogniser."""
from fastapi.testclient import TestClient

from app import voice
from app.main import app

client = TestClient(app)
DSO = {"X-RailKavach-Role": "ROLE_SR_DSO"}
CLIP = b"\x1aE\xdf\xa3" + b"\x00" * 4000  # webm-ish bytes, large enough to be sent on


def post(data=CLIP, mime="audio/webm", headers=DSO):
    return client.post("/api/voice/transcribe", files={"audio": ("q.webm", data, mime)}, data={"lang_hint": "en"}, headers=headers)


def test_requires_role():
    assert post(headers={}).status_code == 401


def test_rejects_non_audio():
    assert post(mime="text/plain").status_code == 415


def test_rejects_oversized():
    assert post(data=b"\x00" * (voice.MAX_BYTES + 1)).status_code == 413


def test_near_silent_clip_returns_empty_without_model_call(monkeypatch):
    monkeypatch.setattr(voice, "transcribe", lambda *a, **k: (_ for _ in ()).throw(AssertionError("should not be called")))
    r = post(data=b"\x00" * 200)
    assert r.status_code == 200 and r.json()["text"] == ""


def test_hindi_transcript_passes_through_and_is_audited(monkeypatch):
    monkeypatch.setattr(voice, "transcribe", lambda *a, **k: {"text": "गाड़ी 12414 कहाँ रुकी?", "language": "hi", "engine": "test"})
    r = post()
    assert r.status_code == 200 and r.json() == {"text": "गाड़ी 12414 कहाँ रुकी?", "language": "hi", "engine": "test"}
    log = client.get("/api/audit?limit=5", headers=DSO).json()["entries"]
    assert any(e["endpoint"] == "/api/voice/transcribe" for e in log)


def test_model_failure_is_503_so_browser_falls_back(monkeypatch):
    def boom(*a, **k):
        raise voice.VoiceUnavailable("quota")
    monkeypatch.setattr(voice, "transcribe", boom)
    assert post().status_code == 503
