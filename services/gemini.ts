import { GoogleGenAI, Type } from "@google/genai";
import { DiagramType } from "../types";

// Always use process.env.API_KEY directly for initialization according to guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateDiagram(
  prompt: string, 
  type: DiagramType, 
  imageBase64?: string,
  fileContent?: string,
  pdfBase64?: string
) {
  // Use pro models for multi-modal (Image/PDF) tasks for better reasoning
  const model = (imageBase64 || pdfBase64) ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are Archiflow AI, an expert software architect and technical illustrator.
    Your task is to generate ONLY valid Mermaid.js syntax for technical diagrams.
    Do not include any explanations, preamble, or markdown code blocks (like \`\`\`mermaid).
    Just output the raw Mermaid string.
    
    Diagram Type Context: ${type}
    Requirements:
    - Flowcharts should use clear boxes and arrows.
    - Architecture diagrams should focus on components and relationships.
    - Use meaningful labels.
    - If a PDF is provided, read through all pages to extract the full logical flow or architecture described.
    - If an image is provided, extract the logic or architecture from it and convert to Mermaid.
    - If code or text content is provided, use it as the source of truth for the logic.
  `;

  try {
    let finalPrompt = prompt || `Create a ${type} diagram based on the attached files.`;
    if (fileContent) {
      finalPrompt = `Based on the following source content, generate a ${type} diagram.\n\nSOURCE CONTENT:\n${fileContent}\n\nUSER INSTRUCTIONS: ${prompt}`;
    }

    const parts: any[] = [{ text: finalPrompt }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: imageBase64.split(',')[1] || imageBase64
        }
      });
    }

    if (pdfBase64) {
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64.split(',')[1] || pdfBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.1, // Lower temperature for more accurate technical extraction
      },
    });

    // Directly access .text property from GenerateContentResponse
    return response.text?.replace(/```mermaid/g, '').replace(/```/g, '').trim() || "";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}