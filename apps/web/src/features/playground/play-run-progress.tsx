"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pause } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTRPC } from "@/utils/trpc-client";

export function PlayRunProgress({ runId }: { runId: string }) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery(trpc.playground.getById.queryOptions(runId));

  const { mutateAsync: pauseSession, isPending } = useMutation(
    trpc.playground.pauseSession.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.playground.getActiveSession.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.playground.getPausedSessions.queryKey() });
        router.push("/playground");
      },
    })
  );

  const handlePause = () => {
    pauseSession({ sessionId: runId });
    setOpen(false);
  };

  const isInProgress = data?.session.status === "in_progress";

  return (
    <div className="flex flex-col gap-3 p-2">
      <div className="flex items-center justify-between">
        <div>
          Question {(data?.progress.currentIndex ?? 0) + 1} of {data?.progress.total}
        </div>
        {isInProgress && (
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Pause this session?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your progress will be saved and you can resume this session later from the
                  playground page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Playing</AlertDialogCancel>
                <AlertDialogAction onClick={handlePause} disabled={isPending}>
                  {isPending ? "Pausing..." : "Pause Session"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <Progress
        value={(((data?.progress.currentIndex ?? 0) + 1) / (data?.progress.total ?? 1)) * 100}
      />
    </div>
  );
}
