import { AdminDashboardTabs } from "@/features/admin/dashboard/tabs";
import { DashboardHeader } from "@/features/admin/dashboard/header";
import { prefetch, trpc } from "@/utils/trpc";

export default function AdminDashboardPage() {
  prefetch(trpc.admin.getUserStats.queryOptions());
  return (
    <div className="bg-background min-h-screen">
      <DashboardHeader />
      <AdminDashboardTabs />
    </div>
  );
}
