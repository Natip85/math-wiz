"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type SetPasswordButtonProps = {
  email: string;
};

export function SetPasswordButton({ email }: SetPasswordButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Auth.setPassword");

  async function handleClick() {
    setIsLoading(true);
    try {
      const res = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (res.error) {
        toast.error(res.error.message ?? "Failed to send password reset email");
      } else {
        toast.success("Password reset email sent");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isLoading}>
      {isLoading ? t("sending") : t("sendEmail")}
    </Button>
  );
}
