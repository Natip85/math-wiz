import type { FastifyInstance } from "fastify";

import { adminClientsRoute } from "./admin-clients";
import { authRoute } from "./auth";
import { healthRoute } from "./health";
import { progressRoute } from "./progress";
import { sessionsRoute } from "./sessions";

export const registerRoutes = async (app: FastifyInstance) => {
  // Register all routes with prefixes
  await app.register(healthRoute, { prefix: "/health" });
  await app.register(authRoute, { prefix: "/auth" });
  await app.register(sessionsRoute, { prefix: "/sessions" });
  await app.register(progressRoute, { prefix: "/progress" });
  await app.register(adminClientsRoute, { prefix: "/admin/clients" });
};
