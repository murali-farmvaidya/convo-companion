import { LightRAGRequest, LightRAGResponse } from '@/types/chat';

// Change this to your LightRAG backend URL
const LIGHTRAG_URL = 'http://localhost:9621/query';

// Function to detect if text is in Telugu
const isTeluguText = (text: string): boolean => {
  const teluguRegex = /[\u0C00-\u0C7F]/g;
  return teluguRegex.test(text);
};

// Function to check if response is relevant to Farm Vaidya
const isFarmVaidyaRelated = (query: string, response: string): boolean => {
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
