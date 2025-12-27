import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MotivationModelData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const motivationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING, description: "The original topic or activity provided by the user." },
    doItems: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Concrete actions, behaviors, or steps involved (The 'Do'). Max 4 items.",
    },
    beItems: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Identity statements, roles, or character traits reinforced (The 'Be'). E.g., 'A disciplined person'. Max 4 items.",
    },
    feelItems: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Emotional rewards, sensations, or feelings experienced (The 'Feel'). E.g., 'Energized', 'Proud'. Max 4 items.",
    },
  },
  required: ["topic", "doItems", "beItems", "feelItems"],
};

export const generateMotivationModel = async (topic: string): Promise<MotivationModelData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the activity "${topic}" using the Motivation Model framework. 
      Break it down into three distinct categories:
      1. DO: What are the tangible actions or habits?
      2. BE: Who does the person become by doing this? What identity values are satisfied?
      3. FEEL: What are the emotional or somatic payoffs?
      
      Keep items concise (under 6 words). Provide 3-4 items per category.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: motivationSchema,
        systemInstruction: "You are an expert psychological coach specializing in behavioral activation and identity modeling.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const json = JSON.parse(text);

    // Transform string arrays into objects with IDs for React keys
    return {
      topic: json.topic,
      doItems: json.doItems.map((text: string) => ({ id: crypto.randomUUID(), text })),
      beItems: json.beItems.map((text: string) => ({ id: crypto.randomUUID(), text })),
      feelItems: json.feelItems.map((text: string) => ({ id: crypto.randomUUID(), text })),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};