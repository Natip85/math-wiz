"use client";

import { useTRPC } from "@/utils/trpc-client";
import { useQuery } from "@tanstack/react-query";
import { QuestionRenderer } from "./question-renderer";
import type { Subject } from "./hooks/use-submit-answer";

export function CurrentQuestion({ runId }: { runId: string }) {
  const trpc = useTRPC();
  const { data, isLoading, isFetching } = useQuery(trpc.playground.getById.queryOptions(runId));

  if (isLoading || !data?.currentQuestion) {
    return <div>Loading question...</div>;
  }

  // Get subject from session, default to "math" for backward compatibility
  const subject = (data.session.subject ?? "math") as Subject;

  return (
    <QuestionRenderer
      question={data.currentQuestion}
      sessionId={data.session.id}
      subject={subject}
      isFetching={isFetching}
    />
  );
}
