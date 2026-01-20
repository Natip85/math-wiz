"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session } = authClient.useSession();
  const t = useTranslations("HomePage");

  return (
    <div className="relative container mx-auto h-screen overflow-hidden px-4 pt-20 pb-12">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute top-10 left-10 h-20 w-20 rounded-full" />
        <div className="bg-accent/10 absolute top-32 right-20 h-16 w-16 rounded-full" />
        <div className="bg-secondary absolute bottom-20 left-1/4 h-12 w-12 rounded-full" />
        <div className="bg-primary/5 absolute right-1/3 bottom-32 h-24 w-24 rounded-full" />
        <div className="bg-accent/5 absolute top-1/2 right-10 h-14 w-14 rounded-full" />
        <div className="bg-primary/10 absolute top-20 left-1/3 h-10 w-10 rounded-full" />
      </div>

      <div className="flex h-full flex-col items-center gap-8 lg:flex-row lg:gap-12">
        {/* Left content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-foreground mb-6 text-4xl leading-tight font-extrabold tracking-tight text-balance md:text-5xl lg:text-6xl">
            {t("title")} <span className="text-kids-green">{t("titleHighlight")}</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-8 max-w-xl text-lg leading-relaxed md:text-xl lg:mx-0">
            {t("description")}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={session ? "/playground" : "/sign-in"}>{t("startPlaying")}</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              {t("watchDemo")}
            </Button>
          </div>
        </div>

        {/* Right illustration */}
        <div className="flex flex-1 items-center justify-center">
          <Image
            src="/hero-image.png"
            alt={t("heroImageAlt")}
            width={1536}
            height={1024}
            className="h-auto w-full max-w-xl rounded-3xl shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
