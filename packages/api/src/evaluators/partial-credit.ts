import type { EnglishAnswer } from "../schemas/answers";

export interface PartialCreditResult {
  isCorrect: boolean;
  score: number; // 0-100
  feedback?: string;
}

/**
 * Evaluate english text answers with partial credit based on similarity
 */
export function evaluateEnglishTextWithPartialCredit(
  correctAnswer: Extract<EnglishAnswer, { type: "text" }>,
  userAnswer: Extract<EnglishAnswer, { type: "text" }>
): PartialCreditResult {
  const correct = correctAnswer.value.toLowerCase().trim();
  const user = userAnswer.value.toLowerCase().trim();

  // Exact match
  if (correct === user) {
    return {
      isCorrect: true,
      score: 100,
    };
  }

  // Check for common variations (e.g., with/without articles, singular/plural)
  const score = calculatePartialCreditScore(correct, user);

  return {
    isCorrect: score >= 70,
    score,
    feedback:
      score >= 70
        ? "Close enough! Good answer."
        : score >= 40
          ? `Almost! The expected answer was "${correctAnswer.value}"`
          : `The correct answer was "${correctAnswer.value}"`,
  };
}

/**
 * Calculate partial credit score based on string similarity
 */
function calculatePartialCreditScore(correct: string, user: string): number {
  // Levenshtein distance-based scoring
  const distance = levenshteinDistance(correct, user);
  const maxLength = Math.max(correct.length, user.length);

  if (maxLength === 0) return 100;

  const similarity = 1 - distance / maxLength;
  return Math.round(similarity * 100);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Create a matrix
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize base cases
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  // Fill in the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] = 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
      }
    }
  }

  return dp[m]![n]!;
}

/**
 * Evaluate spelling with tolerance for minor typos
 */
export function evaluateSpellingWithTolerance(
  correctWord: string,
  userWord: string,
  toleranceLevel: "strict" | "lenient" = "strict"
): PartialCreditResult {
  const correct = correctWord.toLowerCase().trim();
  const user = userWord.toLowerCase().trim();

  // Exact match
  if (correct === user) {
    return {
      isCorrect: true,
      score: 100,
    };
  }

  const distance = levenshteinDistance(correct, user);

  // For spelling, be more strict
  const maxAllowedDistance = toleranceLevel === "strict" ? 1 : 2;

  if (distance <= maxAllowedDistance) {
    // Minor typo, give partial credit
    const score = 100 - distance * 20;
    return {
      isCorrect: false,
      score: Math.max(score, 0),
      feedback: `Almost! You spelled it "${userWord}" but it should be "${correctWord}"`,
    };
  }

  return {
    isCorrect: false,
    score: 0,
    feedback: `The correct spelling is "${correctWord}"`,
  };
}
