"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE, ApiError, type Session } from "./api";

/* =====================================================================================================
 * Voice INPUT — record → server transcription (Gemini, Hindi/English/mixed, railway glossary).
 * The browser's own recogniser runs alongside for live captions and as the fallback when the server
 * can't transcribe (offline, quota). Stops by itself after the speaker goes quiet.
 * ===================================================================================================== */

export type VoiceState = "idle" | "listening" | "transcribing";
export type SpokenLang = "hi" | "en" | "mixed";

const SILENCE_MS = 1600; // quiet after speech → stop
const NO_SPEECH_MS = 7000; // nothing said at all → give up
const MAX_MS = 30000; // hard cap per question
const SPEECH_RMS = 0.035; // level that counts as speech (after noise suppression)

type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
const BrowserRec = (): (new () => Rec) | undefined => {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
};

const pickMime = () => {
  if (typeof MediaRecorder === "undefined") return "";
  return ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
};

const hasDevanagari = (t: string) => /[ऀ-ॿ]/.test(t);

export async function transcribeAudio(blob: Blob, session: Session, hint: "en" | "hi"): Promise<{ text: string; language: SpokenLang }> {
  const fd = new FormData();
  const ext = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm";
  fd.append("audio", blob, `question.${ext}`);
  fd.append("lang_hint", hint);
  const res = await fetch(`${API_BASE}/api/voice/transcribe`, {
    method: "POST",
    body: fd,
    headers: { "X-RailKavach-Role": session.role, "X-RailKavach-Purpose": session.purpose },
  });
  if (!res.ok) throw new ApiError(res.status, (await res.json().catch(() => null))?.detail ?? `Transcription failed (${res.status})`);
  return res.json();
}

type Live = {
  stream?: MediaStream;
  ctx?: AudioContext;
  rec?: MediaRecorder;
  sr?: Rec;
  chunks: Blob[];
  raf?: number;
  spoke: boolean;
  cancelled: boolean;
  finalText: string;
};

