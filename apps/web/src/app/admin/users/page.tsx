import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@math-wiz/auth";
import { UsersHeader } from "@/features/admin/users/header";
import { UserRow } from "@/features/admin/users/user-row";

export default async function UsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session == null) return redirect("/sign-in");
  const hasAccess = await auth.api.userHasPermission({
    headers: await headers(),
    body: { permission: { user: ["list"] } },
  });
  if (!hasAccess.success) return redirect("/");

  const users = await auth.api.listUsers({
    headers: await headers(),
    query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
  });

  return (
    <div className="bg-background min-h-screen">
      <UsersHeader />
      <main className="p-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <div className="text-muted-foreground text-sm">
            Showing {users.users.length} of {users.total} users
          </div>
          <Table className="border-foreground/10 border-2">
            <TableHeader className="bg-foreground/10 rounded-md">
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.users.map((user) => (
                <UserRow key={user.id} user={user} selfId={session.user.id} />
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
