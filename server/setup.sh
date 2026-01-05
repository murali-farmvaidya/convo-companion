#!/bin/bash
# Convo Companion Setup Script for Linux/Mac

echo "🚀 Setting up Convo Companion..."

# 1. Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

# 2. Setup Python environment for LightRAG
echo ""
echo "🐍 Setting up Python environment for LightRAG..."
cd lightrag/Lightrag_main

# Check if .venv exists
if [ -d ".venv" ]; then
    echo "✅ Virtual environment already exists"
else
    echo "Creating virtual environment..."
    python3 -m venv .venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        echo "💡 Make sure Python 3.9+ is installed"
        exit 1
    fi
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements-offline.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# 3. Check for .env files
cd ../..
echo ""
echo "📝 Checking environment files..."

if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found in server/"
    echo "Creating default .env file..."
    cat > .env << 'EOF'
MONGODB_URI=your_mongodb_uri
PORT=3000
LIGHTRAG_API_URL=http://localhost:9621
EOF
    echo "✅ Created .env file - please update with your credentials"
fi

if [ ! -f "lightrag/Lightrag_main/.env" ]; then
    echo "⚠️  No .env file found in lightrag/Lightrag_main/"
    echo "Creating default .env file from example..."
    cp lightrag/Lightrag_main/env.example lightrag/Lightrag_main/.env
    echo "✅ Created .env file - please update with your API keys"
fi

echo ""
echo "✅ Setup complete!"
echo "🚀 To start the server, run: npm start"
