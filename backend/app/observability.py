"""
Langfuse observability for RailKavach Copilot.

- Tracing turns on only when LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY are set.
  Without them, `observe` still works and nothing is sent, so local dev and CI need no keys.
- Set LANGFUSE_REQUIRED=true (the Cloud Run deploy does) and the app refuses to
  start without keys. A deploy cannot go out with tracing silently off.
"""
import logging
import os
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from langfuse import Langfuse, get_client, observe, propagate_attributes  # noqa: F401  (re-exported)

load_dotenv()
log = logging.getLogger("railkavach.observability")

LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY", "")
LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY", "")
LANGFUSE_BASE_URL = os.getenv("LANGFUSE_BASE_URL") or os.getenv("LANGFUSE_HOST") or "https://cloud.langfuse.com"
LANGFUSE_REQUIRED = os.getenv("LANGFUSE_REQUIRED", "false").lower() == "true"
APP_ENV = os.getenv("APP_ENV", "development")
APP_RELEASE = os.getenv("APP_RELEASE", "dev")

ENABLED = bool(LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY)

if LANGFUSE_REQUIRED and not ENABLED:
    raise RuntimeError(
        "LANGFUSE_REQUIRED=true but LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY are not set. "
        "Refusing to start without tracing."
    )

def _dpdp_mask(data: Any, **_: Any) -> Any:
    """Traces never need crew identities: pseudonymise every input/output before it leaves the process."""
    from .governance import masker  # lazy: governance imports config only, no cycle
    try:
        return masker.mask(data)
    except Exception:
        return "[masking failed — payload dropped]"


# Initialise the singleton that get_client() / @observe use.
_client = Langfuse(
    mask=_dpdp_mask,
    public_key=LANGFUSE_PUBLIC_KEY or None,
    secret_key=LANGFUSE_SECRET_KEY or None,
    base_url=LANGFUSE_BASE_URL,
    environment=APP_ENV,
    release=APP_RELEASE,
    tracing_enabled=ENABLED,
)


def status() -> Dict[str, Any]:
    return {
        "provider": "langfuse",
        "enabled": ENABLED,
        "base_url": LANGFUSE_BASE_URL if ENABLED else None,
        "environment": APP_ENV,
        "release": APP_RELEASE,
    }


def current_trace_id() -> Optional[str]:
    if not ENABLED:
        return None
    try:
        return get_client().get_current_trace_id()
    except Exception:
        return None


def flush() -> None:
    """Push buffered spans. Called after each traced request (Cloud Run throttles idle CPU)."""
    if not ENABLED:
        return
    try:
        get_client().flush()
    except Exception as e:  # never break a request over telemetry
        log.warning("Langfuse flush failed: %s", e)


def shutdown() -> None:
    if not ENABLED:
        return
    try:
        get_client().shutdown()
    except Exception as e:
        log.warning("Langfuse shutdown failed: %s", e)
