#!/bin/bash
# Render Build Script - Installs both Node.js and Python dependencies

set -e

echo "🔧 Installing Node.js dependencies..."
npm install

echo "🐍 Setting up Python environment..."
cd lightrag/Lightrag_main

# Create virtual environment
python3 -m venv .venv

# Activate and install dependencies
source .venv/bin/activate
pip install --upgrade pip
pip install -e ".[api]"

echo "✅ Build complete!"
