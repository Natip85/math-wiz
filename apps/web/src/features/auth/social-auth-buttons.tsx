"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
} from "@/lib/o-auth-providers";

export function SocialAuthButtons() {
  const t = useTranslations("Auth.socialAuth");
  const lastMethod = authClient.getLastUsedLoginMethod();

  return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
    const { Icon, nameKey } = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider];
    const isLastUsed = lastMethod === provider;

    return (
      <Button
        variant={isLastUsed ? "default" : "outline"}
        key={provider}
        onClick={() => {
          void authClient.signIn.social({
            provider,
            callbackURL: "/playground",
          });
        }}
        className="relative w-full"
      >
        <Icon />
        {t(nameKey)}
        {isLastUsed && (
          <Badge variant="secondary" className="absolute -top-2 -right-2 ml-2">
            {t("lastUsed")}
          </Badge>
        )}
      </Button>
    );
  });
}
