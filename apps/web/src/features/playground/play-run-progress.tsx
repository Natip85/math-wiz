"use client";

import { Progress } from "@/components/ui/progress";
import { useTRPC } from "@/utils/trpc-client";
import { useQuery } from "@tanstack/react-query";

export function PlayRunProgress({ runId }: { runId: string }) {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.playground.getById.queryOptions(runId));
  return (
    <div className="flex flex-col gap-3 p-2">
      <div>
        Question {(data?.progress.currentIndex ?? 0) + 1} of {data?.progress.total}
      </div>
      <Progress
        value={(((data?.progress.currentIndex ?? 0) + 1) / (data?.progress.total ?? 1)) * 100}
      />
    </div>
  );
}
