"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc-client";

import { useSessionCompletion } from "@/hooks/use-session-completion";

export type Subject = "math" | "science" | "english";

// Answer types for each subject
export type MathAnswerValue = { value: number };
export type ScienceAnswerValue =
  | { type: "boolean"; value: boolean }
  | { type: "choice"; value: string }
  | { type: "explanation"; value: string };
export type EnglishAnswerValue =
  | { type: "text"; value: string }
  | { type: "choice"; value: string };

export type AnswerValue = MathAnswerValue | ScienceAnswerValue | EnglishAnswerValue;

// Full answer input format for the API
export type AnswerInput =
  | { subject: "math"; answer: MathAnswerValue }
  | { subject: "science"; answer: ScienceAnswerValue }
  | { subject: "english"; answer: EnglishAnswerValue };

export interface UseSubmitAnswerOptions {
  sessionId: string;
  questionId: string;
  subject: Subject;
  onAnswerSubmitted?: () => void;
}

export interface SubmitAnswerParams {
  answer: AnswerValue;
  hintsUsed: number;
  timeMs: number;
}

/**
 * Hook to handle answer submission with proper formatting per subject
 */
export function useSubmitAnswer({
  sessionId,
  questionId,
  subject,
  onAnswerSubmitted,
}: UseSubmitAnswerOptions) {
  const queryClient = useQueryClient();
  const { showConfetti, completeSession } = useSessionCompletion();

  const mutation = useMutation(
    trpc.playground.submitAnswer.mutationOptions({
      onSuccess: (data) => {
        if (data.isCorrect) {
          toast.success("Correct! Great job!");
        } else {
          // Format the correct answer display based on subject
          const correctAnswerDisplay = formatCorrectAnswer(data.correctAnswer, subject);
          toast.error(`Not quite! The correct answer was ${correctAnswerDisplay}`);
        }

        if (data.isSessionComplete) {
          completeSession();
          return;
        }

        // Invalidate to refetch the next question
        void queryClient.invalidateQueries(trpc.playground.getById.queryFilter(sessionId));
        onAnswerSubmitted?.();
      },
    })
  );

  const submitAnswer = async ({ answer, hintsUsed, timeMs }: SubmitAnswerParams) => {
    // Format the answer input based on subject
    const formattedAnswer = formatAnswerInput(subject, answer);

    await mutation.mutateAsync({
      sessionId,
      questionId,
      answer: formattedAnswer,
      hintsUsed,
      timeMs,
    });
  };

  return {
    submitAnswer,
    isPending: mutation.isPending,
    showConfetti,
  };
}

/**
 * Format the answer input for the API based on subject
 */
function formatAnswerInput(subject: Subject, answer: AnswerValue): AnswerInput {
  switch (subject) {
    case "math":
      return { subject: "math", answer: answer as MathAnswerValue };
    case "science":
      return { subject: "science", answer: answer as ScienceAnswerValue };
    case "english":
      return { subject: "english", answer: answer as EnglishAnswerValue };
  }
}

/**
 * Format the correct answer for display in error messages
 */
function formatCorrectAnswer(correctAnswer: unknown, subject: Subject): string {
  if (!correctAnswer || typeof correctAnswer !== "object") {
    return String(correctAnswer);
  }

  const answer = correctAnswer as Record<string, unknown>;

  switch (subject) {
    case "math":
      return String(answer.value ?? correctAnswer);

    case "science":
      if (answer.type === "boolean") {
        return answer.value ? "True" : "False";
      }
      if (answer.type === "choice") {
        return String(answer.value);
      }
      if (answer.type === "explanation") {
        // Truncate long explanations
        const explanation = String(answer.value);
        return explanation.length > 50 ? explanation.slice(0, 50) + "..." : explanation;
      }
      return String(answer.value ?? correctAnswer);

    case "english":
      if (answer.type === "text" || answer.type === "choice") {
        return `"${answer.value}"`;
      }
      return String(answer.value ?? correctAnswer);

    default:
      return String(correctAnswer);
  }
}
