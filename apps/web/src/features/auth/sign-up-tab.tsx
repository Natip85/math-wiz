"use client";

import { useTranslations } from "next-intl";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/ui/password-input";

type SignUpTabProps = {
  openEmailVerificationTab: (email: string) => void;
};

export function SignUpTab({ openEmailVerificationTab }: SignUpTabProps) {
  const t = useTranslations("Auth.signUp");

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const res = await authClient.signUp.email(
        { ...value, callbackURL: "/playground" },
        {
          onError: (error) => {
            toast.error(error.error.message || "Failed to sign up");
          },
        }
      );

      if (res.error == null && !res.data.user.emailVerified) {
        openEmailVerificationTab(value.email);
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="name">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={`signup-${field.name}`}>{t("name")}</Label>
            <Input
              id={`signup-${field.name}`}
              name={`signup-${field.name}`}
              placeholder={t("namePlaceholder")}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map((error) => (
              <p key={error?.message} className="text-destructive text-sm">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={`signup-${field.name}`}>{t("email")}</Label>
            <Input
              id={`signup-${field.name}`}
              name={`signup-${field.name}`}
              type="email"
              placeholder={t("emailPlaceholder")}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map((error) => (
              <p key={error?.message} className="text-destructive text-sm">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={`signup-${field.name}`}>{t("password")}</Label>
            <PasswordInput
              id={`signup-${field.name}`}
              name={`signup-${field.name}`}
              placeholder={t("passwordPlaceholder")}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map((error) => (
              <p key={error?.message} className="text-destructive text-sm">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Subscribe>
        {(state) => (
          <Button
            type="submit"
            className="w-full"
            disabled={!state.canSubmit || state.isSubmitting}
          >
            {state.isSubmitting ? t("creatingAccount") : t("signUp")}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
