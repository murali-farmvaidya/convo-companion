import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080',  // Vite dev server or LightRAG WebUI
      'http://localhost:8020',  // LightRAG API server
      'https://convo-companion-uiii.onrender.com',  // Production frontend
      'https://convo-companion.onrender.com',        // Production backend (self)
      /^https:\/\/convo-companion.*\.onrender\.com$/
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else {
        return allowed.test(origin);
      }
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  sessionId: String,
  createdAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  sessionId: String,
  role: { type: String, enum: ['user', 'assistant'] },
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true },
  email: String,
  name: String,
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Models
const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Session = mongoose.model('Session', sessionSchema);

// API Routes

// Register User
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, sessionId } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    const isReturning = !!user;

    if (!user) {
      user = new User({ name, email, sessionId });
      await user.save();
    }

    // Create or update session
    let session = await Session.findOne({ sessionId });
    if (!session) {
      session = new Session({ sessionId, email, messages: [] });
      await session.save();
    }

    res.json({ success: true, isReturning });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save Message
app.post('/api/messages/save', async (req, res) => {
  try {
    const { sessionId, role, content } = req.body;

    // Save message to database
    const message = new Message({ sessionId, role, content });
    await message.save();

    // Generate conversation name from first user message
    const session = await Session.findOne({ sessionId });
    const updateData = {
      $push: { messages: message },
      updatedAt: new Date(),
    };

    // If this is the first user message and no name exists, generate name
    if (role === 'user' && session && !session.name) {
      // Take first 5-6 words from the message
      const words = content.trim().split(/\s+/);
      const nameWords = words.slice(0, Math.min(6, words.length));
      let conversationName = nameWords.join(' ');
      
      // Limit to 50 characters
      if (conversationName.length > 50) {
        conversationName = conversationName.substring(0, 47) + '...';
      }
      
      updateData.name = conversationName;
    }

    // Update session with message and name
    await Session.findOneAndUpdate(
      { sessionId },
      updateData,
      { new: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Save message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Messages
app.get('/api/messages', async (req, res) => {
  try {
    const { sessionId } = req.query;

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.json({ success: true, messages: [] });
    }

    const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });

    res.json({
      success: true,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset Session
app.post('/api/sessions/reset', async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Don't delete messages from DB - keep history stored
    // Only clear the UI state on frontend
    await Session.findOneAndUpdate(
      { sessionId },
      { updatedAt: new Date() },
      { new: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Reset session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Session and its messages
app.delete('/api/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    await Session.findOneAndDelete({ sessionId });
    await Message.deleteMany({ sessionId });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get User Sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, user: null, sessions: [] });
    }

    const sessions = await Session.find({ email }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      user,
      sessions: sessions.map((s) => ({
        sessionId: s.sessionId,
        name: s.name || 'New Conversation',
        createdAt: s.createdAt,
        messageCount: s.messages.length,
      })),
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Migrate existing sessions to add names
app.post('/api/sessions/migrate-names', async (req, res) => {
  try {
    const sessions = await Session.find({ name: { $exists: false } });
    let updated = 0;

    for (const session of sessions) {
      // Find first user message
      const firstUserMessage = session.messages.find(msg => msg.role === 'user');
      
      if (firstUserMessage) {
        // Generate name from first user message
        const words = firstUserMessage.content.trim().split(/\s+/);
        const nameWords = words.slice(0, Math.min(6, words.length));
        let conversationName = nameWords.join(' ');
        
        // Limit to 50 characters
        if (conversationName.length > 50) {
          conversationName = conversationName.substring(0, 47) + '...';
        }
        
        session.name = conversationName;
        await session.save();
        updated++;
      }
    }

    res.json({ success: true, updated });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// LightRAG Proxy - Forward requests to LightRAG server
app.post('/api/lightrag/query', async (req, res) => {
  try {
    const lightragUrl = process.env.LIGHTRAG_API_URL || 'http://localhost:9621';
    const response = await fetch(`${lightragUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('LightRAG proxy error:', error);
    res.status(500).json({ error: 'Failed to query LightRAG', details: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    lightrag: process.env.LIGHTRAG_API_URL || 'http://localhost:9621'
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    path: req.path 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
});
