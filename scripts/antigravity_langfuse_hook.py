#!/usr/bin/env python3
"""
Antigravity CLI → Langfuse: trace the development prompts you run in `agy`.

Registered as a passive PostInvocation / Stop hook (see scripts/install_antigravity_langfuse.sh).
On each call it reads the conversation's transcript JSONL, takes only the steps not yet sent,
and posts them to Langfuse's OpenTelemetry endpoint (/api/public/otel, OTLP/HTTP JSON):

  Session    = one Antigravity conversation
  Trace      = one prompt you typed (USER_INPUT) → final answer
  Generation = one model step (PLANNER_RESPONSE): model, tokens, thinking, tool calls
  Span       = one tool call, with its args and the result the agent saw (GENERIC step)

Guarantees:
  * Never blocks or alters the agent: prints `{}` at once, does the work in a detached child.
  * Never raises: any failure goes to ~/.cache/agy-langfuse/hook.log.
  * Secrets (API keys, tokens, private keys, passwords) are redacted before anything is sent.
  * Stdlib only — no venv needed.

Config (hooks don't inherit your shell env): ~/.config/agy-langfuse/env with
  LANGFUSE_PUBLIC_KEY=..., LANGFUSE_SECRET_KEY=..., LANGFUSE_BASE_URL=http://localhost:3100
Set AGY_LANGFUSE_DISABLED=1 in that file to pause tracing.
"""
from __future__ import annotations

import base64
import glob
import hashlib
import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

HOME = Path.home()
CONF = HOME / ".config/agy-langfuse/env"
CACHE = HOME / ".cache/agy-langfuse"
STATE = CACHE / "state.json"
LOG = CACHE / "hook.log"
BRAIN = HOME / ".gemini/antigravity/brain"
MAX_TEXT = 20_000

SECRET_PATTERNS = [
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----.*?-----END [A-Z ]*PRIVATE KEY-----", re.S), "[REDACTED_PRIVATE_KEY]"),
    (re.compile(r"\bAIza[0-9A-Za-z_\-]{30,}"), "[REDACTED_GOOGLE_KEY]"),
    (re.compile(r"\b(?:sk|pk)-lf-[0-9A-Za-z\-]{8,}"), "[REDACTED_LANGFUSE_KEY]"),
    (re.compile(r"\bsk-(?:ant-|proj-)?[0-9A-Za-z_\-]{20,}"), "[REDACTED_API_KEY]"),
    (re.compile(r"\b(?:ghp|gho|ghs|ghu)_[0-9A-Za-z]{30,}|\bgithub_pat_[0-9A-Za-z_]{30,}"), "[REDACTED_GITHUB_TOKEN]"),
    (re.compile(r"\bya29\.[0-9A-Za-z_\-]{20,}"), "[REDACTED_OAUTH_TOKEN]"),
    (re.compile(r"(?i)\b(bearer)\s+[0-9A-Za-z._\-]{20,}"), r"\1 [REDACTED]"),
    (re.compile(r"(?i)\b([A-Z0-9_]*(?:SECRET|PASSWORD|PASSWD|TOKEN|API_KEY|PRIVATE_KEY|SALT|ENCRYPTION_KEY)[A-Z0-9_]*)\s*[=:]\s*['\"]?[^\s'\"]{6,}"), r"\1=[REDACTED]"),
]


def log(msg: str) -> None:
    try:
        CACHE.mkdir(parents=True, exist_ok=True)
        with LOG.open("a") as f:
            f.write(f"{datetime.now().isoformat(timespec='seconds')} {msg}\n")
    except Exception:
        pass


def redact(text):
    if not isinstance(text, str):
        return text
    for pat, rep in SECRET_PATTERNS:
        text = pat.sub(rep, text)
    return text if len(text) <= MAX_TEXT else text[:MAX_TEXT] + f"\n…[truncated {len(text) - MAX_TEXT} chars]"


