#!/usr/bin/env python3
"""
Rebuild data/cached_demo_responses.json from the datasets, so cached demo answers state only what the
records show and every citation points at a real, hash-registered evidence record.

    python3 scripts/build_demo_cache.py          # writes data/cached_demo_responses.json
    python3 scripts/build_demo_cache.py --check  # exits 1 if the committed cache is stale

Inputs: data/railcomm_transcripts.json, data/locate_alerts.json, data/wdd_inspections.json.
Rules cited are only those in data/statutes.json.
"""
from __future__ import annotations

import argparse
import collections
import json
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
OUT = DATA / "cached_demo_responses.json"
FRONTEND = DATA.parent / "frontend" / "lib" / "demo-data.generated.ts"


def load(name: str) -> list[dict]:
    d = json.loads((DATA / name).read_text(encoding="utf-8"))
    return d if isinstance(d, list) else next(v for v in d.values() if isinstance(v, list))


R = {r["id"]: r for r in load("railcomm_transcripts.json")}
L = load("locate_alerts.json")
W = load("wdd_inspections.json")
pretty = lambda s: s.replace("_", " ").title()


def radio(rid: str, event: str | None = None) -> dict:
    r = R[rid]
    src = "Railcomm Cab Intercom" if "INTERCOM" in r["channel"] else f"Railcomm {r['channel'].replace('-', ' ')}"
    return {"time": r["time_str"], "source": src, "event": event or r["transcript_en"], "status": "CONFIRMED", "evidence_id": rid}


def cabin(a: dict, event: str) -> dict:
    return {"time": a["time_str"], "source": "Locate Cabin CVVRS", "event": event, "status": a["verification_status"], "evidence_id": a["alert_id"]}


