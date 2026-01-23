import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";

import { API_TAGS } from "../constants";
import { env } from "../env";
import { healthResponseSchema, errorResponseSchema } from "../types/schemas";

export const healthRoute = async (fastify: FastifyInstance) => {
  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      tags: [API_TAGS.HEALTH],
      summary: "Health check",
      description: "Check the health status of the API and its dependencies",
      security: [], // No auth required
      response: {
        200: healthResponseSchema,
        503: errorResponseSchema,
      },
    },
    handler: async (_request, reply) => {
      let dbStatus: "healthy" | "unhealthy" = "unhealthy";

      try {
        // Test database connection
        await fastify.db.execute(sql`SELECT 1`);
        dbStatus = "healthy";
      } catch (error) {
        fastify.log.error({ error }, "Database health check failed");
      }

      const overallStatus = dbStatus === "healthy" ? "healthy" : "degraded";

      const response = {
        status: overallStatus,
        version: env.VERSION,
        timestamp: new Date().toISOString(),
        checks: {
          database: dbStatus,
        },
      };

      if (overallStatus !== "healthy") {
        return reply.code(503).send(response);
      }

      return reply.send(response);
    },
  });
};
