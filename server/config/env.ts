import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first (if exists) - takes precedence over .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Then load .env (will not overwrite existing variables from .env.local)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Helper to check for placeholder values
const isPlaceholder = (val?: string) => val === 'your_google_api_key_here';

// Validate critical variables
// Prefer API_KEY, but if it's a placeholder, try GEMINI_API_KEY
let apiKey = process.env.API_KEY;
if (isPlaceholder(apiKey)) {
    apiKey = undefined;
}

if (!apiKey) {
    apiKey = process.env.GEMINI_API_KEY;
}

// Final check
if (isPlaceholder(apiKey)) {
    apiKey = undefined; // Treat placeholder as no key
}

if (!apiKey) {
    console.warn('[Config] No valid API Key found. AI features will run in MOCK mode.');
} else {
    console.log('[Config] API Key loaded successfully.');
}

export const ENV = {
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_KEY: apiKey,
    MOCK_AI: process.env.MOCK_AI === 'true',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash'
};