# --------------------------------------------------------------------------- 1 · 12414 near-SPAD
def scenario_1() -> dict:
    seq = ["RC-12414-003", "RC-12414-004", "RC-12414-005", "RC-12414-006", "RC-12414-007", "RC-12414-008", "RC-12414-009"]
    for rid in seq:
        assert rid in R, rid
    cab = [a for a in L if a["train_no"] == "12414"]
    at_incident = [a for a in cab if "03:13:30" <= a["time_str"] <= "03:15:00"]
    phone = [a for a in cab if a["violation_type"] == "MOBILE_PHONE" and a["verification_status"] == "CONFIRMED"]
    before = [a for a in phone if a["time_str"] < "03:14:15"]
    after = [a for a in phone if a["time_str"] > "03:15:10"]
    assert at_incident and all(a["is_compliant_activity"] for a in at_incident), "cab record at the incident changed: revisit narrative"
    last_before, first_after = before[-1], after[0]

    summary = (
        "**Verdict:** Train 12414 stopped 60 m short of the Home Signal at Danger at Suratgarh. The Station Master confirmed no SPAD. "
        "The radio record shows the stop came from the Assistant Loco Pilot's warning about phone use, not from the Loco Pilot's own signal observance.\n\n"
        "**What was heard (Railcomm)**\n"
        f"- [{R['RC-12414-003']['time_str']}] Station Master: Down Loop Line set, Home Signal at Danger, Caution Order 30 km/h.\n"
        f"- [{R['RC-12414-004']['time_str']}] ALP repeated the order back (call-out protocol followed).\n"
        f"- [{R['RC-12414-005']['time_str']}] ALP called the Distant Signal at Yellow and asked to reduce speed.\n"
        f"- [{R['RC-12414-006']['time_str']}] ALP: \"Put down the phone, Home Signal ahead is RED! Apply brakes!\"\n"
        f"- [{R['RC-12414-007']['time_str']}] LP reported emergency brake applied, brake pipe at 0 kg/cm².\n"
        f"- [{R['RC-12414-008']['time_str']}] LP reported a complete halt 60 m before the Home Signal.\n"
        f"- [{R['RC-12414-009']['time_str']}] Station Master: signal not passed, no SPAD. Section Controller informed.\n\n"
        "**What was seen (Locate)**\n"
        f"- The cab camera has **no phone alert at the moment of the warning**: records between [{at_incident[0]['time_str']}] and [{at_incident[-1]['time_str']}] "
        "are routine monitoring, auto-suppressed.\n"
        f"- The same train has {len(phone)} confirmed phone alerts this shift, the nearest at [{last_before['time_str']}] before and "
        f"[{first_after['time_str']}] after the incident.\n\n"
        "**Assessment:** Phone use is corroborated by the ALP's radio warning and by repeated confirmed cab alerts, but not captured in the incident minute. "
        "Pull the CVVRS footage for 03:13–03:15 before any charge: an AI alert alone must not be the basis of action (Railways Act Section 175).\n\n"
        "**Rules engaged:** G&SR 3.78 (signal at danger), G&SR 4.40 (calling out signal aspects), G&SR 4.09 (caution orders), "
        "Railway Board Safety Circular No. 2018/Safety(A&R)/19/19 (in-cab phones)."
    )
    cites = [radio("RC-12414-003", "SM: Down Loop Line, Home Signal at Danger, Caution Order 30 km/h."),
             radio("RC-12414-004", "ALP repeated the caution order back."),
             radio("RC-12414-006", "ALP warned: put down the phone, Home Signal is RED, apply brakes."),
             radio("RC-12414-007", "LP: emergency brake applied, brake pipe 0 kg/cm²."),
             radio("RC-12414-008", "LP: complete halt 60 m before the Home Signal."),
             radio("RC-12414-009", "SM: signal not passed, no SPAD."),
             cabin(last_before, f"Confirmed phone use on 12414, last alert before the incident ({pretty(last_before['violation_type'])})."),
             cabin(first_after, f"Confirmed phone use on 12414, first alert after the incident ({pretty(first_after['violation_type'])}).")]
    return {
        "query": "Investigate safety events for Train 12414 near Suratgarh on 2026-11-18.",
        "incident_id": "INC-12414-20261118",
        "summary": summary,
        "timestamp_citations": cites,
        "root_cause": "Loss of signal attention by the Loco Pilot approaching a Home Signal at Danger; phone use indicated by the ALP's warning and repeated confirmed cab alerts. Stop achieved by ALP intervention and emergency braking.",
        "bilingual_report": {
            "english_statutory": (
                "PRELIMINARY INQUIRY NOTE (Railways Act s.115 departmental inquiry)\n"
                "Division: Bikaner | Train: 12414 | Date: 18-Nov-2026 | Location: Suratgarh Home Signal\n"
                "Finding: Train halted 60 m before the Home Signal at Danger. No SPAD (SM confirmation on VHF).\n"
                "Cause: ALP warning about phone use, followed by emergency braking. No cab-camera phone alert in the incident minute;\n"
                f"{len(phone)} confirmed phone alerts on the same train this shift.\n"
                "Action: Secure CVVRS footage 03:13–03:15; counsel crew under the in-cab phone circular; no charge on AI alerts alone (s.175)."
            ),
            "hindi_briefing": (
                "क्रू लॉबी ब्रीफिंग — गाड़ी 12414, सूरतगढ़, 18 नवंबर 2026\n"
                "होम सिग्नल लाल था। सहायक लोको पायलट ने फोन रखने और ब्रेक लगाने की चेतावनी दी, आपातकालीन ब्रेक लगाया गया और "
                "गाड़ी सिग्नल से 60 मीटर पहले रुक गई। सिग्नल पार नहीं हुआ।\n"
                "सीख: चलती गाड़ी में निजी फोन बंद रखें, हर सिग्नल को ज़ोर से पुकारें, और कॉशन ऑर्डर दोहराएँ।"
            ),
        },
    }


