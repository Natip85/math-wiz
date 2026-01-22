"use client";

import type { AppRouter } from "@math-wiz/api/routers/index";
import type { inferRouterOutputs } from "@trpc/server";
import type { ComponentType } from "react";

import type { Subject } from "./hooks/use-submit-answer";
import { WordProblem } from "./word-problem";
import { MathMultipleChoice } from "./math-multiple-choice";
import { Equation } from "./equation";
import { TrueFalse } from "./true-false";
import { TextAnswer } from "./text-answer";
import { ChoiceQuestion } from "./choice-question";

export type RouterOutput = inferRouterOutputs<AppRouter>;
type PlaygroundQuestion = NonNullable<RouterOutput["playground"]["getById"]>["currentQuestion"];

export type QuestionComponentProps = {
  question: NonNullable<PlaygroundQuestion>;
  sessionId: string;
  subject: Subject;
  isFetching?: boolean;
};

// All question types from the database schema
type QuestionType =
  | "equation"
  | "word_problem"
  | "multiple_choice"
  | "fact"
  | "experiment"
  | "diagram_label"
  | "grammar"
  | "reading_comprehension"
  | "spelling"
  | "sentence_completion";

// Question type to component mapping
// Note: multiple_choice needs special handling based on subject
const questionComponents: Record<
  Exclude<QuestionType, "multiple_choice">,
  ComponentType<QuestionComponentProps>
> = {
  // Math components
  equation: Equation,
  word_problem: WordProblem,

  // Science components
  fact: TrueFalse,
  experiment: TextAnswer,
  diagram_label: ChoiceQuestion,

  // English components
  grammar: ChoiceQuestion,
  reading_comprehension: ChoiceQuestion,
  spelling: ChoiceQuestion,
  sentence_completion: TextAnswer,
};

type QuestionRendererProps = {
  question: NonNullable<PlaygroundQuestion>;
  sessionId: string;
  subject: Subject;
  isFetching?: boolean;
};

export function QuestionRenderer({
  question,
  sessionId,
  subject,
  isFetching,
}: QuestionRendererProps) {
  // Special handling for multiple_choice which differs by subject
  if (question.type === "multiple_choice") {
    // Math uses numeric multiple choice, others use string-based choice
    if (subject === "math") {
      return (
        <MathMultipleChoice
          question={question}
          sessionId={sessionId}
          subject={subject}
          isFetching={isFetching}
        />
      );
    } else {
      return (
        <ChoiceQuestion
          question={question}
          sessionId={sessionId}
          subject={subject}
          isFetching={isFetching}
        />
      );
    }
  }

  const Component = questionComponents[question.type as Exclude<QuestionType, "multiple_choice">];

  if (!Component) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">
          Unknown question type: <code>{question.type}</code>
        </p>
      </div>
    );
  }

  return (
    <Component
      question={question}
      sessionId={sessionId}
      subject={subject}
      isFetching={isFetching}
    />
  );
}
