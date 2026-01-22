import type { MathAnswer, ScienceAnswer, EnglishAnswer } from "../schemas/answers";

export interface ExactMatchResult {
  isCorrect: boolean;
  score: number; // 0 or 100
  feedback?: string;
}

/**
 * Evaluate math answers using exact numeric match
 */
export function evaluateMathAnswer(
  correctAnswer: MathAnswer,
  userAnswer: MathAnswer
): ExactMatchResult {
  const isCorrect = correctAnswer.value === userAnswer.value;

  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    feedback: isCorrect ? undefined : `The correct answer was ${correctAnswer.value}`,
  };
}

/**
 * Evaluate science choice answers using exact string match
 */
export function evaluateScienceChoiceAnswer(
  correctAnswer: Extract<ScienceAnswer, { type: "choice" }>,
  userAnswer: Extract<ScienceAnswer, { type: "choice" }>
): ExactMatchResult {
  const isCorrect =
    correctAnswer.value.toLowerCase().trim() === userAnswer.value.toLowerCase().trim();

  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    feedback: isCorrect ? undefined : `The correct answer was ${correctAnswer.value}`,
  };
}

/**
 * Evaluate science boolean answers using exact match
 */
export function evaluateScienceBooleanAnswer(
  correctAnswer: Extract<ScienceAnswer, { type: "boolean" }>,
  userAnswer: Extract<ScienceAnswer, { type: "boolean" }>
): ExactMatchResult {
  const isCorrect = correctAnswer.value === userAnswer.value;

  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    feedback: isCorrect
      ? undefined
      : `The correct answer was ${correctAnswer.value ? "True" : "False"}`,
  };
}

/**
 * Evaluate english choice answers using exact string match
 */
export function evaluateEnglishChoiceAnswer(
  correctAnswer: Extract<EnglishAnswer, { type: "choice" }>,
  userAnswer: Extract<EnglishAnswer, { type: "choice" }>
): ExactMatchResult {
  const isCorrect =
    correctAnswer.value.toLowerCase().trim() === userAnswer.value.toLowerCase().trim();

  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    feedback: isCorrect ? undefined : `The correct answer was "${correctAnswer.value}"`,
  };
}

/**
 * Evaluate english text answers using exact string match (case-insensitive)
 */
export function evaluateEnglishTextAnswer(
  correctAnswer: Extract<EnglishAnswer, { type: "text" }>,
  userAnswer: Extract<EnglishAnswer, { type: "text" }>
): ExactMatchResult {
  const isCorrect =
    correctAnswer.value.toLowerCase().trim() === userAnswer.value.toLowerCase().trim();

  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    feedback: isCorrect ? undefined : `The correct answer was "${correctAnswer.value}"`,
  };
}
