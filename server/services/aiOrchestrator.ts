import { GoogleGenAI } from "@google/genai";
import { DiagramType } from "../types";
import { ENV } from "../config/env";

// Initialize AI Client
// Using ENV.API_KEY which is resolved from .env.local or .env
const apiKey = ENV.API_KEY;
const isPlaceholder = (key?: string) => key === 'your_google_api_key_here';

const shouldUseMock = ENV.MOCK_AI || !apiKey || isPlaceholder(apiKey);

if (!shouldUseMock) {
    console.log('[Orchestrator] AI Client initialized with valid API Key.');
} else {
    console.warn('[Orchestrator] AI Client running in MOCK MODE.');
}

const ai = (apiKey && !isPlaceholder(apiKey)) ? new GoogleGenAI({ apiKey: apiKey! }) : null;

const MAX_NODES = 30;
const MAX_LAYERS = 5;

// Simple in-memory cache
const cache = new Map<string, string>();
const MAX_CACHE_SIZE = 50;

export async function orchestrateDiagramSynthesis(
    prompt: string,
    type: DiagramType,
    persona: string,
    imageBase64?: string,
    fileContent?: string,
    pdfBase64?: string
): Promise<string> {

    // Generate cache key
    const cacheKey = `${prompt}-${type}-${persona}-${imageBase64 ? 'img' : ''}-${fileContent ? 'file' : ''}-${pdfBase64 ? 'pdf' : ''}`;

    // 2. Cache Lookup (SRS 7.2)
    if (cache.has(cacheKey)) {
        console.log('[Orchestrator] Cache hit.');
        return cache.get(cacheKey)!;
    }

    // MOCK MODE: If no API key is configured or MOCK_AI is true
    if (shouldUseMock || !ai) {
        console.warn("[Orchestrator] Using MOCK response (Mock Mode active or Missing API Key).");

        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockDiagram = `graph TD
  A[Client] -->|HTTP Request| B(API Gateway)
  B --> C{Auth Service}
  C -->|Valid Token| D[Backend API]
  C -->|Invalid Token| E[Error Response]
  D --> F[(Database)]
  D --> G[AI Service (Mocked)]
  style G fill:#f9f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
  subgraph Mock Mode
    G
  end`;

        return mockDiagram;
    }

    // 1. Complexity Validation (SRS 5.2)
    if (prompt.length > 5000) {
        // Check prompt length as a proxy for complexity before processing
        throw new Error("REJECTED: Request exceeds allowed complexity limit.");
    }

    // 3. Provider Selection (SRS 7.1)
    // Use configured model or default to gemini-2.0-flash
    const model = ENV.GEMINI_MODEL || 'gemini-2.0-flash';

    const systemInstruction = `
    You are Component [7] AI Orchestration Layer.
    Role: Technical Blueprint Synthesizer.
    Persona: ${persona}
    Rules:
    - Output ONLY valid Mermaid.js syntax.
    - No markdown blocks.
    - Adhere to Component [9] Result Processor normalization standards.
    - Complexity limit: ${MAX_NODES} nodes, ${MAX_LAYERS} layers.
    - If input contains file content, use it as context.
  `;

    try {
        let finalPrompt = prompt || `Synthesize ${type} architecture.`;

        if (fileContent) {
            finalPrompt += `\n\nContext from file:\n${fileContent.slice(0, 10000)}`; // Truncate for token limits
        }

        const parts: any[] = [{ text: finalPrompt }];

        if (imageBase64) {
            // Strip prefix if present, though usually client sends raw base64 or data url
            const data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            parts.push({ inlineData: { mimeType: 'image/png', data } });
        }

        if (pdfBase64) {
            const data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
            parts.push({ inlineData: { mimeType: 'application/pdf', data } });
        }

        console.log(`[AI] Generating content with model: ${model}`);
        if (pdfBase64) console.log(`[AI] PDF content present (length: ${pdfBase64.length})`);

        const response = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts }],
            config: {
                systemInstruction,
                temperature: 0.1,
            },
        });

        // 4. Component [9] Result Processor
        const result = response.text?.replace(/```mermaid/g, '').replace(/```/g, '').trim() || "";

        // Update cache
        if (cache.size >= MAX_CACHE_SIZE) {
            const firstKey = cache.keys().next().value;
            if (firstKey) cache.delete(firstKey);
        }
        cache.set(cacheKey, result);

        return result;

    } catch (error) {
        console.error("[7] Orchestration Error:", error);
        throw error;
    }
}
