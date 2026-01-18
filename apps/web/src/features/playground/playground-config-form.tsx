"use client";
"use no memo";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Brain, Divide, Minus, X, Play, Plus, Zap, Rocket } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { trpc } from "@/utils/trpc-client";

export const topics = [
  { value: "addition", icon: Plus },
  { value: "subtraction", icon: Minus },
  { value: "multiplication", icon: X },
  { value: "division", icon: Divide },
] as const;

export const difficulties = [
  { value: "easy", icon: Zap },
  { value: "medium", icon: Brain },
  { value: "hard", icon: Rocket },
] as const;

export const maxNumberPresets = [10, 20, 50, 100, 1000] as const;

export const playgroundConfigSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
  topic: z.enum(["addition", "subtraction", "multiplication", "division"]),
  questionCount: z.number().min(1).max(10),
  maxNumber: z.number().min(10).max(1000),
});

export type PlaygroundConfig = z.infer<typeof playgroundConfigSchema>;

export function PlaygroundConfigForm() {
  const router = useRouter();
  const t = useTranslations("PlaygroundConfigForm");
  const locale = useLocale();

  const form = useForm<PlaygroundConfig>({
    resolver: zodResolver(playgroundConfigSchema),
    mode: "onChange",
    defaultValues: {
      difficulty: "medium",
      topic: "addition",
      questionCount: 5,
      maxNumber: 20,
    },
  });

  const { mutateAsync: createPlaygroundRun, isPending } = useMutation(
    trpc.playground.createPlaygroundRun.mutationOptions({
      onSuccess: (data) => {
        router.push(`/playground/${data.sessionId}`);
      },
    })
  );

  async function onSubmit(data: PlaygroundConfig) {
    // Pass the current locale so the LLM generates content in the correct language
    await createPlaygroundRun({ ...data, locale });
  }

  if (isPending) {
    return (
      <div className="bg-background fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col items-center justify-center gap-6">
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

  return (
    <Form {...form}>
      <form
        id="playground-config-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 space-y-3"
      >
        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("difficulty.label")}</FormLabel>
              <FormControl>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                  className="grid w-full grid-cols-3"
                  variant="outline"
                >
                  {difficulties.map(({ value, icon: Icon }) => (
                    <ToggleGroupItem
                      key={value}
                      value={value}
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary flex flex-1 items-center justify-center gap-2 py-3"
                    >
                      <Icon className="size-4" />
                      <span className="font-medium">{t(`difficulty.${value}`)}</span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("topic.label")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder={t("topic.placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {topics.map(({ value, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-3">
                        <Icon className="size-4" />
                        <span>{t(`topic.${value}`)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maxNumber.label")}</FormLabel>
              <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                <FormControl>
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder={t("maxNumber.placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {maxNumberPresets.map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {t("maxNumber.upTo", { value })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t("maxNumber.description")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="questionCount"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t("questions.label")}</FormLabel>
                <span className="text-primary text-2xl font-bold">{field.value}</span>
              </div>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </FormControl>
              <div className="text-muted-foreground flex justify-between text-xs rtl:flex-row-reverse">
                <span>1</span>
                <span>10</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg">
          <Play className="size-5" />
          {t("startQuiz")}
        </Button>
      </form>
    </Form>
  );
}
