import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  label?: string;
  className?: string;
  size?: "sm" | "default";
}

export function ScoreBadge({ score, label = "pts", className, size = "default" }: ScoreBadgeProps) {
  if (score <= 0) return null;

  if (size === "sm") {
    return (
      <Badge
        variant="secondary"
        className={cn("gap-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", className)}
      >
        <Trophy className="size-3" />
        {score} {label}
      </Badge>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md bg-yellow-500/10 px-2 py-1 text-yellow-600 dark:text-yellow-400",
        className
      )}
    >
      <Trophy className="size-3.5" />
      <span className="font-mono text-sm">
        {score} {label}
      </span>
    </div>
  );
}
