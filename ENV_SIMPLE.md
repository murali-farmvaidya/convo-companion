
# 🎯 SIMPLE: ONE .ENV FILE

```
┌─────────────────────────────────────────────────┐
│         server/.env (YOU EDIT THIS!)            │
│                                                  │
│  PORT=3000                                       │
│  MONGODB_URI=mongodb+srv://...                  │
│  OPENAI_API_KEY=sk-...                          │
│  LIGHTRAG_PORT=9621                             │
│  CORS_ORIGINS=http://localhost:3000,...         │
└────────────────┬────────────────────────────────┘
                 │
                 │ npm start
                 │
                 ▼
         ┌───────────────┐
         │ start-all.js  │  (reads .env)
         └───────┬───────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│   Express    │  │    LightRAG      │
│   Server     │  │  (auto .env)     │
│  (Port 3000) │  │  (Port 9621)     │
└──────────────┘  └──────────────────┘
```

## 📝 What You Edit

**ONE FILE**: `server/.env`

```env
PORT=3000
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
LIGHTRAG_PORT=9621
```

## 🤖 What Happens Automatically

1. You run `npm start`
2. Script reads `server/.env`
3. **Auto-creates** `lightrag/.env` with correct values
4. Both servers start with proper config

## 🌐 For Production (Render/Railway/etc)

Just set these in your dashboard:
```env
MONGODB_URI=...
OPENAI_API_KEY=...
PORT=3000
LIGHTRAG_PORT=9621
```

**That's it!** No multiple files to manage.

