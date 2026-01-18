import { getTranslations } from "next-intl/server";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { HistoryTable } from "@/features/history/history-table";
import { historyBreadcrumbs } from "@/lib/breadcrumbs";

export default async function HistoryPage() {
  const t = await getTranslations("HistoryPage");

  return (
    <div className="p-3">
      <Breadcrumbs pages={historyBreadcrumbs} />

      <div className="container mx-auto max-w-5xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("description")}</p>
        </div>
        <HistoryTable />
      </div>
    </div>
  );
}
