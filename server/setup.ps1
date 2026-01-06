# Bhuvi Chatbot Setup Script for Windows
Write-Host "🚀 Setting up Bhuvi Chatbot..." -ForegroundColor Cyan

# 1. Install Node.js dependencies
Write-Host "`n📦 Installing Node.js dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Node.js dependencies" -ForegroundColor Red
    exit 1
}

# 2. Setup Python environment for LightRAG
Write-Host "`n🐍 Setting up Python environment for LightRAG..." -ForegroundColor Yellow
$lightragPath = Join-Path $PSScriptRoot "lightrag\Lightrag_main"
Set-Location $lightragPath

# Check if .venv exists
if (Test-Path ".venv") {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
} else {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        Write-Host "💡 Make sure Python 3.9+ is installed" -ForegroundColor Yellow
        exit 1
    }
}

# Activate virtual environment and install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
& ".venv\Scripts\Activate.ps1"
pip install --upgrade pip
pip install -r requirements-offline.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}

# 3. Check for .env files
Set-Location $PSScriptRoot
Write-Host "`n📝 Checking environment files..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found in server/" -ForegroundColor Yellow
    Write-Host "Creating default .env file..." -ForegroundColor Yellow
    @"
MONGODB_URI=your_mongodb_uri
PORT=3000
LIGHTRAG_API_URL=http://localhost:9621
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ Created .env file - please update with your credentials" -ForegroundColor Green
}

if (-not (Test-Path "$lightragPath\.env")) {
    Write-Host "⚠️  No .env file found in lightrag/Lightrag_main/" -ForegroundColor Yellow
    Write-Host "Creating default .env file from example..." -ForegroundColor Yellow
    Copy-Item "$lightragPath\env.example" "$lightragPath\.env"
    Write-Host "✅ Created .env file - please update with your API keys" -ForegroundColor Green
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "🚀 To start the server, run: npm start" -ForegroundColor Cyan
