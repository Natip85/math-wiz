import { z } from "zod";

// ============================================================================
// Math Answers
// ============================================================================

// Math answers are numeric values
export const mathAnswerSchema = z.object({
  value: z.number(),
});

export type MathAnswer = z.infer<typeof mathAnswerSchema>;

// ============================================================================
// Science Answers
// ============================================================================

// Science answers can be multiple choice, explanation, or boolean
export const scienceChoiceAnswerSchema = z.object({
  type: z.literal("choice"),
  value: z.string(), // The actual option text (e.g., "Photosynthesis", "Solid", etc.)
});

export const scienceExplanationAnswerSchema = z.object({
  type: z.literal("explanation"),
  value: z.string(),
  keywords: z.array(z.string()).optional(),
});

export const scienceBooleanAnswerSchema = z.object({
  type: z.literal("boolean"),
  value: z.boolean(),
});

export const scienceAnswerSchema = z.discriminatedUnion("type", [
  scienceChoiceAnswerSchema,
  scienceExplanationAnswerSchema,
  scienceBooleanAnswerSchema,
]);

export type ScienceAnswer = z.infer<typeof scienceAnswerSchema>;

// ============================================================================
// English Answers
// ============================================================================

// English answers can be text, choice, or correction
export const englishTextAnswerSchema = z.object({
  type: z.literal("text"),
  value: z.string(),
});

export const englishChoiceAnswerSchema = z.object({
  type: z.literal("choice"),
  value: z.string(),
});

export const englishCorrectionAnswerSchema = z.object({
  type: z.literal("correction"),
  original: z.string(),
  corrected: z.string(),
});

export const englishAnswerSchema = z.discriminatedUnion("type", [
  englishTextAnswerSchema,
  englishChoiceAnswerSchema,
  englishCorrectionAnswerSchema,
]);

export type EnglishAnswer = z.infer<typeof englishAnswerSchema>;

// ============================================================================
// Combined Answer Schema (Discriminated by Subject)
// ============================================================================

export const mathAnswerInputSchema = z.object({
  subject: z.literal("math"),
  answer: mathAnswerSchema,
});

export const scienceAnswerInputSchema = z.object({
  subject: z.literal("science"),
  answer: scienceAnswerSchema,
});

export const englishAnswerInputSchema = z.object({
  subject: z.literal("english"),
  answer: englishAnswerSchema,
});

export const answerInputSchema = z.discriminatedUnion("subject", [
  mathAnswerInputSchema,
  scienceAnswerInputSchema,
  englishAnswerInputSchema,
]);

export type AnswerInput = z.infer<typeof answerInputSchema>;

// ============================================================================
// Helper to get the raw answer value for storage
// ============================================================================

export function getAnswerForStorage(
  input: AnswerInput
): MathAnswer | ScienceAnswer | EnglishAnswer {
  return input.answer;
}

// ============================================================================
// Helper to validate answer type matches subject
// ============================================================================

export function validateAnswerForSubject(
  subject: "math" | "science" | "english",
  answer: unknown
): boolean {
  switch (subject) {
    case "math":
      return mathAnswerSchema.safeParse(answer).success;
    case "science":
      return scienceAnswerSchema.safeParse(answer).success;
    case "english":
      return englishAnswerSchema.safeParse(answer).success;
    default:
      return false;
  }
}
