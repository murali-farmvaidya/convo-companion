import { LightRAGRequest, LightRAGResponse } from '@/types/chat';

// Get LightRAG URL from environment variables
const LIGHTRAG_BASE_URL = import.meta.env.VITE_LIGHTRAG_API_URL || 'http://localhost:9621';
const LIGHTRAG_URL = `${LIGHTRAG_BASE_URL}/query`;

// Function to detect if text is in Telugu
const isTeluguText = (text: string): boolean => {
  const teluguRegex = /[\u0C00-\u0C7F]/g;
  return teluguRegex.test(text);
};

// Function to detect common greetings
const isGreeting = (text: string): boolean => {
  const greetings = [
    'hi',
    'hello',
    'hey',
    'good morning',
    'good afternoon',
    'good evening',
    'good night',
    'namaste',
    'thanks',
    'thank you',
    'how are you',
    'howdy',
    'greetings',
    'welcome',
    'what\s*s?up',
    // Telugu greetings
    'హలో',
    'హాయ్',
    'నమస్కారం',
    'ధన్యవాదాలు',
    // Hindi greetings
    'नमस्ते',
    'धन्यवाद',
    'शुक्रिया',
    'नमस्कार',
  ];

  const lowerText = text.toLowerCase().trim();
  return greetings.some((greeting) => 
    lowerText.match(new RegExp(`\\b${greeting}\\b`, 'i'))
  );
};

// Function to check if response is relevant to Farm Vaidya
const isFarmVaidyaRelated = (query: string, response: string): boolean => {
  // Allow greetings to pass through
  if (isGreeting(query)) {
    return true;
  }

  const farmVaidyaKeywords = [
    'farm vaidya',
    'farmvaidya',
    'agriculture',
    'farming',
    'farmer',
    'crop',
    'soil',
    'water',
    'fertilizer',
    'pesticide',
    'agricultural',
    'harvest',
    'planting',
    'irrigation',
    'yield',
    'disease',
    'pest',
    // Telugu keywords
    'వ్యవసాయ',
    'ఫార్మ్',
    'రైతు',
    'పంటలు',
    'విత్తనాలు',
    'నాట్లు',
    'నీరు',
    'సారం',
    'వరిలో',
    'కంపోస్ట్',
    'సూక్ష్మమూలకాలు',
    'కీటకాలు',
    'రోగం',
    // Hindi keywords
    'कृषि',
    'खेत',
    'किसान',
    'फसल',
    'बीज',
    'पानी',
    'खाद',
    'कीटनाशक',
    'पोषक तत्व',
    'बिमारी',
    'कीट',
    'चावल',
    'गेहूं',
    'मिट्टी',
  ];

  const combinedText = (query + ' ' + response).toLowerCase();
  return farmVaidyaKeywords.some((keyword) => 
    combinedText.includes(keyword.toLowerCase())
  );
};

// Function to check if response is a "no knowledge" response
const isNoKnowledgeResponse = (response: string): boolean => {
  const noKnowledgePatterns = [
    'no context',
    'not in my knowledge',
    'unable to provide',
    "don't have",
    'do not have',
    '[no-context]',
  ];

  return noKnowledgePatterns.some((pattern) =>
    response.toLowerCase().includes(pattern)
  );
};

// Function to get greeting response
const getGreetingResponse = (query: string): string | null => {
  if (!isGreeting(query)) {
    return null;
  }

  const lowerQuery = query.toLowerCase().trim();
  const isTeluguGreeting = isTeluguText(query);

  // Respond based on greeting type
  if (isTeluguGreeting) {
    if (lowerQuery.includes('నమస్క') || lowerQuery === 'హలో' || lowerQuery === 'హాయ్') {
      return 'నమస్కారం! నేను ఫార్మ్ వైద్య సపోర్ట్ ఉద్యోగి. కృషితో సంబంధించిన ఏదైనా ప్రశ్న అడగండి.';
    } else if (lowerQuery.includes('ధన్య')) {
      return 'స్వాగతం! మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను.';
    }
    return 'నమస్కారం! ఫార్మ్ వైద్య గురించి ఏదైనా ప్రశ్న అడగండి.';
  }

  // English responses - varied based on greeting type
  if (lowerQuery.includes('good morning')) {
    return 'Good morning! Hope you\'re having a great day. I\'m ready to help with your farming and agriculture questions. What can I assist you with?';
  } else if (lowerQuery.includes('good afternoon')) {
    return 'Good afternoon! I\'m here to help with any agricultural or farming-related questions. What would you like to know?';
  } else if (lowerQuery.includes('good evening')) {
    return 'Good evening! I\'m ready to assist you with your farming questions. How can I help?';
  } else if (lowerQuery === 'hi' || lowerQuery === 'hey') {
    return 'Hi there! Welcome to Farm Vaidya Support. Feel free to ask me anything about farming, crops, soil, pests, fertilizers, or any agricultural solutions.';
  } else if (lowerQuery === 'hello') {
    return 'Hello! I\'m here to provide expert guidance on all your farming and agriculture needs. What would you like to know?';
  } else if (lowerQuery.includes('thanks') || lowerQuery.includes('thank you')) {
    return 'You\'re welcome! Feel free to ask if you have any more questions about farming or agriculture.';
  } else if (lowerQuery.includes('how are you')) {
    return 'I\'m doing great, thank you for asking! I\'m here and ready to help you with any agricultural questions. What can I assist you with?';
  } else if (lowerQuery === 'namaste') {
    return 'Namaste! Welcome to Farm Vaidya. I\'m here to help you with any farming-related questions or concerns.';
  }

  return 'Hello! How can I help you with your farming questions?';
};

export const queryLightRAG = async (
  query: string,
  conversationHistory: Array<{ role: string; content: string }>,
  mode: LightRAGRequest['mode'] = 'mix'
): Promise<string> => {
  // Handle greetings locally without API call
  const greetingResponse = getGreetingResponse(query);
  if (greetingResponse) {
    return greetingResponse;
  }

  // Add word limit instruction to the query
  const enhancedQuery = `${query}

IMPORTANT: Respond in 50-70 words maximum. Be concise but complete. Adjust word count based on question complexity but never exceed 70 words.`;

  const payload: LightRAGRequest = {
    query: enhancedQuery,
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
    let responseText = cleanResponse(data.response);

    // Detect if query is in Telugu
    const queryIsInTelugu = isTeluguText(query);

    // Check if query is Farm Vaidya related
    const isFarmVaidyaQuery = isFarmVaidyaRelated(query, responseText);

    // Check if response indicates no knowledge
    const hasNoKnowledge = isNoKnowledgeResponse(responseText);

    // Apply response rules
    if (!isFarmVaidyaQuery) {
      // Not related to Farm Vaidya
      responseText = queryIsInTelugu
        ? 'క్షమించండి, నేను నిర్ధారణకు సంబంధించిన ప్రశ్నలకు మాత్రమే సమాధానం ఇవ్వగలను। దయచేసి ఫార్మ్ వైద్య గురించి ఏదైనా ప్రశ్న అడగండి'
        : 'Sorry, I can only answer about Farm Vaidya. Please ask me about Farm Vaidya';
    } else if (hasNoKnowledge) {
      // Related to Farm Vaidya but not in knowledge base
      responseText = queryIsInTelugu
        ? 'క్షమించండి, ఈ సమాచారం నా జ్ఞానం లో లేదు'
        : 'Sorry, this info is not in my knowledge base';
    }

    return responseText;
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
