import { GoogleGenAI, Type } from "@google/genai";

export default async (req) => {
  try {
    const body = JSON.parse(req.body);

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = body.prompt;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.OBJECT }
      }
    });

    // CORRETO: .text (sem parênteses)
    const raw = response.text;

    return {
      statusCode: 200,
      body: raw
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
