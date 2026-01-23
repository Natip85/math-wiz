import type { FastifyInstance } from "fastify";

import { API_TAGS } from "../constants";
import { exchangeClientCredentials } from "../lib/m2m-auth";
import { tokenRequestSchema, tokenResponseSchema, errorResponseSchema } from "../types/schemas";
import type { TokenRequest } from "../types/schemas";

export const authRoute = async (fastify: FastifyInstance) => {
  fastify.route({
    method: "POST",
    url: "/token",
    schema: {
      tags: [API_TAGS.AUTH],
      summary: "Exchange credentials for access token",
      description: `
Exchange your client credentials for an access token.

The returned token should be included in the \`Authorization\` header of subsequent requests:
\`Authorization: Bearer <access_token>\`

Tokens expire after the duration specified in \`expires_in\` (in seconds).
      `,
      security: [], // No auth required for token exchange
      body: tokenRequestSchema,
      response: {
        200: tokenResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { client_id, client_secret, scopes } = request.body as TokenRequest;

      try {
        const tokenResponse = await exchangeClientCredentials(client_id, client_secret, scopes);

        return reply.send(tokenResponse);
      } catch (error) {
        request.log.warn({ error, client_id }, "Token exchange failed");

        return reply.code(401).send({
          error: "Unauthorized",
          message: "Invalid client credentials",
          statusCode: 401,
        });
      }
    },
  });
};
