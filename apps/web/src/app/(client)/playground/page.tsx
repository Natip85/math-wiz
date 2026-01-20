import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { appRouter } from "@math-wiz/api/routers/index";
import { auth } from "@math-wiz/auth";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { playgroundBreadcrumbs } from "@/lib/breadcrumbs";
import { PausedSessions } from "@/features/playground/paused-sessions";
import { PlaygroundConfigDialog } from "@/features/playground/playground-config-dialog";
import { Leaderboard } from "@/features/playground/leaderboard";

export default async function Playground() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (session) {
    const caller = appRouter.createCaller({ session });
    const activeSession = await caller.playground.getActiveSession();

    if (activeSession?.sessionId) {
      redirect(`/playground/${activeSession.sessionId}`);
    }
  } else {
    redirect("/sign-in");
  }

  const t = await getTranslations("PlaygroundPage");

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden p-4">
        {/* Top navigation row */}
        <Breadcrumbs pages={playgroundBreadcrumbs} />

        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-primary/10 absolute top-10 left-10 h-20 w-20 rounded-full" />
          <div className="bg-accent/10 absolute top-32 right-20 h-16 w-16 rounded-full" />
          <div className="bg-secondary absolute bottom-20 left-1/4 h-12 w-12 rounded-full" />
          <div className="bg-primary/5 absolute right-1/3 bottom-32 h-24 w-24 rounded-full" />
        </div>

        <div className="relative mx-auto max-w-lg space-y-6">
          {/* Header section */}
          <div className="mb-8 text-center">
            <h1 className="text-foreground mb-3 text-3xl leading-tight font-black md:text-4xl">
              {t("title")} <span className="text-primary">{t("titleHighlight")}</span>
            </h1>

            <p className="text-muted-foreground mx-auto mb-6 max-w-md">{t("description")}</p>
          </div>
          {/* Leaderboard */}
          <Leaderboard />
          <PlaygroundConfigDialog />
          {/* Paused sessions */}
          <PausedSessions />
        </div>
      </section>
    </main>
  );
}
