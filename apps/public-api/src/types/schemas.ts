import { z } from "zod";

// ============================================================================
// Param Schemas
// ============================================================================

export const idParamSchema = z.object({
  id: z.string().uuid().describe("Resource ID (UUID format)"),
});

export const userIdParamSchema = z.object({
  userId: z.string().describe("User ID"),
});

// ============================================================================
// Common Schemas
// ============================================================================

export const errorResponseSchema = z.object({
  error: z.string().describe("Error type"),
  message: z.string().describe("Human-readable error message"),
  statusCode: z.number().describe("HTTP status code"),
  details: z.string().optional().describe("Additional error details"),
});

export const paginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number for pagination (starts at 1)"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Number of items per page (max: 100)"),
});

export const paginationResponseSchema = z.object({
  page: z.number().describe("Current page number"),
  limit: z.number().describe("Items per page"),
  total: z.number().describe("Total number of items"),
  totalPages: z.number().describe("Total number of pages"),
});

// ============================================================================
// Auth Schemas
// ============================================================================

export const tokenRequestSchema = z.object({
  client_id: z.string().min(1).describe("Your M2M client ID"),
  client_secret: z.string().min(1).describe("Your M2M client secret"),
  scopes: z
    .array(z.string())
    .optional()
    .describe("Optional: specific scopes to request (defaults to all available)"),
});

export const tokenResponseSchema = z.object({
  access_token: z.string().describe("JWT access token"),
  expires_in: z.number().describe("Token lifetime in seconds"),
  token_type: z.literal("Bearer").describe("Token type (always Bearer)"),
});

// ============================================================================
// Session Schemas
// ============================================================================

export const sessionSummarySchema = z.object({
  id: z.string().uuid().describe("Unique session identifier"),
  subject: z.enum(["math", "science", "english"]).describe("Subject area"),
  topic: z.string().describe("Specific topic within the subject"),
  status: z.enum(["in_progress", "completed", "paused"]).describe("Session status"),
  totalQuestions: z.number().describe("Total questions in session"),
  score: z.number().describe("Current score"),
  startedAt: z.string().describe("ISO 8601 timestamp when the session started"),
  endedAt: z.union([z.string(), z.null()]).describe("ISO 8601 timestamp when the session ended"),
  _links: z.object({
    self: z.string().url().describe("URL to this session"),
    questions: z.string().url().describe("URL to session questions"),
  }),
});

export const sessionDetailSchema = sessionSummarySchema.extend({
  currentQuestionIndex: z.number().describe("Current question index (0-based)"),
  progress: z.object({
    answered: z.number().describe("Number of questions answered"),
    correct: z.number().describe("Number of correct answers"),
    incorrect: z.number().describe("Number of incorrect answers"),
    accuracy: z.number().describe("Accuracy percentage"),
  }),
});

export const listSessionsQuerySchema = paginationQuerySchema.extend({
  userId: z.string().optional().describe("Filter by user ID"),
  subject: z.enum(["math", "science", "english"]).optional().describe("Filter by subject"),
  status: z.enum(["in_progress", "completed", "paused"]).optional().describe("Filter by status"),
});

export const listSessionsResponseSchema = z.object({
  data: z.array(sessionSummarySchema).describe("Array of session summaries"),
  pagination: paginationResponseSchema,
});

// ============================================================================
// Question Schemas
// ============================================================================

export const questionSchema = z.object({
  id: z.string().uuid().describe("Unique question identifier"),
  questionIndex: z.number().describe("Position in session (0-based)"),
  subject: z.enum(["math", "science", "english"]).describe("Subject area"),
  type: z.string().describe("Question type (e.g., word_problem, multiple_choice)"),
  topic: z.string().describe("Topic within subject"),
  difficulty: z.union([z.string(), z.null()]).describe("Difficulty level"),
  questionText: z.string().describe("The question text"),
  options: z
    .object({})
    .passthrough()
    .nullable()
    .describe("Multiple choice options (if applicable)"),
  hints: z.array(z.string()).describe("Available hints"),
});

