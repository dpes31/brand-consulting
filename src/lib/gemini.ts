import { GoogleGenAI } from '@google/genai';

/**
 * Executes a specific research node using Gemini API with Search Grounding
 * @param apiKey - Gemini API Key provided by the user
 * @param systemInstruction - The persona and instruction for this node
 * @param userPrompt - The compiled user query (Brand info + references)
 * @returns Generated response text
 */
export async function runResearchNode(
  apiKey: string,
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  if (!apiKey) throw new Error("API Key is missing.");

  // Using the new @google/genai SDK
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Using the latest Pro model for best reasoning
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for factual reporting
        tools: [{ googleSearch: {} }], // Enable Google Search Grounding
      }
    });

    if (response.text) {
      return response.text;
    } else {
      throw new Error("Empty response received from Gemini.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error?.message || "An error occurred during API call.");
  }
}
