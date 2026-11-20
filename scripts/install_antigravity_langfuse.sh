#!/usr/bin/env bash
# Trace your Antigravity CLI (agy) prompts into Langfuse.
#   ./scripts/install_antigravity_langfuse.sh            # install / update
#   ./scripts/install_antigravity_langfuse.sh --uninstall
# Reads LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY / LANGFUSE_BASE_URL from the repo .env
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
( umask 077; grep -E '^LANGFUSE_(PUBLIC_KEY|SECRET_KEY|BASE_URL|HOST)=' "$REPO/.env" > "$CONF_DIR/env" )
chmod 600 "$CONF_DIR/env"
grep -q '^LANGFUSE_SECRET_KEY=.' "$CONF_DIR/env" || { echo "LANGFUSE keys missing in $REPO/.env" >&2; exit 1; }

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
