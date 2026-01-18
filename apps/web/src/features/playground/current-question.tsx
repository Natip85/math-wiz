"use client";

import { useTRPC } from "@/utils/trpc-client";
import { useQuery } from "@tanstack/react-query";
import { QuestionRenderer } from "./question-renderer";

export function CurrentQuestion({ runId }: { runId: string }) {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.playground.getById.queryOptions(runId));

  if (isLoading || !data?.currentQuestion) {
    return <div>Loading question...</div>;
  }

  return <QuestionRenderer question={data.currentQuestion} sessionId={data.session.id} />;
}