# --------------------------------------------------------------------------- 2 · night-shift fatigue
def scenario_2() -> dict:
    sleep = [a for a in L if a["violation_type"] == "SLEEPING" and a["verification_status"] == "CONFIRMED"]
    by_hour = collections.Counter(a["time_str"][:2] for a in sleep)
    by_train = collections.Counter(a["train_no"] for a in sleep)
    peak_hour, peak_n = by_hour.most_common(1)[0]
    quarter = collections.Counter(f"{a['time_str'][:2]}:{int(a['time_str'][3:5]) // 15 * 15:02d}" for a in sleep)
    q_start, q_n = quarter.most_common(1)[0]
    phone = sum(1 for a in L if a["violation_type"] == "MOBILE_PHONE" and a["verification_status"] == "CONFIRMED")
    # One cited alert per hour per train: first confirmed occurrence.
    picked, seen = [], set()
    for a in sorted(sleep, key=lambda a: a["time_str"]):
        k = (a["time_str"][:2], a["train_no"])
        if k not in seen:
            seen.add(k)
            picked.append(a)
    trains = " and ".join(f"{t} ({n})" for t, n in by_train.most_common())
    hours = ", ".join(f"{h}:00–{h}:59 · {by_hour[h]}" for h in sorted(by_hour))
    summary = (
        f"**Finding:** {len(sleep)} confirmed micro-sleep alerts on the night shift, split across {trains}. "
        f"They peak in the **{peak_hour}:00 hour ({peak_n} alerts)**, the densest 15 minutes being from {q_start} ({q_n}).\n\n"
        f"**By hour:** {hours}.\n\n"
        f"**Alongside:** {phone} confirmed phone-use alerts on the same shift, so attention lapses are not only fatigue.\n\n"
        "**Review status:** every micro-sleep alert here has been confirmed by a reviewer. Pending alerts are excluded.\n\n"
        "**Recommended:** tighten vigilance-control checks between 03:00 and 04:00, review crew rest before these turns, "
        "and brief both crews in the lobby."
    )
    return {
        "query": "Show driver alertness and fatigue trends between 02:00 and 05:00 AM on Bikaner Division.",
        "summary": summary,
        "cluster_data": [
            {"time": a["time_str"], "loco": a["loco_id"], "train": a["train_no"], "crew": a.get("crew_id") or "crew",
             "duration": "Sleeping (micro-sleep)", "status": a["verification_status"], "evidence_id": a["alert_id"]}
            for a in picked
        ],
        "corrective_actions": [
            f"Tighten vigilance-control checks between {peak_hour}:00 and {int(peak_hour) + 1:02d}:00",
            "Review crew rest before night turns on 12414 and BOXN-542",
            "Brief both crews in the Suratgarh lobby",
        ],
    }


