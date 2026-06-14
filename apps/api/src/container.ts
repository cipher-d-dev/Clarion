import { prisma } from "@clarion/database";
import { AuthRepository } from "./modules/auth/auth.repository.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { AuthController } from "./modules/auth/auth.controller.js";

const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
export const authController = new AuthController(authService);

export { prisma };
