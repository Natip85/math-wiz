"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Play, Clock, CheckCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTRPC } from "@/utils/trpc-client";
import { topics } from "./playground-config-form";

export function PausedSessions() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations("PausedSessions");
  const tConfig = useTranslations("PlaygroundConfigForm");

  const { data: pausedSessions, isLoading } = useQuery(
    trpc.playground.getPausedSessions.queryOptions()
  );

  const { mutateAsync: resumeSession, isPending } = useMutation(
    trpc.playground.resumeSession.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: trpc.playground.getActiveSession.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.playground.getPausedSessions.queryKey() });
        router.push(`/playground/${data.sessionId}`);
      },
    })
  );

  if (isLoading || !pausedSessions?.length) {
    return null;
  }

  return (
    <Card className="border-border shadow-border/50 bg-card border-4 shadow-[6px_6px_0px_0px]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-black">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {pausedSessions.map((session) => {
          const topic = topics.find((topicItem) => topicItem.value === session.topic);
          const TopicIcon = topic?.icon;
          const progressPercent = Math.round(
            (session.answeredCount / session.totalQuestions) * 100
          );

          return (
            <div
              key={session.id}
              className="bg-muted/50 flex items-center justify-between gap-4 rounded-lg p-3"
            >
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  {TopicIcon && <TopicIcon className="text-muted-foreground h-4 w-4" />}
                  <span className="font-medium">{tConfig(`topic.${session.topic}`)}</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={progressPercent} className="h-2 flex-1" />
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <CheckCircle className="h-3 w-3" />
                    <span>
                      {session.answeredCount}/{session.totalQuestions}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => resumeSession({ sessionId: session.id })}
                disabled={isPending}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {t("resume")}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