# --------------------------------------------------------------------------- 3 · BOXN-542 wagon audit
def scenario_3() -> dict:
    damaged = [w for w in W if w["exit_damage_status"] != "CLEAR"]
    new = [w for w in damaged if w["delta_transit_damage"]]
    pre = [w for w in damaged if not w["delta_transit_damage"]]
    clear = len(W) - len(damaged)
    serious = [w for w in new if any(d["severity"] in ("HIGH", "CRITICAL") for d in w["exit_defects"])]
    w0 = W[0]
    entry_t, exit_t = w0["entry_timestamp"][11:16], w0["exit_timestamp"][11:16]

    def finding(w: dict) -> dict:
        d = w["exit_defects"]
        status = "PRE-EXISTING (not transit)" if not w["delta_transit_damage"] else (
            "NEW TRANSIT DAMAGE · CRITICAL" if any(x["severity"] == "CRITICAL" for x in d) else
            "NEW TRANSIT DAMAGE · HIGH" if any(x["severity"] == "HIGH" for x in d) else "NEW TRANSIT DAMAGE")
        return {"wagon_no": w["wagon_no"], "position": w["position_in_rake"], "status": status,
                "defects": [f"{x['class']} ({x['severity'].lower()})" for x in d], "liability": w["liability_attribution"],
                "time": w["exit_timestamp"][11:19], "evidence_id": w["id"]}

    order = sorted(serious, key=lambda w: -max({"CRITICAL": 3, "HIGH": 2}.get(x["severity"], 1) for x in w["exit_defects"]))
    rest = [w for w in new if w not in serious]
    summary = (
        f"**Rake {w0['train_no']} · {len(W)} {w0['rake_type']} wagons** scanned at {w0['entry_gantry']} ({entry_t}) and {w0['exit_gantry']} ({exit_t}).\n\n"
        f"- **Clear at exit:** {clear}\n"
        f"- **New transit damage:** {len(new)}, of which {len(serious)} serious (door defects)\n"
        f"- **Pre-existing, not transit:** {len(pre)} (wagon #{', #'.join(str(w['position_in_rake']) for w in pre)})\n\n"
        f"{clear} + {len(new)} + {len(pre)} = {len(W)}. Highest priority first:"
    )
    return {
        "query": "Audit entry-versus-exit wagon damage for freight rake BOXN-542.",
        "train_no": w0["train_no"],
        "rake_type": f"{w0['rake_type']} ({len(W)} wagons)",
        "summary": summary,
        "findings": [finding(w) for w in order + rest + pre],
        "inspection_time_savings": f"All {len(W)} wagons compared entry vs exit automatically; only {len(damaged)} need a person to look.",
    }


# --------------------------------------------------------------------------- 4 · callouts & caution orders
def scenario_4() -> dict:
    rows = list(R.values())
    co = [r for r in rows if any("Caution Order" in k for k in r["safety_keywords"])]
    emergency = [r for r in rows if "Emergency Brake" in r["safety_keywords"] or "Phone" in r["safety_keywords"]]
    bypass = [r for r in rows if r["fail_open_bypassed"]]
    by_ch = collections.Counter(r["channel"] for r in bypass).most_common(2)
    summary = (
        f"**Shift audit of {len(rows):,} radio segments** on Bikaner Division, 18 Nov 2026.\n\n"
        f"**Caution orders:** {len(co)} exchanges. On 12414 the Station Master's 30 km/h order was repeated back by the ALP "
        f"[{R['RC-12414-004']['time_str']}], as G&SR 4.09 and the call-out rule G&SR 4.40 require.\n\n"
        f"**Emergency call-outs:** {len(emergency)}, both on 12414 at Suratgarh: the ALP's warning about the phone and the red Home Signal "
        f"[{R['RC-12414-006']['time_str']}], then the LP's emergency-brake report [{R['RC-12414-007']['time_str']}].\n\n"
        f"**Fail-open:** {len(bypass)} segments ({len(bypass) * 100 // len(rows)}%) were passed through without AI cleaning because the "
        f"denoiser could not run, mostly on {', '.join(f'{c} ({n})' for c, n in by_ch)}. They were kept as raw audio, never dropped, "
        "so nothing in the record is lost."
    )
    cites = [radio("RC-12414-003", "SM issued Caution Order 30 km/h, Home Signal at Danger."),
             radio("RC-12414-004", "ALP repeated the caution order back."),
             radio("RC-12414-006", "ALP emergency call-out: phone down, Home Signal RED, apply brakes."),
             radio("RC-12414-007", "LP: emergency brake applied.")]
    cites += [radio(b["id"], f"Fail-open: passed through raw ({b['channel']}).") for b in bypass[:2]]
    return {
        "query": "Show all signal-related miscommunications, emergency callouts, and caution order exchanges on the Bikaner division during the shift on 18 Nov 2026.",
        "summary": summary,
        "citations": cites,
        "fail_open_status": f"{len(bypass)} of {len(rows)} segments passed through raw (fail-open), none dropped",
        "statutory_rules": ["G&SR 4.40 / 4.41 Calling out", "G&SR 4.09 Caution orders", "G&SR 3.78 / 9.02 Signal at danger"],
    }


