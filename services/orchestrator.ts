import { DiagramType } from "../types";

// In production, this should be an environment variable
const API_URL = '/api/generate';

/**
 * COMPONENT [7]: AI ORCHESTRATION LAYER (Client Wrapper)
 * Delegates to the secure backend.
 */
export async function orchestrateDiagramSynthesis(
  prompt: string,
  type: DiagramType,
  persona: string = 'Developer',
  imageBase64?: string,
  fileContent?: string,
  pdfBase64?: string
) {
  try {
    console.log("[Client Orchestrator] Sending request to:", API_URL);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': crypto.randomUUID()
        // 'Authorization': 'Bearer ...' // In real app
      },
      body: JSON.stringify({
        prompt,
        type,
        persona,
        image: imageBase64,
        fileContent,
        pdfContent: pdfBase64
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.code;
  } catch (error) {
    console.error("Orchestration Error:", error);
    throw error;
  }
}