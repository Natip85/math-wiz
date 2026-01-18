"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v4";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ConfettiOverlay, useSessionCompletion } from "@/hooks/use-session-completion";
import { trpc } from "@/utils/trpc-client";

import { HintPopover } from "./hint-popover";
import type { QuestionComponentProps } from "./question-renderer";

const answerSchema = z.object({
  answer: z.number({ error: "Please enter a number" }).min(1),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

export function Equation({ question, sessionId, isFetching }: QuestionComponentProps) {
  const queryClient = useQueryClient();
  const [hintsUsed, setHintsUsed] = useState(0);
  const { showConfetti, completeSession } = useSessionCompletion();
  const [startTime, setStartTime] = useState(Date.now);

  // Reset timer when question changes
  useEffect(() => {
    setStartTime(Date.now());
  }, [question.id]);

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: undefined,
    },
  });

  const { mutateAsync: submitAnswer, isPending } = useMutation(
    trpc.playground.submitAnswer.mutationOptions({
      onSuccess: (data) => {
        if (data.isCorrect) {
          toast.success("Correct! Great job!");
        } else {
          toast.error(`Not quite! The correct answer was ${data.correctAnswer}`);
        }

        if (data.isSessionComplete) {
          completeSession();
          return;
        }

        void queryClient.invalidateQueries(trpc.playground.getById.queryFilter(sessionId));
        form.reset();
        setHintsUsed(0);
      },
    })
  );

  async function onSubmit(values: AnswerFormValues) {
    // eslint-disable-next-line react-hooks/purity
    const timeMs = Date.now() - startTime;
    await submitAnswer({
      sessionId,
      questionId: question.id,
      userAnswer: values.answer,
      hintsUsed,
      timeMs,
    });
  }

  return (
    <>
      <ConfettiOverlay show={showConfetti} />
      <div className="relative flex flex-col gap-3 p-4">
        {/* Hints - top right */}
        <div className="absolute top-4 right-4">
          <HintPopover hints={question.hints} onHintsUsedChange={setHintsUsed} />
        </div>

        <p className="pr-18 font-mono text-lg">{question.questionText}</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-5">
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your answer"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : Number(value));
                      }}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="sm" disabled={isPending || isFetching}>
              {isPending || isFetching ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
