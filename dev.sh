#!/bin/bash
# Quick start script for AegisSpeak React web app

cd "$(dirname "$0")/app"

echo "🛡️  AegisSpeak - React Web App"
echo "=============================="
echo ""
echo "Starting development environment..."
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API expected at: http://localhost:4000"
echo ""
echo "To also run the backend in another terminal:"
echo "  cd backend"
echo "  npm run dev"
echo ""

npm run dev
