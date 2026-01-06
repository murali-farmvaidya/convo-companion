# Bhuvi Chatbot Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                    (http://localhost:8080)                   │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              EXPRESS.JS SERVER (Node.js)                     │
│                   PORT: 3000                                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   MongoDB API Routes                                  │  │
│  │   - /api/messages    (chat history)                  │  │
│  │   - /api/sessions    (user sessions)                 │  │
│  │   - /api/register    (user registration)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   LightRAG Proxy Route                               │  │
│  │   - /api/lightrag/query  → forwards to LightRAG     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└───────────┬──────────────────────────────┬───────────────────┘
            │                              │
            │ Mongoose                     │ HTTP Proxy
            ▼                              ▼
┌───────────────────────┐    ┌─────────────────────────────────┐
│   MONGODB DATABASE    │    │  LIGHTRAG API SERVER (Python)   │
│  (Cloud/Atlas)        │    │      PORT: 9621                 │
│                       │    │                                 │
│  Collections:         │    │  FastAPI Server                 │
│  - users              │    │  - /query    (RAG queries)      │
│  - messages           │    │  - /insert   (add documents)    │
│  - sessions           │    │  - /health   (status check)     │
└───────────────────────┘    └─────────────────────────────────┘
```

## 📊 Data Flow

### 1. **Chat Message Flow**
```
User types message → Frontend (8080)
                      ↓
                  Express Server (3000)
                      ↓
            ┌─────────┴─────────┐
            ▼                   ▼
    Save to MongoDB      Proxy to LightRAG (9621)
            │                   │
            └─────────┬─────────┘
                      ↓
            Return response to Frontend
```

### 2. **User Registration Flow**
```
User submits form → Frontend
                      ↓
                  Express /api/register
                      ↓
                  Save to MongoDB
                      ↓
                  Return success
```

## 🚀 Starting the System

### Single Command (Recommended)
```bash
cd server
npm start
```

This starts:
1. **LightRAG Python Server** (port 9621) - AI/RAG processing
2. **Express Node.js Server** (port 3000) - API gateway + MongoDB

### What Runs Where

| Component | Port | Purpose |
|-----------|------|---------|
| Frontend (Dev) | 8080 | React UI served by Vite |
| Express Server | 3000 | API Gateway, MongoDB CRUD |
| LightRAG API | 9621 | RAG queries, document processing |

## 🔄 Communication Patterns

### Option 1: Through Proxy (Recommended for Production)
```
Frontend → Express (/api/lightrag/query) → LightRAG
```
**Benefits:**
- ✅ Single domain (no CORS issues)
- ✅ Centralized auth/logging
- ✅ Easy to add rate limiting

### Option 2: Direct Call (Current Setup)
```
Frontend → LightRAG (http://localhost:9621/query)
```
**Note:** Requires CORS configuration in LightRAG

## 🌐 Production Deployment

### Single Deployment (Render/Railway)
Both servers run in one container:
```bash
# Build Command
cd server && npm install && cd lightrag/Lightrag_main && python -m venv .venv && .venv/bin/pip install -r requirements-offline.txt

# Start Command
cd server && npm start
```

### Environment Variables
```env
# Express Server
PORT=3000
MONGODB_URI=mongodb+srv://...
LIGHTRAG_API_URL=http://localhost:9621

# LightRAG (in lightrag/Lightrag_main/.env)
OPENAI_API_KEY=sk-...
```

## 🔒 Security Notes

### CORS Configuration
Express allows these origins:
- `http://localhost:5173` (Vite default)
- `http://localhost:8080` (Vite alternative)
- `http://localhost:3000` (Express itself)
- `http://localhost:9621` (LightRAG)
- `https://*.onrender.com` (Production)

### Production Considerations
1. Add authentication middleware
2. Rate limit LightRAG proxy
3. Validate all inputs
4. Use HTTPS
5. Set proper CORS for production domain

## 🐛 Troubleshooting

### CORS Errors
**Symptom:** "No 'Access-Control-Allow-Origin' header"
**Solution:** 
1. Check Express CORS config includes your frontend port
2. Restart Express server after changes

### LightRAG Connection Failed
**Symptom:** "Failed to fetch" when querying
**Solution:**
1. Check LightRAG is running: `curl http://localhost:9621/health`
2. Check firewall isn't blocking port 9621
3. Verify `LIGHTRAG_API_URL` in `.env`

### MongoDB Connection Issues
**Symptom:** "MongoDB connection error"
**Solution:**
1. Check `MONGODB_URI` in `.env`
2. Verify MongoDB Atlas IP whitelist
3. Test connection string

## 📝 API Endpoints

### Express Server (Port 3000)

#### MongoDB Operations
- `GET /api/messages?sessionId=xxx` - Get chat history
- `POST /api/messages` - Save new message
- `GET /api/sessions?email=xxx` - Get user sessions
- `POST /api/register` - Register new user

#### LightRAG Proxy
- `POST /api/lightrag/query` - Query LightRAG (proxied)

#### Health Check
- `GET /api/health` - Server status

### LightRAG Server (Port 9621)
- `POST /query` - RAG query
- `POST /insert` - Add documents
- `GET /health` - Server status

## 🔮 Future Improvements

1. **API Gateway Pattern**
   - Move all LightRAG calls through Express proxy
   - Add request logging and analytics
   - Implement caching layer

2. **Microservices**
   - Separate MongoDB service
   - Separate LightRAG service
   - Use Docker Compose

3. **Load Balancing**
   - Multiple LightRAG instances
   - Redis for session management
   - CDN for static assets
