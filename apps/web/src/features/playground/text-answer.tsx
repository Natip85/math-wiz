"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import z from "zod/v4";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ConfettiOverlay } from "@/hooks/use-session-completion";

import { HintPopover } from "./hint-popover";
import { useSubmitAnswer } from "./hooks/use-submit-answer";
import type { QuestionComponentProps } from "./question-renderer";

const answerSchema = z.object({
  answer: z.string().min(1, "Please enter an answer"),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

export function TextAnswer({ question, sessionId, subject, isFetching }: QuestionComponentProps) {
  const t = useTranslations("QuestionUI");
  const [hintsUsed, setHintsUsed] = useState(0);
  const startTimeRef = useRef(0);

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: "",
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
    form.reset();
    form.setFocus("answer");
  }, [question.id, form]);

  async function onSubmit(values: AnswerFormValues) {
    // eslint-disable-next-line react-hooks/purity -- Date.now() is called in form submit handler, not during render
    const timeMs = Date.now() - startTimeRef.current;

    // Determine answer type based on subject and question type
    const answerType = getAnswerType(subject, question.type);

    await submitAnswer({
      answer: { type: answerType, value: values.answer },
      hintsUsed,
      timeMs,
    });
  }

  return (
    <>
      <ConfettiOverlay show={showConfetti} />
      <div className="relative flex flex-col gap-4 p-4">
        {/* Hints - top right */}
        <div className="absolute top-4 right-4">
          <HintPopover hints={question.hints} onHintsUsedChange={setHintsUsed} />
        </div>

        {/* Display question image if available */}
        {question.imageUrl && (
          <div className="my-4 flex justify-center">
            <Image
              src={question.imageUrl}
              alt="Question illustration"
              width={350}
              height={350}
              className="max-w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Question text */}
        <p className="pr-18 text-center text-lg">{question.questionText}</p>

        {/* Text input form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={t("enterAnswer")}
                      className="min-h-24 resize-none"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" disabled={isPending || isFetching} className="w-full">
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

/**
 * Determine the answer type based on subject and question type
 */
function getAnswerType(
  subject: "math" | "science" | "english",
  questionType: string
): "text" | "explanation" {
  // Science experiment questions use "explanation" type
  if (subject === "science" && questionType === "experiment") {
    return "explanation";
  }

  // English sentence_completion uses "text" type
  return "text";
}
