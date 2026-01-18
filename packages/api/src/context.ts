import type { NextRequest } from "next/server";
import { headers } from "next/headers";

import { auth } from "@math-wiz/auth";

export async function createContext(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  return {
    session,
  };
}

// For server-side tRPC calls (used in server components via createTRPCOptionsProxy)
export async function createServerContext() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
