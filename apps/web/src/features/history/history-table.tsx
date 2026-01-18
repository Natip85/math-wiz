"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

function QuestionTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    word_problem: "Word Problem",
    equation: "Equation",
    multiple_choice: "Multiple Choice",
  };
  return <span className="text-muted-foreground text-xs">{labels[type] ?? type}</span>;
}

export function HistoryTable() {
  const trpc = useTRPC();
  const { data: history, isLoading } = useQuery(trpc.playground.getHistory.queryOptions());

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
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-1 items-center justify-between pr-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{session.topic}</span>
                  <Badge variant={session.endedAt ? "default" : "secondary"}>
                    {session.endedAt ? "Completed" : "In Progress"}
                  </Badge>
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
