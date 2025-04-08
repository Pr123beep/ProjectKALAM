const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = process.env.REACT_APP_GEMINI_API_URL;

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
    const prompt = `Please provide a 4-5 lines in 2 paragraphs summary from all the details available.:

Name: ${firstName} ${lastName}
Headline: ${linkedinHeadline || wellfoundHeadline || ''}
Current Role: ${linkedinJobTitle || ''} at ${companyName || ''}
Industry: ${companyIndustry || ''}
Education: ${Array.isArray(colleges) ? colleges.join(', ') : college || ''}
Description: ${linkedinDescription || ''}
${skills ? `Skills: ${skills}` : ''}
${experience ? `Experience: ${experience}` : ''}

 Focus more on the pedagogy of founder and the capability more appealing for a VC to understand whether to invest in his new startup or not. Note: Don't give any suggestions to invest or not and give a non biased summary.`;

    // Call Gemini API with abort signal
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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

    // Clean up the pending request
    pendingRequests.delete(founderKey);

    if (!response.ok) {
      throw new Error('Failed to generate summary');
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

