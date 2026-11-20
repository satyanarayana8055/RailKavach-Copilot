#!/usr/bin/env bash

# RailKavach Copilot - Full-Stack Start Script
# Runs FastAPI backend on :8000 and Next.js frontend on :3000

echo "🚆 Starting RailKavach Copilot Full-Stack System..."

# 1. Start FastAPI Backend
echo "⚡ Launching FastAPI Backend on http://localhost:8000..."
cd backend
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# 2. Start Next.js Frontend
echo "💻 Launching Next.js Frontend on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ RailKavach Copilot is live!"
echo "   - Frontend UI: http://localhost:3000"
echo "   - Backend API Docs: http://localhost:8000/docs"
echo "   - Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait
