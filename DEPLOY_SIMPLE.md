
# DEPLOYMENT: The Simple Truth

## Local Development

```
YOU EDIT THIS FILE:
┌─────────────────────────┐
│  server/.env            │
│                         │
│  PORT=3000              │
│  MONGODB_URI=...        │
│  OPENAI_API_KEY=...     │
└────────┬────────────────┘
         │
         │ npm start
         │
         ▼
    start-all.js
         │
         ├─────────────────────────┐
         │                         │
         │ AUTO-CREATES:           │
         │  lightrag/.env          │
         │  (with same values)     │
         └─────────────────────────┘
         │
         ▼
    Both servers start ✅
```

## Production Deployment (Render/Railway/Heroku)

```
HOSTING DASHBOARD:
┌──────────────────────────────────────┐
│  Environment Variables               │
│                                      │
│  PORT = 3000                         │
│  MONGODB_URI = mongodb+srv://...     │
│  OPENAI_API_KEY = sk-...             │
│  LIGHTRAG_PORT = 9621                │
└───────────┬──────────────────────────┘
            │
            │ Click "Deploy"
            │
            ▼
       npm start
            │
            ▼
       start-all.js
            │
            ├─────────────────────────┐
            │                         │
            │ AUTO-CREATES:           │
            │  lightrag/.env          │
            │  (from env vars)        │
            └─────────────────────────┘
            │
            ▼
       Both servers start ✅
```

## The Answer to Your Question

**Q: "How do I deploy both .env files?"**

**A: You DON'T!**

You only set environment variables ONCE in your hosting dashboard.

The startup script automatically:
1. Reads environment variables
2. Creates lightrag/.env with correct values
3. Starts both servers

## What You Actually Do

### Local:
```bash
# Edit this file
server/.env

# Run this
npm start

# Done!
```

### Production:
```
1. Go to hosting dashboard (Render/Railway/etc)
2. Add environment variables
3. Click deploy
4. Done!
```

## No Confusion Needed!

❌ DON'T: Try to upload two .env files
❌ DON'T: Manually create lightrag/.env
❌ DON'T: SSH into server to configure

✅ DO: Set environment variables in hosting dashboard
✅ DO: Run npm start
✅ DO: Let the startup script handle the rest

