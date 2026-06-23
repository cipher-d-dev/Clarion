import { NotFoundError } from "../../lib/errors.js";
import type { UsersRepository } from "./users.repository.js";
import type { UpdateProfileInput } from "@clarion/shared";

export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async listStaff(institutionId: string) {
    return this.repo.findStaff(institutionId);
  }

  async getMe(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async updateMe(userId: string, dto: UpdateProfileInput) {
    return this.repo.update(userId, dto);
  }
}
