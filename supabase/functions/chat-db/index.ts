import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatUser {
  name: string;
  email: string;
  sessionId: string;
  createdAt: Date;
}

interface ChatMessage {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const MONGO_URI = Deno.env.get('MONGO_URI');
  const DB_NAME = 'customer_chat';

  if (!MONGO_URI) {
    console.error('MONGO_URI not configured');
    return new Response(
      JSON.stringify({ error: 'Database not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let client: MongoClient | null = null;

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const body = req.method === 'POST' ? await req.json() : {};

    console.log(`Processing action: ${action}`);

    // Connect to MongoDB
    client = new MongoClient();
    await client.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = client.database(DB_NAME);
    const usersCollection = db.collection<ChatUser>('users');
    const messagesCollection = db.collection<ChatMessage>('messages');

    let result;

    switch (action) {
      case 'register_user': {
        const { name, email, sessionId } = body;
        
        if (!name || !email || !sessionId) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: name, email, sessionId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if user already exists with this email
        const existingUser = await usersCollection.findOne({ email });
        
        if (existingUser) {
          // Update session ID for returning user
          await usersCollection.updateOne(
            { email },
            { $set: { sessionId, name } }
          );
          console.log(`Updated existing user: ${email}`);
          result = { success: true, message: 'Welcome back!', isReturning: true };
        } else {
          // Create new user
          await usersCollection.insertOne({
            name,
            email,
            sessionId,
            createdAt: new Date(),
          });
          console.log(`Created new user: ${email}`);
          result = { success: true, message: 'User registered', isReturning: false };
        }
        break;
      }

      case 'save_message': {
        const { sessionId, role, content } = body;
        
        if (!sessionId || !role || !content) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: sessionId, role, content' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await messagesCollection.insertOne({
          sessionId,
          role,
          content,
          timestamp: new Date(),
        });
        console.log(`Saved message for session: ${sessionId}`);
        result = { success: true };
        break;
      }

      case 'get_messages': {
        const sessionId = url.searchParams.get('sessionId');
        
        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: 'Missing sessionId parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const messages = await messagesCollection
          .find({ sessionId })
          .sort({ timestamp: 1 })
          .toArray();
        
        console.log(`Retrieved ${messages.length} messages for session: ${sessionId}`);
        result = { success: true, messages };
        break;
      }

      case 'get_user_sessions': {
        const email = url.searchParams.get('email');
        
        if (!email) {
          return new Response(
            JSON.stringify({ error: 'Missing email parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const user = await usersCollection.findOne({ email });
        if (!user) {
          result = { success: true, sessions: [] };
        } else {
          // Get all messages for this user's sessions
          const sessions = await messagesCollection
            .aggregate([
              { $match: { sessionId: user.sessionId } },
              { $group: { _id: '$sessionId', messageCount: { $sum: 1 }, lastMessage: { $last: '$timestamp' } } }
            ])
            .toArray();
          result = { success: true, user, sessions };
        }
        break;
      }

      case 'reset_session': {
        const { sessionId } = body;
        
        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: 'Missing sessionId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await messagesCollection.deleteMany({ sessionId });
        console.log(`Cleared messages for session: ${sessionId}`);
        result = { success: true, message: 'Session reset' };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action. Valid actions: register_user, save_message, get_messages, get_user_sessions, reset_session' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } finally {
    if (client) {
      try {
        client.close();
        console.log('MongoDB connection closed');
      } catch (e) {
        console.error('Error closing MongoDB connection:', e);
      }
    }
  }
});
