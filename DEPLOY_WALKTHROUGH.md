# 🎬 Step-by-Step: Deploy to Render (Example)

## 📺 Watch Me Deploy (Text Version)

### STEP 1: Push Code to GitHub
```bash
git add .
git commit -m "Ready to deploy"
git push origin main
```

### STEP 2: Go to Render Dashboard
1. Visit https://render.com
2. Click "New +"
3. Select "Web Service"

### STEP 3: Connect Repository
1. Connect your GitHub account
2. Select "bhuvi-chatbot" repository
3. Click "Connect"

### STEP 4: Configure Service

**Name:** `bhuvi-chatbot-server`

**Region:** Choose nearest to you

**Branch:** `main`

**Root Directory:** `server` ⚠️ IMPORTANT!

**Runtime:** `Node`

**Build Command:**
```bash
chmod +x build.sh && ./build.sh
```

Or without the script:
```bash
npm install && cd lightrag/Lightrag_main && python3 -m venv .venv && source .venv/bin/activate && pip install --upgrade pip && pip install -r requirements-offline.txt
```

**Start Command:**
```bash
npm start
```

### STEP 5: Add Environment Variables

Click "Advanced" → "Add Environment Variable"

Add these ONE BY ONE:

```
Key: PORT
Value: 3000
```

```
Key: MONGODB_URI  
Value: mongodb+srv://youruser:yourpass@cluster0.mongodb.net/convo-companion
```

```
Key: OPENAI_API_KEY
Value: sk-your-actual-openai-key-here
```

```
Key: LIGHTRAG_PORT
Value: 9621
```

```
Key: LIGHTRAG_HOST
Value: 0.0.0.0
```

```
Key: CORS_ORIGINS
Value: https://your-frontend-domain.com
```

### STEP 6: Deploy

Click "Create Web Service"

Wait 5-10 minutes... ☕

### STEP 7: Check Logs

Watch the logs:
```
📦 Installing Node.js dependencies...
✅ Node modules installed

🐍 Setting up Python environment...
✅ Python dependencies installed

📝 Configuring LightRAG environment...
✅ LightRAG environment configured

🚀 Starting Convo Companion - Unified Server
📦 Starting LightRAG Server...
🌐 Starting Express Server...

✅ Server running on http://localhost:3000
```

### STEP 8: Test

Your app is live at: `https://convo-companion-server.onrender.com`

Test the health endpoint:
```
https://convo-companion-server.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "lightrag": "http://localhost:9621"
}
```

---

## ✅ DONE! 

**You deployed BOTH servers with ONE set of environment variables!**

No manual .env file creation needed.
No SSH access required.
No confusion!

---

## 📝 Summary of What Happened

1. ✅ You set environment variables in Render dashboard
2. ✅ Render runs `npm start`
3. ✅ `start-all.js` reads environment variables
4. ✅ Auto-creates `lightrag/.env` from those variables
5. ✅ Starts LightRAG server (port 9621)
6. ✅ Starts Express server (port 3000)
7. ✅ Both servers communicate internally
8. ✅ Your app is live!

---

## 🎯 The Key Insight

**You only configured environment variables ONCE.**

The startup script distributed them to both servers automatically.

This is the magic of the unified deployment system!