export const questionWithAnswerSchema = questionSchema.extend({
  isAnswered: z.boolean().describe("Whether the question has been answered"),
  answer: z
    .object({
      userAnswer: z.object({}).passthrough().describe("User's submitted answer"),
      isCorrect: z.union([z.boolean(), z.null()]).describe("Whether the answer was correct"),
      hintsUsed: z.union([z.number(), z.null()]).describe("Number of hints used"),
      timeMs: z.union([z.number(), z.null()]).describe("Time taken in milliseconds"),
    })
    .nullable()
    .describe("Answer details (if answered)"),
});

export const listQuestionsResponseSchema = z.object({
  data: z.array(questionWithAnswerSchema).describe("Array of questions with answers"),
  sessionId: z.string().uuid().describe("Session ID"),
});

// ============================================================================
// Progress Schemas
// ============================================================================

export const skillProgressSchema = z.object({
  subject: z.enum(["math", "science", "english"]).describe("Subject area"),
  topic: z.string().describe("Topic within subject"),
  totalQuestions: z.number().describe("Total questions attempted"),
  correctQuestions: z.number().describe("Number of correct answers"),
  accuracy: z.number().describe("Accuracy percentage"),
  avgHintsUsed: z.number().describe("Average hints used per question"),
});

export const userProgressResponseSchema = z.object({
  userId: z.string().describe("User ID"),
  totalScore: z.number().describe("User's total score"),
  skills: z.array(skillProgressSchema).describe("Array of skill progress by topic"),
  _links: z.object({
    self: z.string().url().describe("URL to this resource"),
    sessions: z.string().url().describe("URL to user sessions"),
  }),
});

// ============================================================================
// Leaderboard Schemas
// ============================================================================

export const leaderboardEntrySchema = z.object({
  rank: z.number().describe("Position on leaderboard"),
  userId: z.string().describe("User ID"),
  name: z.string().describe("User's display name"),
  totalScore: z.number().describe("User's total score"),
});

export const leaderboardResponseSchema = z.object({
  data: z.array(leaderboardEntrySchema).describe("Array of leaderboard entries"),
  generatedAt: z.string().describe("ISO 8601 timestamp when the leaderboard was generated"),
});

// ============================================================================
// Health Check Schemas
// ============================================================================

export const healthResponseSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]).describe("Overall health status"),
  version: z.string().describe("API version"),
  timestamp: z.string().describe("ISO 8601 timestamp of current server time"),
  checks: z.object({
    database: z.enum(["healthy", "unhealthy"]).describe("Database connection status"),
  }),
});

// ============================================================================
// Common Response Definitions
// ============================================================================

export const commonErrorResponses = {
  401: errorResponseSchema,
  403: errorResponseSchema,
  500: errorResponseSchema,
};

export const listSessionsResponses = {
  200: listSessionsResponseSchema,
  ...commonErrorResponses,
};

export const getSessionResponses = {
  200: sessionDetailSchema,
  404: errorResponseSchema,
  ...commonErrorResponses,
};

export const getQuestionsResponses = {
  200: listQuestionsResponseSchema,
  404: errorResponseSchema,
  ...commonErrorResponses,
};

export const getUserProgressResponses = {
  200: userProgressResponseSchema,
  404: errorResponseSchema,
  ...commonErrorResponses,
};

export const getLeaderboardResponses = {
  200: leaderboardResponseSchema,
  ...commonErrorResponses,
};

// ============================================================================
// Type Exports
// ============================================================================

export type TokenRequest = z.infer<typeof tokenRequestSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type SessionSummary = z.infer<typeof sessionSummarySchema>;
export type SessionDetail = z.infer<typeof sessionDetailSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuestionWithAnswer = z.infer<typeof questionWithAnswerSchema>;
export type SkillProgress = z.infer<typeof skillProgressSchema>;
export type UserProgressResponse = z.infer<typeof userProgressResponseSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
