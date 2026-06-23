import { GeminiProvider } from "./providers/gemini.js";
import type { AIProvider, AIProviderConfig } from "./types.js";

/** No-op provider used when no API key is configured. All methods return safe defaults. */
class StubProvider implements AIProvider {
  readonly name = "stub";
  async classify() {
    return { category: "UNCLASSIFIED", confidence: 0, suggestedPriority: "MEDIUM" as const, suggestedSeverity: "MODERATE" as const, tags: [] };
  }
  async chat() { return { message: "AI assistant is not configured. Please contact your administrator.", confidence: 0 }; }
  async embed(text: string) {
    const dims = 768;
    return { embedding: Array.from({ length: dims }, (_, i) => Math.sin(text.charCodeAt(i % text.length) + i) * 0.5), dimensions: dims };
  }
  async analyzeTrends(data: Array<{ category: string; createdAt: Date; status: string }>, period = "30d") {
    return { period, totalComplaints: data.length, topCategories: [], sentimentScore: 0.5, insights: ["AI not configured"] };
  }
  async recommend() { return []; }
}

export function createAIProvider(type: "gemini" | "stub" = "gemini", config?: AIProviderConfig): AIProvider {
  if (type === "stub") return new StubProvider();
  return new GeminiProvider(config);
}

export { GeminiProvider };
export * from "./types.js";
