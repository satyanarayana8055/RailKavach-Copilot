import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gemini-3.5-flash-lite")
PRO_MODEL = os.getenv("PRO_MODEL", "gemini-3.8-flash")

# Token & Cache Settings
ENABLE_CACHE_FALLBACK = os.getenv("ENABLE_CACHE_FALLBACK", "true").lower() == "true"
MAX_OUTPUT_TOKENS = int(os.getenv("MAX_OUTPUT_TOKENS", "1024"))
MAX_REPORT_TOKENS = int(os.getenv("MAX_REPORT_TOKENS", "2048"))
WINDOW_MINUTES_BEFORE = int(os.getenv("WINDOW_MINUTES_BEFORE", "15"))
WINDOW_MINUTES_AFTER = int(os.getenv("WINDOW_MINUTES_AFTER", "5"))
