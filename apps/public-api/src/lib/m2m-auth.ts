import type { FastifyReply, FastifyRequest } from "fastify";
import * as stytch from "stytch";

import { env } from "../env";

// Initialize Stytch B2B client for M2M authentication
const stytchClient = new stytch.B2BClient({
  project_id: env.STYTCH_PROJECT_ID,
  secret: env.STYTCH_SECRET,
  env: env.NODE_ENV === "production" ? stytch.envs.live : stytch.envs.test,
});

// Type for authenticated request with M2M context
export interface M2MAuthContext {
  clientId: string;
  scopes: string[];
}

export interface AuthenticatedRequest extends FastifyRequest {
  m2mAuth: M2MAuthContext;
}

/**
 * Pre-handler hook that validates M2M access tokens
 * Attach this to routes that require authentication
 */
export async function authenticateM2M(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Missing or invalid Authorization header. Expected: Bearer <token>",
      statusCode: 401,
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Missing access token",
      statusCode: 401,
    });
  }

  try {
    // Validate the M2M token with Stytch
    const response = await stytchClient.m2m.authenticateToken({ access_token: token });

    request.log.info(
      { clientId: response.client_id, scopes: response.scopes },
      "Token validated successfully"
    );

    // Attach auth context to request
    (request as AuthenticatedRequest).m2mAuth = {
      clientId: response.client_id,
      scopes: response.scopes,
    };
  } catch (error: unknown) {
    const err = error as Error & {
      status_code?: number;
      error_type?: string;
      error_message?: string;
    };
    request.log.error(
      {
        error: err.message,
        errorType: err.error_type,
        errorMessage: err.error_message,
        statusCode: err.status_code,
      },
      "M2M token validation failed"
    );

    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired access token",
      statusCode: 401,
    });
  }
}

/**
 * Factory function that creates a pre-handler to check for required scopes
 * Use after authenticateM2M to enforce specific permissions
 *
 * @example
 * preHandler: [authenticateM2M, requireScopes('read:sessions')]
 */
export function requireScopes(...requiredScopes: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const authRequest = request as AuthenticatedRequest;

    if (!authRequest.m2mAuth) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Authentication required",
        statusCode: 401,
      });
    }

    const hasAllScopes = requiredScopes.every((scope) =>
      authRequest.m2mAuth.scopes.includes(scope)
    );

    if (!hasAllScopes) {
      return reply.code(403).send({
        error: "Forbidden",
        message: `Missing required scopes: ${requiredScopes.join(", ")}`,
        statusCode: 403,
      });
    }
  };
}

/**
 * Get a new access token using client credentials
 * This is the token exchange endpoint for M2M clients
 */
export async function exchangeClientCredentials(
  clientId: string,
  clientSecret: string,
  scopes?: string[]
): Promise<{ access_token: string; expires_in: number; token_type: string }> {
  const response = await stytchClient.m2m.token({
    client_id: clientId,
    client_secret: clientSecret,
    scopes,
  });

  return {
    access_token: response.access_token,
    expires_in: response.expires_in,
    token_type: "Bearer",
  };
}
