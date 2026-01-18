import { Breadcrumbs } from "@/components/breadcrumbs";
import { HistoryTable } from "@/features/history/history-table";
import { historyBreadcrumbs } from "@/lib/breadcrumbs";

export default function HistoryPage() {
  return (
    <div className="p-3">
      <Breadcrumbs pages={historyBreadcrumbs} />

      <div className="container mx-auto max-w-5xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Playground History</h1>
          <p className="text-muted-foreground mt-2">
            Review your past playground sessions and see how you did on each question.
          </p>
        </div>
        <HistoryTable />
      </div>
    </div>
  );
}
