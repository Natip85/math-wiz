"use client";

import type { AppRouter } from "@math-wiz/api/routers/index";
import type { QuestionType } from "@math-wiz/api/routers/playground";
import type { inferRouterOutputs } from "@trpc/server";
import type { ComponentType } from "react";
import { WordProblem } from "./word-problem";
import { MultipleChoice } from "./multiple-chioce";
import { Equation } from "./equation";

export type RouterOutput = inferRouterOutputs<AppRouter>;
type PlaygroundQuestion = NonNullable<RouterOutput["playground"]["getById"]>["currentQuestion"];

export type QuestionComponentProps = {
  question: NonNullable<PlaygroundQuestion>;
  sessionId: string;
};

const WordProblemQuestion = ({ question, sessionId }: QuestionComponentProps) => (
  <WordProblem question={question} sessionId={sessionId} />
);

const EquationQuestion = ({ question, sessionId }: QuestionComponentProps) => (
  <Equation question={question} sessionId={sessionId} />
);

const MultipleChoiceQuestion = ({ question, sessionId }: QuestionComponentProps) => (
  <MultipleChoice question={question} sessionId={sessionId} />
);

const questionComponents: Record<QuestionType, ComponentType<QuestionComponentProps>> = {
  word_problem: WordProblemQuestion,
  equation: EquationQuestion,
  multiple_choice: MultipleChoiceQuestion,
};

type QuestionRendererProps = {
  question: NonNullable<PlaygroundQuestion>;
  sessionId: string;
};

export function QuestionRenderer({ question, sessionId }: QuestionRendererProps) {
  const Component = questionComponents[question.type];

  if (!Component) {
    return <div>Unknown question type: {question.type}</div>;
  }

  return <Component question={question} sessionId={sessionId} />;
}
