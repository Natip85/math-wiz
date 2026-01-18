"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Brain,
  Eye,
  ListChecks,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Hint types with their icons and translation keys
const HINT_CONFIG = [
  { icon: Brain, labelKey: "think", descKey: "thinkDesc" },
  { icon: Eye, labelKey: "visualize", descKey: "visualizeDesc" },
  { icon: ListChecks, labelKey: "steps", descKey: "stepsDesc" },
  { icon: BookOpen, labelKey: "explain", descKey: "explainDesc" },
] as const;

interface HintPopoverProps {
  hints: string[];
  onHintsUsedChange?: (count: number) => void;
}

export function HintPopover({ hints, onHintsUsedChange }: HintPopoverProps) {
  const t = useTranslations("HintPopover");
  // Track the maximum hint index that has been revealed (0-based)
  const [maxRevealedIndex, setMaxRevealedIndex] = useState(-1);
  // Track current viewing index for navigation
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const hintsCount = hints.length;
  const hintsUsed = maxRevealedIndex + 1;
  const hasMoreHints = maxRevealedIndex < hintsCount - 1;

  const revealNextHint = () => {
    if (hasMoreHints) {
      const newMaxIndex = maxRevealedIndex + 1;
      setMaxRevealedIndex(newMaxIndex);
      setCurrentIndex(newMaxIndex);
      onHintsUsedChange?.(newMaxIndex + 1);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Auto-reveal first hint when opening for the first time
    if (open && maxRevealedIndex === -1) {
      setMaxRevealedIndex(0);
      setCurrentIndex(0);
      onHintsUsedChange?.(1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < maxRevealedIndex) {
      // Navigate to already revealed hint
      setCurrentIndex(currentIndex + 1);
    } else if (hasMoreHints) {
      // Reveal new hint
      revealNextHint();
    }
  };

  const currentHint = hints[currentIndex];
  const currentConfig = HINT_CONFIG[currentIndex];
  const Icon = currentConfig?.icon ?? Lightbulb;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Lightbulb className="size-4" />
          <span>{t("hint")}</span>
          {hintsUsed > 0 && (
            <span className="text-muted-foreground text-xs">
              ({hintsUsed}/{hintsCount})
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex flex-col gap-3">
          {/* Header with hint type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary rounded-full p-1.5">
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {currentConfig ? t(`hintTypes.${currentConfig.labelKey}`) : null}
                </p>
                <p className="text-muted-foreground text-xs">
                  {currentConfig ? t(`hintTypes.${currentConfig.descKey}`) : null}
                </p>
              </div>
            </div>
            <span className="text-muted-foreground text-sm">
              {currentIndex + 1} / {hintsCount}
            </span>
          </div>

          {/* Hint content */}
          <div className="bg-muted/50 min-h-[60px] rounded-md p-3">
            <p className="text-sm leading-relaxed">{currentHint}</p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5">
            {hints.map((_, index) => (
              <button
                key={index}
                onClick={() => index <= maxRevealedIndex && setCurrentIndex(index)}
                disabled={index > maxRevealedIndex}
                className={cn(
                  "size-2 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-primary scale-125"
                    : index <= maxRevealedIndex
                      ? "bg-primary/40 hover:bg-primary/60 cursor-pointer"
                      : "bg-muted-foreground/30"
                )}
                aria-label={t("goToHint", { number: index + 1 })}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="gap-1"
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
              {t("previous")}
            </Button>

            {currentIndex < maxRevealedIndex ? (
              <Button variant="ghost" size="sm" onClick={goToNext} className="gap-1">
                {t("next")}
                <ChevronRight className="size-4 rtl:rotate-180" />
              </Button>
            ) : hasMoreHints ? (
              <Button
                variant={maxRevealedIndex === hintsCount - 2 ? "destructive" : "outline"}
                size="sm"
                onClick={revealNextHint}
                className="gap-1"
              >
                {maxRevealedIndex === hintsCount - 2 ? t("revealAnswer") : t("showNextHint")}
                <ChevronRight className="size-4 rtl:rotate-180" />
              </Button>
            ) : (
              <span className="text-muted-foreground text-xs">{t("allHintsRevealed")}</span>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
