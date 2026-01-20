import { generateObject, generateText, zodSchema } from "ai";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@math-wiz/db";
import {
  answers as answersTable,
  learningSessions,
  questions as questionsTable,
  questionType,
  userScore,
} from "@math-wiz/db/schema/learning";

import { protectedProcedure, router } from "../index";

async function generateImageFromDescription(visualDescription: string): Promise<string | null> {
  try {
    const prompt = `Create a simple, colorful, child-friendly educational illustration for a 9-year-old math student.

The illustration should show: ${visualDescription}

Requirements:
- Use bright, appealing colors
- Simple and clear shapes
- No text or numbers in the image
- Cartoon/illustration style appropriate for children
- Objects should be clearly countable
- White or light background`;

    const result = await generateText({
      model: "google/gemini-2.5-flash-image",
      prompt,
    });

    // Get the first image and return as data URL
    const file = result.files?.[0];
    if (file?.uint8Array) {
      const base64 = Buffer.from(file.uint8Array).toString("base64");
      const mediaType = file.mediaType || "image/png";
      return `data:${mediaType};base64,${base64}`;
    }

    return null;
  } catch (error) {
    console.error("Failed to generate image:", error);
    return null;
  }
}

// Scoring helper functions
function calculateQuestionScore({
  isCorrect,
  hintsUsed,
  difficulty,
}: {
  isCorrect: boolean;
  hintsUsed: number;
  difficulty: string | null;
}): number {
  if (!isCorrect) return 0;

  // Base points by difficulty
  const basePoints: Record<string, number> = {
    easy: 10,
    medium: 20,
    hard: 30,
  };

  let score = basePoints[difficulty ?? "easy"] ?? 10;

  // Hint penalty: -2 points per hint used (max 4 hints)
  score -= hintsUsed * 2;

  return Math.max(score, 1); // Minimum 1 point for correct answer
}

function getAccuracyMultiplier(accuracy: number): number {
  if (accuracy >= 90) return 1.5;
  if (accuracy >= 70) return 1.2;
  if (accuracy >= 50) return 1.0;
  return 0.8;
}

const questionSchema = z.object({
  questions: z.array(
    z.object({
      type: z.enum(questionType),
      questionText: z.string(),
      correctAnswer: z.number(),
      // For multiple choice questions - 4 options where one is correct
      options: z.array(z.number()).length(4).nullable(),
      hints: z.tuple([z.string(), z.string(), z.string(), z.string()]),
      visualDescription: z.string().nullable(),
    })
  ),
});

export type QuestionType = (typeof questionType)[number];
export type Question = z.infer<typeof questionSchema>["questions"][number];
export type PlaygroundQuestions = z.infer<typeof questionSchema>["questions"];

