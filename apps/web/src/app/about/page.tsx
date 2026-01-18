"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Brain, Calculator, Heart, Rocket, Star, Target, Trophy, Zap } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { aboutBreadcrumbs } from "@/lib/breadcrumbs";

export default function AboutPage() {
  const t = useTranslations("AboutPage");

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-2">
        <Breadcrumbs pages={aboutBreadcrumbs} />

        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-primary/10 absolute top-10 left-10 h-20 w-20 rounded-full" />
          <div className="bg-accent/10 absolute top-32 right-20 h-16 w-16 rounded-full" />
          <div className="bg-secondary absolute bottom-10 left-1/4 h-12 w-12 rounded-full" />
          <div className="bg-primary/5 absolute right-1/3 bottom-32 h-24 w-24 rounded-full" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-foreground mb-6 text-4xl leading-tight font-black text-balance md:text-6xl">
            {t("hero.title")} <br />
            <span className="text-primary">{t("hero.titleHighlight")}</span>
          </h1>

          <p className="text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed">
            {t("hero.description")}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-foreground mb-12 text-center text-3xl font-black md:text-4xl">
            {t("features.title")}
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Calculator className="h-10 w-10" />}
              title={t("features.customQuizzes.title")}
              description={t("features.customQuizzes.description")}
              color="primary"
            />
            <FeatureCard
              icon={<Brain className="h-10 w-10" />}
              title={t("features.learnAtYourPace.title")}
              description={t("features.learnAtYourPace.description")}
              color="accent"
            />
            <FeatureCard
              icon={<Trophy className="h-10 w-10" />}
              title={t("features.trackProgress.title")}
              description={t("features.trackProgress.description")}
              color="primary"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-foreground mb-12 text-center text-3xl font-black md:text-4xl">
            {t("howItWorks.title")}
          </h2>

          <div className="space-y-6">
            <StepCard
              number={1}
              icon={<Target className="h-8 w-8" />}
              title={t("howItWorks.step1.title")}
              description={t("howItWorks.step1.description")}
            />
            <StepCard
              number={2}
              icon={<Zap className="h-8 w-8" />}
              title={t("howItWorks.step2.title")}
              description={t("howItWorks.step2.description")}
            />
            <StepCard
              number={3}
              icon={<Star className="h-8 w-8" />}
              title={t("howItWorks.step3.title")}
              description={t("howItWorks.step3.description")}
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <Card className="border-primary shadow-primary/30 bg-card border-4 shadow-[8px_8px_0px_0px]">
            <CardContent className="p-8 text-center md:p-12">
              <div className="bg-secondary mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                <Heart className="text-accent h-10 w-10" />
              </div>
              <h2 className="text-foreground mb-4 text-2xl font-black md:text-3xl">
                {t("mission.title")}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t("mission.description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Rocket className="text-primary mx-auto mb-6 h-16 w-16" />
          <h2 className="text-foreground mb-4 text-3xl font-black md:text-4xl">{t("cta.title")}</h2>
          <p className="text-muted-foreground mb-8 text-lg">{t("cta.description")}</p>
          <Link href="/playground">
            <Button size="lg">
              <Rocket className="mr-2 h-6 w-6" />
              {t("cta.button")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Separator className="mb-8" />
          <p className="text-muted-foreground text-center">
            {t.rich("footer", {
              heart: () => <Heart className="text-accent inline h-4 w-4" />,
            })}
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "accent";
}) {
  return (
    <Card className="border-border shadow-border/50 bg-card border-4 shadow-[6px_6px_0px_0px] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px]">
      <CardHeader className="pb-2">
        <div
          className={`mb-2 flex h-16 w-16 items-center justify-center rounded-2xl ${color === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}
        >
          {icon}
        </div>
        <CardTitle className="text-xl font-black">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 md:gap-6">
      <div className="bg-primary text-primary-foreground shadow-primary/30 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black shadow-[4px_4px_0px_0px]">
        {number}
      </div>
      <Card className="border-border bg-card flex-1 border-2">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="bg-secondary text-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            {icon}
          </div>
          <div>
            <h3 className="text-foreground mb-1 text-lg font-black">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
