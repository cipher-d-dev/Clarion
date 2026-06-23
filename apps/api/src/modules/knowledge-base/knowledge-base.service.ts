import { NotFoundError } from "../../lib/errors.js";
import type { KnowledgeBaseRepository } from "./knowledge-base.repository.js";
import type { AIProvider } from "@clarion/ai";
import type { CreateKnowledgeArticleInput, UpdateKnowledgeArticleInput } from "@clarion/shared";

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

export class KnowledgeBaseService {
  constructor(
    private readonly repo: KnowledgeBaseRepository,
    private readonly ai: AIProvider,
  ) {}

  async list(institutionId: string, canManage: boolean) {
    return this.repo.findMany(institutionId, !canManage);
  }

  async getBySlug(institutionId: string, slug: string) {
    const article = await this.repo.findBySlug(institutionId, slug);
    if (!article) throw new NotFoundError("Article not found");
    await this.repo.update(article.id, { viewCount: { increment: 1 } });
    return article;
  }

  async create(institutionId: string, dto: CreateKnowledgeArticleInput) {
    const slug = dto.slug ?? slugify(dto.title);
    const article = await this.repo.create({
      institution: { connect: { id: institutionId } },
      title: dto.title,
      slug,
      content: dto.content,
      category: dto.category,
    });
    return article;
  }

  async update(id: string, institutionId: string, dto: UpdateKnowledgeArticleInput) {
    const existing = await this.repo.findById(id, institutionId);
    if (!existing) throw new NotFoundError("Article not found");

    const updated = await this.repo.update(id, {
      ...(dto.title && { title: dto.title }),
      ...(dto.slug && { slug: dto.slug }),
      ...(dto.content && { content: dto.content }),
      ...(dto.category !== undefined && { category: dto.category }),
      // Clear embedding when content changes so it gets re-embedded on publish
      ...(dto.content && { embedding: null }),
    });
    return updated;
  }

  async publish(id: string, institutionId: string) {
    const article = await this.repo.findById(id, institutionId);
    if (!article) throw new NotFoundError("Article not found");

    // Embed on publish
    const toEmbed = `${article.title}\n\n${article.content}`;
    let embedding: string | undefined;
    try {
      const result = await this.ai.embed(toEmbed);
      embedding = JSON.stringify(result.embedding);
    } catch (err) {
      console.warn("[KB] Embedding failed, publishing without embedding:", err);
    }

    return this.repo.update(id, {
      isPublished: !article.isPublished,
      ...(embedding && { embedding }),
    });
  }

  async softDelete(id: string, institutionId: string) {
    const existing = await this.repo.findById(id, institutionId);
    if (!existing) throw new NotFoundError("Article not found");
    return this.repo.softDelete(id);
  }

  async search(institutionId: string, query: string, limit = 5) {
    const articles = await this.repo.findPublishedWithEmbeddings(institutionId);
    if (articles.length === 0) return [];

    // If AI available, use semantic search; otherwise fall back to keyword
    try {
      const { embedding: queryEmbedding } = await this.ai.embed(query);
      return articles
        .map((a) => {
          const emb: number[] = JSON.parse(a.embedding!);
          return { ...a, score: cosineSimilarity(queryEmbedding, emb) };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ embedding: _e, score: _s, ...rest }) => rest);
    } catch {
      // keyword fallback
      const q = query.toLowerCase();
      return articles
        .filter((a) => `${a.title} ${a.content}`.toLowerCase().includes(q))
        .slice(0, limit)
        .map(({ embedding: _e, ...rest }) => rest);
    }
  }

  // Used by chat RAG — returns top-k articles with content
  async getContextChunks(institutionId: string, query: string, k = 5) {
    return this.search(institutionId, query, k);
  }
}
