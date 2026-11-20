#!/usr/bin/env bash
# =============================================================================
# Google Cloud Run One-Click Deployment Script
# RailKavach Copilot — AiSPRY Technologies (Startup Buildathon India 2026)
# =============================================================================

set -e

PROJECT_ID=${1:-$GOOGLE_CLOUD_PROJECT}
REGION=${2:-"asia-south1"} # Default: Mumbai / India
SERVICE_NAME="railkavach-copilot"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Google Cloud Project ID is required."
  echo "Usage: ./scripts/deploy_cloud_run.sh <YOUR_GCP_PROJECT_ID> [REGION]"
  echo "Example: ./scripts/deploy_cloud_run.sh aispray-railkavach-2026 asia-south1"
  exit 1
fi

echo "====================================================================="
echo "🚀 Deploying RailKavach Copilot to Google Cloud Run"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Service: $SERVICE_NAME"
echo "====================================================================="

# Check gcloud CLI
if ! command -v gcloud &> /dev/null; then
  echo "⚠️ 'gcloud' CLI was not found."
  echo "Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
  echo "Or deploy via Google Cloud Console: https://console.cloud.google.com/run"
  exit 1
fi

# -----------------------------------------------------------------------------
# Langfuse observability (mandatory). Keys come from the shell env or ./.env.
# -----------------------------------------------------------------------------
# Values exported in the shell win over .env (so deploy can use cloud keys while .env holds local ones)
_SHELL_PK=${LANGFUSE_PUBLIC_KEY:-}; _SHELL_SK=${LANGFUSE_SECRET_KEY:-}; _SHELL_URL=${LANGFUSE_BASE_URL:-}
if [ -f .env ]; then
  set -a; . ./.env; set +a
fi
LANGFUSE_PUBLIC_KEY=${_SHELL_PK:-${LANGFUSE_PUBLIC_KEY:-}}
LANGFUSE_SECRET_KEY=${_SHELL_SK:-${LANGFUSE_SECRET_KEY:-}}
LANGFUSE_BASE_URL=${_SHELL_URL:-${LANGFUSE_BASE_URL:-}}
LANGFUSE_BASE_URL=${LANGFUSE_BASE_URL:-${LANGFUSE_HOST:-https://cloud.langfuse.com}}
if [ -z "$LANGFUSE_PUBLIC_KEY" ] || [ -z "$LANGFUSE_SECRET_KEY" ]; then
  echo "❌ Error: LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY are required for deployment."
  echo "   Set them in .env or export them, then re-run. (Get keys: Langfuse → Project Settings → API Keys)"
  exit 1
fi
case "$LANGFUSE_BASE_URL" in
  *localhost*|*127.0.0.1*)
    echo "❌ Error: LANGFUSE_BASE_URL is $LANGFUSE_BASE_URL. Cloud Run cannot reach a local Langfuse."
    echo "   For deploy, export the Langfuse Cloud or hosted URL and its keys, e.g.:"
    echo "   LANGFUSE_BASE_URL=https://cloud.langfuse.com LANGFUSE_PUBLIC_KEY=pk-lf-... LANGFUSE_SECRET_KEY=sk-lf-... $0 $PROJECT_ID"
    exit 1 ;;
esac
APP_RELEASE=$(git rev-parse --short HEAD 2>/dev/null || echo "manual")

# Enable required GCP APIs
echo "📡 Enabling Cloud Run, Cloud Build and Secret Manager APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com --project "$PROJECT_ID"

# Store Langfuse keys in Secret Manager (new version on every deploy) and let the runtime SA read them
upsert_secret() {
  local name=$1 value=$2
  if ! gcloud secrets describe "$name" --project "$PROJECT_ID" &> /dev/null; then
    gcloud secrets create "$name" --project "$PROJECT_ID" --replication-policy=automatic
  fi
  printf '%s' "$value" | gcloud secrets versions add "$name" --project "$PROJECT_ID" --data-file=- > /dev/null
}
echo "🔐 Syncing Langfuse keys to Secret Manager..."
upsert_secret langfuse-public-key "$LANGFUSE_PUBLIC_KEY"
upsert_secret langfuse-secret-key "$LANGFUSE_SECRET_KEY"

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
for s in langfuse-public-key langfuse-secret-key; do
  gcloud secrets add-iam-policy-binding "$s" --project "$PROJECT_ID" \
    --member="serviceAccount:${RUNTIME_SA}" --role="roles/secretmanager.secretAccessor" > /dev/null
done

# Build and Deploy directly using Google Cloud Build
echo "📦 Submitting source build and deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --port 8080 \
  --set-env-vars="STATIC_DIR=/app/frontend/out,DATA_DIR=/app/data,ENABLE_CACHE_FALLBACK=true,LANGFUSE_REQUIRED=true,LANGFUSE_BASE_URL=${LANGFUSE_BASE_URL},APP_ENV=production,APP_RELEASE=${APP_RELEASE}" \
  --set-secrets="LANGFUSE_PUBLIC_KEY=langfuse-public-key:latest,LANGFUSE_SECRET_KEY=langfuse-secret-key:latest"

# Fetch Service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" --format='value(status.url)')

# Verify Langfuse is live in the deployed revision
echo "🔎 Verifying Langfuse tracing on the live service..."
if curl -fsS "$SERVICE_URL/api/health" | grep -q '"enabled":true'; then
  echo "   ✅ Langfuse tracing enabled → $LANGFUSE_BASE_URL"
else
  echo "   ❌ Langfuse is NOT enabled on the deployed service. Check: gcloud run services logs read $SERVICE_NAME --region $REGION"
  exit 1
fi

echo ""
echo "====================================================================="
echo "🎉 SUCCESS! RailKavach Copilot is live on Google Cloud Run:"
echo "   URL: $SERVICE_URL"
echo "   API Health: $SERVICE_URL/api/health"
echo "====================================================================="
