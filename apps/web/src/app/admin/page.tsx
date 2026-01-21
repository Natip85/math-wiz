import { auth } from "@math-wiz/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const isAdmin = session.user.role === "admin";

  if (!isAdmin) {
    redirect("/");
  }
  redirect("/admin/dashboard");
}
