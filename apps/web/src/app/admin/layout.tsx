import { SidebarInset, SidebarMobileTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/nav/app-sidebar";
import { auth } from "@math-wiz/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const isAdmin = session.user.role === "admin";

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarMobileTrigger />
        <SidebarInset>
          <div className="py-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
