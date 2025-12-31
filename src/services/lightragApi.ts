import { LightRAGRequest, LightRAGResponse } from '@/types/chat';

// Change this to your LightRAG backend URL
const LIGHTRAG_URL = 'http://localhost:9621/query';

export const queryLightRAG = async (
  query: string,
  conversationHistory: Array<{ role: string; content: string }>,
  mode: LightRAGRequest['mode'] = 'mix'
): Promise<string> => {
  const payload: LightRAGRequest = {
    query,
    mode,
    include_references: false,
    response_type: 'Multiple Paragraphs',
    conversation_history: conversationHistory,
  };

  try {
    const response = await fetch(LIGHTRAG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: LightRAGResponse = await response.json();
    return cleanResponse(data.response);
  } catch (error) {
    console.error('LightRAG API error:', error);
    throw new Error('Failed to get response from the server. Please try again.');
  }
};

export const checkNeedsFollowUp = async (
  conversationHistory: Array<{ role: string; content: string }>
): Promise<boolean> => {
  const payload: LightRAGRequest = {
    query: `You are an agriculture assistant.

Ask a follow-up question ONLY IF:
- The answer depends on farmer-specific inputs (crop type, symptoms, soil condition, growth stage, location).

DO NOT ask follow-up questions for:
- Product explanations
- Programs, fees, timings
- Definitions or general info

Reply ONLY with:
ANSWER_DIRECTLY or ASK_FOLLOW_UP`,
    mode: 'bypass',
    conversation_history: conversationHistory,
    response_type: 'Single Sentence',
  };

  try {
    const response = await fetch(LIGHTRAG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return false;

    const data: LightRAGResponse = await response.json();
    return data.response.trim().toUpperCase() === 'ASK_FOLLOW_UP';
  } catch {
    return false;
  }
};

export const generateFollowUp = async (
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> => {
  const payload: LightRAGRequest = {
    query: 'Ask ONE clear follow-up question to get missing farmer-specific details.',
    mode: 'bypass',
    conversation_history: conversationHistory,
    response_type: 'Single Sentence',
  };

  try {
    const response = await fetch(LIGHTRAG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to generate follow-up');
    }

    const data: LightRAGResponse = await response.json();
    return data.response.trim();
  } catch {
    return "Could you please provide more details about your specific situation?";
  }
};

const cleanResponse = (text: string): string => {
  // Remove reference section
  let cleaned = text.split(/\n\s*(###\s*)?references\s*\n/i)[0];
  // Remove inline citations
  cleaned = cleaned.replace(/\[\d+\]/g, '');
  return cleaned.trim();
};
