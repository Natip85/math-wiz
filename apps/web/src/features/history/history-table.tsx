"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Play,
  Clock,
  Calculator,
  FlaskConical,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/ui/score-badge";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTRPC } from "@/utils/trpc-client";

// Subject icons mapping
const subjectIcons: Record<string, LucideIcon> = {
  math: Calculator,
  science: FlaskConical,
  english: BookOpen,
};

/**
 * Get the full answer text without truncation
 */
function getFullAnswer(answer: unknown): string {
  if (answer === null || answer === undefined) return "—";
  if (typeof answer !== "object") return String(answer);

  const a = answer as Record<string, unknown>;

  // Math: { value: number }
  if ("value" in a && !("type" in a)) {
    return String(a.value);
  }

  // Science/English with type discriminator
  if ("type" in a) {
    switch (a.type) {
      case "boolean":
        return a.value ? "True" : "False";
      case "choice":
      case "text":
      case "explanation":
        return String(a.value ?? "");
      case "correction":
        return String((a as { corrected?: string }).corrected ?? a.value ?? "");
      default:
        return String(a.value ?? "—");
    }
  }

  return "—";
}

/**
 * Format answer objects for display (truncated for table view)
 * Handles different answer formats: Math { value }, Science/English { type, value }
 */
function formatAnswer(answer: unknown): { text: string; isTruncated: boolean } {
  const fullText = getFullAnswer(answer);
  if (fullText.length > 30) {
    return { text: fullText.slice(0, 30) + "…", isTruncated: true };
  }
  return { text: fullText, isTruncated: false };
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

function QuestionTypeLabel({ type, t }: { type: string; t: (key: string) => string }) {
  const key = `questionType.${type}`;
  return <span className="text-muted-foreground text-xs">{t(key)}</span>;
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const label = t(`status.${status}`);
  switch (status) {
    case "completed":
      return <Badge variant="default">{label}</Badge>;
    case "paused":
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
          {label}
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
          {label}
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
  const t = useTranslations("HistoryTable");
  const tConfig = useTranslations("PlaygroundConfigForm");
  const format = useFormatter();
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
        <p className="text-lg">{t("empty.title")}</p>
        <p className="text-sm">{t("empty.description")}</p>
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
            <div className="flex flex-1 items-center justify-between gap-4 pe-4">
              <div className="space-y-1 text-start">
                <div className="flex items-center gap-2">
                  {/* Subject icon and label */}
                  {(() => {
                    const subject = session.subject ?? "math";
                    const SubjectIcon = subjectIcons[subject] ?? Calculator;
                    return (
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <SubjectIcon className="size-4" />
                        <span className="text-xs">{tConfig(`subject.${subject}`)}</span>
                      </span>
                    );
                  })()}
                  <span className="font-semibold">{tConfig(`topic.${session.topic}`)}</span>
                  <StatusBadge status={session.status} t={t} />
                </div>
                <p className="text-muted-foreground text-sm">
                  {format.dateTime(new Date(session.startedAt), {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
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
                <ScoreBadge score={session.score} label={t("points")} size="sm" />
                {session.status === "paused" && (
                  <Button asChild size="sm" variant="outline" className="ms-2 gap-1">
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
                      {t("resume")}
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
                  <TableHead className="w-12">{t("table.number")}</TableHead>
                  <TableHead className="min-w-[200px]">{t("table.question")}</TableHead>
                  <TableHead className="w-24">{t("table.type")}</TableHead>
                  <TableHead className="w-24 text-center">{t("table.answer")}</TableHead>
                  <TableHead className="w-24 text-center">{t("table.correctAnswer")}</TableHead>
                  <TableHead className="w-20 text-center">{t("table.time")}</TableHead>
                  <TableHead className="w-20 text-center">{t("table.hints")}</TableHead>
                  <TableHead className="w-20 text-center">{t("table.result")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {session.questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.questionIndex + 1}</TableCell>
                    <TableCell className="max-w-md min-w-[200px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="line-clamp-2 cursor-help">{question.questionText}</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          {question.questionText}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <QuestionTypeLabel type={question.type} t={t} />
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const { text, isTruncated } = formatAnswer(question.userAnswer);
                        if (isTruncated) {
                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help font-mono text-sm">{text}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                {getFullAnswer(question.userAnswer)}
                              </TooltipContent>
                            </Tooltip>
                          );
                        }
                        return <span className="font-mono text-sm">{text}</span>;
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const { text, isTruncated } = formatAnswer(question.correctAnswer);
                        if (isTruncated) {
                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help font-mono text-sm">{text}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                {getFullAnswer(question.correctAnswer)}
                              </TooltipContent>
                            </Tooltip>
                          );
                        }
                        return <span className="font-mono text-sm">{text}</span>;
                      })()}
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
