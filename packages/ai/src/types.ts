export interface ClassificationResult {
  category: string;
  confidence: number;
  suggestedPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  suggestedSeverity: "MINOR" | "MODERATE" | "MAJOR" | "CRITICAL";
  sentimentScore?: number;
  suggestedDepartment?: string;
  tags: string[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  message: string;
  sources?: string[];
  confidence?: number;
}

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
}

export interface TrendAnalysis {
  period: string;
  totalComplaints: number;
  topCategories: Array<{ category: string; count: number; trend: "up" | "down" | "stable" }>;
  sentimentScore: number;
  insights: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  relevanceScore: number;
  type: "knowledge_article" | "action" | "escalation";
}

export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  readonly name: string;

  classify(text: string): Promise<ClassificationResult>;

  chat(messages: ChatMessage[], context?: Record<string, unknown>): Promise<ChatResponse>;

  embed(text: string): Promise<EmbeddingResult>;

  analyzeTrends(
    data: Array<{ category: string; createdAt: Date; status: string }>,
    period?: string,
  ): Promise<TrendAnalysis>;

  recommend(
    complaintText: string,
    knowledgeBase?: Array<{ id: string; title: string; content: string }>,
  ): Promise<Recommendation[]>;
}

export type AIProviderType = "gemini" | "openai" | "anthropic";
