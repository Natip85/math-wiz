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
  isFetching?: boolean;
};

const WordProblemQuestion = ({ question, sessionId, isFetching }: QuestionComponentProps) => (
  <WordProblem question={question} sessionId={sessionId} isFetching={isFetching} />
);

const EquationQuestion = ({ question, sessionId, isFetching }: QuestionComponentProps) => (
  <Equation question={question} sessionId={sessionId} isFetching={isFetching} />
);

const MultipleChoiceQuestion = ({ question, sessionId, isFetching }: QuestionComponentProps) => (
  <MultipleChoice question={question} sessionId={sessionId} isFetching={isFetching} />
);

const questionComponents: Record<QuestionType, ComponentType<QuestionComponentProps>> = {
  word_problem: WordProblemQuestion,
  equation: EquationQuestion,
  multiple_choice: MultipleChoiceQuestion,
};

type QuestionRendererProps = {
  question: NonNullable<PlaygroundQuestion>;
  sessionId: string;
  isFetching?: boolean;
};

export function QuestionRenderer({ question, sessionId, isFetching }: QuestionRendererProps) {
  const Component = questionComponents[question.type];

  if (!Component) {
    return <div>Unknown question type: {question.type}</div>;
  }

  return <Component question={question} sessionId={sessionId} isFetching={isFetching} />;
}
