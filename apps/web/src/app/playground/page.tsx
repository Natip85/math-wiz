import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Calculator } from "lucide-react";

import { appRouter } from "@math-wiz/api/routers/index";
import { auth } from "@math-wiz/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PausedSessions } from "@/features/playground/paused-sessions";
import { PlaygroundConfigForm } from "@/features/playground/playground-config-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { playgroundBreadcrumbs } from "@/lib/breadcrumbs";

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

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden px-4 py-2">
        {/* Top navigation row */}
        <Breadcrumbs pages={playgroundBreadcrumbs} />

        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-primary/10 absolute top-10 left-10 h-20 w-20 rounded-full" />
          <div className="bg-accent/10 absolute top-32 right-20 h-16 w-16 rounded-full" />
          <div className="bg-secondary absolute bottom-20 left-1/4 h-12 w-12 rounded-full" />
          <div className="bg-primary/5 absolute right-1/3 bottom-32 h-24 w-24 rounded-full" />
        </div>

        <div className="relative mx-auto max-w-lg">
          {/* Header section */}
          <div className="mb-8 text-center">
            <h1 className="text-foreground mb-3 text-3xl leading-tight font-black md:text-4xl">
              Ready for a <span className="text-primary">Challenge?</span>
            </h1>

            <p className="text-muted-foreground mx-auto max-w-md">
              Set up your quiz and put your math skills to the test!
            </p>
          </div>

          {/* Config card */}
          <Card className="border-border shadow-border/50 bg-card border-4 shadow-[6px_6px_0px_0px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                    <Calculator className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black">Configure Quiz</CardTitle>
                    <CardDescription>Choose your settings below</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <PlaygroundConfigForm />
            </CardContent>
          </Card>

          {/* Paused sessions */}
          <div className="mt-6">
            <PausedSessions />
          </div>
        </div>
      </section>
    </main>
  );
}
