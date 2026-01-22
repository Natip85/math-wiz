"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";

import { trpc } from "@/utils/trpc-client";
import { useLocale } from "next-intl";

type Subject = "math" | "science" | "english";
type Difficulty = "easy" | "medium" | "hard";

export default function GeneratingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("PlaygroundConfigForm");
  const hasStartedRef = useRef(false);

  const { mutate: createPlaygroundRun, isError } = useMutation(
    trpc.playground.createPlaygroundRun.mutationOptions({
      onSuccess: (data) => {
        router.replace(`/playground/${data.sessionId}`);
      },
      onError: () => {
        // Redirect back to playground on error
        router.replace("/playground");
      },
    })
  );

  useEffect(() => {
    // Prevent double-execution in React StrictMode
    if (hasStartedRef.current) return;

    const subject = (searchParams.get("subject") as Subject) || "math";
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty") as Difficulty | null;
    const questionCount = Number(searchParams.get("questionCount")) || 5;
    const maxNumberParam = searchParams.get("maxNumber");
    const maxNumber = maxNumberParam ? Number(maxNumberParam) : undefined;

    if (!topic || !difficulty) {
      router.replace("/playground");
      return;
    }

    hasStartedRef.current = true;
    createPlaygroundRun({
      subject,
      topic,
      difficulty,
      questionCount,
      ...(maxNumber !== undefined && { maxNumber }),
      locale,
    });
  }, [searchParams, createPlaygroundRun, router, locale]);

  if (isError) {
    return null; // Will redirect
  }

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center gap-6">
      <Image
        src="/brain-loader.gif"
        alt={t("generating")}
        width={500}
        height={500}
        unoptimized
        className="rounded-3xl"
      />
      <h2 className="text-muted-foreground text-2xl font-medium tracking-wide">
        {t("generating")}
      </h2>
    </div>
  );
}
