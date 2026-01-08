
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem } from "../types";

export const getInventoryInsights = async (items: InventoryItem[]) => {
  try {
    // Inizializzazione rigorosa: usa direttamente process.env.API_KEY as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `Analizza questo stato dell'inventario e fornisci 3 consigli strategici o avvisi di sicurezza:
          ${JSON.stringify(items.map(i => ({ name: i.name, sku: i.sku, qty: i.quantity, min: i.min_stock })))}`
        }]
      }],
      config: {
        systemInstruction: "Sei un assistente virtuale esperto in logistica. Rispondi esclusivamente in formato JSON valido come un array di oggetti con 'title' e 'description'.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        }
      }
    });

    // Accesso alla proprietà .text (non metodo) come da linee guida
    const insightsText = response.text;
    if (!insightsText) return [];
    
    try {
      return JSON.parse(insightsText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Gemini insights error:", error);
    return [];
  }
};
