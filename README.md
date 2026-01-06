# Convo Companion

A conversational AI companion application built with React, TypeScript, and LightRAG. This project features a full-stack chat interface with MongoDB for session management and LightRAG for intelligent AI responses.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation Guide](#installation-guide)
- [Environment Configuration](#environment-configuration)
- [Running the Project](#running-the-project)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## ⚡ Quick Start

**Want to run everything immediately? Follow these commands:**

### 🎯 Complete First-Time Setup (Run Once)

#### Automated Setup (Recommended - Installs Everything)

LightRAG packages are **NOT installed automatically**. Use the setup script to install everything at once:

**For Windows (PowerShell):**
```powershell
# 1. Clone and navigate to project
git clone <YOUR_GIT_URL>
cd convo-companion

# 2. Install frontend dependencies
npm install

# 3. Run automated setup for backend + LightRAG
cd server
npm run setup:windows
cd ..

# 4. Create .env file in the root directory
# Add your configuration (see Environment Configuration section)
```

**For Linux/Mac (Bash):**
```bash
# 1. Clone and navigate to project
git clone <YOUR_GIT_URL>
cd convo-companion

# 2. Install frontend dependencies
npm install

# 3. Run automated setup for backend + LightRAG
cd server
npm run setup:unix
cd ..

# 4. Create .env file in the root directory
# Add your configuration (see Environment Configuration section)
```

**What the setup script does:**
- ✅ Installs Node.js backend dependencies
- ✅ Creates Python virtual environment for LightRAG
- ✅ Installs all LightRAG Python packages from `requirements-offline.txt`
- ✅ Creates default `.env` files if they don't exist
- ✅ Validates the installation

---

#### Manual Setup (If You Prefer Step-by-Step)

If you want to install each component manually:

```powershell
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd server
npm install

# 3. Setup LightRAG manually (if you want to run it locally)
cd lightrag/Lightrag_main

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\Activate.ps1
# Linux/Mac:
source .venv/bin/activate

# Install LightRAG packages
pip install --upgrade pip
pip install -r requirements-offline.txt

# Return to project root
cd ../..
```

**Important:** `npm start` does **NOT** automatically install LightRAG packages. You must run the setup script or install them manually first!

---

### ⚡ Quick Run (After Setup)

Once you've completed the first-time setup above, starting the project is simple:

### For Windows (PowerShell):

```powershell
# Option 1: Run each service in separate terminals manually
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend (open a new terminal)
cd server
npm start

# Option 2: Auto-open multiple terminals with one command
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev"; Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd server; npm start"
```

### For Linux/Mac (Bash):

```bash
# Option 1: Run each service in separate terminals
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend (open new terminal)
cd server && npm start

# Option 2: Run both in background
npm run dev & (cd server && npm start) &
```

---

### 🔧 What Does `npm start` Do?

When you run `cd server && npm start`, it:
- ✅ Starts the Express.js backend server
- ✅ Connects to MongoDB
- ✅ Attempts to start LightRAG (if Python venv detected)
- ✅ Auto-detects Python virtual environment at `server/lightrag/Lightrag_main/.venv`
- ✅ Configures LightRAG environment variables from your main `.env`

**What it does NOT do:**
- ❌ Install Node.js packages
- ❌ Install Python/LightRAG packages
- ❌ Create virtual environments
- ❌ Set up initial configuration

**All packages must be installed first using the setup script or manually!**

---

### 📋 Check Your Setup

Before running `npm start`, verify everything is ready:

```bash
# Check if setup is complete
cd server
npm run setupcreated
- ✅ Python dependencies installed
- ✅ Port availability

---

### 🔄 Alternative: Use LightRAG via ngrok (Skip LightRAG Installation)

If you don't want to install LightRAG locally, you can use a remote instance:

1. **Run LightRAG on another machine** or use a hosted instance
2. **Expose it via ngrok:**
   ```bash
   ngrok http 9621
   ```
3. **Update your `.env` file:**
   ```env
   VITE_LIGHTRAG_API_URL=https://your-ngrok-url.ngrok-free.dev
   ```
4. **Skip the LightRAG setup** - just run frontend and backend:
   ```bash
   npm run dev
   cd server && npm run start:express
   ```

This way, you don't need to install Python packages locally!

This will check:
- ✅ Node modules installed
- ✅ Environment files exist
- ✅ Python virtual environment (if using LightRAG locally)
- ✅ Port availability

---

### Prerequisites Before Quick Start:
- ✅ Node.js installed
- ✅ `.env` file configured (see [Environment Configuration](#environment-configuration))
- ✅ MongoDB URI added to `.env`
- ✅ LightRAG URL added to `.env`

**Need help with setup?** Continue reading the detailed guide below. ⬇️

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js (v18 or higher)** and **npm**
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **MongoDB Account** (for database)
   - Create a free account at: https://www.mongodb.com/cloud/atlas
   - Or install MongoDB locally: https://www.mongodb.com/try/download/community

3. **LightRAG Instance** (for AI responses)
   - You can run LightRAG locally or use an ngrok tunnel
   - LightRAG repository: https://github.com/HKUDS/LightRAG

4. **Git** (for version control)
   - Download from: https://git-scm.com/
   - Verify installation:
     ```bash
     git --version
     ```

### Optional Tools

- **ngrok** (for exposing LightRAG to the internet): https://ngrok.com/
- **VS Code** (recommended IDE): https://code.visualstudio.com/

## 🛠 Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management

### Backend
- **Express.js** - Node.js web framework
- **MongoDB + Mongoose** - Database and ODM
- **CORS** - Cross-origin resource sharing

### AI Integration
- **LightRAG** - RAG (Retrieval Augmented Generation) system

## 📁 Project Structure

```
convo-companion/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── chat/               # Chat-specific components
│   │   └── ui/                 # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── pages/                  # Page components
│   ├── services/               # API service layers
│   │   ├── lightragApi.ts     # LightRAG API integration
│   │   └── mongoApi.ts        # MongoDB API integration
│   ├── types/                  # TypeScript type definitions
│   └── lib/                    # Utility functions
├── server/                      # Backend server code
│   ├── server.js              # Express server
│   └── package.json           # Server dependencies
├── public/                      # Static assets
├── .env                        # Environment variables (create this)
└── package.json                # Frontend dependencies
```

## 📥 Installation Guide

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd convo-companion
```

### Step 2: Install Frontend Dependencies

```bash
# In the root directory
npm install
```

⚠️ **Important:** This step is required! `npm start` will NOT install dependencies automatically.

### Step 3: Install Backend Dependencies

```bash
# Navigate to the server directory
cd server

# Install server dependencies
npm install

# Return to the root directory
cd ..
```

⚠️ **Important:** Backend dependencies must be installed before running `npm start`.

## ⚙️ Environment Configuration

### Step 1: Create Environment Files

Create a `.env` file in the **root directory** (not in the server folder):

```bash
# Windows (PowerShell)
New-Item .env

# Linux/Mac
touch .env
```

### Step 2: Configure Environment Variables

Open the `.env` file and add the following variables:

```env
# MongoDB Connection String
VITE_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Backend API URL (for local development)
VITE_API_BASE_URL=http://localhost:3000/api

# LightRAG API URL
# Option 1: Local LightRAG instance
VITE_LIGHTRAG_API_URL=http://localhost:9621

# Option 2: LightRAG via ngrok (if using remote/tunneled instance)
# VITE_LIGHTRAG_API_URL=https://your-ngrok-url.ngrok-free.dev

# Python executable (for LightRAG, if needed)
PYTHON_EXECUTABLE=python3
```

### Step 3: Configure MongoDB

1. **Sign up for MongoDB Atlas** (if you don't have an account):
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free cluster

2. **Get your connection string**:
   - In MongoDB Atlas, click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<database>` with your credentials

3. **Update .env file** with your MongoDB URI

### Step 4: Configure Server Environment (Optional)

Create a `.env` file in the **server** directory if you need server-specific variables:

```bash
cd server
# Windows
New-Item .env

# Linux/Mac
touch .env
```

Add the following to `server/.env`:

```env
# MongoDB Connection (same as frontend)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Server Port (default is 3000)
PORT=3000

# Node Environment
NODE_ENV=development
```

### Step 5: Set Up LightRAG

#### Option A: Running LightRAG Locally

1. Clone and set up LightRAG:
   ```bash
   # In a separate directory
   git clone https://github.com/HKUDS/LightRAG.git
   cd LightRAG
   
   # Follow LightRAG setup instructions
   pip install -e .
   ```

2. Start LightRAG server:
   ```bash
   # Run LightRAG (default port 9621)
   python lightrag_api_server.py
   ```

3. Your `.env` should have:
   ```env
   VITE_LIGHTRAG_API_URL=http://localhost:9621
   ```

#### Option B: Using LightRAG via ngrok

1. If LightRAG is running on a different machine or you want to expose it:
   ```bash
   # Start ngrok tunnel
   ngrok http 9621
   ```

2. Copy the ngrok URL (e.g., `https://abc123.ngrok-free.dev`)

3. Update your `.env`:
   ```env
   VITE_LIGHTRAG_API_URL=https://abc123.ngrok-free.dev
   `✅ Pre-Flight Checklist

Before starting the servers, ensure:
1. ✅ All dependencies installed (`npm install` in root and `server/`)
2. ✅ `.env` file created and configured
3. ✅ MongoDB URI added to `.env`
4. ✅ LightRAG URL configured (local or ngrok)

**Quick check:**
```bash
cd server
npm run setup
```

---

### Development Mode (Recommended)

You need to run **two services** simultaneously (frontend + backend):

#### Option 1: Separate Terminals (Recommended for Development)

**Terminal 1: Frontend Development Server**
```bash
# In the root directory
npm run dev
```
✅ Starts Vite dev server at `http://localhost:5173`
- Auto-reloads on file changes
- Hot Module Replacement (HMR)

**Terminal 2: Backend Express Server**
```bash
# In the root directory (or cd to project root first)
cd server && npm start
```
✅ Starts Express API at `http://localhost:3000`
- Connects to MongoDB
- Attempts to start LightRAG (if local setup detected)
- Auto-detects Python virtual environment
- Configures CORS for development

**What `npm start` does:**
- Runs `start-all.js` script
- Checks for Python virtual environment
- Configures LightRAG environment if available
- Starts Express server on port 3000
- **Does NOT install dependencies** (must be pre-installed
# In your LightRAG directory
python lightrag_api_server.py
```
✅ Starts LightRAG at `http://localhost:9621` (or use ngrok URL in .env)

---

#### Option 2: One-Command Start (Windows)

**Windows PowerShell - Opens multiple terminal windows:**
```powershell
# Run this from the project root
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev"; Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd server; npm start"
```

---

#### Option 3: One-Command Start (Linux/Mac)

**Run both services in background:**
```bash
# Start frontend and backend
npm run dev & (cd server && npm start) &
```

**Or use tmux for better control:**
```bash
# Start a tmux session
tmux new-session -d -s convo 'npm run dev'
tmux split-window -h -t convo 'cd server && npm start'
tmux attach -t convo
```

---

### 🚦 Quick Backend Start

**To start only the backend server:**
```bash
cd server && npm start
```

**With auto-restart on file changes:**
```bash
cd server && npm run dev
```

**Check if backend is running:**
```bash
# Windows
curl http://localhost:3000/api/health

# Linux/Mac
curl http://localhost:3000/api/health
```

---

### 🎯 Accessing the Application

Once services are running:

| Service | URL | Status Check |
|---------|-----|--------------|
| **Frontend** | `http://localhost:5173` | Open in browser |
| **Backend API** | `http://localhost:3000/api` | `curl http://localhost:3000/api/health` |
| **LightRAG** | `http://localhost:9621` | `curl http://localhost:9621/health` |

**Quick Test:**
1. Open `http://localhost:5173` in your browser
2. You should see the Convo Companion interface
3. Try sending a message to test the full stack

## 🔄 Development Workflow

### Making Changes

1. **Frontend changes** (src/\*):
   - Edit files in the `src` directory
   - Vite will auto-reload the browser

2. **Backend changes** (server/\*):
   - Edit files in the `server` directory
   - The server will auto-restart (if using `npm run dev`)

3. **Environment changes** (.env):
   - Restart both frontend and backend servers after changing .env files

### Building for Production

#### Build Frontend

```bash
# In the root directory
npm run build
```

This creates an optimized production build in the `dist` folder.

#### Build Widget (if needed)

```bash
npm run build:widget
```

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

## 📦 Deployment

### Frontend Deployment

You can deploy the frontend to various platforms:

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy
```

#### Manual Deployment

```bash
# Build the project
npm run build

# Upload the 'dist' folder to your hosting service
```

### Backend Deployment

#### Render.com (Recommended)

1. Push your code to GitHub
2. Go to https://render.com
3. Create a new Web Service
4. Connect your repository
5. Set the following:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**: Add all variables from your `.env`

#### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

### Environment Variables for Production

When deploying, make sure to set these environment variables in your hosting platform:

**Frontend**:
- `VITE_MONGODB_URI`
- `VITE_API_BASE_URL` (your production backend URL)
- `VITE_LIGHTRAG_API_URL`

**Backend**:
- `MONGODB_URI`
- `PORT` (usually set automatically by hosting platform)
- `NODE_ENV=production`

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error**: `MongoDB connection error: MongoServerError`

**Solution**:
- Verify your MongoDB URI in `.env`
- Check if your IP address is whitelisted in MongoDB Atlas
- Ensure your MongoDB cluster is running

#### 2. LightRAG Not Responding

**Error**: `Failed to fetch from LightRAG`

**Solution**:
- Verify LightRAG is running: `curl http://localhost:9621/health`
- Check `VITE_LIGHTRAG_API_URL` in `.env`
- If using ngrok, ensure the tunnel is active
- Check CORS settings if accessing from a different origin

#### 3. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

Or change the port in your configuration.

#### 4. Module Not Found Errors

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For server
cd server
rm -rf node_modules package-lock.json
npm install
```

#### 5. Environment Variables Not Loading

**Error**: Variables are `undefined`

**Solution**:
- Ensure `.env` is in the root directory
- Restart your development servers after changing `.env`
- Verify variable names start with `VITE_` for frontend variables
- Check for typos in variable names

#### 6. CORS Errors

**Error**: `Access to fetch has been blocked by CORS policy`

**Solution**:
- Check the CORS configuration in `server/server.js`
- Add your frontend URL to the allowed origins
- Ensure credentials are properly configured

### Getting Help

If you encounter issues not covered here:

1. Check the browser console for error messages (F12)
2. Check the terminal outputs for both frontend and backend
3. Review the MongoDB Atlas logs
4. Check LightRAG logs

### Useful Commands

```bash
# Check if ports are available
# Windows
netstat -ano | findstr :5173
netstat -ano | findstr :3000
netstat -ano | findstr :9621

# Linux/Mac
lsof -i :5173
lsof -i :3000
lsof -i :9621

# Clear npm cache
npm cache clean --force

# Check Node/npm versions
node --version
npm --version

# View environment variables (frontend)
npm run dev -- --debug

# Test MongoDB connection
mongosh "your_connection_string"
```

## 📝 Additional Notes

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- GitLens

### Code Style

This project uses:
- ESLint for linting
- Prettier for formatting (if configured)
- TypeScript for type safety

Run linting:
```bash
npm run lint
```

### Database Seeding (Optional)

If you need to seed your database with initial data, you can create a seed script in the server folder.

---

## 📄 License

This project is private and proprietary.

## 👥 Contributors

- Your Name

---

For questions or issues, please open an issue on the repository or contact the maintainers.
