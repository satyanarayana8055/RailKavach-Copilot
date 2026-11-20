#!/usr/bin/env bash
# =============================================================================
# Automated One-Command Cloud Run Deploy for RailKavach Copilot
# =============================================================================

set -e

PROJECT_ID=${1:-$(gcloud config get-value project 2>/dev/null)}
PROJECT_ID=${PROJECT_ID:-"seraphic-beacon-515305-d2"}
REGION=${2:-"asia-south1"}
SERVICE_NAME="railkavach-copilot"

echo "====================================================================="
echo "🚀 Deploying RailKavach Copilot to Google Cloud Run"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Service: $SERVICE_NAME"
echo "====================================================================="

PROJECT_NUM=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
echo "ℹ️ Project Number: $PROJECT_NUM"

echo "🔐 Configuring Service Account IAM permissions for Cloud Build..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUM}-compute@developer.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageConsumer" --quiet || true

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUM}-compute@developer.gserviceaccount.com" \
  --role="roles/artifactregistry.writer" --quiet || true

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUM}-compute@developer.gserviceaccount.com" \
  --role="roles/logging.logWriter" --quiet || true

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUM}@cloudbuild.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageConsumer" --quiet || true

echo "📦 Submitting build and deploying to Cloud Run..."
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
  --set-env-vars="STATIC_DIR=/app/frontend/out,DATA_DIR=/app/data,ENABLE_CACHE_FALLBACK=true,APP_ENV=production"

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" --format='value(status.url)')

echo ""
echo "====================================================================="
echo "🎉 SUCCESS! RailKavach Copilot is live on Google Cloud Run:"
echo "   URL: $SERVICE_URL"
echo "   API Health: $SERVICE_URL/api/health"
echo "====================================================================="
