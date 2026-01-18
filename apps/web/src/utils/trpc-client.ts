import type { AppRouter } from "@math-wiz/api/routers/index";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { getQueryClient } from "./query-client";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }
  return "http://localhost:3000";
}

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});

// Client-side tRPC proxy (uses HTTP calls)
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient: getQueryClient,
});

// Hook for accessing trpc in client components
export function useTRPC() {
  return trpc;
}
