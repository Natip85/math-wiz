import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  json,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const mode = ["playground", "quiz"] as const;
export type Mode = (typeof mode)[number];
export const modeEnum = pgEnum("mode", mode);

export const sessionStatus = ["in_progress", "completed", "paused"] as const;
export type SessionStatus = (typeof sessionStatus)[number];
export const sessionStatusEnum = pgEnum("session_status", sessionStatus);

export const questionType = ["word_problem", "equation", "multiple_choice"] as const;
export type QuestionType = (typeof questionType)[number];

export const learningSessions = pgTable(
  "learning_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    mode: modeEnum("mode").$type<Mode | null>().default(null),
    topic: text("topic").notNull(), // addition, subtraction, etc.
    status: sessionStatusEnum("status").$type<SessionStatus>().default("in_progress").notNull(),

    totalQuestions: integer("total_questions").default(10),
    currentQuestionIndex: integer("current_question_index").default(0), // 0-based

    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
  },
  (table) => [index("learning_sessions_userId_idx").on(table.userId)]
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

    type: text("type").$type<QuestionType>().default("word_problem").notNull(),
    topic: text("topic").notNull(),
    difficulty: text("difficulty").default("easy"),

    questionText: text("question_text").notNull(),
    correctAnswer: integer("correct_answer").notNull(),
    options: json("options").$type<number[] | null>(), // for multiple choice - array of 4 numbers
    hints: json("hints").notNull(), // array of hint strings
    visualDescription: text("visual_description"), // for word problems with visuals
    imageUrl: text("image_url"), // generated image URL from visual description

    questionIndex: integer("question_index").notNull(), // 0-9

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("questions_sessionId_idx").on(table.sessionId),
    index("questions_sessionId_questionIndex_idx").on(table.sessionId, table.questionIndex),
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

    userAnswer: integer("user_answer"),
    isCorrect: boolean("is_correct"),
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