export function useVoiceInput(opts: {
  session: Session;
  hint: "en" | "hi";
  onFinal: (text: string, lang: SpokenLang) => void;
  onError: (msg: string) => void;
}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [level, setLevel] = useState(0);
  const [interim, setInterim] = useState("");
  const live = useRef<Live | null>(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const teardown = useCallback(() => {
    const l = live.current;
    if (!l) return;
    if (l.raf) cancelAnimationFrame(l.raf);
    try { l.sr?.abort(); } catch { /* already stopped */ }
    l.stream?.getTracks().forEach((t) => t.stop());
    l.ctx?.close().catch(() => undefined);
    setLevel(0);
  }, []);

  const stop = useCallback(() => {
    const l = live.current;
    if (l?.rec && l.rec.state !== "inactive") l.rec.stop(); // → onstop does the rest
  }, []);

  const cancel = useCallback(() => {
    if (!live.current) return;
    live.current.cancelled = true;
    stop();
  }, [stop]);

  const start = useCallback(async () => {
    if (live.current) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      return optsRef.current.onError("Voice input needs a browser with microphone access (Chrome, Edge or Safari)");
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
    } catch {
      return optsRef.current.onError("Microphone access was blocked. Allow it in the address bar and try again.");
    }

    const l: Live = { stream, chunks: [], spoke: false, cancelled: false, finalText: "" };
    live.current = l;
    setInterim("");
    setState("listening");

    // Level meter + end-of-speech detection.
    const ctx = new AudioContext();
    l.ctx = ctx;
    const an = ctx.createAnalyser();
    an.fftSize = 1024;
    ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Float32Array(an.fftSize);
    const t0 = performance.now();
    let lastVoice = t0;
    const tick = () => {
      an.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      setLevel(Math.min(1, rms * 9));
      const now = performance.now();
      if (rms > SPEECH_RMS) {
        l.spoke = true;
        lastVoice = now;
      }
      const quiet = now - lastVoice;
      if ((l.spoke && quiet > SILENCE_MS) || (!l.spoke && now - t0 > NO_SPEECH_MS) || now - t0 > MAX_MS) return stop();
      l.raf = requestAnimationFrame(tick);
    };
    l.raf = requestAnimationFrame(tick);

    // Live captions (and fallback text) from the browser recogniser, when it exists.
    const SR = BrowserRec();
    if (SR) {
      try {
        const sr = new SR();
        sr.lang = optsRef.current.hint === "hi" ? "hi-IN" : "en-IN";
        sr.continuous = true;
        sr.interimResults = true;
        sr.maxAlternatives = 1;
        sr.onresult = (e) => {
          let fin = "", tmp = "";
          for (let i = 0; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) fin += r[0].transcript;
            else tmp += r[0].transcript;
          }
          l.finalText = fin.trim();
          setInterim((fin + " " + tmp).trim());
        };
        sr.onerror = sr.onend = null;
        sr.start();
        l.sr = sr;
      } catch { /* captions are optional */ }
    }

    // Recording for the server.
    const mime = pickMime();
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 48000 } : undefined);
    l.rec = rec;
    rec.ondataavailable = (e) => e.data.size && l.chunks.push(e.data);
    rec.onstop = async () => {
      teardown();
      const { chunks, spoke, cancelled, finalText } = l;
      live.current = null;
      if (cancelled) return setState("idle");
      if (!spoke && !finalText) {
        setState("idle");
        return optsRef.current.onError("Didn't hear anything. Tap the mic and speak your question.");
      }
      setState("transcribing");
      const blob = new Blob(chunks, { type: rec.mimeType || mime || "audio/webm" });
      try {
        const r = await transcribeAudio(blob, optsRef.current.session, optsRef.current.hint);
        const text = r.text.trim() || finalText;
        if (!text) optsRef.current.onError("Couldn't make out the question. Please try again.");
        else optsRef.current.onFinal(text, r.text.trim() ? r.language : hasDevanagari(text) ? "hi" : "en");
      } catch (e) {
        // Refusals (401/403) are real errors; anything else → use the on-device transcript.
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) optsRef.current.onError(e.message);
        else if (finalText) optsRef.current.onFinal(finalText, hasDevanagari(finalText) ? "hi" : "en");
        else optsRef.current.onError("Voice service is unreachable. Please type your question.");
      } finally {
        setState("idle");
        setInterim("");
      }
    };
    rec.start(250);
  }, [stop, teardown]);

  useEffect(() => () => cancel(), [cancel]);

  return { state, level, interim, start, stop, cancel, toggle: () => (live.current ? stop() : start()) };
}

/* =====================================================================================================
 * Voice OUTPUT — browser speech synthesis, made dependable:
 * picks a Hindi or Indian-English voice by the text's script, speaks in sentence-sized chunks (Chrome stops
 * long utterances after ~15 s), and turns copilot shorthand into speakable words.
 * ===================================================================================================== */

let voices: SpeechSynthesisVoice[] = [];
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const load = () => (voices = window.speechSynthesis.getVoices());
  load();
  window.speechSynthesis.addEventListener?.("voiceschanged", load);
}

/** Natural / neural voices sound far clearer than the old compact ones. */
const quality = (v: SpeechSynthesisVoice) =>
  (/natural|neural|online|premium|enhanced/i.test(v.name) ? 4 : 0) + (/google/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1);
const best = (list: SpeechSynthesisVoice[]) => [...list].sort((a, b) => quality(b) - quality(a))[0];
const isLang = (v: SpeechSynthesisVoice, re: RegExp) => re.test(v.lang.replace("_", "-"));

/**
 * English is always spoken in an Indian accent:
 * 1) an en-IN voice (Edge "Neerja/Prabhat (Natural)", Windows "Heera/Ravi", macOS "Rishi"…), best quality first;
 * 2) otherwise a Hindi voice (Google हिन्दी, Lekha) — they read English text with an Indian accent;
 * 3) only then British / US English.
 */
