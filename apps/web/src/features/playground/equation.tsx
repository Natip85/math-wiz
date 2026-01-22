"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import z from "zod/v4";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ConfettiOverlay } from "@/hooks/use-session-completion";

import { HintPopover } from "./hint-popover";
import { useSubmitAnswer } from "./hooks/use-submit-answer";
import type { QuestionComponentProps } from "./question-renderer";

const answerSchema = z.object({
  answer: z.number({ error: "Please enter a number" }),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

export function Equation({ question, sessionId, subject, isFetching }: QuestionComponentProps) {
  const t = useTranslations("QuestionUI");
  const [hintsUsed, setHintsUsed] = useState(0);
  const startTimeRef = useRef(0);

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: undefined,
    },
  });

  const { submitAnswer, isPending, showConfetti } = useSubmitAnswer({
    sessionId,
    questionId: question.id,
    subject,
    onAnswerSubmitted: () => {
      form.reset();
      setHintsUsed(0);
    },
  });

  // Reset timer and focus input when question changes
  useEffect(() => {
    startTimeRef.current = Date.now();
    form.setFocus("answer");
  }, [question.id, form]);

  async function onSubmit(values: AnswerFormValues) {
    // eslint-disable-next-line react-hooks/purity -- Date.now() is called in form submit handler, not during render
    const timeMs = Date.now() - startTimeRef.current;
    await submitAnswer({
      answer: { value: values.answer },
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
                      placeholder={t("enterNumber")}
                      autoFocus
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
                  {t("checking")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
