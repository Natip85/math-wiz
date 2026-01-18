"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Lightbulb, Play, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/utils/trpc-client";

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatTime(ms: number | null) {
  if (ms === null) return null;
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function QuestionTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    word_problem: "Word Problem",
    equation: "Equation",
    multiple_choice: "Multiple Choice",
  };
  return <span className="text-muted-foreground text-xs">{labels[type] ?? type}</span>;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <Badge variant="default">Completed</Badge>;
    case "paused":
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
          Paused
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
          In Progress
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function HistoryTable() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: history, isLoading } = useQuery(trpc.playground.getHistory.queryOptions());

  const { mutateAsync: resumeSession, isPending } = useMutation(
    trpc.playground.resumeSession.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: trpc.playground.getActiveSession.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.playground.getPausedSessions.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.playground.getHistory.queryKey() });
        router.push(`/playground/${data.sessionId}`);
      },
    })
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-2 h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        <p className="text-lg">No playground history yet</p>
        <p className="text-sm">Complete some playground sessions to see your history here.</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-4">
      {history.map((session) => (
        <AccordionItem
          key={session.id}
          value={session.id}
          className="rounded-lg border px-4 last:border-b"
        >
          <AccordionTrigger className="cursor-pointer hover:no-underline">
            <div className="flex flex-1 items-center justify-between pr-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{session.topic}</span>
                  <StatusBadge status={session.status} />
                </div>
                <p className="text-muted-foreground text-sm">{formatDate(session.startedAt)}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="size-4" />
                  <span>{session.stats.correctCount}</span>
                </div>
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <XCircle className="size-4" />
                  <span>{session.stats.incorrectCount}</span>
                </div>
                <Badge variant="outline">{session.stats.accuracy}%</Badge>
                {session.status === "paused" && (
                  <Button asChild size="sm" variant="outline" className="ml-2 gap-1">
                    <span
                      role="button"
                      tabIndex={isPending ? -1 : 0}
                      className={isPending ? "pointer-events-none opacity-50" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isPending) resumeSession({ sessionId: session.id });
                      }}
                      onKeyDown={(e) => {
                        if (!isPending && (e.key === "Enter" || e.key === " ")) {
                          e.stopPropagation();
                          resumeSession({ sessionId: session.id });
                        }
                      }}
                    >
                      <Play className="size-3" />
                      Resume
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="w-24 text-center">Answer</TableHead>
                  <TableHead className="w-24 text-center">Correct answer</TableHead>
                  <TableHead className="w-20 text-center">Time</TableHead>
                  <TableHead className="w-20 text-center">Hints</TableHead>
                  <TableHead className="w-20 text-center">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {session.questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.questionIndex + 1}</TableCell>
                    <TableCell className="max-w-md truncate">{question.questionText}</TableCell>
                    <TableCell>
                      <QuestionTypeLabel type={question.type} />
                    </TableCell>
                    <TableCell className="text-center">
                      {question.userAnswer !== null ? (
                        <span className="font-mono">{question.userAnswer}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono">{question.correctAnswer}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {question.timeMs ? (
                        <div className="text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="size-3" />
                          <span className="text-xs">{formatTime(question.timeMs)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {question.hintsUsed > 0 ? (
                        <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400">
                          <Lightbulb className="size-3" />
                          <span>{question.hintsUsed}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {question.isCorrect === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : question.isCorrect ? (
                        <CheckCircle2 className="mx-auto size-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="mx-auto size-5 text-red-600 dark:text-red-400" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
