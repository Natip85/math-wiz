"use client";

import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/utils/trpc-client";

export function TopLearners() {
  const trpc = useTRPC();
  const { data: learners = [] } = useQuery(trpc.admin.getTopLearners.queryOptions());

  return (
    <Card className="from-card to-secondary/50 h-full bg-linear-to-br">
      <CardHeader className="flex-row items-center gap-3">
        <div className="bg-warning/20 flex size-10 items-center justify-center rounded-xl">
          <Trophy className="text-warning size-5" />
        </div>
        <div>
          <CardTitle className="text-lg">Top Learners</CardTitle>
          <CardDescription>This month</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {learners.map((learner, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="border-border size-12 border-2">
                <AvatarFallback className="bg-muted text-sm font-semibold">
                  {learner.initials}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  idx === 0
                    ? "bg-warning text-warning-foreground"
                    : idx === 1
                      ? "bg-muted-foreground text-background"
                      : "bg-chart-4 text-chart-4-foreground"
                }`}
              >
                {idx + 1}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{learner.name}</p>
              <p className="text-muted-foreground text-xs">{learner.streak} day streak</p>
            </div>
            <p className="font-mono text-lg font-bold">{(learner.score / 1000).toFixed(1)}K</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
