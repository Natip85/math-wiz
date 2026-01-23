import type { FastifyInstance } from "fastify";
import * as stytch from "stytch";
import { z } from "zod";

import { env } from "../env";
import { API_TAGS } from "../constants";
import { authenticateM2M, requireScopes } from "../lib/m2m-auth";
import { errorResponseSchema } from "../types/schemas";

// Initialize Stytch B2B client
const stytchClient = new stytch.B2BClient({
  project_id: env.STYTCH_PROJECT_ID,
  secret: env.STYTCH_SECRET,
  env: env.NODE_ENV === "production" ? stytch.envs.live : stytch.envs.test,
});

// Available scopes that can be assigned to clients
const AVAILABLE_SCOPES = [
  "read:sessions",
  "read:questions",
  "read:progress",
  "read:leaderboard",
  "admin:clients",
] as const;

// Type for Stytch M2M client response (SDK types may not be complete)
interface M2MClientData {
  client_id: string;
  client_secret?: string;
  client_name?: string;
  client_description?: string;
  scopes: string[];
  trusted_metadata?: Record<string, unknown>;
}

interface M2MSearchResponse {
  m2m_clients?: M2MClientData[];
  clients?: M2MClientData[];
}

interface M2MCreateResponse {
  client_id?: string;
  client_secret?: string;
  m2m_client?: M2MClientData;
}

// Schemas
const createClientRequestSchema = z.object({
  name: z.string().min(1).describe("Client name (e.g., 'Company X Integration')"),
  description: z.string().optional().describe("Optional description"),
  scopes: z.array(z.string()).min(1).describe("Scopes to grant to this client"),
});

const clientResponseSchema = z.object({
  client_id: z.string().describe("The client ID"),
  client_name: z.string().describe("Client display name"),
  client_description: z.union([z.string(), z.null()]).describe("Client description"),
  scopes: z.array(z.string()).describe("Granted scopes"),
  created_at: z.string().describe("When the client was created"),
});

const createClientResponseSchema = clientResponseSchema.extend({
  client_secret: z.string().describe("The client secret (shown only once!)"),
});

const listClientsResponseSchema = z.object({
  clients: z.array(clientResponseSchema).describe("List of M2M clients"),
});

const availableScopesResponseSchema = z.object({
  scopes: z.array(z.string()).describe("Available scopes that can be assigned"),
});

export const adminClientsRoute = async (fastify: FastifyInstance) => {
  // GET /admin/clients/scopes - List available scopes
  fastify.route({
    method: "GET",
    url: "/scopes",
    preHandler: [authenticateM2M, requireScopes("admin:clients")],
    schema: {
      tags: [API_TAGS.ADMIN],
      summary: "List available scopes",
      description: "Get all available scopes that can be assigned to M2M clients",
      response: {
        200: availableScopesResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
      },
    },
    handler: async (_request, reply) => {
      return reply.send({
        scopes: [...AVAILABLE_SCOPES],
      });
    },
  });

  // GET /admin/clients - List all M2M clients
  fastify.route({
    method: "GET",
    url: "/",
    preHandler: [authenticateM2M, requireScopes("admin:clients")],
    schema: {
      tags: [API_TAGS.ADMIN],
      summary: "List M2M clients",
      description: "List all M2M clients that have been created for API access",
      response: {
        200: listClientsResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const response = (await stytchClient.m2m.clients.search(
          {}
        )) as unknown as M2MSearchResponse;
        const clientList = response.m2m_clients ?? response.clients ?? [];

        const clients = clientList.map((client: M2MClientData) => ({
          client_id: client.client_id,
          client_name: client.client_name ?? "Unnamed",
          client_description: client.client_description ?? null,
          scopes: client.scopes,
          created_at: (client.trusted_metadata?.created_at as string) ?? new Date().toISOString(),
        }));

        return reply.send({ clients });
      } catch (error) {
        request.log.error({ error }, "Failed to list M2M clients");
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to list clients",
          statusCode: 500,
        });
      }
    },
  });

  // POST /admin/clients - Create a new M2M client
  fastify.route({
    method: "POST",
    url: "/",
    preHandler: [authenticateM2M, requireScopes("admin:clients")],
    schema: {
      tags: [API_TAGS.ADMIN],
      summary: "Create M2M client",
      description:
        "Create a new M2M client for API access. The client_secret is returned only once - store it securely!",
      body: createClientRequestSchema,
      response: {
        201: createClientResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { name, description, scopes } = request.body as z.infer<
        typeof createClientRequestSchema
      >;

      try {
        const response = (await stytchClient.m2m.clients.create({
          client_name: name,
          client_description: description,
          scopes,
          trusted_metadata: {
            created_at: new Date().toISOString(),
            created_by: "admin",
          },
        })) as unknown as M2MCreateResponse;

        const clientId = response.client_id ?? response.m2m_client?.client_id ?? "";
        const clientSecret = response.client_secret ?? response.m2m_client?.client_secret ?? "";

        return reply.code(201).send({
          client_id: clientId,
          client_name: name,
          client_description: description ?? null,
          client_secret: clientSecret,
          scopes: scopes,
          created_at: new Date().toISOString(),
        });
      } catch (error: unknown) {
        const err = error as Error & { error_message?: string };
        request.log.error({ error }, "Failed to create M2M client");
        return reply.code(400).send({
          error: "Bad Request",
          message: err.error_message ?? "Failed to create client",
          statusCode: 400,
        });
      }
    },
  });

  // DELETE /admin/clients/:clientId - Delete an M2M client
  fastify.route({
    method: "DELETE",
    url: "/:clientId",
    preHandler: [authenticateM2M, requireScopes("admin:clients")],
    schema: {
      tags: [API_TAGS.ADMIN],
      summary: "Delete M2M client",
      description: "Revoke API access by deleting an M2M client",
      params: z.object({
        clientId: z.string().describe("The client ID to delete"),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { clientId } = request.params as { clientId: string };

      try {
        await stytchClient.m2m.clients.delete({ client_id: clientId });

        return reply.send({
          success: true,
          message: `Client ${clientId} has been deleted`,
        });
      } catch (error: unknown) {
        const err = error as Error & { status_code?: number; error_message?: string };
        request.log.error({ error }, "Failed to delete M2M client");

        if (err.status_code === 404) {
          return reply.code(404).send({
            error: "Not Found",
            message: "Client not found",
            statusCode: 404,
          });
        }

        return reply.code(500).send({
          error: "Internal Server Error",
          message: err.error_message ?? "Failed to delete client",
          statusCode: 500,
        });
      }
    },
  });
};
