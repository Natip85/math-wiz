"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pause, Clock } from "lucide-react";
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

function formatElapsedTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function QuestionTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-md px-2 py-1">
      <Clock className="size-3.5" />
      <span className="min-w-[3ch] font-mono text-sm">{formatElapsedTime(elapsedSeconds)}</span>
    </div>
  );
}

export function PlayRunProgress({ runId }: { runId: string }) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery(trpc.playground.getById.queryOptions(runId));

  const currentQuestionId = data?.currentQuestion?.id;

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
        <div className="flex items-center gap-4">
          <span>
            Question {(data?.progress.currentIndex ?? 0) + 1} of {data?.progress.total}
          </span>
          {isInProgress && currentQuestionId && <QuestionTimer key={currentQuestionId} />}
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