function pickVoice(lang: "hi" | "en"): SpeechSynthesisVoice | undefined {
  const hindi = voices.filter((v) => isLang(v, /^hi\b/i));
  if (lang === "hi") return best(hindi);
  const indianEnglish = voices.filter((v) => isLang(v, /^en-IN$/i));
  return (
    best(indianEnglish) ??
    best(hindi) ??
    best(voices.filter((v) => isLang(v, /^en-GB$/i))) ??
    best(voices.filter((v) => isLang(v, /^en\b/i)))
  );
}

/** Short label for the voice that will read `lang`, e.g. "Indian English · Rishi". */
export function voiceLabel(lang: "hi" | "en" = "en"): string {
  const v = pickVoice(lang);
  if (!v) return lang === "hi" ? "Hindi" : "Indian English";
  const name = v.name.replace(/^(Microsoft|Google)\s+/i, "").replace(/\s*\(.*\)\s*$/, "").replace(/\s+Online.*$/i, "");
  const kind = lang === "hi" ? "Hindi" : isLang(v, /^en-IN$/i) || isLang(v, /^hi\b/i) ? "Indian English" : "English";
  return `${kind} · ${name}`;
}

/** Copilot markdown → something worth listening to. Keeps the opening of the answer (the verdict). */
export function speakable(md: string, maxChars = 900): string {
  let t = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[(\d{2}:\d{2})(?::\d{2})?\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^\s*[-•*]\s+/gm, "")
    .replace(/[*_`>|]/g, "")
    .replace(/\bkm\/h\b|\bkmph\b/gi, " kilometres per hour")
    .replace(/kg\/cm²/g, " kg per square centimetre")
    .replace(/G&SR/g, "G and S R")
    .replace(/§\s?(\d+)/g, "section $1")
    .replace(/→/g, " to ")
    .replace(/[·•]/g, ", ")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, ". ")
    .replace(/\s+/g, " ")
    .replace(/(\.\s*){2,}/g, ". ")
    .trim();
  if (t.length > maxChars) {
    const cut = t.slice(0, maxChars);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("। "), cut.lastIndexOf("? "));
    t = end > maxChars * 0.4 ? cut.slice(0, end + 1) : cut;
  }
  return t;
}

const chunk = (t: string): string[] =>
  (t.match(/[^.!?।]+[.!?।]*\s*/g) ?? [t]).reduce<string[]>((out, s) => {
    const last = out[out.length - 1];
    if (last && (last + s).length < 220) out[out.length - 1] = last + s;
    else out.push(s);
    return out;
  }, []);

let session = 0;
export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

export function stopSpeaking() {
  session++;
  if (canSpeak()) window.speechSynthesis.cancel();
}

export function pauseSpeaking() {
  if (canSpeak() && window.speechSynthesis.speaking) window.speechSynthesis.pause();
}

export function resumeSpeaking() {
  if (canSpeak()) window.speechSynthesis.resume();
}

/** Speak text in Hindi or English (chosen by script unless forced). Resolves when finished or stopped. */
export function speak(text: string, opts: { lang?: "hi" | "en"; onStart?: (voice: string) => void } = {}): Promise<void> {
  if (!canSpeak()) return Promise.reject(new Error("Speech output isn't supported in this browser"));
  stopSpeaking();
  const my = ++session;
  const body = speakable(text);
  const lang = opts.lang ?? (/[ऀ-ॿ]/.test(body) ? "hi" : "en");
  const voice = pickVoice(lang);
  const parts = chunk(body).filter((p) => p.trim());
  return new Promise((resolve) => {
    let i = 0;
    const next = () => {
      if (my !== session || i >= parts.length) return resolve();
      const u = new SpeechSynthesisUtterance(parts[i++].trim());
      // Tag English as en-IN even on a Hindi voice, so the engine keeps an Indian accent.
      u.lang = lang === "hi" ? voice?.lang ?? "hi-IN" : voice && isLang(voice, /^en-IN$/i) ? voice.lang : "en-IN";
      if (voice) u.voice = voice;
      u.rate = 0.95; // a touch slower: clearer for numbers, codes and station names
      if (i === 1) u.onstart = () => opts.onStart?.(voiceLabel(lang));
      u.onend = next;
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    };
    next();
  });
}
