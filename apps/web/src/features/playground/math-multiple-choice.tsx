"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfettiOverlay } from "@/hooks/use-session-completion";

import { HintPopover } from "./hint-popover";
import { useSubmitAnswer } from "./hooks/use-submit-answer";
import type { QuestionComponentProps } from "./question-renderer";

export function MathMultipleChoice({
  question,
  sessionId,
  subject,
  isFetching,
}: QuestionComponentProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
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

    setSelectedOption(null);
  }, [question.id]);

  async function handleSelect(option: number) {
    // eslint-disable-next-line react-hooks/purity -- Date.now() is called in event handler, not during render
    const timeMs = Date.now() - startTimeRef.current;
    setSelectedOption(option);
    await submitAnswer({
      answer: { value: option },
      hintsUsed,
      timeMs,
    });
  }

  // Get options as numbers (for math multiple choice)
  const options = question.options as number[] | null;

  return (
    <>
      <ConfettiOverlay show={showConfetti} />
      <div className="relative p-4">
        {/* Hints - top right */}
        <div className="absolute top-4 right-4">
          <HintPopover hints={question.hints} onHintsUsedChange={setHintsUsed} />
        </div>

        <p className="mb-4 pr-18 text-lg">{question.questionText}</p>
        {options && (
          <div className="grid grid-cols-2 gap-2">
            {options.map((option, index) => (
              <Button
                variant="outline"
                key={index}
                onClick={() => handleSelect(option)}
                disabled={isPending || isFetching}
              >
                {isPending && selectedOption === option && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {option}
              </Button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// Keep the old export name for backward compatibility during transition
export { MathMultipleChoice as MultipleChoice };
