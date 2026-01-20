"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calculator, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlaygroundConfigForm } from "./playground-config-form";

export function PlaygroundConfigDialog() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("PlaygroundPage");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="mt-10 w-full gap-2 text-lg font-bold">
          <Settings2 className="size-5" />
          {t("configureQuiz")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
              <Calculator className="text-primary h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black">{t("configureQuiz")}</DialogTitle>
              <DialogDescription>{t("chooseSettings")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <PlaygroundConfigForm />
      </DialogContent>
    </Dialog>
  );
}
