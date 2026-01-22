import type { Subject } from "@math-wiz/db/schema/learning";

import { getMathPrompt } from "./math";
import type { MathPromptParams } from "./math";
import { getSciencePrompt } from "./science";
import type { SciencePromptParams } from "./science";
import { getEnglishPrompt } from "./english";
import type { EnglishPromptParams } from "./english";

export type PromptParams = {
  subject: Subject;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  locale: string;
  // Math-specific options
  maxNumber?: number;
};

/**
 * Get the AI prompt for generating questions based on subject
 */
export function getPromptForSubject(params: PromptParams): string {
  const { subject, topic, difficulty, questionCount, locale, maxNumber } = params;

  switch (subject) {
    case "math":
      return getMathPrompt({
        topic: topic as MathPromptParams["topic"],
        difficulty,
        questionCount,
        maxNumber: maxNumber ?? 100,
        locale,
      });

    case "science":
      return getSciencePrompt({
        topic: topic as SciencePromptParams["topic"],
        difficulty,
        questionCount,
        locale,
      });

    case "english":
      return getEnglishPrompt({
        topic: topic as EnglishPromptParams["topic"],
        difficulty,
        questionCount,
        locale,
      });

    default:
      throw new Error(`Unknown subject: ${subject}`);
  }
}

// Re-export individual prompt functions for direct use
export { getMathPrompt, type MathPromptParams } from "./math";
export { getSciencePrompt, type SciencePromptParams } from "./science";
export { getEnglishPrompt, type EnglishPromptParams } from "./english";
