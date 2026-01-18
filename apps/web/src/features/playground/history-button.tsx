"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/utils/trpc-client";

export function HistoryButton() {
  const trpc = useTRPC();
  const { data: hasHistory } = useQuery(trpc.playground.hasCompletedSessions.queryOptions());

  if (!hasHistory) {
    return null;
  }

  return (
    <Button asChild variant="secondary">
      <Link href="/history">View playground history</Link>
    </Button>
  );
}
