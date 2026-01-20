"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/utils/trpc-client";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="size-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="size-5 text-gray-400" />;
  if (rank === 3) return <Medal className="size-5 text-amber-600" />;
  return <span className="text-muted-foreground w-5 text-center text-sm font-medium">{rank}</span>;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Leaderboard() {
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();
  const t = useTranslations("Leaderboard");

  const { data: leaderboard, isLoading } = useQuery(trpc.playground.getLeaderboard.queryOptions());

  if (isLoading) {
    return (
      <Card className="border-border shadow-border/50 bg-card border-4 shadow-[6px_6px_0px_0px]">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-5" />
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard?.length) {
    return (
      <Card className="border-border shadow-border/50 bg-card border-4 shadow-[6px_6px_0px_0px]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-black">{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center text-sm">{t("empty")}</p>
        </CardContent>
      </Card>
    );
  }

  const currentUserId = session?.user?.id;

  return (
    <Card className="border-border shadow-border/50 bg-card border-4 shadow-[6px_6px_0px_0px]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div> */}
          <div>
            <CardTitle className="text-lg font-black">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {leaderboard.map((entry) => {
          const isCurrentUser = entry.userId === currentUserId;

          return (
            <div
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 rounded-lg p-2 transition-colors",
                isCurrentUser && "bg-primary/10 ring-primary/20 ring-1"
              )}
            >
              {getRankIcon(entry.rank)}
              <Avatar className="size-8">
                {entry.image && <AvatarImage src={entry.image} alt={entry.name} />}
                <AvatarFallback className="text-xs">{getInitials(entry.name)}</AvatarFallback>
              </Avatar>
              <span className={cn("flex-1 truncate font-medium", isCurrentUser && "text-primary")}>
                {entry.name}
                {isCurrentUser && (
                  <span className="text-muted-foreground ml-1 text-xs">({t("you")})</span>
                )}
              </span>
              <span className="font-mono text-sm font-bold text-yellow-600 dark:text-yellow-400">
                {entry.totalScore.toLocaleString()}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
