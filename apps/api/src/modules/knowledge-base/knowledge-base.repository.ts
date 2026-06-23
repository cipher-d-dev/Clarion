import type { PrismaClient, Prisma } from "@clarion/database";

export class KnowledgeBaseRepository {
  constructor(private readonly db: PrismaClient) {}

  async findMany(institutionId: string, publishedOnly = true) {
    return this.db.knowledgeArticle.findMany({
      where: { institutionId, deletedAt: null, ...(publishedOnly && { isPublished: true }) },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, category: true, isPublished: true, viewCount: true, createdAt: true, updatedAt: true },
    });
  }

  async findBySlug(institutionId: string, slug: string) {
    return this.db.knowledgeArticle.findFirst({
      where: { institutionId, slug, deletedAt: null },
    });
  }

  async findById(id: string, institutionId: string) {
    return this.db.knowledgeArticle.findFirst({
      where: { id, institutionId, deletedAt: null },
    });
  }

  async findPublishedWithEmbeddings(institutionId: string) {
    return this.db.knowledgeArticle.findMany({
      where: { institutionId, isPublished: true, deletedAt: null, embedding: { not: null } },
      select: { id: true, title: true, content: true, slug: true, category: true, embedding: true },
    });
  }

  async create(data: Prisma.KnowledgeArticleCreateInput) {
    return this.db.knowledgeArticle.create({ data });
  }

  async update(id: string, data: Prisma.KnowledgeArticleUpdateInput) {
    return this.db.knowledgeArticle.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.db.knowledgeArticle.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
