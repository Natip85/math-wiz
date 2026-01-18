import { GoogleIcon } from "@/components/icons/google";
import type { ComponentProps, ElementType } from "react";

export const SUPPORTED_OAUTH_PROVIDERS = ["google"] as const;
export type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

export const SUPPORTED_OAUTH_PROVIDER_DETAILS: Record<
  SupportedOAuthProvider,
  { nameKey: string; Icon: ElementType<ComponentProps<"svg">> }
> = {
  google: { nameKey: "google", Icon: GoogleIcon },
};
