import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.VITE_GOOGLE_API_KEY,
    });

    const prompt = `
Identify the main object in this photo for a kid's learning app.

Rules:
1. Identify as a single simple English noun.
2. Provide word and phonetic pronunciation for: English, Korean, Japanese, Chinese (Simplified), Spanish, French, German, Russian, and Hindi.
3. Output strictly in JSON.
`;

    const langSchema = {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING },
        pronunciation: { type: Type.STRING },
      },
      required: ["word", "pronunciation"],
    };

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            english: langSchema,
            korean: langSchema,
            japanese: langSchema,
            chinese: langSchema,
            spanish: langSchema,
            french: langSchema,
            german: langSchema,
            russian: langSchema,
            hindi: langSchema,
          },
        },
      },
    });

    const text = result.text;

    if (!text) {
      return res.status(500).json({ error: "Empty AI response" });
    }

    return res.status(200).json(JSON.parse(text));
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: "Server error",
      message: err?.message,
    });
  }
}
