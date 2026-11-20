# =========================================================================
# Stage 1: Build Next.js Static Single-Page Application (SPA)
# =========================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# =========================================================================
# Stage 2: Python FastAPI Production Runtime for Google Cloud Run
# =========================================================================
FROM python:3.11-slim AS runner

WORKDIR /app

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, data assets, and static frontend build
COPY backend/ ./backend/
COPY data/ ./data/
COPY --from=frontend-builder /build/out ./frontend/out

# Cloud Run Configuration
ENV PORT=8080
ENV HOST=0.0.0.0
ENV STATIC_DIR=/app/frontend/out
ENV DATA_DIR=/app/data
ENV PYTHONUNBUFFERED=1

EXPOSE 8080

CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8080"]
