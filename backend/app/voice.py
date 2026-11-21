"""
Copilot voice input: speech-to-text for Hindi, English and code-mixed (Hinglish) questions.

The browser records the officer's question and posts it here; Gemini transcribes it with a railway glossary,
so station names, train/rake numbers and rule codes come back in the form the Copilot's skills match on.
If transcription fails the caller gets 503 and the browser falls back to its own on-device recogniser.
"""
from __future__ import annotations

import json
import logging
from typing import Optional

from google.genai import types

from .config import DEFAULT_MODEL
from .engine import engine

log = logging.getLogger(__name__)

MAX_BYTES = 8 * 1024 * 1024  # ~4 min of Opus; a spoken question is a few seconds
ALLOWED_MIME = ("audio/webm", "audio/ogg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/mpeg", "audio/aac", "audio/flac")

GLOSSARY = (
    "Bikaner, Suratgarh, Lalgarh, Hanumangarh, Sri Ganganagar, NWR (North Western Railway), "
    "Loco Pilot (LP), Assistant Loco Pilot (ALP), Station Master (SM), Guard, Section Controller, Crew Controller, "
    "Sr. DSO, Sr. DEE, Sr. DME, CRS, SPAD, Home Signal, Distant Signal, Starter, caution order, T/409, "
    "G&SR 4.40, G&SR 4.09, G&SR 3.78, brake pipe (BP), RS valve, loop line, CVVRS, Railcomm, Locate, WDD, "
    "BOXN-542, BOXNHL, rake, wagon, gantry, Mandore Express, 12414, 12403, WAP-7, WAG-9, micro-sleep, fatigue, "
    "लोको पायलट, सहायक लोको पायलट, स्टेशन मास्टर, होम सिग्नल, कॉशन ऑर्डर, गाड़ी, डिब्बा, वैगन, रेक, सूरतगढ़, बीकानेर, लालगढ़"
)

PROMPT = f"""You transcribe a railway safety officer's spoken question to an AI copilot (Indian Railways, Bikaner division).

Rules:
- Write exactly what was said. Do not answer, translate, summarise or add words.
- Hindi words in Devanagari, English words in Latin script; keep code-mixed speech mixed as spoken.
- Write numbers as digits: train numbers (12414), rake ids (BOXN-542), caution orders (T/409), rules (G&SR 4.40), times (03:14).
- Prefer these terms when the audio matches them: {GLOSSARY}.
- If there is no intelligible speech, return an empty text.

language: "hi" if mostly Hindi, "en" if mostly English, "mixed" if both are substantial."""

SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "text": types.Schema(type=types.Type.STRING),
        "language": types.Schema(type=types.Type.STRING, enum=["hi", "en", "mixed"]),
    },
    required=["text", "language"],
)


class VoiceUnavailable(RuntimeError):
    """Transcription service is not reachable; the browser should use its local recogniser."""


def transcribe(audio: bytes, mime: str, hint: Optional[str] = None) -> dict:
    if engine.client is None:
        raise VoiceUnavailable("Gemini is not configured on this server")
    mime = (mime or "audio/webm").split(";")[0].strip().lower()
    prompt = PROMPT + (f"\nThe user's interface language is {'Hindi' if hint == 'hi' else 'English'}; they may still speak either." if hint in ("hi", "en") else "")
    try:
        resp = engine.client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=[types.Part.from_bytes(data=audio, mime_type=mime), prompt],
            config=types.GenerateContentConfig(
                temperature=0,
                response_mime_type="application/json",
                response_schema=SCHEMA,
            ),
        )
        data = json.loads(resp.text or "{}")
    except Exception as e:  # network, quota, malformed audio
        log.warning("voice transcription failed: %s", e)
        raise VoiceUnavailable(str(e)) from e
    text = " ".join((data.get("text") or "").split())
    lang = data.get("language") if data.get("language") in ("hi", "en", "mixed") else ("hi" if any("ऀ" <= ch <= "ॿ" for ch in text) else "en")
    return {"text": text, "language": lang, "engine": DEFAULT_MODEL}
