# Bhuvi Chatbot - Unified Deployment

## 🎯 KEY POINT: ONE .env FILE

**You only need to edit ONE file**: `server/.env`

This single file configures both:
- ✅ Express Server (Node.js)
- ✅ LightRAG Server (Python)

👉 **See [ENV_GUIDE.md](ENV_GUIDE.md) for complete .env documentation**

## 🚀 Quick Start

### First Time Setup

**Windows:**
```bash
cd server
npm run setup:windows
```

**Linux/Mac:**
```bash
cd server
chmod +x setup.sh
npm run setup:unix
```

This will:
- Install Node.js dependencies
- Create Python virtual environment (`.venv`)
- Install all Python dependencies for LightRAG
- Check for required `.env` files

### Start the Server

```bash
cd server
npm start
```

This single command starts:
1. **LightRAG Python Server** (port 8020)
2. **Express Node.js Server** (port 3000)

## 📋 Manual Setup (if setup script fails)

### 1. Install Node.js dependencies
```bash
cd server
npm install
```

### 2. Setup Python environment
```bash
cd lightrag/Lightrag_main

# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements-offline.txt
```

### 3. Configure environment variables

**Create `server/.env`:**
```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bhuvi-chatbot
```

**Create `server/lightrag/Lightrag_main/.env`:**
```env
OPENAI_API_KEY=your_openai_api_key
# Add other LightRAG config from env.example
```

## 🌐 Deployment (Production)

### Important: .env File Setup

LightRAG requires a `.env` file in the startup directory. The startup script will automatically create one if missing, but for production you should:

1. **Create `.env` before deployment** or
2. **Set environment variables directly** in your hosting platform

### Render / Railway / Fly.io

1. **Build Command:**
   ```bash
   cd server && npm install && cd lightrag/Lightrag_main && cp env.example .env && python -m venv .venv && .venv/bin/pip install -r requirements-offline.txt
   ```

2. **Start Command:**
   ```bash
   cd server && npm start
   ```

3. **Environment Variables (Set in Dashboard):**
   ```env
   # Express Server
   PORT=3000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
   LIGHTRAG_API_URL=http://localhost:9621
   
   # LightRAG (These will be written to .env automatically)
   HOST=0.0.0.0
   OPENAI_API_KEY=sk-your-key-here
   CORS_ORIGINS=https://your-frontend-domain.com
   ```

### Docker Deployment (Coming Soon)

The project will include a Dockerfile that:
- ✅ Creates all required .env files
- ✅ Installs Python and Node.js dependencies
- ✅ Runs both servers in one container
- ✅ No interactive prompts

### Heroku

Add these files:

**`Procfile`** in `server/` directory:
```
web: npm start
```

**`runtime.txt`** (if needed):
```
python-3.11
```

Set all environment variables in Heroku dashboard.

## ⚙️ Environment Variables

### Required for Express Server (`server/.env`)
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string

### Required for LightRAG (`server/lightrag/Lightrag_main/.env`)
- `OPENAI_API_KEY` - Your OpenAI API key
- See `env.example` for full configuration options

### Optional
- `PYTHON_EXECUTABLE` - Path to Python executable (auto-detected if not set)

## 🔧 Troubleshooting

**Error: "ModuleNotFoundError: No module named 'httpx'"**
- Python dependencies not installed
- Solution: Run the setup script or manually install dependencies

**LightRAG server won't start:**
```bash
cd server/lightrag/Lightrag_main
.venv\Scripts\activate  # or source .venv/bin/activate on Linux/Mac
python -m lightrag.api.lightrag_server
# Check for errors
```

**Express server won't start:**
- Check MongoDB connection string in `.env`
- Verify port 3000 is available

**On production, servers exit immediately:**
- Ensure Python is available on the hosting platform
- Check all environment variables are set
- Review build logs for missing dependencies

## 📝 Development Commands

```bash
npm start              # Start both servers (production mode)
npm run dev:all        # Start both servers (development)
npm run start:express  # Start only Express server
npm run setup          # Check setup status
```
