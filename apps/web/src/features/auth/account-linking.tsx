"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { SupportedOAuthProvider } from "@/lib/o-auth-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
} from "@/lib/o-auth-providers";
import type { auth } from "@math-wiz/auth";
import { authClient } from "@/lib/auth-client";

type Account = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number];

export function AccountLinking({ currentAccounts }: { currentAccounts: Account[] }) {
  const t = useTranslations("Auth.accountLinking");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("linkedAccounts")}</h3>

        {currentAccounts.length === 0 ? (
          <Card>
            <CardContent className="text-secondary-muted py-8 text-center">
              {t("noLinkedAccounts")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentAccounts.map((account) => (
              <AccountCard key={account.id} provider={account.providerId} account={account} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("linkOtherAccounts")}</h3>
        <div className="grid gap-3">
          {SUPPORTED_OAUTH_PROVIDERS.filter(
            (provider) => !currentAccounts.find((acc) => acc.providerId === provider)
          ).map((provider) => (
            <AccountCard key={provider} provider={provider} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountCard({ provider, account }: { provider: string; account?: Account }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Auth.accountLinking");
  const tSocial = useTranslations("Auth.socialAuth");
  const format = useFormatter();

  const providerDetails = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider as SupportedOAuthProvider] ?? {
    nameKey: provider,
    Icon: Shield,
  };
  const providerName = tSocial(providerDetails.nameKey);

  async function handleLinkAccount() {
    setIsLoading(true);
    try {
      const res = await authClient.linkSocial({
        provider,
        callbackURL: "/profile",
      });

      if (res.error) {
        toast.error(res.error.message ?? "Failed to link account");
      }
      // Note: On success, the user will be redirected to the OAuth provider
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnlinkAccount() {
    if (account == null) {
      toast.error("Account not found");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authClient.unlinkAccount({
        accountId: account.accountId,
        providerId: provider,
      });

      if (res.error) {
        toast.error(res.error.message ?? "Failed to unlink account");
      } else {
        toast.success("Account unlinked");
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {<providerDetails.Icon className="size-5" />}
            <div>
              <p className="font-medium">{providerName}</p>
              {account == null ? (
                <p className="text-muted-foreground text-sm">
                  {t("connectFor", { provider: providerName })}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t("linkedOn", {
                    date: format.dateTime(new Date(account.createdAt), { dateStyle: "medium" }),
                  })}
                </p>
              )}
            </div>
          </div>
          {account == null ? (
            <Button variant="outline" size="sm" onClick={handleLinkAccount} disabled={isLoading}>
              {isLoading ? (
                t("linking")
              ) : (
                <>
                  <Plus />
                  {t("link")}
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleUnlinkAccount}
              disabled={isLoading}
            >
              {isLoading ? (
                "..."
              ) : (
                <>
                  <Trash2 />
                  {t("unlink")}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
