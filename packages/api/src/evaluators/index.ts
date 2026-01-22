import type { EvaluationStrategy, Subject } from "@math-wiz/db/schema/learning";

import type { MathAnswer, ScienceAnswer, EnglishAnswer } from "../schemas/answers";
import {
  evaluateMathAnswer,
  evaluateScienceChoiceAnswer,
  evaluateScienceBooleanAnswer,
  evaluateEnglishChoiceAnswer,
  evaluateEnglishTextAnswer,
} from "./exact-match";
import { evaluateScienceExplanation, evaluateEnglishCorrection } from "./ai-rubric";
import { evaluateEnglishTextWithPartialCredit } from "./partial-credit";

// ============================================================================
// Types
// ============================================================================

export interface EvaluationResult {
  isCorrect: boolean;
  score: number; // 0-100
  feedback?: string;
}

export type AnswerType = MathAnswer | ScienceAnswer | EnglishAnswer;

export interface EvaluateAnswerParams {
  strategy: EvaluationStrategy;
  subject: Subject;
  questionText: string;
  correctAnswer: AnswerType;
  userAnswer: AnswerType;
}

// ============================================================================
// Main Evaluator Function
// ============================================================================

/**
 * Evaluate an answer based on subject and evaluation strategy
 */
export async function evaluateAnswer(params: EvaluateAnswerParams): Promise<EvaluationResult> {
  const { strategy, subject, questionText, correctAnswer, userAnswer } = params;

  switch (subject) {
    case "math":
      return evaluateMathSubject(correctAnswer as MathAnswer, userAnswer as MathAnswer);

    case "science":
      return evaluateScienceSubject(
        strategy,
        questionText,
        correctAnswer as ScienceAnswer,
        userAnswer as ScienceAnswer
      );

    case "english":
      return evaluateEnglishSubject(
        strategy,
        questionText,
        correctAnswer as EnglishAnswer,
        userAnswer as EnglishAnswer
      );

    default:
      throw new Error(`Unknown subject: ${subject}`);
  }
}

// ============================================================================
// Subject-Specific Evaluators
// ============================================================================

/**
 * Evaluate math answers - always exact match
 */
function evaluateMathSubject(correctAnswer: MathAnswer, userAnswer: MathAnswer): EvaluationResult {
  return evaluateMathAnswer(correctAnswer, userAnswer);
}

/**
 * Evaluate science answers based on answer type
 */
async function evaluateScienceSubject(
  strategy: EvaluationStrategy,
  questionText: string,
  correctAnswer: ScienceAnswer,
  userAnswer: ScienceAnswer
): Promise<EvaluationResult> {
  // Ensure both answers have the same type
  if (correctAnswer.type !== userAnswer.type) {
    return {
      isCorrect: false,
      score: 0,
      feedback: "Answer type mismatch",
    };
  }

  switch (correctAnswer.type) {
    case "choice":
      return evaluateScienceChoiceAnswer(
        correctAnswer as Extract<ScienceAnswer, { type: "choice" }>,
        userAnswer as Extract<ScienceAnswer, { type: "choice" }>
      );

    case "boolean":
      return evaluateScienceBooleanAnswer(
        correctAnswer as Extract<ScienceAnswer, { type: "boolean" }>,
        userAnswer as Extract<ScienceAnswer, { type: "boolean" }>
      );

    case "explanation":
      if (strategy === "ai_rubric") {
        return evaluateScienceExplanation(
          questionText,
          correctAnswer as Extract<ScienceAnswer, { type: "explanation" }>,
          userAnswer as Extract<ScienceAnswer, { type: "explanation" }>
        );
      }
      // Fallback to keyword matching
      return evaluateScienceExplanation(
        questionText,
        correctAnswer as Extract<ScienceAnswer, { type: "explanation" }>,
        userAnswer as Extract<ScienceAnswer, { type: "explanation" }>
      );

    default:
      return {
        isCorrect: false,
        score: 0,
        feedback: "Unknown answer type",
      };
  }
}

/**
 * Evaluate english answers based on answer type and strategy
 */
async function evaluateEnglishSubject(
  strategy: EvaluationStrategy,
  questionText: string,
  correctAnswer: EnglishAnswer,
  userAnswer: EnglishAnswer
): Promise<EvaluationResult> {
  // Ensure both answers have the same type
  if (correctAnswer.type !== userAnswer.type) {
    return {
      isCorrect: false,
      score: 0,
      feedback: "Answer type mismatch",
    };
  }

  switch (correctAnswer.type) {
    case "choice":
      return evaluateEnglishChoiceAnswer(
        correctAnswer as Extract<EnglishAnswer, { type: "choice" }>,
        userAnswer as Extract<EnglishAnswer, { type: "choice" }>
      );

    case "text":
      if (strategy === "partial_credit") {
        return evaluateEnglishTextWithPartialCredit(
          correctAnswer as Extract<EnglishAnswer, { type: "text" }>,
          userAnswer as Extract<EnglishAnswer, { type: "text" }>
        );
      }
      return evaluateEnglishTextAnswer(
        correctAnswer as Extract<EnglishAnswer, { type: "text" }>,
        userAnswer as Extract<EnglishAnswer, { type: "text" }>
      );

    case "correction":
      if (strategy === "ai_rubric") {
        return evaluateEnglishCorrection(
          questionText,
          correctAnswer as Extract<EnglishAnswer, { type: "correction" }>,
          userAnswer as Extract<EnglishAnswer, { type: "correction" }>
        );
      }
      // Fallback to AI rubric for corrections
      return evaluateEnglishCorrection(
        questionText,
        correctAnswer as Extract<EnglishAnswer, { type: "correction" }>,
        userAnswer as Extract<EnglishAnswer, { type: "correction" }>
      );

    default:
      return {
        isCorrect: false,
        score: 0,
        feedback: "Unknown answer type",
      };
  }
}

// Re-export individual evaluators for direct use
export * from "./exact-match";
export * from "./ai-rubric";
export * from "./partial-credit";
