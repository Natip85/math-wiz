import { generateObject, zodSchema } from "ai";
import { z } from "zod";

import type { ScienceAnswer, EnglishAnswer } from "../schemas/answers";

export interface AIRubricResult {
  isCorrect: boolean;
  score: number; // 0-100
  feedback: string;
}

const evaluationResultSchema = z.object({
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string(),
});

/**
 * Evaluate science explanation answers using AI
 */
export async function evaluateScienceExplanation(
  questionText: string,
  correctAnswer: Extract<ScienceAnswer, { type: "explanation" }>,
  userAnswer: Extract<ScienceAnswer, { type: "explanation" }>
): Promise<AIRubricResult> {
  const keywords = correctAnswer.keywords?.join(", ") || "";

  const prompt = `You are evaluating a 9-year-old's science answer. Be encouraging but accurate.

Question: ${questionText}

Expected Answer: ${correctAnswer.value}
${keywords ? `Key concepts to look for: ${keywords}` : ""}

Student's Answer: ${userAnswer.value}

Evaluate the student's answer:
1. Is it scientifically correct (or mostly correct)?
2. Does it demonstrate understanding of the concept?
3. Give a score from 0-100:
   - 0-20: Completely wrong or off-topic
   - 21-50: Partially correct, shows some understanding
   - 51-80: Mostly correct, minor errors or missing details
   - 81-100: Correct and shows good understanding

Provide encouraging feedback appropriate for a 9-year-old.
If the answer is wrong, explain the correct answer in simple terms.`;

  try {
    const result = await generateObject({
      model: "anthropic/claude-sonnet-4-20250514",
      schema: zodSchema(evaluationResultSchema),
      prompt,
    });

    return {
      isCorrect: result.object.score >= 70,
      score: result.object.score,
      feedback: result.object.feedback,
    };
  } catch (error) {
    console.error("AI evaluation failed:", error);
    // Fallback to keyword matching
    return evaluateScienceExplanationFallback(correctAnswer, userAnswer);
  }
}

/**
 * Fallback evaluation using keyword matching
 */
function evaluateScienceExplanationFallback(
  correctAnswer: Extract<ScienceAnswer, { type: "explanation" }>,
  userAnswer: Extract<ScienceAnswer, { type: "explanation" }>
): AIRubricResult {
  const keywords = correctAnswer.keywords || [];
  const userAnswerLower = userAnswer.value.toLowerCase();

  if (keywords.length === 0) {
    // No keywords, do simple similarity check
    const correctLower = correctAnswer.value.toLowerCase();
    const similarity = calculateSimilarity(correctLower, userAnswerLower);

    return {
      isCorrect: similarity >= 0.7,
      score: Math.round(similarity * 100),
      feedback:
        similarity >= 0.7
          ? "Good job! Your answer shows understanding."
          : "Your answer could be improved. Review the concept and try again!",
    };
  }

  // Count matching keywords
  const matchingKeywords = keywords.filter((keyword) =>
    userAnswerLower.includes(keyword.toLowerCase())
  );

  const score = Math.round((matchingKeywords.length / keywords.length) * 100);
  const isCorrect = score >= 70;

  return {
    isCorrect,
    score,
    feedback: isCorrect
      ? "Great answer! You included the key concepts."
      : `Try to include more key concepts like: ${keywords.slice(0, 3).join(", ")}`,
  };
}

/**
 * Evaluate english correction answers using AI
 */
export async function evaluateEnglishCorrection(
  questionText: string,
  correctAnswer: Extract<EnglishAnswer, { type: "correction" }>,
  userAnswer: Extract<EnglishAnswer, { type: "correction" }>
): Promise<AIRubricResult> {
  const prompt = `You are evaluating a 9-year-old's grammar/spelling correction. Be encouraging but accurate.

Question: ${questionText}

Original sentence: ${correctAnswer.original}
Expected correction: ${correctAnswer.corrected}
Student's correction: ${userAnswer.corrected}

Evaluate the student's correction:
1. Did they identify and fix the error(s)?
2. Is the corrected sentence grammatically correct?
3. Give a score from 0-100:
   - 0-20: No meaningful correction made
   - 21-50: Partially corrected, some errors remain
   - 51-80: Mostly corrected, minor issues
   - 81-100: Correctly fixed the error(s)

Provide encouraging feedback appropriate for a 9-year-old.
If there are still errors, point them out gently.`;

  try {
    const result = await generateObject({
      model: "anthropic/claude-sonnet-4-20250514",
      schema: zodSchema(evaluationResultSchema),
      prompt,
    });

    return {
      isCorrect: result.object.score >= 70,
      score: result.object.score,
      feedback: result.object.feedback,
    };
  } catch (error) {
    console.error("AI evaluation failed:", error);
    // Fallback to exact match
    const isCorrect =
      correctAnswer.corrected.toLowerCase().trim() === userAnswer.corrected.toLowerCase().trim();

    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect
        ? "Perfect correction!"
        : `The correct sentence is: "${correctAnswer.corrected}"`,
    };
  }
}

/**
 * Simple string similarity calculation (Jaccard similarity on words)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/).filter((w) => w.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter((w) => w.length > 2));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}
