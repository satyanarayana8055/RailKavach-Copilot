#!/usr/bin/env bash
# =============================================================================
# Local self-hosted Langfuse for RailKavach Copilot development
#   ./scripts/langfuse_local.sh up     # start (first run generates secrets + API keys)
#   ./scripts/langfuse_local.sh down   # stop (data kept in Docker volumes)
#   ./scripts/langfuse_local.sh reset  # stop and delete all local trace data
#   ./scripts/langfuse_local.sh logs
#   ./scripts/langfuse_local.sh link-app # also send the RailKavach backend's traces here
# By default this instance holds only Antigravity CLI (agy) traces
# (see scripts/install_antigravity_langfuse.sh); the backend is not linked.
# UI: http://localhost:3100. Login and keys are in infra/langfuse/.env (gitignored).
# Local only: Cloud Run cannot reach this. Deploys need a public Langfuse URL.
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LF_DIR="$ROOT/infra/langfuse"
LF_ENV="$LF_DIR/.env"
APP_ENV_FILE="$ROOT/.env"
PORT="${LANGFUSE_WEB_PORT:-3100}"
COMPOSE=(docker compose -p railkavach-langfuse -f "$LF_DIR/docker-compose.yml" --env-file "$LF_ENV")

rand() { openssl rand -hex "$1"; }

init_env() {
  [ -f "$LF_ENV" ] && return
  echo "🔑 Generating local Langfuse secrets → infra/langfuse/.env"
  local pg ch minio redis
  pg=$(rand 16); ch=$(rand 16); minio=$(rand 16); redis=$(rand 16)
  umask 077
  cat > "$LF_ENV" <<EOF
LANGFUSE_WEB_PORT=$PORT
NEXTAUTH_URL=http://localhost:$PORT
NEXTAUTH_SECRET=$(rand 32)
SALT=$(rand 32)
ENCRYPTION_KEY=$(rand 32)
TELEMETRY_ENABLED=false
POSTGRES_PASSWORD=$pg
DATABASE_URL=postgresql://postgres:$pg@postgres:5432/postgres
CLICKHOUSE_PASSWORD=$ch
MINIO_ROOT_PASSWORD=$minio
LANGFUSE_S3_EVENT_UPLOAD_SECRET_ACCESS_KEY=$minio
LANGFUSE_S3_MEDIA_UPLOAD_SECRET_ACCESS_KEY=$minio
LANGFUSE_S3_BATCH_EXPORT_SECRET_ACCESS_KEY=$minio
REDIS_AUTH=$redis

# Headless init: org, project, API keys and login are created on first start
LANGFUSE_INIT_ORG_ID=railkavach
LANGFUSE_INIT_ORG_NAME=RailKavach
LANGFUSE_INIT_PROJECT_ID=railkavach-copilot
LANGFUSE_INIT_PROJECT_NAME=RailKavach Copilot
LANGFUSE_INIT_PROJECT_PUBLIC_KEY=pk-lf-local-$(rand 8)
LANGFUSE_INIT_PROJECT_SECRET_KEY=sk-lf-local-$(rand 16)
LANGFUSE_INIT_USER_EMAIL=admin@railkavach.local
LANGFUSE_INIT_USER_NAME=RailKavach Admin
LANGFUSE_INIT_USER_PASSWORD=$(rand 12)
EOF
}

# Write the local keys into the app's .env so the backend traces to this instance
link_app_env() {
  local pk sk
  pk=$(grep '^LANGFUSE_INIT_PROJECT_PUBLIC_KEY=' "$LF_ENV" | cut -d= -f2-)
  sk=$(grep '^LANGFUSE_INIT_PROJECT_SECRET_KEY=' "$LF_ENV" | cut -d= -f2-)
  [ -f "$APP_ENV_FILE" ] || cp "$ROOT/.env.example" "$APP_ENV_FILE"
  set_kv() {
    if grep -q "^$1=" "$APP_ENV_FILE"; then
      sed -i.bak "s#^$1=.*#$1=$2#" "$APP_ENV_FILE" && rm -f "$APP_ENV_FILE.bak"
    else
      echo "$1=$2" >> "$APP_ENV_FILE"
    fi
  }
  set_kv LANGFUSE_PUBLIC_KEY "$pk"
  set_kv LANGFUSE_SECRET_KEY "$sk"
  set_kv LANGFUSE_BASE_URL "http://localhost:$PORT"
  echo "🔗 .env now points the backend at http://localhost:$PORT"
}

wait_healthy() {
  echo -n "⏳ Waiting for Langfuse"
  for _ in $(seq 1 90); do
    if curl -fsS "http://localhost:$PORT/api/public/health" > /dev/null 2>&1; then
      echo " ✅"; return
    fi
    echo -n "."; sleep 2
  done
  echo " ❌ not healthy after 3 min. Check: $0 logs"; exit 1
}

case "${1:-up}" in
  up)
    docker info > /dev/null 2>&1 || { echo "❌ Docker is not running. Start Docker Desktop first."; exit 1; }
    init_env
    "${COMPOSE[@]}" up -d
    wait_healthy
    echo ""
    echo "🎛  Langfuse UI: http://localhost:$PORT"
    echo "   Login:  $(grep '^LANGFUSE_INIT_USER_EMAIL=' "$LF_ENV" | cut -d= -f2-)"
    echo "   Password: in infra/langfuse/.env (LANGFUSE_INIT_USER_PASSWORD)"
    echo "   Traces: Antigravity CLI (agy) only. Run '$0 link-app' to add backend traces."
    ;;
  link-app) link_app_env; echo "   Restart the backend to pick up the keys." ;;
  down)  "${COMPOSE[@]}" down ;;
  reset) "${COMPOSE[@]}" down -v && rm -f "$LF_ENV" && echo "🧹 Local Langfuse data and secrets removed" ;;
  logs)  "${COMPOSE[@]}" logs -f --tail=100 ;;
  *) echo "Usage: $0 {up|down|reset|logs|link-app}"; exit 1 ;;
esac
