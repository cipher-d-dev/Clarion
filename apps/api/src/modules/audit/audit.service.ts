import type { AuditFilters, AuditRepository } from "./audit.repository.js";

export class AuditService {
  constructor(private readonly repo: AuditRepository) {}

  list(institutionId: string | null, page: number, pageSize: number, filters: AuditFilters) {
    return this.repo.find(institutionId, page, pageSize, filters);
  }

  log(data: Parameters<AuditRepository["create"]>[0]) {
    return this.repo.create(data);
  }
}
