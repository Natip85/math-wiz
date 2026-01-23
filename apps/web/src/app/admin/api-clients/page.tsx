import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@math-wiz/auth";
import { appRouter } from "@math-wiz/api/routers/index";
import { createServerContext } from "@math-wiz/api/context";
import { ApiClientsHeader } from "@/features/admin/api-clients/header";
import { ClientRow } from "@/features/admin/api-clients/client-row";

export default async function ApiClientsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session == null) return redirect("/sign-in");

  if (session.user.role !== "admin") return redirect("/");

  // Create server-side tRPC caller
  const ctx = await createServerContext();
  const caller = appRouter.createCaller(ctx);
  const clients = await caller.apiClients.list();

  return (
    <div className="bg-background min-h-screen">
      <ApiClientsHeader />
      <main className="p-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <div className="text-muted-foreground text-sm">
            {clients.length} API client{clients.length !== 1 ? "s" : ""} configured
          </div>
          {clients.length === 0 ? (
            <div className="border-border/50 rounded-lg border-2 border-dashed p-12 text-center">
              <h3 className="text-lg font-medium">No API clients yet</h3>
              <p className="text-muted-foreground mt-1">
                Create your first API client to allow external access to your API.
              </p>
            </div>
          ) : (
            <Table className="border-foreground/10 border-2">
              <TableHeader className="bg-foreground/10 rounded-md">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Client</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <ClientRow key={client.clientId} client={client} />
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
