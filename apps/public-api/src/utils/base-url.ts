import { env } from "../env";

/**
 * Get the base URL for HATEOAS links
 */
export function getBaseUrl(): string {
  return env.APIS_PUBLIC_BASE_URL ?? `http://localhost:${env.API_PORT}`;
}
