// Array of available API keys
const GEMINI_API_KEYS = [
  'AIzaSyD6wQFBLo5pLG2YqPwQdzRALveKdKdSU4Y',
  'AIzaSyCng4SZErxibw_pv4YgxuGhIXZ7r4oCHU8',
  'AIzaSyDVq7rVg-sRJ0zfFGmAgQ1xlq0MMh3Jr3g',
  'AIzaSyDQC6QWfYZ48c4NCn3SkCA0bIzqo-Eb-eo',
  'AIzaSyBXW0UOZGh42feVLeqB3xO3qtee9griYtU'
];

// Key rotation state
let currentKeyIndex = 0;
const keyUsageCount = new Map();
const keyLastUsed = new Map();
const MAX_REQUESTS_PER_KEY = 60; // Adjust based on actual API limits
const KEY_COOLDOWN_MS = 60000; // 1 minute cooldown

// Helper function to get the next available API key
const getNextApiKey = () => {
  // Initialize or update usage tracking
  GEMINI_API_KEYS.forEach(key => {
    if (!keyUsageCount.has(key)) {
      keyUsageCount.set(key, 0);
      keyLastUsed.set(key, 0);
    }
  });

  // Check if current key can be used
  const currentKey = GEMINI_API_KEYS[currentKeyIndex];
  const now = Date.now();
  const lastUsed = keyLastUsed.get(currentKey);
  const usageCount = keyUsageCount.get(currentKey);
  
  // If key is under usage limit or cooldown has passed, use it
  if (usageCount < MAX_REQUESTS_PER_KEY || (now - lastUsed) > KEY_COOLDOWN_MS) {
    keyUsageCount.set(currentKey, (now - lastUsed) > KEY_COOLDOWN_MS ? 1 : usageCount + 1);
    keyLastUsed.set(currentKey, now);
    return currentKey;
  }
  
  // Try to find an available key
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
    const nextKey = GEMINI_API_KEYS[currentKeyIndex];
    const nextKeyLastUsed = keyLastUsed.get(nextKey);
    const nextKeyUsage = keyUsageCount.get(nextKey);
    
    if (nextKeyUsage < MAX_REQUESTS_PER_KEY || (now - nextKeyLastUsed) > KEY_COOLDOWN_MS) {
      keyUsageCount.set(nextKey, (now - nextKeyLastUsed) > KEY_COOLDOWN_MS ? 1 : nextKeyUsage + 1);
      keyLastUsed.set(nextKey, now);
      return nextKey;
    }
  }
  
  // If all keys are at limit, use the oldest one
  let oldestKey = currentKey;
  let oldestTime = now;
  
  GEMINI_API_KEYS.forEach(key => {
    if (keyLastUsed.get(key) < oldestTime) {
      oldestTime = keyLastUsed.get(key);
      oldestKey = key;
    }
  });
  
  currentKeyIndex = GEMINI_API_KEYS.indexOf(oldestKey);
  keyUsageCount.set(oldestKey, 1);
  keyLastUsed.set(oldestKey, now);
  
  return oldestKey;
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Keep track of ongoing requests
const pendingRequests = new Map();

/**
 * Generates an AI-powered summary of a founder's profile using Google Gemini API
 * @param {Object} founderData - The founder's profile data
 * @returns {Promise<string>} - The generated summary
 */
export const generateFounderSummary = async (founderData) => {
  try {
    // Create a unique key for this founder
    const founderKey = `${founderData.firstName}_${founderData.lastName}_${founderData.companyName}`.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Cancel any existing request for this founder
    if (pendingRequests.has(founderKey)) {
      const controller = pendingRequests.get(founderKey);
      controller.abort();
      pendingRequests.delete(founderKey);
    }

    // Create a new AbortController for this request
    const controller = new AbortController();
    pendingRequests.set(founderKey, controller);

    // Extract relevant information from founder data
    const {
      firstName,
      lastName,
      linkedinHeadline,
      wellfoundHeadline,
      linkedinDescription,
      linkedinJobTitle,
      companyName,
      companyIndustry,
      colleges,
      college,
      skills,
      experience
    } = founderData;

    // Construct the prompt for the AI
    const prompt = `Please provide a 4-5 lines in 2 paragraphs summary from all the details available.Directly provide the summary without any introductory text and headings.:

Name: ${firstName} ${lastName}
Headline: ${linkedinHeadline || wellfoundHeadline || ''}
Current Role: ${linkedinJobTitle || ''} at ${companyName || ''}
Industry: ${companyIndustry || ''}
Education: ${Array.isArray(colleges) ? colleges.join(', ') : college || ''}
Description: ${linkedinDescription || ''}
${skills ? `Skills: ${skills}` : ''}
${experience ? `Experience: ${experience}` : ''}

 Focus more on the pedagogy of founder and the capability more appealing for a VC to understand whether to invest in his new startup or not. Note: Don't give any suggestions to invest or not and give a non biased summary.`;

    // Get the next available API key
    const apiKey = getNextApiKey();
    
    // Call Gemini API with abort signal
    let response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
      signal: controller.signal
    });

    // If rate limit is reached, try with different keys
    if (response.status === 429) {
      console.log(`Rate limit reached for key ${apiKey}, trying another key...`);
      
      // Mark this key as heavily used
      keyUsageCount.set(apiKey, MAX_REQUESTS_PER_KEY);
      
      // Try up to 3 more times with different keys
      for (let attempt = 0; attempt < 3; attempt++) {
        const nextApiKey = getNextApiKey();
        
        if (nextApiKey === apiKey) continue; // Skip if we got the same key
        
        response = await fetch(`${GEMINI_API_URL}?key=${nextApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          }),
          signal: controller.signal
        });
        
        if (response.ok) break;
        
        // Mark this key as heavily used if it fails with rate limit
        if (response.status === 429) {
          keyUsageCount.set(nextApiKey, MAX_REQUESTS_PER_KEY);
        }
      }
    }

    // Clean up the pending request
    pendingRequests.delete(founderKey);

    if (!response.ok) {
      throw new Error(`Failed to generate summary: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    // Don't throw if the request was aborted
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
      return null;
    }
    console.error('Error generating founder summary:', error);
    throw error;
  }
};

