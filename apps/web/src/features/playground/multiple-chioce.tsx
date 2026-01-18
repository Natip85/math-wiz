"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfettiOverlay, useSessionCompletion } from "@/hooks/use-session-completion";
import { trpc } from "@/utils/trpc-client";

import { HintPopover } from "./hint-popover";
import type { QuestionComponentProps } from "./question-renderer";

export function MultipleChoice({ question, sessionId, isFetching }: QuestionComponentProps) {
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const { showConfetti, completeSession } = useSessionCompletion();

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
        setSelectedOption(null);
        setHintsUsed(0);
      },
    })
  );

  async function handleSelect(option: number) {
    setSelectedOption(option);
    await submitAnswer({
      sessionId,
      questionId: question.id,
      userAnswer: option,
      hintsUsed,
      timeMs: undefined,
    });
  }

  return (
    <>
      <ConfettiOverlay show={showConfetti} />
      <div className="relative p-4">
        {/* Hints - top right */}
        <div className="absolute top-4 right-4">
          <HintPopover hints={question.hints} onHintsUsedChange={setHintsUsed} />
        </div>

        <p className="mb-4 pr-18 text-lg">{question.questionText}</p>
        {question.options && (
          <div className="grid grid-cols-2 gap-2">
            {question.options.map((option, index) => (
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
