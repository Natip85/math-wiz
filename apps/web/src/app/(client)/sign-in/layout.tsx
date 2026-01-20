import { auth } from "@math-wiz/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/");
  }

  return <div className="flex min-h-screen items-center justify-center">{children}</div>;
}
