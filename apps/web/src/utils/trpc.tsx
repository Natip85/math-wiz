import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import React, { cache } from "react";
import type { ReactNode } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import type { AppRouter } from "@math-wiz/api/routers/index";
import { appRouter } from "@math-wiz/api/routers/index";
import { createServerContext } from "@math-wiz/api/context";

import { createQueryClient } from "./query-client";

// Request-scoped singletons via React.cache
export const getQueryClient = cache(createQueryClient);
const createContext = cache(createServerContext);

export const trpc = createTRPCOptionsProxy<AppRouter>({
  router: appRouter,
  ctx: createContext,
  queryClient: getQueryClient,
});

// Hydration component for passing prefetched data to client components
export function HydrateClient(props: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>;
}

// Helper for prefetching queries in server components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === "infinite") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}

// Hook for accessing trpc in components
export function useTRPC() {
  return trpc;
}
