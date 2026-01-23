import * as stytch from "stytch";
import { z } from "zod";

import { env } from "@math-wiz/env/server";
import { adminProcedure, router } from "../index";

// Initialize Stytch B2B client
const stytchClient = new stytch.B2BClient({
  project_id: env.STYTCH_PROJECT_ID,
  secret: env.STYTCH_SECRET,
  env: stytch.envs.test,
});

// Available scopes that can be assigned to clients
export const AVAILABLE_SCOPES = [
  "read:sessions",
  "read:questions",
  "read:progress",
  "read:leaderboard",
] as const;

// Type for Stytch M2M client response
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

export const apiClientsRouter = router({
  // List available scopes
  getScopes: adminProcedure.query(() => {
    return [...AVAILABLE_SCOPES];
  }),

  // List all M2M clients
  list: adminProcedure.query(async () => {
    const response = (await stytchClient.m2m.clients.search({})) as unknown as M2MSearchResponse;
    const clientList = response.m2m_clients ?? response.clients ?? [];

    return clientList.map((client: M2MClientData) => ({
      clientId: client.client_id,
      name: client.client_name ?? "Unnamed",
      description: client.client_description ?? null,
      scopes: client.scopes,
      createdAt: (client.trusted_metadata?.created_at as string) ?? new Date().toISOString(),
    }));
  }),

  // Create a new M2M client
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        scopes: z.array(z.string()).min(1, "At least one scope is required"),
      })
    )
    .mutation(async ({ input }) => {
      const response = (await stytchClient.m2m.clients.create({
        client_name: input.name,
        client_description: input.description,
        scopes: input.scopes,
        trusted_metadata: {
          created_at: new Date().toISOString(),
          created_by: "admin",
        },
      })) as unknown as M2MCreateResponse;

      const clientId = response.client_id ?? response.m2m_client?.client_id ?? "";
      const clientSecret = response.client_secret ?? response.m2m_client?.client_secret ?? "";

      return {
        clientId,
        clientSecret, // Only returned once!
        name: input.name,
        description: input.description ?? null,
        scopes: input.scopes,
        createdAt: new Date().toISOString(),
      };
    }),

  // Delete an M2M client
  delete: adminProcedure.input(z.object({ clientId: z.string() })).mutation(async ({ input }) => {
    await stytchClient.m2m.clients.delete({ client_id: input.clientId });
    return { success: true };
  }),
});
