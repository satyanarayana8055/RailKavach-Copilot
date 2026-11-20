#!/usr/bin/env bash
# Trace your Antigravity CLI (agy) prompts into Langfuse.
#   ./scripts/install_antigravity_langfuse.sh            # install / update
#   ./scripts/install_antigravity_langfuse.sh --uninstall
# Keys: LANGFUSE_* in the repo .env if set, else the local Langfuse keys in infra/langfuse/.env
# (default: the self-hosted Langfuse at http://localhost:3100 — prompts stay on this machine).
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
HOOK="$REPO/scripts/antigravity_langfuse_hook.py"
HOOKS_JSON="$HOME/.gemini/config/hooks.json"
CONF_DIR="$HOME/.config/agy-langfuse"
PY="$(command -v python3)"

if [[ "${1:-}" == "--uninstall" ]]; then
  [[ -f "$HOOKS_JSON" ]] && "$PY" -I - "$HOOKS_JSON" <<'PY'
import json, sys
p = sys.argv[1]; d = json.load(open(p)); d.pop("langfuse-tracing", None)
json.dump(d, open(p, "w"), indent=2)
PY
  echo "Removed the langfuse-tracing hook group. Restart agy to apply."
  exit 0
fi

mkdir -p "$CONF_DIR" "$(dirname "$HOOKS_JSON")"
LF_ENV="$REPO/infra/langfuse/.env"
if grep -q '^LANGFUSE_SECRET_KEY=.' "$REPO/.env" 2>/dev/null; then
  ( umask 077; grep -E '^LANGFUSE_(PUBLIC_KEY|SECRET_KEY|BASE_URL|HOST)=' "$REPO/.env" > "$CONF_DIR/env" )
elif [[ -f "$LF_ENV" ]]; then
  # Default: keys of the local Langfuse from scripts/langfuse_local.sh (the backend stays unlinked)
  ( umask 077
    echo "LANGFUSE_PUBLIC_KEY=$(grep '^LANGFUSE_INIT_PROJECT_PUBLIC_KEY=' "$LF_ENV" | cut -d= -f2-)"
    echo "LANGFUSE_SECRET_KEY=$(grep '^LANGFUSE_INIT_PROJECT_SECRET_KEY=' "$LF_ENV" | cut -d= -f2-)"
    echo "LANGFUSE_BASE_URL=http://localhost:$(grep '^LANGFUSE_WEB_PORT=' "$LF_ENV" | cut -d= -f2- || echo 3100)"
  ) > "$CONF_DIR/env"
else
  echo "No Langfuse keys: run ./scripts/langfuse_local.sh up first (or set LANGFUSE_* in $REPO/.env)" >&2; exit 1
fi
chmod 600 "$CONF_DIR/env"
grep -q '^LANGFUSE_SECRET_KEY=.' "$CONF_DIR/env" || { echo "LANGFUSE_SECRET_KEY is empty in $CONF_DIR/env" >&2; exit 1; }

"$PY" -I - "$HOOKS_JSON" "$PY $HOOK" <<'PY'
import json, os, sys
path, cmd = sys.argv[1], sys.argv[2]
d = json.load(open(path)) if os.path.exists(path) else {}
entry = lambda ev: {"type": "command", "command": f"{cmd} {ev}", "timeout": 10}
d["langfuse-tracing"] = {
    "enabled": True,
    "PostInvocation": [entry("PostInvocation")],
    "Stop": [entry("Stop")],
}
json.dump(d, open(path, "w"), indent=2)
PY
echo "Installed: $HOOKS_JSON (group: langfuse-tracing)"
echo "Restart agy (hooks load at startup; only in trusted folders). Logs: ~/.cache/agy-langfuse/hook.log"
