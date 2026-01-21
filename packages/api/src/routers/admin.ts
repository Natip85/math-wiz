import { and, avg, count, gte, lt, sql, sum } from "drizzle-orm";

import { db } from "@math-wiz/db";
import { user } from "@math-wiz/db/schema/auth";
import { answers, learningSessions, questions, userScore } from "@math-wiz/db/schema/learning";

import { protectedProcedure, router } from "../index";

export const adminRouter = router({
  getUserStats: protectedProcedure.query(async () => {
    // Calculate date boundaries
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date(startOfThisMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const [totalUsers, usersThisMonth, usersLastMonth] = await Promise.all([
      db.$count(user),
      db.$count(user, gte(user.createdAt, startOfThisMonth)),
      db.$count(
        user,
        and(gte(user.createdAt, startOfLastMonth), lt(user.createdAt, startOfThisMonth))
      ),
    ]);

    // Calculate percentage change
    let percentChange = 0;
    if (usersLastMonth > 0) {
      percentChange = ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;
    } else if (usersThisMonth > 0) {
      percentChange = 100;
    }

    return {
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      percentChange: Math.round(percentChange * 10) / 10,
    };
  }),

  getSessionStats: protectedProcedure.query(async () => {
    // Calculate date boundaries
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date(startOfThisMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const [totalSessions, sessionsThisMonth, sessionsLastMonth] = await Promise.all([
      db.$count(learningSessions),
      db.$count(learningSessions, gte(learningSessions.startedAt, startOfThisMonth)),
      db.$count(
        learningSessions,
        and(
          gte(learningSessions.startedAt, startOfLastMonth),
          lt(learningSessions.startedAt, startOfThisMonth)
        )
      ),
    ]);

    // Calculate percentage change
    let percentChange = 0;
    if (sessionsLastMonth > 0) {
      percentChange = ((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth) * 100;
    } else if (sessionsThisMonth > 0) {
      percentChange = 100;
    }

    return {
      totalSessions,
      sessionsThisMonth,
      sessionsLastMonth,
      percentChange: Math.round(percentChange * 10) / 10,
    };
  }),

  getQuestionStats: protectedProcedure.query(async () => {
    // Calculate date boundaries
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date(startOfThisMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const [totalQuestions, questionsThisMonth, questionsLastMonth] = await Promise.all([
      db.$count(questions),
      db.$count(questions, gte(questions.createdAt, startOfThisMonth)),
      db.$count(
        questions,
        and(gte(questions.createdAt, startOfLastMonth), lt(questions.createdAt, startOfThisMonth))
      ),
    ]);

    // Calculate percentage change
    let percentChange = 0;
    if (questionsLastMonth > 0) {
      percentChange = ((questionsThisMonth - questionsLastMonth) / questionsLastMonth) * 100;
    } else if (questionsThisMonth > 0) {
      percentChange = 100;
    }

    return {
      totalQuestions,
      questionsThisMonth,
      questionsLastMonth,
      percentChange: Math.round(percentChange * 10) / 10,
    };
  }),

  getAvgTimeStats: protectedProcedure.query(async () => {
    // Calculate date boundaries
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date(startOfThisMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const [avgTimeResult, avgTimeThisMonthResult, avgTimeLastMonthResult] = await Promise.all([
      db.select({ avgTime: avg(answers.timeMs) }).from(answers),
      db
        .select({ avgTime: avg(answers.timeMs) })
        .from(answers)
        .where(gte(answers.createdAt, startOfThisMonth)),
      db
        .select({ avgTime: avg(answers.timeMs) })
        .from(answers)
        .where(
          and(gte(answers.createdAt, startOfLastMonth), lt(answers.createdAt, startOfThisMonth))
        ),
    ]);

    const avgTimeMs = Number(avgTimeResult[0]?.avgTime) || 0;
    const avgTimeThisMonth = Number(avgTimeThisMonthResult[0]?.avgTime) || 0;
    const avgTimeLastMonth = Number(avgTimeLastMonthResult[0]?.avgTime) || 0;

    // Calculate percentage change
    let percentChange = 0;
    if (avgTimeLastMonth > 0) {
      percentChange = ((avgTimeThisMonth - avgTimeLastMonth) / avgTimeLastMonth) * 100;
    } else if (avgTimeThisMonth > 0) {
      percentChange = 100;
    }

    return {
      avgTimeMs: Math.round(avgTimeMs),
      avgTimeThisMonth: Math.round(avgTimeThisMonth),
      avgTimeLastMonth: Math.round(avgTimeLastMonth),
      percentChange: Math.round(percentChange * 10) / 10,
    };
  }),

  getHintsStats: protectedProcedure.query(async () => {
    // Calculate date boundaries
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date(startOfThisMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const [
      totalHintsResult,
      hintsThisMonthResult,
      hintsLastMonthResult,
      totalAnswers,
      avgHintsResult,
    ] = await Promise.all([
      db.select({ total: sum(answers.hintsUsed) }).from(answers),
      db
        .select({ total: sum(answers.hintsUsed) })
        .from(answers)
        .where(gte(answers.createdAt, startOfThisMonth)),
      db
        .select({ total: sum(answers.hintsUsed) })
        .from(answers)
        .where(
          and(gte(answers.createdAt, startOfLastMonth), lt(answers.createdAt, startOfThisMonth))
        ),
      db.$count(answers),
      db.select({ avg: avg(answers.hintsUsed) }).from(answers),
    ]);

    const totalHints = Number(totalHintsResult[0]?.total) || 0;
    const hintsThisMonth = Number(hintsThisMonthResult[0]?.total) || 0;
    const hintsLastMonth = Number(hintsLastMonthResult[0]?.total) || 0;
    const avgHintsPerQuestion = Number(avgHintsResult[0]?.avg) || 0;

    // Calculate percentage change
    let percentChange = 0;
    if (hintsLastMonth > 0) {
      percentChange = ((hintsThisMonth - hintsLastMonth) / hintsLastMonth) * 100;
    } else if (hintsThisMonth > 0) {
      percentChange = 100;
    }

    return {
      totalHints,
      hintsThisMonth,
      hintsLastMonth,
      totalAnswers,
      avgHintsPerQuestion: Math.round(avgHintsPerQuestion * 100) / 100,
      percentChange: Math.round(percentChange * 10) / 10,
    };
  }),

  getWeeklyActivity: protectedProcedure.query(async () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Get the start of 7 days ago
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    // Query sessions grouped by day
    const sessionsData = await db
      .select({
        date: sql<string>`DATE(${learningSessions.startedAt})`.as("date"),
        count: count(),
      })
      .from(learningSessions)
      .where(gte(learningSessions.startedAt, weekAgo))
      .groupBy(sql`DATE(${learningSessions.startedAt})`);

    // Query questions grouped by day
    const questionsData = await db
      .select({
        date: sql<string>`DATE(${questions.createdAt})`.as("date"),
        count: count(),
      })
      .from(questions)
      .where(gte(questions.createdAt, weekAgo))
      .groupBy(sql`DATE(${questions.createdAt})`);

    // Build a map of date -> counts
    const sessionsMap = new Map(sessionsData.map((d) => [d.date, d.count]));
    const questionsMap = new Map(questionsData.map((d) => [d.date, d.count]));

    // Build the result array for the past 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0] ?? "";
      const dayName = days[date.getDay()];

      result.push({
        day: dayName,
        sessions: sessionsMap.get(dateStr) ?? 0,
        questions: questionsMap.get(dateStr) ?? 0,
      });
    }

    return result;
  }),

  getQuestionTypeStats: protectedProcedure.query(async () => {
    const typeLabels: Record<string, string> = {
      word_problem: "Word Problems",
      equation: "Equations",
      multiple_choice: "Multiple Choice",
    };

    const typeColors: Record<string, string> = {
      word_problem: "var(--chart-1)",
      equation: "var(--chart-2)",
      multiple_choice: "var(--chart-3)",
    };

    const results = await db
      .select({
        type: questions.type,
        count: count(),
      })
      .from(questions)
      .groupBy(questions.type);

    return results.map((r) => ({
      name: typeLabels[r.type] ?? r.type,
      value: r.count,
      color: typeColors[r.type] ?? "var(--chart-4)",
    }));
  }),

  getTopicPerformance: protectedProcedure.query(async () => {
    const topicColors: Record<string, string> = {
      addition: "bg-chart-1",
      subtraction: "bg-chart-2",
      multiplication: "bg-chart-3",
      division: "bg-chart-4",
      fractions: "bg-chart-5",
      decimals: "bg-chart-1",
    };

    // Get question counts by topic
    const questionCounts = await db
      .select({
        topic: questions.topic,
        count: count(),
      })
      .from(questions)
      .groupBy(questions.topic);

    // Get accuracy by topic (join answers with questions)
    const accuracyData = await db
      .select({
        topic: questions.topic,
        total: count(),
        correct: sum(sql<number>`CASE WHEN ${answers.isCorrect} = true THEN 1 ELSE 0 END`),
      })
      .from(answers)
      .innerJoin(questions, sql`${answers.questionId} = ${questions.id}`)
      .groupBy(questions.topic);

    // Build maps for easy lookup
    const questionCountMap = new Map(questionCounts.map((q) => [q.topic, q.count]));
    const accuracyMap = new Map(
      accuracyData.map((a) => [
        a.topic,
        a.total > 0 ? Math.round((Number(a.correct) / a.total) * 100) : 0,
      ])
    );

    // Get unique topics and build result
    const allTopics = [...new Set([...questionCountMap.keys(), ...accuracyMap.keys()])];

    return allTopics
      .map((topic) => ({
        name: topic.charAt(0).toUpperCase() + topic.slice(1),
        accuracy: accuracyMap.get(topic) ?? 0,
        questions: questionCountMap.get(topic) ?? 0,
        color: topicColors[topic.toLowerCase()] ?? "bg-chart-1",
      }))
      .sort((a, b) => b.questions - a.questions);
  }),

  getPeakHours: protectedProcedure.query(async () => {
    // Get session counts grouped by hour of day
    const hourData = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${learningSessions.startedAt})`.as("hour"),
        count: count(),
      })
      .from(learningSessions)
      .groupBy(sql`EXTRACT(HOUR FROM ${learningSessions.startedAt})`);

    // Build a map of hour -> count
    const hourMap = new Map(hourData.map((h) => [h.hour, h.count]));

    // Define the hours we want to show (every 3 hours)
    const displayHours = [6, 9, 12, 15, 18, 21];
    const hourLabels: Record<number, string> = {
      6: "6AM",
      9: "9AM",
      12: "12PM",
      15: "3PM",
      18: "6PM",
      21: "9PM",
    };

    // Aggregate counts into 3-hour buckets
    const bucketCounts = displayHours.map((startHour) => {
      let total = 0;
      for (let h = startHour; h < startHour + 3; h++) {
        total += hourMap.get(h) ?? 0;
      }
      return { hour: startHour, count: total };
    });

    // Find max for normalization
    const maxCount = Math.max(...bucketCounts.map((b) => b.count), 1);

    // Find peak hour
    const peakBucket =
      bucketCounts.length > 0
        ? bucketCounts.reduce((max, b) => (b.count > max.count ? b : max))
        : null;
    const peakHourLabel = peakBucket
      ? `${hourLabels[peakBucket.hour]?.replace("AM", ":00 AM").replace("PM", ":00 PM")} - ${
          peakBucket.hour + 1 > 12
            ? `${peakBucket.hour + 1 - 12}:00 PM`
            : `${peakBucket.hour + 1}:00 AM`
        }`
      : "N/A";

    return {
      hours: bucketCounts.map((b) => ({
        hour: hourLabels[b.hour] ?? `${b.hour}`,
        value: Math.round((b.count / maxCount) * 100),
      })),
      peakTime: peakHourLabel,
    };
  }),

  getDifficultyStats: protectedProcedure.query(async () => {
    const difficultyLabels: Record<string, string> = {
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
    };

    const difficultyColors: Record<string, string> = {
      easy: "bg-chart-1",
      medium: "bg-chart-2",
      hard: "bg-chart-4",
    };

    const difficultyOrder: Record<string, number> = {
      easy: 0,
      medium: 1,
      hard: 2,
    };

    const results = await db
      .select({
        difficulty: questions.difficulty,
        count: count(),
      })
      .from(questions)
      .groupBy(questions.difficulty);

    const total = results.reduce((sum, r) => sum + r.count, 0);

    return results
      .map((r) => ({
        level: difficultyLabels[r.difficulty ?? "easy"] ?? r.difficulty ?? "Unknown",
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
        color: difficultyColors[r.difficulty ?? "easy"] ?? "bg-chart-1",
        order: difficultyOrder[r.difficulty ?? "easy"] ?? 99,
      }))
      .sort((a, b) => a.order - b.order)
      .map(({ order: _order, ...rest }) => rest);
  }),

  getLiveFeed: protectedProcedure.query(async () => {
    const recentSessions = await db
      .select({
        id: learningSessions.id,
        topic: learningSessions.topic,
        status: learningSessions.status,
        score: learningSessions.score,
        totalQuestions: learningSessions.totalQuestions,
        startedAt: learningSessions.startedAt,
        userName: user.name,
      })
      .from(learningSessions)
      .innerJoin(user, sql`${learningSessions.userId} = ${user.id}`)
      .orderBy(sql`${learningSessions.startedAt} DESC`)
      .limit(5);

    const now = new Date();

    return recentSessions.map((session) => {
      // Calculate time ago
      const diffMs = now.getTime() - new Date(session.startedAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const timeAgo =
        diffMins < 1
          ? "just now"
          : diffMins < 60
            ? `${diffMins}m ago`
            : `${Math.floor(diffMins / 60)}h ago`;

      // Calculate score percentage
      const scorePercent =
        session.totalQuestions && session.totalQuestions > 0
          ? Math.round(((session.score ?? 0) / (session.totalQuestions * 10)) * 100)
          : 0;

      // Get initials from name
      const nameParts = session.userName.split(" ");
      const initials =
        nameParts.length >= 2
          ? `${nameParts[0]?.[0] ?? ""}${nameParts[1]?.[0] ?? ""}`.toUpperCase()
          : session.userName.slice(0, 2).toUpperCase();

      return {
        name: session.userName,
        initials,
        topic: session.topic.charAt(0).toUpperCase() + session.topic.slice(1),
        score: scorePercent,
        time: timeAgo,
        status: session.status === "in_progress" ? "in-progress" : session.status,
      };
    });
  }),

  getTopLearners: protectedProcedure.query(async () => {
    // Get top 3 users by score this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get users with highest scores
    const topUsers = await db
      .select({
        userId: userScore.userId,
        totalScore: userScore.totalScore,
        userName: user.name,
      })
      .from(userScore)
      .innerJoin(user, sql`${userScore.userId} = ${user.id}`)
      .orderBy(sql`${userScore.totalScore} DESC`)
      .limit(3);

    // Calculate streaks for each user
    const result = await Promise.all(
      topUsers.map(async (u) => {
        // Get distinct dates of sessions for this user, ordered by date descending
        const sessionDates = await db
          .selectDistinct({
            date: sql<string>`DATE(${learningSessions.startedAt})`.as("date"),
          })
          .from(learningSessions)
          .where(sql`${learningSessions.userId} = ${u.userId}`)
          .orderBy(sql`DATE(${learningSessions.startedAt}) DESC`);

        // Calculate streak (consecutive days from today/yesterday)
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sessionDates.length; i++) {
          const sessionDate = new Date(sessionDates[i]?.date ?? "");
          const expectedDate = new Date(today);
          expectedDate.setDate(expectedDate.getDate() - i);

          // Allow starting from today or yesterday
          if (i === 0) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (
              sessionDate.toDateString() !== today.toDateString() &&
              sessionDate.toDateString() !== yesterday.toDateString()
            ) {
              break;
            }
            // Adjust expected date if streak starts from yesterday
            if (sessionDate.toDateString() === yesterday.toDateString()) {
              expectedDate.setDate(expectedDate.getDate() - 1);
            }
          }

          if (sessionDate.toDateString() === expectedDate.toDateString()) {
            streak++;
          } else {
            break;
          }
        }

        // Get initials
        const nameParts = u.userName.split(" ");
        const initials =
          nameParts.length >= 2
            ? `${nameParts[0]?.[0] ?? ""}${nameParts[1]?.[0] ?? ""}`.toUpperCase()
            : u.userName.slice(0, 2).toUpperCase();

        return {
          name: u.userName,
          initials,
          score: u.totalScore,
          streak,
        };
      })
    );

    return result;
  }),
});
