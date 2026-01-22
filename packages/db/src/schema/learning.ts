import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ============================================================================
// Enums
// ============================================================================

export const mode = ["playground", "quiz"] as const;
export type Mode = (typeof mode)[number];
export const modeEnum = pgEnum("mode", mode);

export const sessionStatus = ["in_progress", "completed", "paused"] as const;
export type SessionStatus = (typeof sessionStatus)[number];
export const sessionStatusEnum = pgEnum("session_status", sessionStatus);

// Subject enum
export const subject = ["math", "science", "english"] as const;
export type Subject = (typeof subject)[number];
export const subjectEnum = pgEnum("subject", subject);

// ============================================================================
// Subject-Specific Question Types
// ============================================================================

export const mathQuestionTypes = ["equation", "word_problem", "multiple_choice"] as const;
export const scienceQuestionTypes = [
  "fact",
  "experiment",
  "diagram_label",
  "multiple_choice",
] as const;
export const englishQuestionTypes = [
  "grammar",
  "reading_comprehension",
  "spelling",
  "sentence_completion",
] as const;

// Combined question types for database storage (unique values only)
export const questionType = [
  // Math types
  "equation",
  "word_problem",
  "multiple_choice",
  // Science types (excluding duplicates)
  "fact",
  "experiment",
  "diagram_label",
  // English types (excluding duplicates)
  "grammar",
  "reading_comprehension",
  "spelling",
  "sentence_completion",
] as const;

export type QuestionType = (typeof questionType)[number];
export type MathQuestionType = (typeof mathQuestionTypes)[number];
export type ScienceQuestionType = (typeof scienceQuestionTypes)[number];
export type EnglishQuestionType = (typeof englishQuestionTypes)[number];

// Mapping for validation
export const questionTypesBySubject = {
  math: mathQuestionTypes,
  science: scienceQuestionTypes,
  english: englishQuestionTypes,
} as const;

// ============================================================================
// Evaluation Strategies
// ============================================================================

export const evaluationStrategy = [
  "exact_match",
  "multiple_choice",
  "ai_rubric",
  "partial_credit",
] as const;
export type EvaluationStrategy = (typeof evaluationStrategy)[number];

// ============================================================================
// Topics by Subject
// ============================================================================

export const topicsBySubject = {
  math: ["addition", "subtraction", "multiplication", "division", "fractions", "decimals"] as const,
  science: ["plants", "animals", "forces", "matter", "weather", "solar_system"] as const,
  english: ["grammar", "spelling", "reading_comprehension", "vocabulary", "punctuation"] as const,
} as const;

export type MathTopic = (typeof topicsBySubject.math)[number];
export type ScienceTopic = (typeof topicsBySubject.science)[number];
export type EnglishTopic = (typeof topicsBySubject.english)[number];

export const learningSessions = pgTable(
  "learning_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    mode: modeEnum("mode").$type<Mode | null>().default(null),
    subject: subjectEnum("subject").default("math").notNull(),
    topic: text("topic").notNull(), // addition, subtraction, plants, grammar, etc.
    status: sessionStatusEnum("status").$type<SessionStatus>().default("in_progress").notNull(),

    totalQuestions: integer("total_questions").default(10),
    currentQuestionIndex: integer("current_question_index").default(0), // 0-based
    score: integer("score").default(0), // points earned this session

    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
  },
  (table) => [
    index("learning_sessions_userId_idx").on(table.userId),
    index("learning_sessions_subject_idx").on(table.subject),
  ]
);

export const learningSessionsRelations = relations(learningSessions, ({ one, many }) => ({
  user: one(user, {
    fields: [learningSessions.userId],
    references: [user.id],
  }),
  questions: many(questions),
  answers: many(answers),
}));

export type LearningSession = typeof learningSessions.$inferSelect;
export type NewLearningSession = typeof learningSessions.$inferInsert;

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .references(() => learningSessions.id, { onDelete: "cascade" })
      .notNull(),

    subject: subjectEnum("subject").default("math").notNull(),
    type: text("type").$type<QuestionType>().default("word_problem").notNull(),
    topic: text("topic").notNull(),
    difficulty: text("difficulty").default("easy"),
    evaluationStrategy: text("evaluation_strategy")
      .$type<EvaluationStrategy>()
      .default("exact_match")
      .notNull(),

    questionText: text("question_text").notNull(),
    correctAnswer: jsonb("correct_answer").notNull(), // { value: number } for math, varies by subject
    options: jsonb("options"), // for multiple choice - array of options (numbers or strings)
    hints: jsonb("hints").notNull(), // array of hint strings
    visualDescription: text("visual_description"), // for word problems with visuals
    imageUrl: text("image_url"), // generated image URL from visual description

    questionIndex: integer("question_index").notNull(), // 0-9

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("questions_sessionId_idx").on(table.sessionId),
    index("questions_sessionId_questionIndex_idx").on(table.sessionId, table.questionIndex),
    index("questions_subject_idx").on(table.subject),
  ]
);

export const questionsRelations = relations(questions, ({ one, many }) => ({
  session: one(learningSessions, {
    fields: [questions.sessionId],
    references: [learningSessions.id],
  }),
  answers: many(answers),
}));

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export const answers = pgTable(
  "answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .references(() => learningSessions.id, { onDelete: "cascade" })
      .notNull(),
    questionId: uuid("question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),

    userAnswer: jsonb("user_answer"), // { value: number } for math, varies by subject
    isCorrect: boolean("is_correct"),
    score: integer("score"), // for partial credit (0-100)
    feedback: text("feedback"), // AI-generated feedback for wrong answers
    hintsUsed: integer("hints_used").default(0),
    timeMs: integer("time_ms"), // how long the child took

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("answers_sessionId_idx").on(table.sessionId),
    index("answers_questionId_idx").on(table.questionId),
  ]
);

export const answersRelations = relations(answers, ({ one }) => ({
  session: one(learningSessions, {
    fields: [answers.sessionId],
    references: [learningSessions.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;

export const skillsProgress = pgTable(
  "skills_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),

    subject: subjectEnum("subject").default("math").notNull(),
    topic: text("topic").notNull(),

    totalQuestions: integer("total_questions").default(0),
    correctQuestions: integer("correct_questions").default(0),
    avgHintsUsed: integer("avg_hints_used").default(0),
    avgTimeMs: integer("avg_time_ms"),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("skills_progress_userId_idx").on(table.userId),
    index("skills_progress_userId_topic_idx").on(table.userId, table.topic),
    index("skills_progress_userId_subject_topic_idx").on(table.userId, table.subject, table.topic),
  ]
);

export const skillsProgressRelations = relations(skillsProgress, ({ one }) => ({
  user: one(user, {
    fields: [skillsProgress.userId],
    references: [user.id],
  }),
}));

export type SkillsProgress = typeof skillsProgress.$inferSelect;
export type NewSkillsProgress = typeof skillsProgress.$inferInsert;

// User score tracking (one-to-one with user)
export const userScore = pgTable("user_score", {
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .primaryKey(),
  totalScore: integer("total_score").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userScoreRelations = relations(userScore, ({ one }) => ({
  user: one(user, {
    fields: [userScore.userId],
    references: [user.id],
  }),
}));

export type UserScore = typeof userScore.$inferSelect;
export type NewUserScore = typeof userScore.$inferInsert;
