import { QueryCache, QueryClient, isServer } from "@tanstack/react-query";
import { toast } from "sonner";

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show toast on client-side
        if (typeof window !== "undefined") {
          toast.error(error.message, {
            action: {
              label: "retry",
              onClick: query.invalidate,
            },
          });
        }
      },
    }),
    defaultOptions: {
      queries: {
        // Avoid refetching immediately on the client after SSR
        staleTime: 30 * 1000,
      },
    },
  });
}

// Browser singleton for client components
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always create a new query client
    return createQueryClient();
  }
  // Browser: reuse the same query client
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}
