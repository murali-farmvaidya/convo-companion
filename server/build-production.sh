#!/bin/bash
# Production Build Script
# This script prepares the application for deployment

set -e  # Exit on any error

echo "🚀 Building Convo Companion for Production..."

# 1. Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install --production

# 2. Setup Python environment
echo ""
echo "🐍 Setting up Python environment..."
cd lightrag/Lightrag_main

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
HOST=0.0.0.0
PORT=9621
WEBUI_TITLE='Convo Companion RAG'
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
OPENAI_API_KEY=${OPENAI_API_KEY}
EOF
fi

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Install dependencies
echo "Installing Python dependencies..."
source .venv/bin/activate
pip install --upgrade pip --quiet
pip install -r requirements-offline.txt --quiet

cd ../..

# 3. Verify setup
echo ""
echo "✅ Build complete!"
echo ""
echo "📋 Deployment Checklist:"
echo "  ✅ Node.js dependencies installed"
echo "  ✅ Python virtual environment created"
echo "  ✅ Python dependencies installed"
echo "  ✅ .env file created"
echo ""
echo "⚠️  Don't forget to set these environment variables:"
echo "  - MONGODB_URI"
echo "  - OPENAI_API_KEY"
echo "  - PORT (optional, defaults to 3000)"
echo ""
echo "🚀 Ready to deploy! Start with: npm start"
