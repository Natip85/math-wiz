"use client";

import { useTranslations } from "next-intl";
import { Activity, useState } from "react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialAuthButtons } from "@/features/auth/social-auth-buttons";
import { SignInTab } from "@/features/auth/sign-in-tab";
import { SignUpTab } from "@/features/auth/sign-up-tab";
import { EmailVerification } from "@/features/auth/email-verification";
import { ForgotPassword } from "@/features/auth/forgot-password";

type Tab = "signin" | "signup" | "email-verification" | "forgot-password";

export default function LoginPage() {
  const t = useTranslations("Auth.page");
  const [email, setEmail] = useState("");
  const [selectedTab, setSelectedTab] = useState<Tab>("signin");

  function openEmailVerificationTab(email: string) {
    setEmail(email);
    setSelectedTab("email-verification");
  }

  const isAuthTab = selectedTab === "signin" || selectedTab === "signup";

  return (
    <Tabs
      value={selectedTab}
      onValueChange={(t) => setSelectedTab(t as Tab)}
      className="w-full max-w-md px-4"
    >
      {isAuthTab && (
        <TabsList className="w-fit">
          <TabsTrigger value="signin">{t("signInTab")}</TabsTrigger>
          <TabsTrigger value="signup">{t("signUpTab")}</TabsTrigger>
        </TabsList>
      )}

      {/* Sign In / Sign Up with Activity for state preservation */}
      {isAuthTab && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {selectedTab === "signin" ? t("signInTitle") : t("signUpTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Activity mode={selectedTab === "signin" ? "visible" : "hidden"}>
              <SignInTab
                openEmailVerificationTab={openEmailVerificationTab}
                openForgotPassword={() => setSelectedTab("forgot-password")}
              />
            </Activity>
            <Activity mode={selectedTab === "signup" ? "visible" : "hidden"}>
              <SignUpTab openEmailVerificationTab={openEmailVerificationTab} />
            </Activity>
          </CardContent>

          <Separator />

          <CardFooter className="">
            <SocialAuthButtons />
          </CardFooter>
        </Card>
      )}

      <TabsContent value="email-verification">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t("verifyEmailTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <EmailVerification email={email} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="forgot-password">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t("forgotPasswordTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ForgotPassword openSignInTab={() => setSelectedTab("signin")} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
