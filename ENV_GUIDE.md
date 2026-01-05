# 🚀 ONE .ENV FILE - SIMPLE DEPLOYMENT

## ✅ The Solution: Single Configuration File

All configuration is now in **ONE FILE**: `server/.env`

This single file configures:
- ✅ Express Server (Node.js)
- ✅ LightRAG Server (Python)
- ✅ MongoDB connection
- ✅ API keys
- ✅ CORS settings

## 📝 The ONE .env File

Location: `server/.env`

```env
# ========================================
# EXPRESS SERVER
# ========================================
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# ========================================
# LIGHTRAG SERVER
# ========================================
LIGHTRAG_HOST=0.0.0.0
LIGHTRAG_PORT=9621
LIGHTRAG_API_URL=http://localhost:9621

WEBUI_TITLE=Convo Companion RAG
WEBUI_DESCRIPTION=Farm Vaidya Knowledge Base

CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:5173

# ========================================
# AI/LLM CONFIGURATION
# ========================================
OPENAI_API_KEY=sk-your-key-here

# Optional:
# ANTHROPIC_API_KEY=
# GEMINI_API_KEY=
# OLLAMA_BASE_URL=http://localhost:11434
```

## 🎯 How It Works

1. **You edit**: `server/.env` (the only file you touch)
2. **Startup script reads** this file
3. **Auto-generates** `server/lightrag/Lightrag_main/.env` for Python
4. **Both servers start** with correct configuration

```
server/.env  (YOU EDIT THIS)
     ↓
start-all.js (reads and distributes)
     ↓
  ┌──────┴──────┐
  ↓             ↓
Express      LightRAG
(Node)       (Python - auto .env)
```

## 🌐 Deployment Steps

### Local Development

1. **Edit** `server/.env` with your settings
2. **Run** `npm start`
3. **Done!** Both servers configured automatically

### Render / Railway / Fly.io / Heroku

#### Option 1: Use Dashboard (Recommended)

Just set these environment variables in your hosting dashboard:

```env
PORT=3000
MONGODB_URI=mongodb+srv://...
LIGHTRAG_HOST=0.0.0.0
LIGHTRAG_PORT=9621
LIGHTRAG_API_URL=http://localhost:9621
OPENAI_API_KEY=sk-...
CORS_ORIGINS=https://your-frontend-domain.com
```

**Build Command:**
```bash
cd server && npm install && cd lightrag/Lightrag_main && python -m venv .venv && .venv/bin/pip install -r requirements-offline.txt
```

**Start Command:**
```bash
cd server && npm start
```

#### Option 2: Upload .env File

Some platforms let you upload a `.env` file:
1. Upload `server/.env` 
2. Set build & start commands
3. Done!

## ❌ What You DON'T Need

- ❌ NO separate `.env` in `lightrag/Lightrag_main/` (auto-generated)
- ❌ NO manual configuration of Python environment
- ❌ NO copying values between files
- ❌ NO confusion about which file to edit

## 🔄 Update Configuration

**Local:**
```bash
# 1. Edit server/.env
# 2. Restart
npm start
```

**Production:**
```bash
# 1. Update environment variables in hosting dashboard
# 2. Restart/redeploy
```

## 📋 Required Variables (Minimum)

```env
# These 3 are REQUIRED:
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
PORT=3000

# These have defaults but you can override:
LIGHTRAG_HOST=0.0.0.0
LIGHTRAG_PORT=9621
```

## 🔒 Security Notes

1. **Never commit** `server/.env` to git (already in .gitignore)
2. **Use environment variables** in production dashboard
3. **Rotate keys** regularly
4. **Use different keys** for dev/staging/production

## 🐛 Troubleshooting

**Q: Changes to .env not working?**
```bash
# Restart both servers:
npm start
```

**Q: LightRAG can't find config?**
Check logs - the startup script shows which variables were loaded.

**Q: Production deployment fails?**
1. Verify ALL required variables are set in dashboard
2. Check build logs for errors
3. Ensure MongoDB URI and API keys are valid

## ✅ Benefits of Single .env

✅ **Simple**: Edit one file, not two  
✅ **Clear**: All configuration in one place  
✅ **Safe**: Less chance of mismatched configs  
✅ **Deploy-friendly**: One source of truth  
✅ **Version control**: Easy to template and share (without secrets)  

## 🎓 Example: Complete .env for Production

```env
# Production Configuration
PORT=3000
MONGODB_URI=mongodb+srv://produser:pass123@cluster0.mongodb.net/convo-prod

# LightRAG
LIGHTRAG_HOST=0.0.0.0
LIGHTRAG_PORT=9621
LIGHTRAG_API_URL=http://localhost:9621

WEBUI_TITLE=Farm Vaidya Assistant
WEBUI_DESCRIPTION=Agricultural Knowledge System

CORS_ORIGINS=https://myapp.com,https://www.myapp.com

# AI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Performance
TIMEOUT=180
LLM_TIMEOUT=150
EMBEDDING_TIMEOUT=120
```

Save this as `server/.env` and you're ready to deploy!
