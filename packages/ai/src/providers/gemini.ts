import type {
  AIProvider,
  AIProviderConfig,
  ChatMessage,
  ChatResponse,
  ClassificationResult,
  EmbeddingResult,
  Recommendation,
  TrendAnalysis,
} from "../types.js";

const DEFAULT_CATEGORIES = [
  "Academic",
  "Facilities",
  "Harassment",
  "Financial",
  "Administrative",
  "Other",
];

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig = {}) {
    this.config = {
      model: "gemini-1.5-flash",
      maxTokens: 1024,
      temperature: 0.7,
      ...config,
    };
  }

  async classify(text: string): Promise<ClassificationResult> {
    const lowerText = text.toLowerCase();
    let category = "Other";
    let confidence = 0.65;

    for (const cat of DEFAULT_CATEGORIES) {
      if (lowerText.includes(cat.toLowerCase())) {
        category = cat;
        confidence = 0.85;
        break;
      }
    }

    if (lowerText.includes("harass") || lowerText.includes("bully")) {
      category = "Harassment";
      confidence = 0.92;
    } else if (lowerText.includes("fee") || lowerText.includes("payment")) {
      category = "Financial";
      confidence = 0.88;
    } else if (lowerText.includes("hostel") || lowerText.includes("building")) {
      category = "Facilities";
      confidence = 0.87;
    }

    const isUrgent =
      lowerText.includes("urgent") ||
      lowerText.includes("emergency") ||
      category === "Harassment";

    return {
      category,
      confidence,
      suggestedPriority: isUrgent ? "HIGH" : "MEDIUM",
      suggestedSeverity: category === "Harassment" ? "CRITICAL" : "MODERATE",
      tags: [category.toLowerCase(), ...(isUrgent ? ["urgent"] : [])],
    };
  }

  async chat(
    messages: ChatMessage[],
    _context?: Record<string, unknown>,
  ): Promise<ChatResponse> {
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    return {
      message: `[Gemini Stub] I received your message about "${lastUserMessage.slice(0, 80)}${lastUserMessage.length > 80 ? "..." : ""}". This is a stub response. Configure GEMINI_API_KEY to enable real AI responses.`,
      confidence: 0.5,
    };
  }

  async embed(text: string): Promise<EmbeddingResult> {
    const dimensions = 768;
    const embedding: number[] = [];

    for (let i = 0; i < dimensions; i++) {
      const charCode = text.charCodeAt(i % text.length) || 0;
      embedding.push(Math.sin(charCode + i) * 0.5);
    }

    return { embedding, dimensions };
  }

  async analyzeTrends(
    data: Array<{ category: string; createdAt: Date; status: string }>,
    period = "30d",
  ): Promise<TrendAnalysis> {
    const categoryCounts = new Map<string, number>();

    for (const item of data) {
      categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
    }

    const topCategories = [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({
        category,
        count,
        trend: "stable" as const,
      }));

    return {
      period,
      totalComplaints: data.length,
      topCategories,
      sentimentScore: 0.62,
      insights: [
        `[Stub] Analyzed ${data.length} complaints over ${period}`,
        topCategories.length > 0
          ? `Top category: ${topCategories[0]?.category ?? "N/A"}`
          : "No category data available",
        "Configure GEMINI_API_KEY for real trend analysis",
      ],
    };
  }

  async recommend(
    complaintText: string,
    knowledgeBase: Array<{ id: string; title: string; content: string }> = [],
  ): Promise<Recommendation[]> {
    const keywords = complaintText.toLowerCase().split(/\s+/).slice(0, 10);

    return knowledgeBase
      .map((article) => {
        const contentLower = `${article.title} ${article.content}`.toLowerCase();
        const matchCount = keywords.filter((kw) => contentLower.includes(kw)).length;
        return {
          id: article.id,
          title: article.title,
          description: article.content.slice(0, 150),
          relevanceScore: matchCount / Math.max(keywords.length, 1),
          type: "knowledge_article" as const,
        };
      })
      .filter((r) => r.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
  }
}
