"""
Structured rule citations.

Answers are free text written by the model, so a rule it names may not exist or may be mis-numbered.
This module finds every legal reference in an answer and checks it against the rule library
(data/statutes.json, summarised from the RailKavach compliance framework):

  IN_LIBRARY      — a known rule; the UI shows its summary
  NOT_IN_LIBRARY  — named by the answer but not in the library; the UI marks it for manual checking
"""
from __future__ import annotations

import json
import re
from functools import lru_cache
from typing import Optional

from .config import DATA_DIR

# Each act: how it is named, and how its provision numbers look.
_ACTS = [
    ("RA", "Railways Act, 1989", "Railways Act", re.compile(r"railways?\s+act", re.I), r"\d{2,3}[A-Z]?"),
    ("GSR", "General & Subsidiary Rules", "G&SR", re.compile(r"G\s*&\s*SR|general\s+(?:and|&)\s+subsidiary\s+rules?|\bgeneral\s+rules?\b", re.I), r"\d{1,2}\.\d{2}|\d{2,3}"),
    ("DPDP", "DPDP Act, 2023", "DPDP", re.compile(r"\bDPDP\b|digital\s+personal\s+data\s+protection", re.I), r"\d{1,2}"),
    ("BSA", "Bharatiya Sakshya Adhiniyam, 2023", "BSA", re.compile(r"\bBSA\b|bharatiya\s+sakshya", re.I), r"\d{1,3}"),
]
_PROVISION = r"(?:Sections?|Sec\.?|§|Rules?|GR|SR|S\.)"
_CIRCULAR = re.compile(r"2018/Safety\(A&R\)/19/19", re.I)


@lru_cache(maxsize=1)
def library() -> dict:
    p = DATA_DIR / "statutes.json"
    data = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {"rules": []}
    index: dict[tuple[str, str], dict] = {}
    for r in data["rules"]:
        family = r["id"].split("-")[0]
        nums = r.get("aliases") or [re.sub(r"\D", "", r["ref"])]
        for n in nums:
            index[(family, n)] = r
    return {"source": data.get("_source", ""), "rules": data["rules"], "index": index}


def _sentences(text: str) -> list[str]:
    return re.split(r"(?<=[.;\n])\s+", text)


_NUM = r"\d{1,3}(?:\.\d{2})?[A-Z]?"


def _provisions(sentence: str) -> list[tuple[int, int, str]]:
    """(position, number) for 'Section 175', 'Rule 3.78 / 9.02', 'Sections 184 and 185', 'G&SR 4.40'."""
    out: list[tuple[int, int, str]] = []
    for m in re.finditer(rf"{_PROVISION}\s*({_NUM})((?:\s*(?:,|/|&|and|or)\s*(?:{_PROVISION}\s*)?{_NUM}\b)*)", sentence, re.I):
        out.append((m.start(), m.end(), m.group(1)))
        out += [(m.start(), m.end(), n) for n in re.findall(_NUM, m.group(2) or "")]
    return out


def _entry(rule: dict) -> dict:
    return {**{k: rule[k] for k in ("id", "act", "ref", "label", "title", "summary")}, "status": "IN_LIBRARY"}


def extract(answer: str) -> list[dict]:
    lib = library()
    found: dict[str, dict] = {}

    def add(family: str, act: str, short: str, n: str) -> None:
        n = n.upper()
        rule = lib["index"].get((family, n))
        if rule:
            found.setdefault(rule["id"], _entry(rule))
        else:
            label = f"{short} {'s.' if family in ('RA', 'DPDP', 'BSA') else ''}{n}"
            found.setdefault(f"?{family}-{n}", {"id": f"?{family}-{n}", "act": act, "ref": n, "label": label,
                                                "title": None, "summary": None, "status": "NOT_IN_LIBRARY"})

    for sentence in _sentences(answer or ""):
        acts = [(m.start(), m.end(), fam, act, short, pat)
                for fam, act, short, name_re, pat in _ACTS for m in name_re.finditer(sentence)]
        if not acts:
            continue
        # A number written straight after the act name ("G&SR 4.40") belongs to that act.
        for start, end, fam, act, short, pat in acts:
            d = re.match(rf"\s*\(?({pat})\b", sentence[end:])
            if d and not re.match(rf"\s*\(?\d{{4}}", sentence[end:]):  # skip years: "Railways Act, 1989"
                add(fam, act, short, d.group(1))
        # Every "Section/Rule N" belongs to the nearest act name: preceding, or following within "… of the Railways Act".
        for pos, pend, n in _provisions(sentence):
            # "Section 175 of the Railways Act" / "under the DPDP Act": the act that follows wins.
            tail = re.match(r"\s*(?:\([^)]*\)\s*)?(?:of|under)\s+(?:the\s+)?(?:indian\s+)?", sentence[pend:], re.I)
            if tail:
                after = [a for a in acts if a[0] == pend + tail.end()]
                if after and re.fullmatch(after[0][5], n, re.I):
                    add(after[0][2], after[0][3], after[0][4], n)
                    continue
            best, best_d = None, 10**9
            for start, end, *rest in acts:
                dist = pos - end if end <= pos else (start - pos + 15 if start - pos < 60 else 10**9)
                if 0 <= dist < best_d:
                    best, best_d = rest, dist
            if best and re.fullmatch(best[3], n, re.I):
                add(best[0], best[1], best[2], n)
    if _CIRCULAR.search(answer or ""):  # whole answer: "Circular No. 2018/…" would split as a sentence
        found.setdefault("RB-PHONE", _entry(next(x for x in lib["rules"] if x["id"] == "RB-PHONE")))
    # Known rules first, then those needing a manual check.
    return sorted(found.values(), key=lambda r: (r["status"] != "IN_LIBRARY", r["label"]))


def source_note() -> Optional[str]:
    return library()["source"] or None
