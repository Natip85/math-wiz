"use client";

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
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
      )}

      {/* Sign In / Sign Up with Activity for state preservation */}
      {isAuthTab && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {selectedTab === "signin" ? "Sign In" : "Sign Up"}
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

      {/* Email Verification - no state to preserve */}
      <TabsContent value="email-verification">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          </CardHeader>
          <CardContent>
            EmailVerification
            <EmailVerification email={email} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Forgot Password - no state to preserve */}
      <TabsContent value="forgot-password">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ForgotPassword openSignInTab={() => setSelectedTab("signin")} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
