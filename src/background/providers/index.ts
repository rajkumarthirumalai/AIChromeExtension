import { LLMProvider, LLMProviderOptions } from './base';
import { GeminiProvider } from './gemini';
import { GroqProvider } from './groq';

export * from './base';
export * from './gemini';
export * from './groq';

export function getProvider(
  type: string, 
  options: LLMProviderOptions
): LLMProvider {
  if (type === 'groq') {
    return new GroqProvider(options);
  }
  // Default to Gemini
  return new GeminiProvider(options);
}
