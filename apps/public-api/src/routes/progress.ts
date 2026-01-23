import type { FastifyInstance } from "fastify";
import { eq, desc } from "drizzle-orm";

import { skillsProgress, userScore } from "@math-wiz/db/schema/learning";
import type { SkillsProgress } from "@math-wiz/db/schema/learning";
import { user } from "@math-wiz/db/schema/auth";

import { API_TAGS } from "../constants";
import { authenticateM2M, requireScopes } from "../lib/m2m-auth";
import { getBaseUrl } from "../utils/base-url";
import {
  userIdParamSchema,
  userProgressResponseSchema,
  leaderboardResponseSchema,
  errorResponseSchema,
  paginationQuerySchema,
} from "../types/schemas";

export const progressRoute = async (fastify: FastifyInstance) => {
  const baseUrl = getBaseUrl();

  // GET /progress/:userId - Get user progress
  fastify.route({
    method: "GET",
    url: "/:userId",
    preHandler: [authenticateM2M, requireScopes("read:progress")],
    schema: {
      tags: [API_TAGS.PROGRESS],
      summary: "Get user progress",
      description: "Retrieve skill progress and total score for a specific user",
      params: userIdParamSchema,
      response: {
        200: userProgressResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { userId } = request.params as { userId: string };

      // Get user's total score
      const score = await fastify.db.query.userScore.findFirst({
        where: eq(userScore.userId, userId),
      });

      // Get user's skill progress
      const skills = await fastify.db.query.skillsProgress.findMany({
        where: eq(skillsProgress.userId, userId),
      });

      // If no data found, return 404
      if (!score && skills.length === 0) {
        return reply.code(404).send({
          error: "Not Found",
          message: `No progress data found for user ${userId}`,
          statusCode: 404,
        });
      }

      const skillsData = skills.map((s: SkillsProgress) => ({
        subject: s.subject,
        topic: s.topic,
        totalQuestions: s.totalQuestions ?? 0,
        correctQuestions: s.correctQuestions ?? 0,
        accuracy:
          s.totalQuestions && s.totalQuestions > 0
            ? Math.round(((s.correctQuestions ?? 0) / s.totalQuestions) * 100)
            : 0,
        avgHintsUsed: s.avgHintsUsed ?? 0,
      }));

      return reply.send({
        userId,
        totalScore: score?.totalScore ?? 0,
        skills: skillsData,
        _links: {
          self: `${baseUrl}/progress/${userId}`,
          sessions: `${baseUrl}/sessions?userId=${userId}`,
        },
      });
    },
  });

  // GET /leaderboard - Get public leaderboard
  fastify.route({
    method: "GET",
    url: "/leaderboard",
    preHandler: [authenticateM2M, requireScopes("read:leaderboard")],
    schema: {
      tags: [API_TAGS.PROGRESS],
      summary: "Get leaderboard",
      description: "Retrieve the top learners by total score",
      querystring: paginationQuerySchema,
      response: {
        200: leaderboardResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { limit } = request.query as { page: number; limit: number };

      const scores = await fastify.db
        .select({
          odUserId: userScore.userId,
          totalScore: userScore.totalScore,
          name: user.name,
        })
        .from(userScore)
        .innerJoin(user, eq(userScore.userId, user.id))
        .orderBy(desc(userScore.totalScore))
        .limit(limit);

      const data = scores.map((s, index) => ({
        rank: index + 1,
        userId: s.odUserId,
        name: s.name,
        totalScore: s.totalScore,
      }));

      return reply.send({
        data,
        generatedAt: new Date().toISOString(),
      });
    },
  });
};
