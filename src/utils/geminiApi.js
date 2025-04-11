const GEMINI_API_KEYS = [
  'AIzaSyD6wQFBLo5pLG2YqPwQdzRALveKdKdSU4Y',
  'AIzaSyCng4SZErxibw_pv4YgxuGhIXZ7r4oCHU8',
  'AIzaSyDVq7rVg-sRJ0zfFGmAgQ1xlq0MMh3Jr3g',
  'AIzaSyDQC6QWfYZ48c4NCn3SkCA0bIzqo-Eb-eo',
  'AIzaSyBXW0UOZGh42feVLeqB3xO3qtee9griYtU'
];

let currentKeyIndex = 0;
const keyUsageCount = new Map();
const keyLastUsed = new Map();
const MAX_REQUESTS_PER_KEY = 60; // Adjust based on actual API limits
const KEY_COOLDOWN_MS = 60000; // 1 minute cooldown

const getNextApiKey = () => {
  GEMINI_API_KEYS.forEach(key => {
    if (!keyUsageCount.has(key)) {
      keyUsageCount.set(key, 0);
      keyLastUsed.set(key, 0);
    }
  });

  const currentKey = GEMINI_API_KEYS[currentKeyIndex];
  const now = Date.now();
  const lastUsed = keyLastUsed.get(currentKey);
  const usageCount = keyUsageCount.get(currentKey);
  
  if (usageCount < MAX_REQUESTS_PER_KEY || (now - lastUsed) > KEY_COOLDOWN_MS) {
    keyUsageCount.set(currentKey, (now - lastUsed) > KEY_COOLDOWN_MS ? 1 : usageCount + 1);
    keyLastUsed.set(currentKey, now);
    return currentKey;
  }
  
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

const pendingRequests = new Map();


export const generateFounderSummary = async (founderData) => {
  try {
    const founderKey = `${founderData.firstName}_${founderData.lastName}_${founderData.companyName}`.toLowerCase().replace(/[^a-z0-9]/g, '_');

    if (pendingRequests.has(founderKey)) {
      const controller = pendingRequests.get(founderKey);
      controller.abort();
      pendingRequests.delete(founderKey);
    }

    const controller = new AbortController();
    pendingRequests.set(founderKey, controller);

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

    const apiKey = getNextApiKey();
    
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

    if (response.status === 429) {
      console.log(`Rate limit reached for key ${apiKey}, trying another key...`);
      
      keyUsageCount.set(apiKey, MAX_REQUESTS_PER_KEY);
      
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
        
        if (response.status === 429) {
          keyUsageCount.set(nextApiKey, MAX_REQUESTS_PER_KEY);
        }
      }
    }

    pendingRequests.delete(founderKey);

    if (!response.ok) {
      throw new Error(`Failed to generate summary: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
      return null;
    }
    console.error('Error generating founder summary:', error);
    throw error;
  }
}; 