const createPlaygroundRunInput = z.object({
  topic: z.enum(["addition", "subtraction", "multiplication", "division"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionCount: z.number().min(1).max(10),
  maxNumber: z.number().min(10).max(1000),
  locale: z.string().default("en"),
});

export type CreatePlaygroundRunInput = z.infer<typeof createPlaygroundRunInput>;

const submitAnswerInput = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  userAnswer: z.number(),
  hintsUsed: z.number().min(0).max(4).default(0),
  timeMs: z.number().min(0).optional(),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerInput>;

export const playgroundRouter = router({
  hasCompletedSessions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const completedSession = await db.query.learningSessions.findFirst({
      where: and(eq(learningSessions.userId, userId), eq(learningSessions.mode, "playground")),
      columns: { id: true, endedAt: true },
    });

    // Return true if there's at least one session that has ended
    return completedSession?.endedAt !== null && completedSession?.endedAt !== undefined;
  }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all completed sessions with their questions and answers
    const sessions = await db.query.learningSessions.findMany({
      where: and(eq(learningSessions.userId, userId), eq(learningSessions.mode, "playground")),
      orderBy: (sessions, { desc }) => [desc(sessions.startedAt)],
      with: {
        questions: {
          orderBy: (questions, { asc }) => [asc(questions.questionIndex)],
        },
        answers: true,
      },
    });

    // Transform data for the client
    return sessions.map((session) => {
      // Create a map of answers by questionId
      const answersByQuestionId = new Map(
        session.answers.map((answer) => [answer.questionId, answer])
      );

      const questionsWithAnswers = session.questions.map((question) => {
        const answer = answersByQuestionId.get(question.id);
        return {
          id: question.id,
          questionIndex: question.questionIndex,
          type: question.type,
          questionText: question.questionText,
          correctAnswer: question.correctAnswer,
          userAnswer: answer?.userAnswer ?? null,
          isCorrect: answer?.isCorrect ?? null,
          hintsUsed: answer?.hintsUsed ?? 0,
          timeMs: answer?.timeMs ?? null,
        };
      });

      const totalAnswered = session.answers.length;
      const correctCount = session.answers.filter((a) => a.isCorrect).length;

      // Derive effective status: if endedAt is set, it's completed (handles legacy data)
      const effectiveStatus = session.endedAt ? "completed" : session.status;

      return {
        id: session.id,
        topic: session.topic,
        status: effectiveStatus,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        totalQuestions: session.totalQuestions ?? session.questions.length,
        score: session.score ?? 0,
        questions: questionsWithAnswers,
        stats: {
          totalAnswered,
          correctCount,
          incorrectCount: totalAnswered - correctCount,
          accuracy: totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0,
        },
      };
    });
  }),

  getActiveSession: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const activeSession = await db.query.learningSessions.findFirst({
      where: and(
        eq(learningSessions.userId, userId),
        eq(learningSessions.mode, "playground"),
        eq(learningSessions.status, "in_progress")
      ),
      orderBy: (sessions, { desc }) => [desc(sessions.startedAt)],
    });

    if (
      activeSession &&
      !activeSession.endedAt &&
      (activeSession.currentQuestionIndex ?? 0) < (activeSession.totalQuestions ?? 0)
    ) {
      return { sessionId: activeSession.id };
    }

    return null;
  }),

  getPausedSessions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const pausedSessions = await db.query.learningSessions.findMany({
      where: and(
        eq(learningSessions.userId, userId),
        eq(learningSessions.mode, "playground"),
        eq(learningSessions.status, "paused")
      ),
      orderBy: (sessions, { desc }) => [desc(sessions.startedAt)],
      with: {
        answers: true,
      },
    });

    return pausedSessions.map((session) => ({
      id: session.id,
      topic: session.topic,
      startedAt: session.startedAt,
      totalQuestions: session.totalQuestions ?? 0,
      currentQuestionIndex: session.currentQuestionIndex ?? 0,
      answeredCount: session.answers.length,
      correctCount: session.answers.filter((a) => a.isCorrect).length,
    }));
  }),

  createPlaygroundRun: protectedProcedure
    .input(createPlaygroundRunInput)
    .mutation(async ({ input, ctx }) => {
      const { topic, difficulty, questionCount, maxNumber, locale } = input;
      const userId = ctx.session.user.id;

      // Check if there's already an active session - if so, return it instead of creating a new one
      const existingActiveSession = await db.query.learningSessions.findFirst({
        where: and(
          eq(learningSessions.userId, userId),
          eq(learningSessions.mode, "playground"),
          eq(learningSessions.status, "in_progress")
        ),
      });

      if (existingActiveSession) {
        // Return existing session instead of creating a duplicate
        return { sessionId: existingActiveSession.id };
      }

      // Distribute questions across types (roughly equal, with remainder going to word problems)
      const equationCount = Math.floor(questionCount / 3);
      const multipleChoiceCount = Math.floor(questionCount / 3);
      const wordProblemCount = questionCount - equationCount - multipleChoiceCount;

      // Language-specific instructions
      const languageInstructions =
        locale === "he"
          ? `
**CRITICAL: Generate ALL text content in Hebrew (עברית).**
- All questionText must be in Hebrew
- All hints must be in Hebrew
- Use Hebrew names for children (e.g., דני, מאיה, יוסי, נועה)
- Keep visual descriptions in English (for image generation)
- Use natural, child-friendly Hebrew appropriate for a 9-year-old`
          : `
**Generate ALL text content in English.**
- Use English names for children (e.g., Emma, Jack, Sophie, Tom)
- Keep language simple and clear for a 9-year-old`;

      const prompt = `You are generating a set of ${questionCount} math questions for a 9-year-old child for a **playground app**.

${languageInstructions}

Requirements:
- Topic: ${topic} (e.g., addition, subtraction, multiplication, division)
- Difficulty: ${difficulty} (easy, medium, hard)
- Number of questions: ${questionCount}
- The numbers used should not exceed ${maxNumber}

**Question Type Distribution (mix it up, don't group by type):**
1. ${wordProblemCount} "word_problem" questions - Fun story problems (e.g., "Emma has 5 stickers. Her friend gives her 3 more. How many stickers does Emma have now?")
   - Set options to null
   - ALL word problems MUST have a visualDescription for drag-and-drop interaction

2. ${equationCount} "equation" questions - Simple math equations (e.g., "What is 7 + 4?", "Calculate: 12 - 5 = ?")
   - Set options to null
   - Set visualDescription to null

3. ${multipleChoiceCount} "multiple_choice" questions - Questions with 4 answer options to choose from
   - Provide exactly 4 number options in the options array
   - One option MUST be the correctAnswer
   - Other options should be plausible wrong answers (close to correct answer)
   - Set visualDescription to null

**For ALL questions:**
- Each question must include 4 hints in this exact order:
  1. Thinking hint (encourages strategy)
  2. Visual hint (imagine or draw)
  3. Step hint (break it down)
  4. Full explanation
- Output should be **fun and age-appropriate**
- Make the questions engaging and encourage learning
- Keep language simple and clear for a 9-year-old

**For word problems with visuals:**
- Visual descriptions should be detailed enough to create an illustration (ALWAYS in English)
- Example: "5 red apples on the left and 3 green apples on the right"
- Use colorful, kid-friendly objects (apples, stars, balloons, toys, animals)

Important: 
- The correctAnswer should be the numerical answer to the math problem
- Shuffle/mix the question types - don't put all of one type together`;

      const result = await generateObject({
        model: "anthropic/claude-sonnet-4.5",
        schema: zodSchema(questionSchema),
        prompt,
      });

      const generatedQuestions = result.object.questions;

      // Generate images for questions with visual descriptions (in parallel)
      const questionsWithImages = await Promise.all(
        generatedQuestions.map(async (q) => {
          if (q.visualDescription) {
            const imageUrl = await generateImageFromDescription(q.visualDescription);
            return { ...q, imageUrl };
          }
          return { ...q, imageUrl: null };
        })
      );

      // Create a learning session
      const [session] = await db
        .insert(learningSessions)
        .values({
          userId,
          mode: "playground",
          topic,
          totalQuestions: questionCount,
          currentQuestionIndex: 0,
        })
        .returning();

      if (!session) {
        throw new Error("Failed to create learning session");
      }

      // Save the generated questions to the database
      const questionRecords = questionsWithImages.map((q, index) => ({
        sessionId: session.id,
        type: q.type,
        topic,
        difficulty,
        questionText: q.questionText,
        correctAnswer: q.correctAnswer,
        // Ensure nullable fields are explicitly null, not undefined
        options: q.options ?? null,
        // Convert tuple to array for JSON serialization
        hints: [...q.hints],
        visualDescription: q.visualDescription ?? null,
        imageUrl: q.imageUrl ?? null,
        questionIndex: index,
      }));

      await db.insert(questionsTable).values(questionRecords);

      return {
        sessionId: session.id,
        questions: questionsWithImages,
      };
    }),
  getById: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Get the session with all related data using drizzle relations
    const session = await db.query.learningSessions.findFirst({
      where: and(eq(learningSessions.id, input), eq(learningSessions.userId, userId)),
      with: {
        questions: {
          orderBy: (questions, { asc }) => [asc(questions.questionIndex)],
        },
        answers: {
          with: {
            question: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Map answers by questionId for easy lookup
    const answersByQuestionId = new Map(
      session.answers.map((answer) => [answer.questionId, answer])
    );

    // Get current question index (default to 0)
    const currentIndex = session.currentQuestionIndex ?? 0;
    const currentQuestion = session.questions[currentIndex] ?? null;

    // Calculate progress stats
    const totalQuestions = session.totalQuestions ?? session.questions.length;
    const answeredCount = session.answers.length;
    const correctCount = session.answers.filter((a) => a.isCorrect).length;
    const incorrectCount = answeredCount - correctCount;
    const totalHintsUsed = session.answers.reduce((sum, a) => sum + (a.hintsUsed ?? 0), 0);
    const totalTimeMs = session.answers.reduce((sum, a) => sum + (a.timeMs ?? 0), 0);

    // Build questions array with their answer status
    const questionsWithStatus = session.questions.map((question) => {
      const answer = answersByQuestionId.get(question.id);
      return {
        id: question.id,
        questionIndex: question.questionIndex,
        type: question.type,
        topic: question.topic,
        difficulty: question.difficulty,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        options: question.options,
        hints: question.hints as string[],
        visualDescription: question.visualDescription,
        imageUrl: question.imageUrl,
        // Answer data (if answered)
        isAnswered: !!answer,
        answer: answer
          ? {
              id: answer.id,
              userAnswer: answer.userAnswer,
              isCorrect: answer.isCorrect,
              hintsUsed: answer.hintsUsed,
              timeMs: answer.timeMs,
            }
          : null,
      };
    });

    // Current question with full details for display
    const currentQuestionData = currentQuestion
      ? {
          id: currentQuestion.id,
          questionIndex: currentQuestion.questionIndex,
          type: currentQuestion.type,
          topic: currentQuestion.topic,
          difficulty: currentQuestion.difficulty,
          questionText: currentQuestion.questionText,
          correctAnswer: currentQuestion.correctAnswer,
          options: currentQuestion.options,
          hints: currentQuestion.hints as string[],
          visualDescription: currentQuestion.visualDescription,
          imageUrl: currentQuestion.imageUrl,
          isAnswered: answersByQuestionId.has(currentQuestion.id),
          answer: answersByQuestionId.get(currentQuestion.id) ?? null,
        }
      : null;

    return {
      // Session metadata
      session: {
        id: session.id,
        mode: session.mode,
        topic: session.topic,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        score: session.score ?? 0,
      },
      // Current question for display
      currentQuestion: currentQuestionData,
      // All questions with answer status (for review/navigation)
      questions: questionsWithStatus,
      // Progress data for the progress bar
      progress: {
        total: totalQuestions,
        currentIndex,
        answered: answeredCount,
        correct: correctCount,
        incorrect: incorrectCount,
        remaining: totalQuestions - answeredCount,
        percentComplete: Math.round((answeredCount / totalQuestions) * 100),
        isComplete: answeredCount >= totalQuestions,
        score: session.score ?? 0,
      },
      // Stats for summary/review
      stats: {
        totalHintsUsed,
        totalTimeMs,
        avgTimeMs: answeredCount > 0 ? Math.round(totalTimeMs / answeredCount) : 0,
        avgHintsPerQuestion: answeredCount > 0 ? +(totalHintsUsed / answeredCount).toFixed(2) : 0,
        accuracy: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
      },
    };
  }),

  submitAnswer: protectedProcedure.input(submitAnswerInput).mutation(async ({ input, ctx }) => {
    const { sessionId, questionId, userAnswer, hintsUsed, timeMs } = input;
    const userId = ctx.session.user.id;

    // Verify the session belongs to the user and get current score
    const session = await db.query.learningSessions.findFirst({
      where: and(eq(learningSessions.id, sessionId), eq(learningSessions.userId, userId)),
      with: {
        answers: true,
      },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    // Get the question to check the correct answer
    const question = await db.query.questions.findFirst({
      where: and(eq(questionsTable.id, questionId), eq(questionsTable.sessionId, sessionId)),
    });

    if (!question) {
      throw new Error("Question not found");
    }

    const isCorrect = userAnswer === question.correctAnswer;

    // Calculate score for this question
    const questionScore = calculateQuestionScore({
      isCorrect,
      hintsUsed,
      difficulty: question.difficulty,
    });

    // Insert the answer
    const [answer] = await db
      .insert(answersTable)
      .values({
        sessionId,
        questionId,
        userAnswer,
        isCorrect,
        hintsUsed,
        timeMs,
      })
      .returning();

    // Update the session's current question index and accumulate score
    const nextIndex = (session.currentQuestionIndex ?? 0) + 1;
    const totalQuestions = session.totalQuestions ?? 0;
    const isSessionComplete = nextIndex >= totalQuestions;
    const currentSessionScore = (session.score ?? 0) + questionScore;

    // Calculate final session score with accuracy multiplier if complete
    let finalSessionScore = currentSessionScore;
    if (isSessionComplete) {
      // Calculate accuracy including this answer
      const allAnswers = [...session.answers, { isCorrect }];
      const correctCount = allAnswers.filter((a) => a.isCorrect).length;
      const accuracy = Math.round((correctCount / allAnswers.length) * 100);
      const multiplier = getAccuracyMultiplier(accuracy);
      finalSessionScore = Math.round(currentSessionScore * multiplier);
    }

    // Update session: set next index, score, and endedAt/status if complete
    if (isSessionComplete) {
      await db
        .update(learningSessions)
        .set({
          currentQuestionIndex: nextIndex,
          score: finalSessionScore,
          endedAt: new Date(),
          status: "completed",
        })
        .where(eq(learningSessions.id, sessionId));
    } else {
      await db
        .update(learningSessions)
        .set({
          currentQuestionIndex: nextIndex,
          score: finalSessionScore,
        })
        .where(eq(learningSessions.id, sessionId));
    }

    // If session is complete, update user's total score
    if (isSessionComplete) {
      await db
        .insert(userScore)
        .values({
          userId,
          totalScore: finalSessionScore,
        })
        .onConflictDoUpdate({
          target: userScore.userId,
          set: {
            totalScore: sql`${userScore.totalScore} + ${finalSessionScore}`,
            updatedAt: new Date(),
          },
        });
    }

    return {
      answerId: answer?.id,
      isCorrect,
      correctAnswer: question.correctAnswer,
      nextQuestionIndex: nextIndex,
      isSessionComplete,
      questionScore,
      sessionScore: finalSessionScore,
    };
  }),

  getUserScore: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const score = await db.query.userScore.findFirst({
      where: eq(userScore.userId, userId),
    });

    return {
      totalScore: score?.totalScore ?? 0,
      updatedAt: score?.updatedAt ?? null,
    };
  }),

  pauseSession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // Verify the session belongs to the user and is in progress
      const session = await db.query.learningSessions.findFirst({
        where: and(
          eq(learningSessions.id, input.sessionId),
          eq(learningSessions.userId, userId),
          eq(learningSessions.status, "in_progress")
        ),
      });

      if (!session) {
        throw new Error("Session not found or already completed");
      }

      // Update status to paused
      await db
        .update(learningSessions)
        .set({ status: "paused" })
        .where(eq(learningSessions.id, input.sessionId));

      return { success: true };
    }),

  resumeSession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // Verify the session belongs to the user and is paused
      const session = await db.query.learningSessions.findFirst({
        where: and(
          eq(learningSessions.id, input.sessionId),
          eq(learningSessions.userId, userId),
          eq(learningSessions.status, "paused")
        ),
      });

      if (!session) {
        throw new Error("Session not found or not paused");
      }

      // Update status back to in_progress
      await db
        .update(learningSessions)
        .set({ status: "in_progress" })
        .where(eq(learningSessions.id, input.sessionId));

      return { sessionId: input.sessionId };
    }),

  getLeaderboard: protectedProcedure.query(async () => {
    const scores = await db.query.userScore.findMany({
      orderBy: (us, { desc }) => [desc(us.totalScore)],
      limit: 10,
      with: {
        user: {
          columns: { id: true, name: true, image: true },
        },
      },
    });

    return scores.map((s, i) => ({
      rank: i + 1,
      userId: s.userId,
      name: s.user.name,
      image: s.user.image,
      totalScore: s.totalScore,
    }));
  }),
});
