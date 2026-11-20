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

# Enable required GCP APIs
echo "📡 Enabling Cloud Run and Cloud Build APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com --project "$PROJECT_ID"

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
  --set-env-vars="STATIC_DIR=/app/frontend/out,DATA_DIR=/app/data,ENABLE_CACHE_FALLBACK=true"

# Fetch Service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" --format='value(status.url)')

echo ""
echo "====================================================================="
echo "🎉 SUCCESS! RailKavach Copilot is live on Google Cloud Run:"
echo "   URL: $SERVICE_URL"
echo "   API Health: $SERVICE_URL/api/health"
echo "====================================================================="
