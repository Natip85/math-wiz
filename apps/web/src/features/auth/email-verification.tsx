"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type EmailVerificationProps = {
  email: string;
};

export function EmailVerification({ email }: EmailVerificationProps) {
  const t = useTranslations("Auth.emailVerification");
  const [timeToNextResend, setTimeToNextResend] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const interval = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    startCountdown();

    return () => {
      clearInterval(interval.current);
    };
  }, []);

  function startCountdown(time = 30) {
    setTimeToNextResend(time);

    clearInterval(interval.current);
    interval.current = setInterval(() => {
      setTimeToNextResend((t) => {
        const newT = t - 1;

        if (newT <= 0) {
          clearInterval(interval.current);
          return 0;
        }
        return newT;
      });
    }, 1000);
  }

  async function handleResendVerification() {
    setIsResending(true);
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/",
      });
      toast.success("Verification email sent!");
      startCountdown();
    } catch {
      toast.error("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  }

  const isDisabled = timeToNextResend > 0 || isResending;

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        {t.rich("description", {
          email,
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleResendVerification}
        disabled={isDisabled}
      >
        {isResending
          ? t("sending")
          : timeToNextResend > 0
            ? t("resendEmailCountdown", { seconds: timeToNextResend })
            : t("resendEmail")}
      </Button>
    </div>
  );
}
