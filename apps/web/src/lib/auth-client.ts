import type { auth } from "@math-wiz/auth";
import {
  adminClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  // organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = "/2fa";
      },
    }),
    adminClient({
      // ac,
      // roles: {
      //   admin,
      //   user,
      // },
    }),
    //   organizationClient({
    //     ac: organizationAc,
    //     roles: {
    //       owner,
    //       admin: orgAdmin,
    //       member,
    //     },
    //     teams: {
    //       enabled: true,
    //     },
    //   }),
    lastLoginMethodClient(),
  ],
});
