"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import { useTRPC } from "@/utils/trpc-client";

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

function formatTime(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function HeroStats() {
  const trpc = useTRPC();
  const { data: userStats } = useQuery(trpc.admin.getUserStats.queryOptions());
  const { data: sessionStats } = useQuery(trpc.admin.getSessionStats.queryOptions());
  const { data: questionStats } = useQuery(trpc.admin.getQuestionStats.queryOptions());
  const { data: avgTimeStats } = useQuery(trpc.admin.getAvgTimeStats.queryOptions());
  const { data: hintsStats } = useQuery(trpc.admin.getHintsStats.queryOptions());

  const totalUsers = userStats?.totalUsers ?? 0;
  const percentChange = userStats?.percentChange ?? 0;
  const isPositive = percentChange >= 0;

  const totalSessions = sessionStats?.totalSessions ?? 0;
  const sessionPercentChange = sessionStats?.percentChange ?? 0;
  const isSessionPositive = sessionPercentChange >= 0;

  const totalQuestions = questionStats?.totalQuestions ?? 0;
  const questionPercentChange = questionStats?.percentChange ?? 0;
  const isQuestionPositive = questionPercentChange >= 0;

  const avgTimeMs = avgTimeStats?.avgTimeMs ?? 0;
  const avgTimePercentChange = avgTimeStats?.percentChange ?? 0;
  // For time, negative change (faster) is good, so we flip the logic
  const isTimeImproved = avgTimePercentChange <= 0;

  const totalHints = hintsStats?.totalHints ?? 0;
  const avgHintsPerQuestion = hintsStats?.avgHintsPerQuestion ?? 0;
  const hintsPercentChange = hintsStats?.percentChange ?? 0;
  // For hints, negative change (fewer hints needed) is good
  const isHintsImproved = hintsPercentChange <= 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {/* Giant hero stat */}
      <div className="bg-primary col-span-2 row-span-2 flex min-h-[280px] flex-col justify-between rounded-3xl p-8 lg:col-span-2">
        <div>
          <p className="text-primary-foreground/70 text-sm font-medium tracking-wider uppercase">
            Total Users
          </p>
          <p className="text-primary-foreground mt-2 text-7xl font-bold tracking-tighter lg:text-8xl">
            {totalUsers.toLocaleString()}
          </p>
        </div>
        <div className="text-primary-foreground/80 flex items-center gap-2">
          {isPositive ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
          <span className="text-sm font-medium">
            {isPositive ? "+" : ""}
            {percentChange}% from last month
          </span>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="bg-card border-border flex flex-col justify-between rounded-3xl border p-6">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Learning Sessions
        </p>
        <div>
          <p className="text-4xl font-bold tracking-tight">{formatNumber(totalSessions)}</p>
          <div
            className={`mt-1 flex items-center gap-1 ${isSessionPositive ? "text-success" : "text-warning"}`}
          >
            {isSessionPositive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            <span className="text-xs">
              {isSessionPositive ? "+" : ""}
              {sessionPercentChange}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card border-border flex flex-col justify-between rounded-3xl border p-6">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Questions
        </p>
        <div>
          <p className="text-4xl font-bold tracking-tight">{formatNumber(totalQuestions)}</p>
          <div
            className={`mt-1 flex items-center gap-1 ${isQuestionPositive ? "text-success" : "text-warning"}`}
          >
            {isQuestionPositive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            <span className="text-xs">
              {isQuestionPositive ? "+" : ""}
              {questionPercentChange}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card border-border flex flex-col justify-between rounded-3xl border p-6">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Avg Time
        </p>
        <div>
          <p className="text-4xl font-bold tracking-tight">{formatTime(avgTimeMs)}</p>
          <div
            className={`mt-1 flex items-center gap-1 ${isTimeImproved ? "text-success" : "text-warning"}`}
          >
            {isTimeImproved ? (
              <ArrowDownRight className="size-3" />
            ) : (
              <ArrowUpRight className="size-3" />
            )}
            <span className="text-xs">
              {avgTimePercentChange >= 0 ? "+" : ""}
              {avgTimePercentChange}%
            </span>
          </div>
        </div>
      </div>

      {/* Wide stat with chart placeholder */}
      <div className="bg-card border-border col-span-2 rounded-3xl border p-6 lg:col-span-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Hints Used
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight">{formatNumber(totalHints)}</p>
          </div>
          <div
            className={`flex items-center gap-1 ${isHintsImproved ? "text-success" : "text-warning"}`}
          >
            {isHintsImproved ? (
              <ArrowDownRight className="size-4" />
            ) : (
              <ArrowUpRight className="size-4" />
            )}
            <span className="text-sm font-medium">
              {hintsPercentChange >= 0 ? "+" : ""}
              {hintsPercentChange}%
            </span>
          </div>
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          Average {avgHintsPerQuestion} hints per question answered
        </p>
      </div>
    </div>
  );
}
