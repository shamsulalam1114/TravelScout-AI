const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const TRAVEL_SYSTEM_PROMPT = `You are TravelScout AI — a friendly, expert travel assistant. You help users with:
- Destination recommendations and travel tips
- Hotel and accommodation advice
- Transportation guidance (flights, buses, trains)
- Itinerary planning and trip optimization
- Budget planning and cost estimates
- Visa requirements and travel documentation
- Local cuisine, culture, and customs
- Safety tips and travel advisories
- Packing lists and travel preparation

Guidelines:
- Be concise but informative (aim for 2-4 paragraphs max)
- Use bullet points for lists
- Include practical tips and insider knowledge
- If asked about prices, give approximate ranges in USD
- Always be helpful and enthusiastic about travel
- If you don't know something specific, say so honestly
- Format responses with markdown for readability`;

const ITINERARY_SYSTEM_PROMPT = `You are TravelScout's AI Trip Planner. Generate detailed, practical travel itineraries.

For each day, include:
- Morning, afternoon, and evening activities
- Specific places to visit with brief descriptions
- Estimated time at each location
- Transportation between locations
- Meal recommendations (breakfast, lunch, dinner) with cuisine type
- Approximate costs in USD

Format the itinerary as a structured JSON with this exact schema:
{
  "title": "Trip title",
  "summary": "Brief 1-2 sentence trip summary",
  "totalEstimatedBudget": { "min": number, "max": number, "currency": "USD" },
  "bestTimeToVisit": "string",
  "tips": ["tip1", "tip2", "tip3"],
  "days": [
    {
      "day": 1,
      "title": "Day theme/title",
      "activities": [
        {
          "time": "09:00 AM",
          "activity": "Activity name",
          "description": "Brief description",
          "duration": "2 hours",
          "cost": "$10-15",
          "type": "sightseeing|food|transport|shopping|adventure|culture|relaxation"
        }
      ]
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks, no extra text.`;

/**
 * Chat with Gemini about travel topics
 */
async function chatWithGemini(message, conversationHistory = []) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build the chat history
    const history = conversationHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a travel assistant. Follow these instructions for all responses: " + TRAVEL_SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "I understand! I'm TravelScout AI, your expert travel assistant. I'm ready to help with destination recommendations, hotel advice, transportation, itinerary planning, budgeting, and everything travel-related. How can I help you plan your next adventure?" }],
        },
        ...history,
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return {
      success: true,
      message: response.text(),
    };
  } catch (error) {
    console.error("Gemini chat error:", error.message);
    return {
      success: false,
      message: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      error: error.message,
    };
  }
}

/**
 * Generate a trip itinerary using Gemini
 */
async function generateItinerary({ destination, from, days, budget, interests, travelers }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `${ITINERARY_SYSTEM_PROMPT}

Generate a ${days}-day trip itinerary for ${destination}${from ? ` (traveling from ${from})` : ''}.
Budget level: ${budget || 'moderate'}
Number of travelers: ${travelers || 2}
Interests: ${interests || 'general sightseeing, local food, culture'}

Remember: Return ONLY valid JSON matching the schema above.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response — remove markdown code blocks if present
    text = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    try {
      const itinerary = JSON.parse(text);
      return {
        success: true,
        itinerary,
      };
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      console.error("Failed to parse itinerary JSON:", parseError.message);
      return {
        success: true,
        itinerary: null,
        rawText: text,
        parseError: "AI returned non-standard format. Showing raw response.",
      };
    }
  } catch (error) {
    console.error("Gemini itinerary error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get quick destination recommendations
 */
async function getRecommendations(preferences) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Based on these travel preferences, recommend 5 destinations. Return ONLY valid JSON.

Preferences: ${JSON.stringify(preferences)}

Return format:
{
  "recommendations": [
    {
      "destination": "City, Country",
      "reason": "Why this destination matches",
      "bestFor": "What it's best for",
      "budgetRange": "$XX-$XX per day",
      "bestSeason": "Best time to visit",
      "highlights": ["highlight1", "highlight2", "highlight3"]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    const data = JSON.parse(text);
    return { success: true, ...data };
  } catch (error) {
    console.error("Gemini recommendations error:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  chatWithGemini,
  generateItinerary,
  getRecommendations,
};