def scrub(obj):
    if isinstance(obj, str):
        return redact(obj)
    if isinstance(obj, dict):
        return {k: scrub(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [scrub(v) for v in obj]
    return obj


def load_conf() -> dict:
    conf = {}
    try:
        for line in CONF.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                conf[k.strip()] = v.strip().strip("'\"")
    except FileNotFoundError:
        log(f"no config at {CONF}")
    return conf


def hid(*parts) -> str:
    """Deterministic 32-hex id (OTel-compatible) so re-sends upsert instead of duplicating."""
    return hashlib.sha256(":".join(map(str, parts)).encode()).hexdigest()[:32]


def find_transcript(payload: dict) -> Path | None:
    p = payload.get("transcriptPath")
    if p and Path(p).exists():
        full = Path(p).with_name("transcript_full.jsonl")
        return full if full.exists() else Path(p)
    conv = payload.get("conversationId")
    if conv:
        for name in ("transcript_full.jsonl", "transcript.jsonl"):
            c = BRAIN / conv / ".system_generated/logs" / name
            if c.exists():
                return c
    # Fallback: the most recently written transcript (the active session).
    files = glob.glob(str(BRAIN / "*/.system_generated/logs/transcript_full.jsonl"))
    files = [f for f in files if time.time() - os.path.getmtime(f) < 900]
    return Path(max(files, key=os.path.getmtime)) if files else None


def _ns(ts: str | None) -> str:
    try:
        return str(int(datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp() * 1e9))
    except Exception:
        return str(time.time_ns())


def _attrs(d: dict) -> list[dict]:
    out = []
    for k, v in d.items():
        if v is None or v == "" or v == [] or v == {}:
            continue
        if isinstance(v, bool):
            val = {"boolValue": v}
        elif isinstance(v, int):
            val = {"intValue": str(v)}
        elif isinstance(v, list) and all(isinstance(x, str) for x in v):
            val = {"arrayValue": {"values": [{"stringValue": x} for x in v]}}
        elif isinstance(v, str):
            val = {"stringValue": v}
        else:
            val = {"stringValue": json.dumps(v, ensure_ascii=False)}
        out.append({"key": k, "value": val})
    return out


def build_spans(conv: str, steps: list[dict], st: dict, workspace: str | None) -> list[dict]:
    """OTLP spans using Langfuse's attribute conventions (langfuse.* / gen_ai.*)."""
    spans: list[dict] = []
    trace_id, root_id = st.get("trace_id"), st.get("root_id")
    last_ts = st.get("last_ts")
    pending_tools: list[dict] = []

    def span(sid, name, start, end, attrs, parent=None):
        spans.append({
            "traceId": trace_id, "spanId": sid, **({"parentSpanId": parent} if parent else {}),
            "name": name, "kind": 1, "startTimeUnixNano": _ns(start), "endTimeUnixNano": _ns(end or start),
            "attributes": _attrs(attrs),
        })

    for s in steps:
        src, typ, idx, ts = s.get("source"), s.get("type"), s.get("step_index"), s.get("created_at")
        content = redact(s.get("content") or "")

        if typ == "USER_INPUT" or not trace_id:
            trace_id = hid(conv, "turn", idx)
            root_id = hid(conv, "root", idx)[:16]
            pending_tools = []
            span(root_id, "antigravity.prompt", ts, ts, {
                "langfuse.trace.name": "antigravity.prompt",
                "langfuse.session.id": conv,
                "langfuse.trace.tags": ["antigravity-cli", "dev"],
                "langfuse.trace.input": content if typ == "USER_INPUT" else None,
                "langfuse.trace.metadata.workspace": workspace,
                "langfuse.observation.input": content if typ == "USER_INPUT" else None,
            })
            last_ts = ts
            if typ == "USER_INPUT":
                continue

        if src == "MODEL" and typ == "PLANNER_RESPONSE":
            gen_id = hid(conv, "gen", idx)[:16]
            calls = s.get("tool_calls") or []
            out = {"text": content or None, "thinking": redact(s.get("thinking")) or None,
                   "tool_calls": [{"name": c.get("name"), "args": scrub(c.get("args"))} for c in calls] or None}
            usage = {"input": s.get("input_tokens"), "output": s.get("output_tokens"), "cache_read_input_tokens": s.get("cache_read_tokens")}
            usage = {k: v for k, v in usage.items() if isinstance(v, int)}
            attrs = {
                "langfuse.observation.type": "generation",
                "langfuse.observation.model.name": s.get("model"),
                "gen_ai.request.model": s.get("model"),
                "langfuse.observation.output": {k: v for k, v in out.items() if v},
                "langfuse.observation.usage_details": usage or None,
                "langfuse.observation.metadata.step_index": idx,
            }
            if content and not calls:
                attrs["langfuse.trace.output"] = content
            span(gen_id, f"step {idx} · {s.get('model') or 'model'}", last_ts or ts, ts, attrs, root_id)
            for j, c in enumerate(calls):
                pending_tools.append({"id": hid(conv, "tool", idx, j)[:16], "name": c.get("name") or "tool",
                                      "args": scrub(c.get("args")), "start": ts, "parent": gen_id})
        elif src == "MODEL" and typ == "GENERIC":
            if pending_tools:  # the result of the pending tool call
                t = pending_tools.pop(0)
                span(t["id"], t["name"], t["start"], ts, {
                    "langfuse.observation.type": "tool",
                    "langfuse.observation.input": t["args"],
                    "langfuse.observation.output": content,
                }, t["parent"])
            elif content:
                span(hid(conv, "msg", idx)[:16], "agent message", ts, ts,
                     {"langfuse.observation.output": content, "langfuse.trace.output": content}, root_id)
        last_ts = ts

    for t in pending_tools:  # tool calls with no result yet
        span(t["id"], t["name"], t["start"], t["start"], {"langfuse.observation.type": "tool", "langfuse.observation.input": t["args"]}, t["parent"])
    st.update(trace_id=trace_id, root_id=root_id, last_ts=last_ts)
    return spans


def send(conf: dict, spans: list[dict]) -> None:
    base = (conf.get("LANGFUSE_BASE_URL") or conf.get("LANGFUSE_HOST") or "http://localhost:3100").rstrip("/")
    auth = base64.b64encode(f"{conf['LANGFUSE_PUBLIC_KEY']}:{conf['LANGFUSE_SECRET_KEY']}".encode()).decode()
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    resource = {"attributes": _attrs({"service.name": "antigravity-cli", "deployment.environment": "development"})}
    for i in range(0, len(spans), 100):
        body = {"resourceSpans": [{"resource": resource, "scopeSpans": [{"scope": {"name": "agy-langfuse-hook", "version": "1"}, "spans": spans[i:i + 100]}]}]}
        req = urllib.request.Request(
            base + "/api/public/otel/v1/traces", data=json.dumps(body, ensure_ascii=False).encode(), method="POST",
            headers={"Authorization": f"Basic {auth}", "Content-Type": "application/json", "x-langfuse-ingestion-version": "4"},
        )
        with opener.open(req, timeout=5) as r:  # raises on HTTP errors → progress not saved, retried next call
            resp = r.read().decode(errors="replace")
        if '"rejectedSpans"' in resp and '"rejectedSpans":"0"' not in resp and '"rejectedSpans":0' not in resp:
            raise RuntimeError(f"partial rejection: {resp[:400]}")


def work(event: str, payload: dict) -> None:
    conf = load_conf()
    if conf.get("AGY_LANGFUSE_DISABLED") == "1":
        return
    if not (conf.get("LANGFUSE_PUBLIC_KEY") and conf.get("LANGFUSE_SECRET_KEY")):
        log("missing LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY")
        return
    path = find_transcript(payload)
    if not path:
        log(f"{event}: no transcript (payload keys: {sorted(payload)})")
        return
    conv = payload.get("conversationId") or path.parents[2].name

    CACHE.mkdir(parents=True, exist_ok=True)
    lock = CACHE / f"{conv}.lock"
    try:  # one sender per conversation at a time
        fd = os.open(lock, os.O_CREAT | os.O_EXCL)
        os.close(fd)
    except FileExistsError:
        if time.time() - lock.stat().st_mtime < 60:
            return
        lock.touch()
    try:
        state = json.loads(STATE.read_text()) if STATE.exists() else {}
        st = state.setdefault(conv, {"sent": -1})
        steps = []
        for line in path.read_text().splitlines():
            try:
                s = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(s.get("step_index"), int) and s["step_index"] > st["sent"] and s.get("status") == "DONE":
                steps.append(s)
        steps.sort(key=lambda s: s["step_index"])
        if not steps:
            return
        work_st = dict(st)
        spans = build_spans(conv, steps, work_st, payload.get("workspace") or payload.get("cwd"))
        send(conf, spans)  # only advance state after Langfuse accepted the spans
        st.update(work_st, sent=steps[-1]["step_index"])
        STATE.write_text(json.dumps(state))
        log(f"{event}: conv={conv[:8]} sent steps ≤{st['sent']} ({len(spans)} spans)")
    finally:
        lock.unlink(missing_ok=True)


def main() -> None:
    event = sys.argv[1] if len(sys.argv) > 1 else "PostInvocation"
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
    except Exception:
        payload = {}
    # Passive hook: answer immediately so the agent loop is never blocked.
    sys.stdout.write("{}\n")
    sys.stdout.flush()
    if os.environ.get("AGY_LANGFUSE_FOREGROUND") == "1":
        return _run(event, payload)
    try:
        if os.fork() > 0:
            return
        os.setsid()
        if os.fork() > 0:
            os._exit(0)
        devnull = os.open(os.devnull, os.O_RDWR)
        for fd in (0, 1, 2):
            os.dup2(devnull, fd)
        _run(event, payload)
    finally:
        if os.getpid() != _PARENT:
            os._exit(0)


def _run(event: str, payload: dict) -> None:
    try:
        work(event, payload)
    except Exception as e:  # never surface to the agent
        log(f"{event}: {type(e).__name__}: {e}")


_PARENT = os.getpid()

if __name__ == "__main__":
    main()
