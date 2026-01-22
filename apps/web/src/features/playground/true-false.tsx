"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfettiOverlay } from "@/hooks/use-session-completion";

import { HintPopover } from "./hint-popover";
import { useSubmitAnswer } from "./hooks/use-submit-answer";
import type { QuestionComponentProps } from "./question-renderer";

export function TrueFalse({ question, sessionId, subject, isFetching }: QuestionComponentProps) {
  const t = useTranslations("QuestionUI");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [selectedOption, setSelectedOption] = useState<boolean | null>(null);
  const startTimeRef = useRef(0);

  const { submitAnswer, isPending, showConfetti } = useSubmitAnswer({
    sessionId,
    questionId: question.id,
    subject,
    onAnswerSubmitted: () => {
      setSelectedOption(null);
      setHintsUsed(0);
    },
  });

  // Reset timer and selection when question changes
  useEffect(() => {
    startTimeRef.current = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Resetting selection on question change is intentional
    setSelectedOption(null);
  }, [question.id]);

  async function handleSelect(value: boolean) {
    const timeMs = Date.now() - startTimeRef.current;
    setSelectedOption(value);
    await submitAnswer({
      answer: { type: "boolean", value },
      hintsUsed,
      timeMs,
    });
  }

  return (
    <>
      <ConfettiOverlay show={showConfetti} />
      <div className="relative flex flex-col gap-6 p-4">
        {/* Hints - top right */}
        <div className="absolute top-4 right-4">
          <HintPopover hints={question.hints} onHintsUsedChange={setHintsUsed} />
        </div>

        {/* Question text */}
        <p className="pr-18 text-center text-lg">{question.questionText}</p>

        {/* True/False buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex min-w-32 items-center gap-2 px-8 py-6"
            onClick={() => handleSelect(true)}
            disabled={isPending || isFetching}
          >
            {isPending && selectedOption === true ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Check className="size-5 text-green-500" />
            )}
            <span className="text-lg font-medium">{t("true")}</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="flex min-w-32 items-center gap-2 px-8 py-6"
            onClick={() => handleSelect(false)}
            disabled={isPending || isFetching}
          >
            {isPending && selectedOption === false ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <X className="size-5 text-red-500" />
            )}
            <span className="text-lg font-medium">{t("false")}</span>
          </Button>
        </div>
      </div>
    </>
  );
}
