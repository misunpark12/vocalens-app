
import { GoogleGenAI, Type } from "@google/genai";
import { RecognitionResult } from "../types";

export const analyzeImage = async (base64Image: string): Promise<RecognitionResult> => {
  // 시스템 규칙에 따라 process.env.API_KEY 사용
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const prompt = `Identify the main object in this photo for a kid's learning app.
  Rules:
  1. Identify as a single simple English noun.
  2. Provide word and phonetic pronunciation for: English, Korean, Japanese, Chinese (Simplified), Spanish, French, German, Russian, and Hindi.
  3. Output strictly in JSON.`;

  const langSchema = {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING },
      pronunciation: { type: Type.STRING }
    },
    required: ['word', 'pronunciation']
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
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
          hindi: langSchema
        },
        required: ['english', 'korean', 'japanese', 'chinese', 'spanish', 'french', 'german', 'russian', 'hindi']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty AI response");
  return JSON.parse(text) as RecognitionResult;
};

export const playTTS = (text: string, langCode: string, onEnd?: () => void) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const langMap: Record<string, string> = {
    'ko': 'ko-KR', 'en': 'en-US', 'ja': 'ja-JP', 'zh': 'zh-CN',
    'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'ru': 'ru-RU', 'hi': 'hi-IN'
  };
  utterance.lang = langMap[langCode] || 'en-US';
  utterance.onend = onEnd || null;
  window.speechSynthesis.speak(utterance);
};
