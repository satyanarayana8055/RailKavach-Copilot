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


def _numbers_near(sentence: str, act_match: re.Match, num_pat: str) -> list[str]:
    """Provision numbers in the same sentence as the act name: 'Section 175', 'Rule 3.78 / 9.02', 'Sections 184 and 185'."""
    out: list[str] = []
    for m in re.finditer(rf"{_PROVISION}\s*({num_pat})((?:\s*(?:,|/|&|and|or)\s*(?:{_PROVISION}\s*)?(?:{num_pat}))*)", sentence, re.I):
        out.append(m.group(1))
        out += re.findall(num_pat, m.group(2) or "")
    # "G&SR 4.40" — number directly after the act name, no "Rule" keyword
    direct = re.match(rf"\s*({num_pat})\b", sentence[act_match.end():])
    if direct:
        out.append(direct.group(1))
    return out


def extract(answer: str) -> list[dict]:
    lib = library()
    found: dict[str, dict] = {}
    for sentence in _sentences(answer or ""):
        for family, act, short, name_re, num_pat in _ACTS:
            for am in name_re.finditer(sentence):
                for n in _numbers_near(sentence, am, num_pat):
                    n = n.upper()
                    rule = lib["index"].get((family, n)) or lib["index"].get((family, re.sub(r"\(.*", "", n)))
                    if rule:
                        found.setdefault(rule["id"], {**{k: rule[k] for k in ("id", "act", "ref", "label", "title", "summary")}, "status": "IN_LIBRARY"})
                    else:
                        label = f"{short} {'s.' if family in ('RA', 'DPDP', 'BSA') else ''}{n}"
                        found.setdefault(f"?{family}-{n}", {"id": f"?{family}-{n}", "act": act, "ref": n, "label": label, "title": None,
                                                            "summary": None, "status": "NOT_IN_LIBRARY"})
                break  # one scan per act per sentence is enough
        if _CIRCULAR.search(sentence):
            r = next(x for x in lib["rules"] if x["id"] == "RB-PHONE")
            found.setdefault(r["id"], {**{k: r[k] for k in ("id", "act", "ref", "label", "title", "summary")}, "status": "IN_LIBRARY"})
    # Known rules first, then those needing a manual check.
    return sorted(found.values(), key=lambda r: (r["status"] != "IN_LIBRARY", r["label"]))


def source_note() -> Optional[str]:
    return library()["source"] or None
