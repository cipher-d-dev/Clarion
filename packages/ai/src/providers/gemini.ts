import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
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

const classificationSchema = z.object({
  category: z.string(),
  confidence: z.number().min(0).max(1),
  suggestedPriority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  suggestedSeverity: z.enum(["MINOR", "MODERATE", "MAJOR", "CRITICAL"]),
  sentimentScore: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()),
  suggestedDepartment: z.string().optional(),
});

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(config: AIProviderConfig = {}) {
    if (!config.apiKey) throw new Error("GEMINI_API_KEY is required");
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model ?? "gemini-2.5-flash";
  }

  async classify(text: string): Promise<ClassificationResult> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const prompt = `You are a complaint classification system for a university. Classify the following complaint and respond ONLY with valid JSON matching this schema exactly:
{
  "category": "Academic|Facilities|Harassment|Financial|Administrative|IT|Health|Safety|Other",
  "confidence": 0.0-1.0,
  "suggestedPriority": "LOW|MEDIUM|HIGH|URGENT",
  "suggestedSeverity": "MINOR|MODERATE|MAJOR|CRITICAL",
  "sentimentScore": 0.0-1.0 (0=very negative, 1=very positive),
  "tags": ["tag1", "tag2"],
  "suggestedDepartment": "department name or null"
}

Complaint: "${text.slice(0, 2000)}"`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim().replace(/^```json\n?|\n?```$/g, "");
    const parsed = classificationSchema.parse(JSON.parse(raw));
    return {
      category: parsed.category,
      confidence: parsed.confidence,
      suggestedPriority: parsed.suggestedPriority,
      suggestedSeverity: parsed.suggestedSeverity,
      sentimentScore: parsed.sentimentScore,
      tags: parsed.tags,
      suggestedDepartment: parsed.suggestedDepartment,
    };
  }

  async chat(messages: ChatMessage[], context?: Record<string, unknown>): Promise<ChatResponse> {
    const model = this.client.getGenerativeModel({ model: this.model });

    const isStaff = context?.userRole && !["STUDENT", "LECTURER"].includes(context.userRole as string);

    const systemParts: string[] = [
      "You are Clarion, an AI assistant for a university complaint management system.",
    ];

    if (isStaff) {
      systemParts.push(
        "You are speaking with a staff member. You can help them with:",
        "- Reviewing and prioritising their assigned tickets",
        "- Looking up complaint details by reference number (CLN-YYYY-NNNNN)",
        "- Suggesting next actions for complaints",
        "- General complaint management guidance",
        "",
        "When asked about workload or tickets to tackle, summarise the assigned tickets from the context ordered by priority (URGENT > HIGH > MEDIUM > LOW).",
        "Be helpful and direct. Provide specific information when available.",
      );
    } else {
      systemParts.push(
        "You can help users with:",
        "- Looking up complaints by reference number (format: CLN-YYYY-NNNNN)",
        "- Explaining how to submit complaints",
        "- Checking complaint status",
        "- General university policies and procedures",
        "",
        "Be helpful and direct. Provide specific information when available.",
      );
    }

    if (context?.institutionName) {
      systemParts.push(`Institution: ${context.institutionName}`);
    }
    if (context?.kbContext) {
      systemParts.push(`\nRelevant knowledge base articles:\n${context.kbContext}`);
    }
    if (context?.complaintContext) {
      systemParts.push(`\nComplaint context:\n${context.complaintContext}`);
    }

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user" as const,
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1]?.content ?? "";

    const chat = model.startChat({
      systemInstruction: {
        role: "system",
        parts: [{ text: systemParts.join("\n") }]
      },
      history,
    });

    const response = await chat.sendMessage(lastMessage);
    return {
      message: response.response.text(),
      confidence: 0.9,
    };
  }

  async embed(text: string): Promise<EmbeddingResult> {
    const model = this.client.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text.slice(0, 8000));
    const embedding = result.embedding.values;
    return { embedding, dimensions: embedding.length };
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
      .map(([category, count]) => ({ category, count, trend: "stable" as const }));

    if (data.length === 0) {
      return { period, totalComplaints: 0, topCategories: [], sentimentScore: 0.5, insights: ["No data available"] };
    }

    const model = this.client.getGenerativeModel({ model: this.model });
    const prompt = `Analyze these university complaint statistics and provide 3 brief insights (one sentence each). Respond as a JSON array of strings.
Total complaints: ${data.length}
Period: ${period}
Top categories: ${topCategories.map((c) => `${c.category}(${c.count})`).join(", ")}`;

    let insights: string[] = [];
    try {
      const result = await model.generateContent(prompt);
      const raw = result.response.text().trim().replace(/^```json\n?|\n?```$/g, "");
      insights = z.array(z.string()).parse(JSON.parse(raw));
    } catch {
      insights = [`${data.length} complaints analyzed over ${period}`];
    }

    return { period, totalComplaints: data.length, topCategories, sentimentScore: 0.5, insights };
  }

  async recommend(
    complaintText: string,
    knowledgeBase: Array<{ id: string; title: string; content: string }> = [],
  ): Promise<Recommendation[]> {
    if (knowledgeBase.length === 0) return [];

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
