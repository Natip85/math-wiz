import { Breadcrumbs } from "@/components/breadcrumbs";
import { CurrentQuestion } from "@/features/playground/current-question";
import { PlayRunProgress } from "@/features/playground/play-run-progress";
import { createPlaygroundDetailBreadcrumbs } from "@/lib/breadcrumbs";
import { prefetch, trpc } from "@/utils/trpc";

type PlaygroundRunPageProps = {
  params: Promise<{ runId: string }>;
};

export default async function PlaygroundRunPage({ params }: PlaygroundRunPageProps) {
  const { runId } = await params;
  prefetch(trpc.playground.getById.queryOptions(runId));

  return (
    <div className="flex flex-col gap-6 p-3">
      <Breadcrumbs pages={createPlaygroundDetailBreadcrumbs(runId)} />
      <div className="mx-auto flex w-[50%] flex-col gap-4">
        <PlayRunProgress runId={runId} />
        <CurrentQuestion runId={runId} />
      </div>
    </div>
  );
}
