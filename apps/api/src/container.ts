import { prisma } from "@clarion/database";
import { createAIProvider } from "@clarion/ai";
import { env } from "./config/env.js";

import { AuthRepository } from "./modules/auth/auth.repository.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { AuthController } from "./modules/auth/auth.controller.js";

import { ComplaintsRepository } from "./modules/complaints/complaints.repository.js";
import { ComplaintsService } from "./modules/complaints/complaints.service.js";
import { ComplaintsController } from "./modules/complaints/complaints.controller.js";

import { TicketsRepository } from "./modules/tickets/tickets.repository.js";
import { TicketsService } from "./modules/tickets/tickets.service.js";
import { TicketsController } from "./modules/tickets/tickets.controller.js";

import { UsersRepository } from "./modules/users/users.repository.js";
import { UsersService } from "./modules/users/users.service.js";
import { UsersController } from "./modules/users/users.controller.js";

import { KnowledgeBaseRepository } from "./modules/knowledge-base/knowledge-base.repository.js";
import { KnowledgeBaseService } from "./modules/knowledge-base/knowledge-base.service.js";
import { KnowledgeBaseController } from "./modules/knowledge-base/knowledge-base.controller.js";

import { ChatbotRepository } from "./modules/chatbot/chatbot.repository.js";
import { ChatbotService } from "./modules/chatbot/chatbot.service.js";
import { ChatbotController } from "./modules/chatbot/chatbot.controller.js";

import { NotificationsRepository } from "./modules/notifications/notifications.repository.js";
import { NotificationsService } from "./modules/notifications/notifications.service.js";
import { NotificationsController } from "./modules/notifications/notifications.controller.js";

import { AnalyticsRepository } from "./modules/analytics/analytics.repository.js";
import { AnalyticsService } from "./modules/analytics/analytics.service.js";
import { AnalyticsController } from "./modules/analytics/analytics.controller.js";

import { AuditRepository } from "./modules/audit/audit.repository.js";
import { AuditService } from "./modules/audit/audit.service.js";
import { AuditController } from "./modules/audit/audit.controller.js";

import { AdminRepository } from "./modules/admin/admin.repository.js";
import { AdminService } from "./modules/admin/admin.service.js";
import { AdminController } from "./modules/admin/admin.controller.js";

// Gracefully degrade when no API key is set
const aiProvider = env.GEMINI_API_KEY
  ? createAIProvider("gemini", { apiKey: env.GEMINI_API_KEY })
  : createAIProvider("stub");

const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
export const authController = new AuthController(authService);

const notificationsRepository = new NotificationsRepository(prisma);
export const notificationsService = new NotificationsService(notificationsRepository, env);
export const notificationsController = new NotificationsController(notificationsService);

const auditRepository = new AuditRepository(prisma);
const auditService = new AuditService(auditRepository);
export const auditController = new AuditController(auditService);

const ticketsRepository = new TicketsRepository(prisma);
const ticketsService = new TicketsService(ticketsRepository, notificationsService);
export const ticketsController = new TicketsController(ticketsService);

const complaintsRepository = new ComplaintsRepository(prisma);
const complaintsService = new ComplaintsService(
  complaintsRepository,
  ticketsRepository,
  aiProvider,
  notificationsService,
  auditService,
);
export const complaintsController = new ComplaintsController(complaintsService);

const usersRepository = new UsersRepository(prisma);
const usersService = new UsersService(usersRepository);
export const usersController = new UsersController(usersService);

const kbRepository = new KnowledgeBaseRepository(prisma);
const kbService = new KnowledgeBaseService(kbRepository, aiProvider);
export const kbController = new KnowledgeBaseController(kbService);

const chatbotRepository = new ChatbotRepository(prisma);
const chatbotService = new ChatbotService(chatbotRepository, aiProvider, kbService, complaintsRepository);
export const chatbotController = new ChatbotController(chatbotService);

export { prisma };

const analyticsRepository = new AnalyticsRepository(prisma);
const analyticsService = new AnalyticsService(analyticsRepository, aiProvider);
export const analyticsController = new AnalyticsController(analyticsService);

const adminRepository = new AdminRepository(prisma);
const adminService = new AdminService(adminRepository, auditService);
export const adminController = new AdminController(adminService);