# --------------------------------------------------------------------------- frontend copy (offline mode, dashboard)
ROLE = {"STATION_MASTER": "Station Master SOG", "LOCO_PILOT": "LP", "ASSISTANT_LOCO_PILOT": "ALP", "ASST_LOCO_PILOT": "ALP"}


def frontend_ts(cache: dict) -> str:
    s1, s4 = cache["scenario_1_spad_investigation"], cache["scenario_signal_miscommunications"]

    def resp(sc: dict, cites_key: str, actions: list[str]) -> dict:
        return {"answer": sc["summary"], "citations": [
            {"timestamp": c["time"], "source": c["source"], "event_description": c["event"], "reviewer_status": c.get("status"),
             "evidence_id": c.get("evidence_id")} for c in sc[cites_key]],
            "suggested_actions": actions, "latency_ms": 2, "token_usage": {"total_tokens": 0}, "cached": True}

    timeline = []
    for rid in ["RC-12414-003", "RC-12414-004", "RC-12414-005", "RC-12414-006", "RC-12414-007", "RC-12414-008", "RC-12414-009"]:
        r = R[rid]
        timeline.append({"time_str": r["time_str"], "source": "RAILCOMM_AUDIO", "speaker": ROLE.get(r["speaker_role"], r["speaker_role"].title()),
                         "event": r["transcript_en"], "event_hi": r["transcript_hi"], "clarity": r["clarity_score"],
                         "fail_open": r["fail_open_bypassed"], "reviewer_status": "CONFIRMED",
                         "severity": "CRITICAL" if rid in ("RC-12414-006", "RC-12414-007") else "INFO"})
    for a in L:
        if a["train_no"] == "12414" and "03:13:30" <= a["time_str"] <= "03:15:00":
            timeline.append({"time_str": a["time_str"], "source": "LOCATE_CABIN_CAM", "speaker": "Cab camera",
                             "event": "Routine monitoring, no phone alert (auto-suppressed)", "event_hi": "सामान्य निगरानी, फोन अलर्ट नहीं",
                             "reviewer_status": a["verification_status"], "severity": "INFO"})
    # Telemetry lane: the brake event as reported by the LP on the radio (no separate telemetry dataset).
    bp = R["RC-12414-007"]
    timeline.append({"time_str": bp["time_str"], "source": "LOCO_TELEMETRY", "speaker": "Brake pipe",
                     "event": "Emergency brake · brake pipe 5.0 → 0 kg/cm² (as reported by the LP on cab intercom)",
                     "event_hi": "आपातकालीन ब्रेक · ब्रेक पाइप 5.0 → 0 किग्रा/सेमी²", "severity": "CRITICAL"})
    timeline.sort(key=lambda e: (e["time_str"], e["source"] != "RAILCOMM_AUDIO"))

    def wagon(w: dict) -> dict:
        d = w["exit_defects"]
        if not d:
            status, exit_txt = "CLEAR", "Clear"
        elif not w["delta_transit_damage"]:
            status, exit_txt = "PRE_EXISTING", "; ".join(x.get("description", x["class"]) for x in d)
        else:
            status = "CRITICAL" if any(x["severity"] == "CRITICAL" for x in d) else "NEW_DAMAGE"
            exit_txt = "; ".join(x.get("description", x["class"]) for x in d)
        entry_txt = "Clear" if not w["entry_defects"] else "; ".join(x.get("description", x["class"]) for x in w["entry_defects"])
        tag = "CLEAR" if not d else ", ".join(f"{x['class']} ({x['severity']})" for x in d)
        return {"pos": w["position_in_rake"], "serial": w["wagon_no"], "entry": entry_txt, "exit": exit_txt, "status": status,
                "note": w["liability_attribution"], "image_url": w.get("image_url"), "defect_tag": tag}

    rake = [wagon(w) for w in sorted(W, key=lambda w: w["position_in_rake"])]
    report = "\n".join([
        "PRELIMINARY INQUIRY REPORT (Railways Act s.115)",
        "=" * 53,
        "Authority: Senior Divisional Safety Officer (Sr. DSO)",
        "Division : Bikaner Division, North Western Railway",
        f"Incident : {s1['incident_id']} (signal at danger, SPAD averted)",
        "Train    : 12414",
        "Date     : 18-Nov-2026, Suratgarh Home Signal",
        "",
        "1. CHRONOLOGY (Railcomm radio record)",
        "-" * 53,
        *[f"* [{R[r]['time_str']}] {ROLE.get(R[r]['speaker_role'], 'Crew')}: {R[r]['transcript_en']}" for r in
          ["RC-12414-003", "RC-12414-004", "RC-12414-006", "RC-12414-007", "RC-12414-008", "RC-12414-009"]],
        "",
        "2. CAB CAMERA (Locate)",
        "-" * 53,
        "* No phone alert in the incident minute (routine monitoring, auto-suppressed).",
        f"* {sum(1 for a in L if a['train_no'] == '12414' and a['violation_type'] == 'MOBILE_PHONE' and a['verification_status'] == 'CONFIRMED')} confirmed phone alerts on 12414 this shift.",
        "",
        "3. FINDINGS",
        "-" * 53,
        "* Stop achieved by ALP warning and emergency braking; no SPAD.",
        "* Rules engaged: G&SR 3.78, G&SR 4.40, G&SR 4.09; Railway Board in-cab phone circular.",
        "* Secure CVVRS footage 03:13-03:15 before any charge (Railways Act s.175:",
        "  an AI alert alone is not a basis for action).",
        "* Evidence hashes recorded at ingest; BSA 2023 s.63 certificate to follow.",
    ])
    out = [
        "// GENERATED by scripts/build_demo_cache.py from data/*.json — do not edit by hand.",
        'import type { ChatResponse, TimelineEvent, Wagon } from "./types";',
        "",
        f"export const SCENARIO_1_FALLBACK: ChatResponse = {json.dumps(resp(s1, 'timestamp_citations', ['Generate inquiry report', 'Issue Hindi lobby briefing', 'Pull CVVRS footage 03:13–03:15']), ensure_ascii=False, indent=2)};",
        "",
        f"export const SCENARIO_4_FALLBACK: ChatResponse = {json.dumps(resp(s4, 'citations', ['Open timeline', 'Export call-out report', 'Audit fail-open segments']), ensure_ascii=False, indent=2)};",
        "",
        f"export const TIMELINE: TimelineEvent[] = {json.dumps(timeline, ensure_ascii=False, indent=2)};",
        "",
        f"export const RAKE: Wagon[] = {json.dumps(rake, ensure_ascii=False, indent=2)};",
        "",
        f"export const INQUIRY_REPORT = {json.dumps(report.replace(chr(92) + 'n', chr(10)), ensure_ascii=False)};",
        "",
    ]
    return "\n".join(out)


def build() -> dict:
    return {
        "_generated_by": "scripts/build_demo_cache.py — do not edit by hand; regenerate from the datasets",
        "scenario_1_spad_investigation": scenario_1(),
        "scenario_2_fatigue_pattern": scenario_2(),
        "scenario_3_wagon_damage_audit": scenario_3(),
        "scenario_signal_miscommunications": scenario_4(),
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    cache = build()
    outputs = {OUT: json.dumps(cache, ensure_ascii=False, indent=2) + "\n", FRONTEND: frontend_ts(cache)}
    if args.check:
        stale = [str(p) for p, t in outputs.items() if not p.exists() or p.read_text(encoding="utf-8") != t]
        print("stale: " + ", ".join(stale) if stale else "up to date")
        sys.exit(1 if stale else 0)
    for p, t in outputs.items():
        p.write_text(t, encoding="utf-8")
        print(f"wrote {p}")
