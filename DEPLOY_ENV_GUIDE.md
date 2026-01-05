# 🚀 DEPLOYMENT: How to Handle .env Files

## The Setup

```
server/
├── .env                           ← YOU EDIT THIS (main config)
├── server.js
├── start-all.js                   ← Reads main .env
└── lightrag/
    └── Lightrag_main/
        └── .env                   ← AUTO-GENERATED (don't touch)
```

## 🌐 DEPLOYMENT OPTIONS

### Option 1: Environment Variables (RECOMMENDED) ⭐

**Render / Railway / Fly.io / Heroku**

Just add these in your hosting dashboard:

```env
# Express Server
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# LightRAG Config  
LIGHTRAG_HOST=0.0.0.0
LIGHTRAG_PORT=9621
LIGHTRAG_API_URL=http://localhost:9621

# AI Keys
OPENAI_API_KEY=sk-your-key-here

# CORS
CORS_ORIGINS=https://your-frontend.com
```

**What happens:**
1. Your hosting platform sets these environment variables
2. `start-all.js` reads them
3. Auto-creates `lightrag/.env` with correct values
4. Both servers start

✅ **You set variables ONCE in dashboard**
✅ **Startup script handles both servers**

---

### Option 2: Upload .env File

**Platforms that support file upload:**

Upload ONLY `server/.env`:
```
📁 Upload: server/.env
```

**Don't upload** `lightrag/.env` - it's auto-generated!

---

## 📋 Example: Deploy to Render

### Step 1: Create Web Service
```
Repository: github.com/yourname/convo-companion
Root Directory: server
```

### Step 2: Set Build Command
```bash
npm install && cd lightrag/Lightrag_main && python -m venv .venv && .venv/bin/pip install -r requirements-offline.txt
```

### Step 3: Set Start Command
```bash
npm start
```

### Step 4: Add Environment Variables (Dashboard)

Click "Environment" tab and add:

| Key | Value |
|-----|-------|
| PORT | 3000 |
| MONGODB_URI | mongodb+srv://user:pass@... |
| OPENAI_API_KEY | sk-... |
| LIGHTRAG_PORT | 9621 |
| CORS_ORIGINS | https://myapp.com |

### Step 5: Deploy

Click "Deploy" - Done! ✅

---

## 📋 Example: Deploy to Railway

### Step 1: New Project
```
Add service -> GitHub Repo
```

### Step 2: Settings

**Root Directory:** `server`

**Build Command:**
```bash
npm install && cd lightrag/Lightrag_main && python -m venv .venv && .venv/bin/pip install -r requirements-offline.txt
```

**Start Command:**
```bash
npm start
```

### Step 3: Variables Tab

Add variables:
```env
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
PORT=3000
LIGHTRAG_PORT=9621
```

### Step 4: Deploy
Railway auto-deploys ✅

---

## 📋 Example: Deploy to Heroku

### Step 1: Create App
```bash
heroku create my-convo-companion
```

### Step 2: Set Buildpacks
```bash
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/python
```

### Step 3: Set Config Vars
```bash
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set OPENAI_API_KEY="sk-..."
heroku config:set PORT=3000
heroku config:set LIGHTRAG_PORT=9621
```

### Step 4: Deploy
```bash
git push heroku main
```

---

## ⚙️ What Happens During Deployment

```
1. Platform reads environment variables
   ↓
2. npm start runs
   ↓
3. start-all.js executes
   ↓
4. Reads process.env (from platform)
   ↓
5. Creates lightrag/.env automatically
   ↓
6. Starts Express server (3000)
   ↓
7. Starts LightRAG server (9621)
   ↓
8. Both servers running ✅
```

---

## 🔑 KEY POINTS

### ✅ What You Do:
1. Set environment variables in hosting dashboard
2. Click deploy
3. Done!

### ✅ What Happens Automatically:
1. Platform provides environment variables
2. Startup script reads them
3. Creates `lightrag/.env` on the fly
4. Both servers start

### ❌ What You DON'T Do:
- ❌ Don't manually create `lightrag/.env` 
- ❌ Don't upload multiple .env files
- ❌ Don't SSH into server to configure

---

## 🎯 TLDR (Too Long, Didn't Read)

**For deployment:**
1. Set environment variables in your hosting dashboard
2. Run `npm start`
3. That's it! 

The startup script handles creating the second .env file automatically.

**You manage ONE set of variables in ONE place (hosting dashboard).**

---

## 🐛 Troubleshooting

**Q: Do I need to commit .env files to git?**
❌ NO! Both .env files are in .gitignore

**Q: What if my hosting platform doesn't support .env files?**
✅ Use environment variables in dashboard (all platforms support this)

**Q: Can I test this locally?**
✅ Yes! Edit `server/.env` and run `npm start`

**Q: What about secrets/API keys?**
✅ Set them as environment variables in your hosting dashboard - never commit them to git

**Q: Do I need to manually sync two .env files?**
❌ NO! You only edit `server/.env` - the other is auto-generated
