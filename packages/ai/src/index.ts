import { GeminiProvider } from "./providers/gemini.js";
import type { AIProvider, AIProviderConfig, AIProviderType } from "./types.js";

export function createAIProvider(
  type: AIProviderType = "gemini",
  config?: AIProviderConfig,
): AIProvider {
  switch (type) {
    case "gemini":
      return new GeminiProvider(config);
    default:
      throw new Error(`Unsupported AI provider: ${type}`);
  }
}

export { GeminiProvider };
export * from "./types.js";
