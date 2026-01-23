import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fp from "fastify-plugin";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import type { FastifyInstance } from "fastify";

import { env } from "../env";

export const registerOpenApi = fp(async (fastify: FastifyInstance) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Math Wiz Public API",
        description: `
## Overview

The Math Wiz Public API provides programmatic access to learning sessions, questions, and user progress data.

## Authentication

This API uses **OAuth 2.0 Client Credentials** flow via Stytch M2M (machine-to-machine) authentication.

### Getting Access

1. Contact the Math Wiz team to get your \`client_id\` and \`client_secret\`
2. Exchange your credentials for an access token via \`POST /auth/token\`
3. Include the token in all API requests: \`Authorization: Bearer <token>\`

### Available Scopes

| Scope | Description |
|-------|-------------|
| \`read:sessions\` | Read learning sessions |
| \`read:questions\` | Read questions |
| \`read:progress\` | Read user progress and stats |
| \`read:leaderboard\` | Read leaderboard data |
| \`admin:clients\` | Manage M2M clients (admin only) |

### Example Token Exchange

\`\`\`bash
curl -X POST ${env.APIS_PUBLIC_BASE_URL ?? "http://localhost:8080"}/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"client_id": "your-client-id", "client_secret": "your-secret"}'
\`\`\`

### Example Authenticated Request

\`\`\`bash
curl ${env.APIS_PUBLIC_BASE_URL ?? "http://localhost:8080"}/sessions \\
  -H "Authorization: Bearer <your-access-token>"
\`\`\`
        `,
        version: env.VERSION,
        contact: {
          name: "Math Wiz API Support",
        },
      },
      servers: [
        {
          url: env.APIS_PUBLIC_BASE_URL ?? `http://localhost:${env.API_PORT}`,
          description: env.NODE_ENV === "production" ? "Production" : "Development",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Access token obtained from POST /auth/token",
          },
        },
      },
      security: [{ BearerAuth: [] }],
      tags: [
        { name: "Authentication", description: "Token exchange and authentication" },
        { name: "Learning Sessions", description: "Learning session management" },
        { name: "Progress & Stats", description: "User progress and statistics" },
        { name: "Health", description: "API health checks" },
        { name: "Admin", description: "Admin endpoints for managing API clients" },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await fastify.register(fastifySwaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      persistAuthorization: true,
    },
  });

  fastify.log.info("OpenAPI documentation available at /docs");
});
