"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { ConfettiOverlay } from "@/hooks/use-session-completion";

import { HintPopover } from "./hint-popover";
import { useSubmitAnswer } from "./hooks/use-submit-answer";
import type { QuestionComponentProps } from "./question-renderer";

export function ChoiceQuestion({
  question,
  sessionId,
  subject,
  isFetching,
}: QuestionComponentProps) {
  const t = useTranslations("QuestionUI");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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

  async function handleSelect(option: string) {
    const timeMs = Date.now() - startTimeRef.current;
    setSelectedOption(option);
    await submitAnswer({
      answer: { type: "choice", value: option },
      hintsUsed,
      timeMs,
    });
  }

  // Get options as strings (they may come as strings or numbers from the API)
  const options = question.options as (string | number)[] | null;

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
        <p className="mb-4 pr-18 text-lg">{question.questionText}</p>

        {/* Options grid */}
        {options && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.map((option, index) => {
              const optionStr = String(option);
              const optionLabel = getOptionLabel(index);

              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto min-h-12 justify-start px-4 py-3 text-left whitespace-normal"
                  onClick={() => handleSelect(optionStr)}
                  disabled={isPending || isFetching}
                >
                  {isPending && selectedOption === optionStr && (
                    <Loader2 className="mr-2 size-4 flex-shrink-0 animate-spin" />
                  )}
                  <span className="text-primary mr-2 font-bold">{optionLabel}.</span>
                  <span>{optionStr}</span>
                </Button>
              );
            })}
          </div>
        )}

        {!options && <p className="text-muted-foreground text-center">{t("noOptions")}</p>}
      </div>
    </>
  );
}

/**
 * Get option label (A, B, C, D) based on index
 */
function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index); // A, B, C, D, ...
}
