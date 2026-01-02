# Render Deployment Setup

## Problem
The frontend is trying to call `https://convo-companion.onrender.com/api` but that URL is pointing to the frontend, not the backend API.

## Solution: Deploy Backend Separately

### Step 1: Create a New Render Service for the Backend

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo (or use "Public Git repository")
4. **Configure the backend service:**
   - **Name:** `convo-companion-api` (or similar)
   - **Root Directory:** `server` (since your backend is in `/server`)
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment Variables:**
     ```
     MONGODB_URI=mongodb+srv://murali_db_user:farmvaidya@cluster0.hgzl3np.mongodb.net/convo-companion
     PORT=3000
     ```

5. Deploy

### Step 2: Update Frontend Configuration

Once the backend is deployed, you'll get a URL like `https://convo-companion-api.onrender.com`

Update `.env.production`:
```
VITE_API_BASE_URL=https://convo-companion-api.onrender.com/api
VITE_LIGHTRAG_API_URL=https://overhumane-sloppily-su.ngrok-free.dev
```

### Step 3: Deploy Frontend

1. Update the frontend's `package.json` build to use `.env.production`
2. Push changes to GitHub
3. Render will auto-deploy

## Current Architecture

You need TWO separate Render services:
- **Frontend:** `convo-companion.onrender.com` (current - runs frontend)
- **Backend API:** `convo-companion-api.onrender.com` (new - needs to be created)

## Why This Matters

- Frontend serves HTML/JS (current URL)
- Backend serves API endpoints like `/api/sessions`, `/api/messages/save`, etc.
- They must be on different domains/services
