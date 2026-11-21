"""The exact model architectures behind Railcomm, Locate and WDD are not ours to state.
Fail if CNN / RNN / U-Net / Transformer / LSTM claims appear in the app, docs or data."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BANNED = re.compile(r"\b(CNNs?|RNNs?|U-?Nets?|Transformers?|LSTMs?)\b")
SCAN = ["frontend/app", "frontend/components", "frontend/lib", "backend/app", "docs", "assets", "data", "README.md"]
SUFFIXES = {".ts", ".tsx", ".css", ".py", ".md", ".json", ".html", ".svg"}


def test_no_model_architecture_names():
    hits = []
    for rel in SCAN:
        base = ROOT / rel
        files = [base] if base.is_file() else [p for p in base.rglob("*") if p.suffix in SUFFIXES and "drive_ingest" not in p.parts]
        for f in files:
            for n, line in enumerate(f.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
                if BANNED.search(line):
                    hits.append(f"{f.relative_to(ROOT)}:{n}: {line.strip()[:120]}")
    assert not hits, "Model architecture names must not appear:\n" + "\n".join(hits)
