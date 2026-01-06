# Render Environment Configuration

## Backend Service (convo-companion.onrender.com)

### Environment Variables to Set:
```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bhuvi-chatbot

# Server Configuration
PORT=3000

# LightRAG Configuration
LIGHTRAG_HOST=localhost
LIGHTRAG_PORT=9621
WEBUI_TITLE=Farm Vaidya AI Assistant

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
LLM_BINDING=openai
LLM_MODEL=gpt-4o-mini
EMBEDDING_BINDING=openai
EMBEDDING_MODEL=text-embedding-3-large
EMBEDDING_DIM=3072
EMBEDDING_BATCH_NUM=32

# CORS Configuration (already in code)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://convo-companion-uiii.onrender.com
```

### Build Settings:
- **Build Command**: `chmod +x build.sh && ./build.sh`
- **Start Command**: `npm start`

---

## Frontend Service (convo-companion-uiii.onrender.com)

### Environment Variables to Set:
```bash
# Backend API URL - IMPORTANT!
VITE_API_BASE_URL=https://convo-companion.onrender.com/api

# LightRAG URL - Use backend proxy instead of direct access
VITE_LIGHTRAG_API_URL=https://convo-companion.onrender.com/api/lightrag
```

### Build Settings:
- **Build Command**: `npm install && npm run build`
- **Start Command**: (Static site, no start command needed)
- **Publish Directory**: `dist`

---

## Important Notes:

### 1. Frontend Must Use Backend Proxy
Your frontend should **NOT** directly access the LightRAG server or use ngrok URLs. All requests should go through your Express backend:

```typescript
// ✅ CORRECT - Use backend proxy
VITE_LIGHTRAG_API_URL=https://convo-companion.onrender.com/api/lightrag

// ❌ WRONG - Don't use ngrok or direct access
VITE_LIGHTRAG_API_URL=https://overhumane-sloppily-su.ngrok-free.dev
```

### 2. After Setting Environment Variables
1. Go to your Render dashboard
2. Navigate to each service
3. Go to "Environment" tab
4. Add/update the variables listed above
5. Click "Manual Deploy" > "Clear build cache & deploy"

### 3. Verify Deployment
After both services redeploy:
- Backend should start both Express and LightRAG servers
- Frontend should successfully connect to backend API
- No CORS errors in browser console
- Chat functionality should work end-to-end

### 4. Troubleshooting CORS
If you still see CORS errors:
1. Check backend logs for "CORS blocked origin" messages
2. Verify `VITE_API_BASE_URL` exactly matches your backend URL
3. Make sure you deployed the latest code with CORS fixes
4. Try a hard refresh (Ctrl+Shift+R) on frontend
