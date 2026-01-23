import type { FastifyInstance } from "fastify";
import { and, eq, count, desc } from "drizzle-orm";

import { learningSessions, questions, answers } from "@math-wiz/db/schema/learning";
import type { LearningSession, Question, Answer } from "@math-wiz/db/schema/learning";

import { API_TAGS } from "../constants";
import { authenticateM2M, requireScopes } from "../lib/m2m-auth";
import { getBaseUrl } from "../utils/base-url";
import {
  idParamSchema,
  listSessionsQuerySchema,
  listSessionsResponseSchema,
  sessionDetailSchema,
  listQuestionsResponseSchema,
  errorResponseSchema,
} from "../types/schemas";
import type { ListSessionsQuery } from "../types/schemas";

export const sessionsRoute = async (fastify: FastifyInstance) => {
  const baseUrl = getBaseUrl();

  // GET /sessions - List learning sessions
  fastify.route({
    method: "GET",
    url: "/",
    preHandler: [authenticateM2M, requireScopes("read:sessions")],
    schema: {
      tags: [API_TAGS.SESSIONS],
      summary: "List learning sessions",
      description: "Retrieve a paginated list of learning sessions with optional filters",
      querystring: listSessionsQuerySchema,
      response: {
        200: listSessionsResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const query = request.query as ListSessionsQuery;
      const { page, limit, userId, subject, status } = query;

      // Build where conditions
      const conditions = [];
      if (userId) {
        conditions.push(eq(learningSessions.userId, userId));
      }
      if (subject) {
        conditions.push(eq(learningSessions.subject, subject));
      }
      if (status) {
        conditions.push(eq(learningSessions.status, status));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const [countResult] = await fastify.db
        .select({ count: count() })
        .from(learningSessions)
        .where(whereClause);

      const total = countResult?.count ?? 0;

      // Get paginated data
      const sessionsData = await fastify.db.query.learningSessions.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: [desc(learningSessions.startedAt)],
      });

      const data = sessionsData.map((session: LearningSession) => ({
        id: session.id,
        subject: session.subject,
        topic: session.topic,
        status: session.status,
        totalQuestions: session.totalQuestions ?? 0,
        score: session.score ?? 0,
        startedAt: session.startedAt.toISOString(),
        endedAt: session.endedAt?.toISOString() ?? null,
        _links: {
          self: `${baseUrl}/sessions/${session.id}`,
          questions: `${baseUrl}/sessions/${session.id}/questions`,
        },
      }));

      return reply.send({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    },
  });

  // GET /sessions/:id - Get session details
  fastify.route({
    method: "GET",
    url: "/:id",
    preHandler: [authenticateM2M, requireScopes("read:sessions")],
    schema: {
      tags: [API_TAGS.SESSIONS],
      summary: "Get session details",
      description: "Retrieve detailed information about a specific learning session",
      params: idParamSchema,
      response: {
        200: sessionDetailSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const session = await fastify.db.query.learningSessions.findFirst({
        where: eq(learningSessions.id, id),
        with: {
          answers: true,
        },
      });

      if (!session) {
        return reply.code(404).send({
          error: "Not Found",
          message: `Session ${id} not found`,
          statusCode: 404,
        });
      }

      const answeredCount = session.answers.length;
      const correctCount = session.answers.filter((a: Answer) => a.isCorrect).length;

      return reply.send({
        id: session.id,
        subject: session.subject,
        topic: session.topic,
        status: session.status,
        totalQuestions: session.totalQuestions ?? 0,
        score: session.score ?? 0,
        startedAt: session.startedAt.toISOString(),
        endedAt: session.endedAt?.toISOString() ?? null,
        currentQuestionIndex: session.currentQuestionIndex ?? 0,
        progress: {
          answered: answeredCount,
          correct: correctCount,
          incorrect: answeredCount - correctCount,
          accuracy: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
        },
        _links: {
          self: `${baseUrl}/sessions/${session.id}`,
          questions: `${baseUrl}/sessions/${session.id}/questions`,
        },
      });
    },
  });

  // GET /sessions/:id/questions - Get session questions
  fastify.route({
    method: "GET",
    url: "/:id/questions",
    preHandler: [authenticateM2M, requireScopes("read:sessions", "read:questions")],
    schema: {
      tags: [API_TAGS.SESSIONS],
      summary: "Get session questions",
      description: "Retrieve all questions for a learning session with their answer status",
      params: idParamSchema,
      response: {
        200: listQuestionsResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      // Verify session exists
      const session = await fastify.db.query.learningSessions.findFirst({
        where: eq(learningSessions.id, id),
      });

      if (!session) {
        return reply.code(404).send({
          error: "Not Found",
          message: `Session ${id} not found`,
          statusCode: 404,
        });
      }

      // Get questions with their answers
      const questionsData = await fastify.db.query.questions.findMany({
        where: eq(questions.sessionId, id),
        orderBy: [questions.questionIndex],
      });

      const answersData = await fastify.db.query.answers.findMany({
        where: eq(answers.sessionId, id),
      });

      const answersByQuestionId = new Map(answersData.map((a: Answer) => [a.questionId, a]));

      const data = questionsData.map((q: Question) => {
        const answer = answersByQuestionId.get(q.id);
        return {
          id: q.id,
          questionIndex: q.questionIndex,
          subject: q.subject,
          type: q.type,
          topic: q.topic,
          difficulty: q.difficulty,
          questionText: q.questionText,
          options: q.options,
          hints: q.hints as string[],
          isAnswered: !!answer,
          answer: answer
            ? {
                userAnswer: answer.userAnswer,
                isCorrect: answer.isCorrect,
                hintsUsed: answer.hintsUsed,
                timeMs: answer.timeMs,
              }
            : null,
        };
      });

      return reply.send({
        data,
        sessionId: id,
      });
    },
  });
};
